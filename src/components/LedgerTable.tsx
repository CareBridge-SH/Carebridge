import { useTranslation } from 'react-i18next';
import ledgerJson from '../data/ledger.json';
import type { LedgerSnapshot } from '../data/types';

const ledger = ledgerJson as LedgerSnapshot;

/** 0 -> A, 25 -> Z, 26 -> AA, 27 -> AB … */
function columnLetter(index: number): string {
  let n = index + 1;
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/*
 * Excel-look styling, opened out into a ledger (ROUND4-PLAN §3.5): row and
 * column rules, figures right-aligned on `tabular-nums` so digits line up down
 * the page — and **no outer border and no fill**, so it reads as a ruled table
 * on the page rather than as a bordered card floating on it.
 *
 * The gridlines are a low-alpha tint of the flipping `--color-white` token,
 * which reads as a neutral grey in both themes. This is a decorative grid, not
 * text, so it carries no WCAG contrast requirement — but the number cells and
 * labels use full-strength tokens (`text-white`, `text-lavender`) and are
 * measured in the report.
 *
 * `RAIL` keeps `bg-navy-soft` because the header cells are `sticky`: a sticky
 * cell needs an opaque fill or the rows scroll through it.
 */
const GRID = 'border-b border-r border-white/40';
const RAIL = 'bg-navy-soft font-sans text-xs whitespace-nowrap text-white/70';
const DATA = 'font-sans text-xs whitespace-nowrap text-white';

export default function LedgerTable() {
  const { i18n } = useTranslation();

  /*
   * Empty snapshot -> render nothing: no frame, no header row, no link, no
   * placeholder.
   *
   * This is the SHIPPED state (src/data/ledger.json is `sheetName: null,
   * columns: [], rows: []`), so §3.5's "must look deliberate when empty" has to
   * be answered by what is here. Deliberate silence is the honest answer: a
   * half-drawn table, an empty ruled frame, or a lone sheet-tab strip would all
   * read as breakage, and the one thing that would read as intentional — a
   * sentence explaining that the ledger is not published yet — needs a locale
   * key that exists in neither language. Reported, not invented.
   */
  if (!ledger.sheetName || ledger.rows.length === 0) {
    return null;
  }

  const numberFormat = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 2,
  });

  // A column is numeric when >= 80% of its non-empty cells are numbers — never a
  // hard-coded index.
  const numericCols = ledger.columns.map((_, ci) => {
    const nonEmpty = ledger.rows.filter((r) => r.values[ci] !== null);
    if (nonEmpty.length === 0) return false;
    const numeric = nonEmpty.filter((r) => typeof r.values[ci] === 'number').length;
    return numeric / nonEmpty.length >= 0.8;
  });

  function formatCell(value: string | number | null): string {
    if (value === null) return '';
    if (typeof value === 'number') return numberFormat.format(value);
    return value;
  }

  const align = (ci: number) =>
    numericCols[ci] ? 'text-right tabular-nums' : 'text-left';

  return (
    <div className="mt-4">
      <div
        role="region"
        aria-label={ledger.sheetName}
        tabIndex={0}
        className="overflow-x-auto"
      >
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            {/* Column-letter rail — decoration only. */}
            <tr aria-hidden="true">
              <th className={`sticky top-0 left-0 z-20 ${GRID} ${RAIL}`} />
              {ledger.columns.map((_, ci) => (
                <th
                  key={`letter-${ci}`}
                  className={`sticky top-0 z-10 ${GRID} ${RAIL} px-1 py-0.5 text-center font-normal`}
                >
                  {columnLetter(ci)}
                </th>
              ))}
            </tr>
            {/* Header row — the real column names (frozen). */}
            <tr>
              <th
                aria-hidden="true"
                className={`sticky top-5 left-0 z-20 ${GRID} ${RAIL}`}
              />
              {ledger.columns.map((col, ci) => (
                <th
                  key={`h-${ci}`}
                  scope="col"
                  className={`sticky top-5 z-10 ${GRID} ${RAIL} px-2 py-1 font-semibold text-white ${align(ci)}`}
                >
                  {col ?? ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ledger.rows.map((row) => (
              <tr key={row.sourceRow}>
                {/* Row-number rail — decoration only. */}
                <th
                  aria-hidden="true"
                  className={`sticky left-0 z-10 ${GRID} ${RAIL} px-2 py-1 text-center font-normal ${
                    row.isTotal ? 'border-t-2 border-t-white/70 font-semibold' : ''
                  }`}
                >
                  {row.sourceRow}
                </th>
                {row.values.map((value, ci) => {
                  const cell = `${GRID} ${DATA} px-2 py-1 ${align(ci)} ${
                    row.isTotal ? 'border-t-2 border-t-white/70 font-semibold' : ''
                  }`;
                  return ci === 0 ? (
                    <th key={`r-${ci}`} scope="row" className={cell}>
                      {formatCell(value)}
                    </th>
                  ) : (
                    <td key={`c-${ci}`} className={cell}>
                      {formatCell(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet-tab strip. */}
      <div className="mt-1 flex flex-wrap items-center gap-3 border-t border-white/40 px-2 py-1.5 font-sans text-xs">
        <span className={`${GRID} ${RAIL} px-3 py-1 font-semibold text-white`}>
          {ledger.sheetName}
        </span>
        {ledger.workbookModifiedAt ? (
          <span className="text-white">
            {new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(
              new Date(ledger.workbookModifiedAt),
            )}
          </span>
        ) : null}
      </div>
    </div>
  );
}
