import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Container } from './Container';

/**
 * The report's contents page: one folio per section, in route order.
 *
 * The folios are numerals, not translatable strings — Arabic digits are the
 * same in both locales, exactly as the section numerals are. The section NAME
 * comes from the existing `nav.*` keys, so furniture costs the i18n layer
 * nothing: **round 5 introduces no key for it.**
 *
 * A path that is not one of the five sections (`/donate` on its way through the
 * redirect, the `*` catch-all, anything unknown) has no folio, and furniture
 * renders **nothing at all** rather than a guessed section name or a folio 00.
 * That is what keeps it off a 404.
 */
const FOLIOS: Record<string, { key: string; folio: string }> = {
  '/': { key: 'nav.home', folio: '01' },
  '/about': { key: 'nav.about', folio: '02' },
  '/events': { key: 'nav.events', folio: '03' },
  '/get-involved': { key: 'nav.getInvolved', folio: '04' },
  '/transparency': { key: 'nav.transparency', folio: '05' },
};

function useFolio() {
  const { pathname } = useLocation();
  return FOLIOS[pathname] ?? null;
}

/**
 * The running head: which section of the report you are in, and its folio.
 *
 * It sits **outside `<main>`**, so it is not part of the page's reading order —
 * a screen reader user navigating by landmark never has to pass through the
 * furniture to reach the content.
 *
 * Accessibility: the section name is real text. It is not a duplicate of
 * anything announced nearby — on `/` the heading is "Bridging Care and
 * Compassion." while this says "Home" — so it orients rather than repeats. The
 * folio number is `aria-hidden`: a page number is not content, and reading
 * "zero one" before every page would be noise.
 */
export function RunningHead() {
  const { t } = useTranslation();
  const section = useFolio();
  if (!section) return null;

  return (
    <div className="border-b border-rule">
      {/*
        `h-9` is a RESERVED height, not a padding, and it is the reason this
        band costs no CLS. The section name is set in a webfont that arrives
        after first paint; without a fixed line box the swap changes the band's
        height and pushes everything below it down — measured as 0.05 CLS at
        375px on /events, which is over the round's own ceiling. A fixed height
        means the swap can change glyph widths and nothing else, and the two
        ends are pinned to opposite edges so a width change moves neither.
      */}
      <Container className="flex h-9 items-center justify-between gap-4">
        <p className="font-mono text-label tracking-label text-lavender uppercase">
          {t(section.key)}
        </p>
        <span
          aria-hidden="true"
          className="font-mono text-label tracking-label text-lavender"
        >
          {section.folio}
        </span>
      </Container>
    </div>
  );
}

/**
 * The folio at the foot: the same number, on the other edge of the sheet.
 *
 * The whole band is decoration — the number is `aria-hidden` and there is no
 * text in it — so it adds nothing to the accessibility tree. It sits outside
 * `<main>` as well, between the content and the footer.
 */
export function Folio() {
  const section = useFolio();
  if (!section) return null;

  return (
    <div className="border-t border-rule">
      {/* Reserved height, for the same reason as the running head above. */}
      <Container className="flex h-10 items-center justify-end">
        <span
          aria-hidden="true"
          className="font-mono text-label tracking-label text-lavender"
        >
          {section.folio}
        </span>
      </Container>
    </div>
  );
}
