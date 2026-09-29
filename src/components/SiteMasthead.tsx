import { useTranslation } from 'react-i18next';
import { Container } from './ui';

/**
 * The nameplate — the site's own name, with the logo set beside it.
 *
 * Home was the one page where the site never said its own name in type. The
 * header's `<img>` *is* the wordmark, but at 36px it reads as a mark, not as a
 * title, so the band between the top bar and the hero read as empty. The operator:
 *
 *   "we lack a title that says 'CareBridge' and that space between the top bar
 *    also looks empty. So now, add a 'CareBridge' onto that place, make the font
 *    size and distances above and below appropriate, and on the right of
 *    'CareBridge' add the logo with the same height or something similar."
 *
 * Three decisions worth keeping:
 *
 * 1. **The ground is `bg-navy-deep`, the header's own surface.** The logo is
 *    opaque artwork that is already proven against exactly this background in the
 *    header; putting it on anything else would be a new compositing question, in
 *    two themes, that nothing has measured. It also makes the band read as the
 *    header gaining a nameplate rather than as a new block appearing.
 *
 * 2. **`text-display-3` is not an arbitrary size — it is the logo's height.** At
 *    1440 that token is 36px and the logo is `h-9` = 36px, so the lockup is
 *    literally the same height, which is what was asked for. It also stays far
 *    below the hero's `text-display-1` (129.6px at 1440), so the page keeps one
 *    loud voice: the h1 is still the loudest thing on it.
 *
 * 3. **The image is `alt=""` on purpose.** `common.siteName` sits beside it as real
 *    text, so naming the image as well would make a screen reader announce
 *    "CareBridge CareBridge". The text carries the name; the image is decoration.
 *
 * Below `sm` the logo is **omitted, not shrunk** — the repetition the operator
 * named. The same logo is 36px tall in the header a few millimetres above, and at
 * 375px the line is 335px wide; the name is the part that has to survive there.
 * That the lockup would in fact still fit at 375px (≈130px + 80px + gap) is the
 * reason this threshold is a judgement rather than a measurement — recorded so the
 * next reader knows it was chosen, not derived.
 */
export function SiteMasthead() {
  const { t } = useTranslation();

  return (
    <div className="bg-navy-deep">
      <Container>
        <div className="flex items-center gap-5 py-6 md:gap-6 md:py-8">
          <span className="font-serif text-display-3 font-semibold tracking-display text-white">
            {t('common.siteName')}
          </span>
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt=""
            width={1008}
            height={454}
            className="hidden h-9 w-auto sm:block"
          />
        </div>
      </Container>
    </div>
  );
}
