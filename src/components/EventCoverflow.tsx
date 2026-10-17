import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';
import type { EventPhoto } from '../data/types';
import EVENT_PHOTOS from '../data/event-photos.json';

/*
 * The Events cover flow — the season's photographs stand in a row, the one in
 * front faces you, its neighbours turn inwards and overlap it.
 *
 * Round 7. This replaces the framed 3:2 `Plate` that used to open this page. The
 * brief: "cancel the original frame of that space", "the background should be in
 * its original color except for the 图片滚动 part" — so there is no frame, no
 * ground of its own, and nothing between the photographs but the page.
 *
 * ── The geometry, and the one number that matters ───────────────────────────
 *
 * Cards are not laid out in a row with a gap. They are all placed at the same
 * centre point and pushed apart by `translateX(distance × step)`, where
 *
 *     step = cardWidth × (1 − OVERLAP)
 *
 * so `step` is *smaller* than a card and the neighbours genuinely overlap —
 * at 470 px cards and OVERLAP 0.40 the step is 282 px, i.e. 188 px of the next
 * photograph is sitting on top of the previous one. Setting OVERLAP to 0 gives
 * the old "side by side" look, which the operator explicitly rejected.
 *
 * ── Why `overflow: hidden` on the stage ─────────────────────────────────────
 *
 * Nineteen cards reach ±5 300 px and would widen the document. The stage clips
 * at the content column, which is also the look: the fan is cut by the page's
 * own grid rather than by the viewport, so it never introduces a horizontal
 * scrollbar (a `100vw` escape here would, because `100vw` includes the vertical
 * scrollbar).
 *
 * ── No photographs yet ─────────────────────────────────────────────────────
 *
 * `event-photos.json` is `[]`, and the page renders nothing at all while it is
 * empty (the guard sits in EventsPage, next to the same guard it already uses
 * for the event list). An empty 400 px band would be the old empty frame with
 * new furniture; the space is better spent on the title.
 */

/** Overlap between neighbouring cards, as a fraction of a card's width. */
const OVERLAP = 0.4;

/** Cards further than this are edge-on slivers; they are also invisible. */
const MAX_TILT = 2.6;
const TILT_DEG = 26;

/** A card is a 4:3 box. The strip is 400 px tall on desktop, 300 px on phones. */
const CARD_RATIO = 0.75;

/** How far the pointer must travel before it counts as a swipe, in px. */
const DRAG_THRESHOLD = 60;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** Card width follows the *viewport*, not the column: 1440 → 470 px, 375 → 278 px. */
function cardWidthFor(viewport: number) {
  if (viewport < 700) return Math.round(viewport * 0.74);
  return Math.round(clamp(viewport * 0.34, 300, 470));
}

/** `(prefers-reduced-motion: reduce)` — the strip then cuts instead of gliding. */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return reduced;
}

export interface EventCoverflowProps {
  className?: string;
}

export function EventCoverflow({ className = '' }: EventCoverflowProps) {
  const { t } = useTranslation();
  const photos: EventPhoto[] = EVENT_PHOTOS;
  const total = photos.length;

  const [active, setActive] = useState(0);
  const [cardWidth, setCardWidth] = useState(() =>
    typeof window === 'undefined' ? 470 : cardWidthFor(window.innerWidth),
  );
  const reduced = useReducedMotion();

  /*
   * A drag leaves a `click` behind it. This flag eats exactly that one click and
   * clears itself, so a swipe never also re-centres a card it happened to end on.
   */
  const swallowClick = useRef(false);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);

  useLayoutEffect(() => {
    const measure = () => setCardWidth(cardWidthFor(window.innerWidth));
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const go = useCallback(
    (target: number) => setActive(clamp(target, 0, total - 1)),
    [total],
  );

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      go(event.key === 'Home' ? 0 : total - 1);
      return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    go(active + (event.key === 'ArrowRight' ? 1 : -1));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = { x: event.clientX, moved: false };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state) return;
    const dx = event.clientX - state.x;
    if (Math.abs(dx) < DRAG_THRESHOLD) return;
    state.moved = true;
    go(active + (dx < 0 ? 1 : -1));
    state.x = event.clientX; // dragging on can keep turning pages
  };

  const endDrag = () => {
    if (drag.current?.moved) {
      swallowClick.current = true;
      window.setTimeout(() => {
        swallowClick.current = false;
      }, 250);
    }
    drag.current = null;
  };

  const cardHeight = Math.round(cardWidth * CARD_RATIO);
  const stepWidth = cardWidth * (1 - OVERLAP);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className={className}>
      <div
        role="group"
        aria-label={t('events.photos.region')}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        className="relative h-[300px] cursor-grab overflow-hidden outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-cream md:h-[400px]"
        style={{ perspective: '1500px', touchAction: 'pan-y' }}
      >
        {photos.map((photo, index) => {
          const distance = index - active;
          const depth = Math.abs(distance);
          const isCurrent = distance === 0;

          return (
            <div
              key={photo.file}
              aria-hidden={isCurrent ? undefined : true}
              onClick={() => {
                if (swallowClick.current) {
                  swallowClick.current = false;
                  return;
                }
                go(index);
              }}
              className="absolute left-1/2 top-1/2 overflow-hidden"
              style={{
                width: cardWidth,
                height: cardHeight,
                /*
                 * `brightness` rather than `opacity` for the near neighbours: a
                 * second photograph showing through the first is exactly the mud
                 * an overlap invites. Only the far ones fade, and by then there
                 * is nothing behind them to show through.
                 */
                filter: `brightness(${1 - Math.min(0.34, depth * 0.09)})`,
                opacity: clamp(1 - Math.max(0, depth - 2) * 0.34, 0, 1),
                transform: `translate(-50%, -50%) translateX(${distance * stepWidth}px) rotateY(${
                  clamp(distance, -MAX_TILT, MAX_TILT) * -TILT_DEG
                }deg) scale(${1 - Math.min(0.3, depth * 0.11)})`,
                zIndex: 500 - Math.round(depth * 10),
                pointerEvents: depth > 6 ? 'none' : 'auto',
                boxShadow: 'var(--shadow-deck)',
                transition: reduced
                  ? 'none'
                  : 'transform 500ms cubic-bezier(.2,.7,.2,1), filter 500ms, opacity 500ms',
              }}
            >
              <img
                src={`${import.meta.env.BASE_URL}photos/events/${photo.file}`}
                alt={t(photo.altKey)}
                loading={index < 3 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
                className="h-full w-full select-none object-cover"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="font-sans text-sm tracking-widest text-cream" aria-live="polite">
          {pad(active + 1)} / {pad(total)}
        </p>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="neutral"
            size="sm"
            aria-label={t('events.photos.prev')}
            disabled={active === 0}
            onClick={() => go(active - 1)}
          >
            ←
          </Button>
          <Button
            type="button"
            variant="neutral"
            size="sm"
            aria-label={t('events.photos.next')}
            disabled={active === total - 1}
            onClick={() => go(active + 1)}
          >
            →
          </Button>
        </div>
      </div>
    </div>
  );
}
