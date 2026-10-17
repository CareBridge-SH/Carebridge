# `content/` — the financial ledger

The club's financial ledger lives here as a single Excel workbook:

**`content/ledger.xlsx`**

The site reads it at **build time** (`scripts/build-ledger.mjs`) and turns it into
the spreadsheet table on the Transparency page. Nothing else in this folder is read.

## How to update it — five steps, no tooling beyond a browser

1. Edit the ledger in Excel / WPS / Numbers. Save as **`.xlsx`**.
2. On **github.com**, open this `content/` folder and **drag the new file onto
   `ledger.xlsx`** to replace it (Add file → Upload files).
3. Commit — a web-UI upload is already a commit.
4. Wait for the deploy (Actions → *Deploy to GitHub Pages*).
5. The Transparency page shows the new numbers.

## The one trap that will bite you

- **Do NOT put the file at `data/ledger.xlsx`.** `.gitignore` has a root-scoped
  `/data/`, so a workbook dropped in `data/` is **silently never committed** — the
  upload looks fine, nothing changes on the site, and there is no error to go on.
  It must be **`content/ledger.xlsx`**, in this folder.

## What gets published (and what never does)

- Only **visible** sheets are extracted. A hidden or *very hidden* tab is never
  published — use a hidden tab for your private working notes.
- The build renders the first **visible** sheet, unless one is named **`Ledger`**
  (that name wins) or the extractor is told otherwise.
- The `.xlsx` file itself is **never served and never downloadable** — only the
  extracted values appear on the page.

## What the extractor trims at the ends (added 2026-10-17)

A workbook carries scaffolding: pre-filled formulas reserved for rows nobody has
filled in yet, a title banner above the header, a data block that starts in column B.
Two of those used to reach the page, and the 26–27 inventory sheet had both:

- **Trailing rows that only contain a formula.** `lastNonEmptyColumn` counts a formula
  cell as not-blank, so a template with `=E*F` filled down the sheet published rows in
  which every cell coerced to `null` — that workbook would have shipped **20 rows, 14
  of them blank**. Leading and trailing all-empty rows are now dropped.
- **A leading column with no header and no value in any row** (that sheet starts its
  data in column B, leaving column A empty). Leading and trailing empty **columns** are
  dropped too, and the build prints how many.

**Interior** blank rows and columns are left alone: they may be deliberate spacing, and
removing one would silently change the shape of the sheet you uploaded. Nothing holding
a value is ever dropped, and the anti-wipe guard still refuses a snapshot with zero rows.

Row numbers in the left rail are the workbook's real rows, so they do not renumber when
rows are trimmed — row 3 in the rail is row 3 in Excel. Column letters **do** shift,
because they are drawn from the trimmed column list; the rail is decoration, not a
promise about your sheet. Start the data in column A if you want the letters to match.
