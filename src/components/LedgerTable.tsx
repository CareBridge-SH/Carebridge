import { useTranslation } from 'react-i18next';
import ledgerJson from '../data/ledger.json';
import { Plate } from './ui';
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
/*
 * T30: the table heads move to the LABEL VOICE (round 5 §2.5), which is what a
 * printed table's column heads are. Roman numerals are not involved, so the
 * label voice is safe here — it is Latin-only and the heads are Latin.
 */
const RAIL =
  'bg-navy-soft font-mono text-label tracking-label whitespace-nowrap text-white/70';
const DATA = 'font-sans text-xs whitespace-nowrap text-white';

export default function LedgerTable() {
  const { i18n } = useTranslation();

  /*
   * Empty snapshot — which is the SHIPPED state: `src/data/ledger.json` is
   * `sheetName: null, columns: [], rows: []`.
   *
   * This used to render `null`, so the section drew nothing at all. Round 5's
   * §7.5 asks for the page to look finished with the ledger empty, and §3.5 asks
   * for it to "look deliberate when empty". Neither is met by a void.
   *
   * A blank ledger is not available as a fallback here: with `columns: []` there
   * are no column heads to draw, so "an honest blank ledger" would be a ruled
   * region with nothing in it. So it renders the **designed plate** instead,
   * which is the other thing §3.5 allows.
   *
   * What this still does NOT do: apologise, show a zero, or fabricate a row.
   * `src/data/ledger.json` is operator-owned and stays empty; the plate is the
   * honest shape of "there is a ledger here, and it is not published yet".
   */
  if (!ledger.sheetName || ledger.rows.length === 0) {
    /*
     * The RESERVED FOOTPRINT. The empty state is the flat field, held at a
     * stated height so the region cannot collapse — and so the table that
     * replaces it lands in a space that was already the right size.
     *
     * 20rem = 320px at every viewport. A semester ledger is a header row plus
     * roughly ten data rows plus the sheet-tab strip; 320px holds that with
     * room to spare, and it is a FIXED height rather than the plate field's
     * own 3:2 ratio, because a ratio would make the reservation change with
     * the viewport width while the table it is reserving for does not.
     *
     * The inner box takes the height explicitly. The Plate sets an inline
     * `aspect-ratio`, and the ratio applies whenever EITHER dimension is auto.
     * A definite height alone therefore made it 480px WIDE at a 375px viewport —
     * 320 x 1.5, the width derived from the ratio. Both dimensions have to be
     * definite for the ratio to be ignored, which is what `w-full` does; the
     * first version of this shipped that overflow and the matrix caught it.
     */
    return <Plate slug="ledger" className="mt-6 [&>div]:h-[20rem] [&>div]:w-full" />;
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
    <div className="mt-6 min-h-[20rem]">
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
