import { useTranslation } from 'react-i18next';

/**
 * The nameplate — the site's own name, with the logo set to its right.
 *
 * Home was the one page where the site never said its own name in type. The
 * header's `<img>` *is* the wordmark, but at 36px it reads as a mark, not a title.
 *
 * **This is content, not a band.** The first version sat *above* the hero on
 * `bg-navy-deep` — the header's own surface — so it read as the top bar growing
 * taller rather than as the page saying its name. The operator's correction was
 * exact: "The 'CareBridge' should not be on the top bar, it should be part of the
 * content section." So it now renders as the hero's **first child**, inside the
 * `<Section>`'s `Container`, on the page's own ground, sharing the column edge with
 * the display line beneath it. That is also why there is no `Container` here: the
 * `Section` already supplies one, and a second would double the gutter.
 *
 * Four decisions worth keeping:
 *
 * 1. **Size: `clamp(1.75rem, 4.2vw, 4.25rem)`, deliberately well under the hero's
 *    `--text-display-1` rather than a token.** This was `clamp(2.5rem, 7.8vw, 8rem)`
 *    (112.3px at 1440, ~87% of the old headline), and the operator's instruction on
 *    2026-10-17 was that both display lines were too large and the headline should
 *    be relatively larger than this one. It now sits at **~60% of the `<h1>`**
 *    (60.5 vs 100.8px at 1440, 32.3 vs 53.8 at 768) instead of ~87%, so the page
 *    reads name-first, headline-second, and the `<h1>` is once again the loudest
 *    thing on screen. There is still no token at that step, and inventing a
 *    `--text-display-0` would change a scale five pages share to serve one page.
 *    The earlier version of this note recorded the opposite: that the page no
 *    longer had a single loudest element, and that the `<h1>` was barely larger
 *    than the word above it. That was the cost of the old size, and it is paid off
 *    by this one.
 *
 * 2. **Italics, at `font-medium` and not `font-semibold`.** Cormorant Garamond is
 *    loaded at 400/500/600/700 **plus 500 italic only** (`src/fonts.css`); there is
 *    no 600 italic. Asking for `font-semibold italic` would let the browser
 *    synthesise a slanted 600 — a fake — instead of using the real italic face. 500
 *    *is* the italic, so 500 is what is asked for. It also sits a step lighter than
 *    the h1's 600, which helps the two display lines read as different voices.
 *
 * 3. **The logo is aligned to the right edge** (`justify-between`), on the
 *    operator's instruction. It came down with the nameplate — **`clamp(1.75rem,
 *    2.9vw, 2.75rem)`** (41.8px at 1440, 22.3 at 768) instead of `clamp(3rem, 5vw,
 *    5.5rem)` (72px at 1440). Shrinking the word and leaving a 72px mark beside it
 *    would have traded one imbalance for another; the mark now sits at ~0.69 of the
 *    word's size at every visible width, which is where it sat before (0.64–0.80).
 *    It is `shrink-0` so it is never squeezed by the nameplate.
 *
 * 4. **The image is `alt=""` on purpose.** `common.siteName` sits beside it as real
 *    text, so naming the image as well would make a screen reader announce
 *    "CareBridge CareBridge". The text carries the name; the image is decoration.
 *    Below `sm` the logo is **omitted, not shrunk** — the repetition the operator
 *    named, and the same logo is 36px tall in the header directly above.
 */
export function SiteMasthead() {
  const { t } = useTranslation();

  return (
    <div className="mb-12 flex items-center justify-between gap-6 md:mb-16">
      <span className="font-serif text-[clamp(1.75rem,4.2vw,4.25rem)] font-medium italic leading-[0.95] tracking-display text-white">
        {t('common.siteName')}
      </span>
      <img
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt=""
        width={1008}
        height={454}
        className="hidden h-[clamp(1.75rem,2.9vw,2.75rem)] w-auto shrink-0 sm:block"
      />
    </div>
  );
}
