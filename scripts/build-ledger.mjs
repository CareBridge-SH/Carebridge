#!/usr/bin/env node
/**
 * Build-time ledger extractor: `content/ledger.xlsx` -> `src/data/ledger.json`.
 *
 * Build-time only. `exceljs` is a devDependency and never reaches the browser —
 * this writes a JSON snapshot that `src/data/**` imports. No network, no secret,
 * no timestamp: provenance is the workbook's own last-saved time, so two runs on
 * the same file are byte-identical (determinism is a requirement).
 *
 *     node scripts/build-ledger.mjs                 # extract + write
 *     node scripts/build-ledger.mjs --check         # validate, write nothing
 *     node scripts/build-ledger.mjs --from-file x.xlsx --sheet Ledger --header-row 2
 *
 * `--header-row` is where the column names live. The operator's workbook keeps a
 * title row above the real header, so the header is on **row 2**; that value is
 * passed by the `package.json` scripts (`prebuild`, `predev`, `ledger:build`,
 * `ledger:check`) rather than baked in here, so changing the workbook layout is
 * a one-line npm edit and not a code change. The fallback below is 1 only for a
 * bare direct invocation.
 *
 * Exit codes: 0 = nothing wrong (including "not uploaded yet"); 1 = a present-but-
 * wrong input that would otherwise silently ship a stale or empty table.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_INPUT = resolve(ROOT, 'content', 'ledger.xlsx');
const OUTPUT = resolve(ROOT, 'src', 'data', 'ledger.json');
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// xlsx is a ZIP (PK..), legacy .xls is OLE2 (D0 CF 11 E0).
const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04];
const OLE_MAGIC = [0xd0, 0xcf, 0x11, 0xe0];

// A totals row is detected, never computed.
const TOTAL_RE = /^(total|totals|subtotal|合计|合計|总计|小计)/i;

const EMPTY_SNAPSHOT = {
  sheetName: null,
  columns: [],
  rows: [],
  ignoredSheets: [],
  workbookModifiedAt: null,
};

const args = process.argv.slice(2);
const CHECK = args.includes('--check');
function arg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? args[i + 1] : undefined;
}

const inputPath = arg('from-file') || process.env.LEDGER_FILE || DEFAULT_INPUT;
const sheetArg = arg('sheet') || process.env.LEDGER_SHEET;
const headerRow = Number.parseInt(
  arg('header-row') || process.env.LEDGER_HEADER_ROW || '1',
  10,
);

function warn(message) {
  console.warn(`WARN  ${message}`);
}

function error(message) {
  console.error(`FAIL  ${message}`);
}

function hasMagic(buf, magic) {
  return buf.length >= magic.length && magic.every((b, i) => buf[i] === b);
}

/**
 * Blank means "carries no value": null, undefined, the empty string, **or a
 * string that is only whitespace**.
 *
 * The whitespace case is the whole point. `"   "` used to count as a value, so a
 * header row of spaces produced a `columns` array of `"   "` and a data row of
 * spaces produced a row that was not null — and `--check` exited 0 on both.
 */
function isBlank(v) {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.trim() === '';
  return false;
}

/** Last column index (1-based) whose cell is not blank; 0 if the row is empty. */
function lastNonEmptyColumn(row) {
  let last = 0;
  const count = row.cellCount || 0;
  for (let c = 1; c <= count; c += 1) {
    if (!isBlank(row.getCell(c).value)) last = c;
  }
  return last;
}

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

/**
 * Coerce a raw exceljs cell value to the JSON type it belongs to:
 * number stays number, Date -> YYYY-MM-DD, string stays string, blank -> null,
 * formula -> its cached result (or null + warning). Never invents a value.
 */
function typedValue(raw) {
  if (isBlank(raw)) return { value: null };
  if (typeof raw === 'number' || typeof raw === 'boolean') return { value: raw };
  if (typeof raw === 'string') return { value: raw };
  if (raw instanceof Date) return { value: formatDate(raw) };
  if (typeof raw === 'object') {
    if (raw.formula !== undefined) {
      if (isBlank(raw.result)) {
        return { value: null, warn: 'formula has no cached result' };
      }
      return typedValue(raw.result);
    }
    if (raw.text !== undefined) return { value: String(raw.text) };
    if (raw.richText !== undefined) {
      return { value: raw.richText.map((r) => (r && r.text) || '').join('') };
    }
    if (raw.error !== undefined) return { value: null, warn: `error cell ${raw.error}` };
    if (raw.result !== undefined) return typedValue(raw.result);
    return { value: String(raw) };
  }
  return { value: String(raw) };
}

/** A header cell, coerced to a string (or null when blank). */
function headerString(raw) {
  const { value } = typedValue(raw);
  return value === null ? null : String(value);
}

