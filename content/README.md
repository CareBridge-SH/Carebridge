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
