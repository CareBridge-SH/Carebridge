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
 * 1. **Size: `clamp(2.5rem, 7.8vw, 8rem)` — deliberately just under the hero's
 *    `--text-display-1` rather than a token.** `display-1` is
 *    `clamp(3.5rem, 9vw, 9rem)`, so 7.8vw against 9vw keeps this at ~87% of the
 *    headline at every width it is visible (59.9 vs 69.1px at 768, 112.3 vs 129.6px
 *    at 1440, 128 vs 144px at 1920) — "just slightly smaller than the big words
 *    below", which is the instruction. There is no token at that step, and inventing
 *    a `--text-display-0` would change a scale five pages share to serve one page.
 *    **This does mean the page no longer has a single loudest element**: the h1 is
 *    still the `<h1>`, but it is no longer the largest thing on screen by a clear
 *    margin. Recorded, not hidden — it is the one thing the operator's size change
 *    overrode.
 *
 * 2. **Italics, at `font-medium` and not `font-semibold`.** Cormorant Garamond is
 *    loaded at 400/500/600/700 **plus 500 italic only** (`src/fonts.css`); there is
 *    no 600 italic. Asking for `font-semibold italic` would let the browser
 *    synthesise a slanted 600 — a fake — instead of using the real italic face. 500
 *    *is* the italic, so 500 is what is asked for. It also sits a step lighter than
 *    the h1's 600, which helps the two display lines read as different voices.
 *
 * 3. **The logo is aligned to the right edge** (`justify-between`), on the
 *    operator's instruction, and sized `clamp(3rem, 5vw, 5.5rem)` — 48px at 768,
 *    72px at 1440, 88px at 1920, against a flat 36px before. It is `shrink-0` so it
 *    is never squeezed by the nameplate.
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
      <span className="font-serif text-[clamp(2.5rem,7.8vw,8rem)] font-medium italic leading-[0.95] tracking-display text-white">
        {t('common.siteName')}
      </span>
      <img
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt=""
        width={1008}
        height={454}
        className="hidden h-[clamp(3rem,5vw,5.5rem)] w-auto shrink-0 sm:block"
      />
    </div>
  );
}