function writeSnapshot(snapshot) {
  writeFileSync(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`);
}

async function main() {
  // 1. No input file -> "not uploaded yet" is not an error (absent => exit 0).
  if (!existsSync(inputPath)) {
    if (existsSync(OUTPUT)) {
      warn(`no ${inputPath}; leaving ${OUTPUT} untouched (anti-wipe)`);
    } else if (!CHECK) {
      warn(`no ${inputPath} yet — writing the empty snapshot`);
      writeSnapshot(EMPTY_SNAPSHOT);
    } else {
      warn(`no ${inputPath}; nothing to check`);
    }
    process.exit(0);
  }

  // 2. Present but wrong => exit 1.
  const bytes = readFileSync(inputPath);
  if (bytes.length > MAX_BYTES) {
    error(`file is ${bytes.length} bytes — larger than the 10 MB limit`);
    process.exit(1);
  }
  if (!hasMagic(bytes, ZIP_MAGIC)) {
    if (hasMagic(bytes, OLE_MAGIC)) {
      error('this is a legacy `.xls` — re-save it as `.xlsx`');
    } else {
      error('not an `.xlsx` file (bad magic bytes)');
    }
    process.exit(1);
  }

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(bytes);
  } catch (e) {
    error(`cannot parse workbook: ${e.message}`);
    process.exit(1);
  }

  // 3. Select the visible sheet to render.
  const visibleSheets = workbook.worksheets.filter((ws) => ws.state === 'visible');
  if (visibleSheets.length === 0) {
    warn('workbook has no visible sheets — nothing to publish');
    if (!CHECK) writeSnapshot(EMPTY_SNAPSHOT);
    process.exit(0);
  }

  let sheet;
  if (sheetArg) {
    sheet = visibleSheets.find((ws) => ws.name === sheetArg);
    if (!sheet) {
      error(`sheet "${sheetArg}" not found or not visible`);
      process.exit(1);
    }
  } else {
    sheet = visibleSheets.find((ws) => ws.name === 'Ledger') || visibleSheets[0];
  }

  // 4. Header row (explicit). Merged title rows above it are simply ignored.
  const headerRowObj = sheet.getRow(headerRow);
  let columnCount = lastNonEmptyColumn(headerRowObj);
  if (columnCount === 0) {
    error(
      `header row ${headerRow} has no column names (blank or whitespace only) — ` +
        `pass --header-row if the real header is on a different row (anti-wipe)`,
    );
    process.exit(1);
  }

  // 5. Data rows: trim leading and trailing empty rows; track the real column width.
  let firstDataRow = 0;
  let lastDataRow = headerRow;
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber <= headerRow) return;
    const lastCol = lastNonEmptyColumn(row);
    if (lastCol === 0) return;
    if (firstDataRow === 0) firstDataRow = rowNumber;
    lastDataRow = rowNumber;
    if (lastCol > columnCount) columnCount = lastCol;
  });
  if (firstDataRow === 0) {
    error(
      `no data rows below header row ${headerRow} — header-only workbooks are ` +
        `mis-shaped, not empty (anti-wipe)`,
    );
    process.exit(1);
  }

  // 6. Build the snapshot.
  const columns = [];
  for (let c = 1; c <= columnCount; c += 1) {
    columns.push(headerString(headerRowObj.getCell(c).value));
  }

  const rows = [];
  for (let r = firstDataRow; r <= lastDataRow; r += 1) {
    const row = sheet.getRow(r);
    const values = [];
    for (let c = 1; c <= columnCount; c += 1) {
      const { value, warn: w } = typedValue(row.getCell(c).value);
      if (w) warn(`row ${r}, col ${c}: ${w}`);
      values.push(value);
    }
    const isTotal = values.some(
      (v) => typeof v === 'string' && TOTAL_RE.test(v.trim()),
    );
    rows.push({ sourceRow: r, values, isTotal });
  }

  // 7. Rows that exist but hold no value at all. This is the case the old guard
  //    missed entirely: `lastNonEmptyColumn` counts a formula cell or an error
  //    cell as "not blank", so the sheet gets past `firstDataRow` and ships a
  //    table of nulls with a green build. A workbook whose every data row is
  //    null is mis-shaped, not empty.
  const populatedRows = rows.filter((r) => r.values.some((v) => v !== null));
  if (populatedRows.length === 0) {
    error(
      `all ${rows.length} data row(s) below header row ${headerRow} are empty — ` +
        `every cell coerced to null, so this workbook would publish an all-null ` +
        `table (anti-wipe)`,
    );
    process.exit(1);
  }

  const extraVisible = visibleSheets.filter((ws) => ws !== sheet);
  const ignoredSheets = extraVisible.map((ws) => ws.name);
  if (extraVisible.length > 0) {
    warn(`ignoring ${extraVisible.length} extra visible sheet(s): ${extraVisible.map((s) => s.name).join(', ')}`);
  }

  const snapshot = {
    sheetName: sheet.name,
    columns,
    rows,
    ignoredSheets,
    workbookModifiedAt: workbook.modified ? workbook.modified.toISOString() : null,
  };

  if (CHECK) {
    console.log(`OK   would write ${rows.length} row(s) from sheet "${sheet.name}"`);
    process.exit(0);
  }
  writeSnapshot(snapshot);
  console.log(`Wrote ${rows.length} row(s) from "${sheet.name}" to src/data/ledger.json`);
}

main();
