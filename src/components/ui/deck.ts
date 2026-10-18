import type { CSSProperties } from 'react';

/*
 * The deck geometry — the one piece of arithmetic both "rolling picture" surfaces
 * share.
 *
 * There are two of them now:
 *
 *   Events page   EventCoverflow    4:3 cards, 40% overlap, 470 / 278 px wide
 *   Home page     InstagramFeed    3:4 cards, 85% overlap, 160–256 px wide
 *
 * They look different because the constants differ, not because the method does.
 * Both place every card at the SAME centre point and push it out by
 *
 *     translateX(distance × step)
 *
 * where `step = cardWidth × (1 − overlap)`. `step` is smaller than a card, so the
 * neighbours genuinely sit on top of each other — at 40% the stack reads as a fan
 * you can read, at 85% it reads as a dense wedge of edges, which is the point of
 * the Instagram one: it says "this post has more in it" without spending a
 * carousel's width on saying it.
 *
 * Keeping this in one function is the whole reason it exists. Two copies of this
 * formula is how the two decks quietly drift apart, and drifting is invisible
 * until someone puts them side by side on the same page.
 *
 * `step` is a CSS length, not a number, so the caller chooses its unit:
 *
 *   - the Events deck measures its cards in JS (they follow the viewport) and
 *     passes `"282px"`;
 *   - the Instagram deck's cards are sized by CSS classes, and a percentage in
 *     `translateX` resolves against the element's own width, so it passes `"15%"`
 *     and needs no measurement, no ResizeObserver and no resize listener.
 *
 * Either way the result is `calc(distance * step)`, which is why `step` must
 * always carry its unit — `calc(2 * 15)` is not a length.
 */

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export interface DeckCardOptions {
  /** Signed distance from the active card, in steps. Negative is to the left. */
  distance: number;

  /** One card-to-card step, WITH its unit: `"282px"` or `"15%"`. */
  step: string;

  /** Each step away from centre turns the card this far, in degrees. */
  tiltDeg: number;

  /**
   * Steps past this stop tilting. Without a cap, card nine is edge-on and its
   * width collapses to a sliver of shadow.
   */
  maxTilt: number;

  /** Scale lost per step, and the floor it may not go under. */
  scaleStep: number;
  maxScale: number;

  /**
   * Brightness lost per step, and the floor.
   *
   * `filter: brightness()` rather than `opacity` for the near neighbours: a
   * second picture showing through the first is exactly the mud an overlap
   * invites. Opacity is reserved for the far ones, where there is nothing behind
   * them left to show through.
   */
  dimStep: number;
  maxDim: number;

  /** Step at which fading starts, and how much is lost per step after that. */
  fadeFrom: number;
  fadeStep: number;

  /** Card shadow, e.g. `var(--shadow-deck)`. */
  shadow: string;

  /** Transition length in ms. Pass 0 for `prefers-reduced-motion: reduce`. */
  duration: number;
}

/**
 * The full visual state of one card in a deck. Position, depth cueing and the
 * shadow all come from `distance` alone, so a card can be re-styled without
 * knowing anything about the deck it is in.
 *
 * Deliberately does NOT set `width` / `height` / `pointerEvents` — those are the
 * caller's business, and spreading them over this object is the clean way in.
 */
export function deckCard({
  distance,
  step,
  tiltDeg,
  maxTilt,
  scaleStep,
  maxScale,
  dimStep,
  maxDim,
  fadeFrom,
  fadeStep,
  shadow,
  duration,
}: DeckCardOptions): CSSProperties {
  const depth = Math.abs(distance);

  return {
    transform: [
      'translate(-50%, -50%)',
      `translateX(calc(${distance} * ${step}))`,
      `rotateY(${clamp(distance, -maxTilt, maxTilt) * -tiltDeg}deg)`,
      `scale(${1 - Math.min(maxScale, depth * scaleStep)})`,
    ].join(' '),
    filter: `brightness(${1 - Math.min(maxDim, depth * dimStep)})`,
    opacity: clamp(1 - Math.max(0, depth - fadeFrom) * fadeStep, 0, 1),
    /*
     * Depth-ordered, one decade per step, so a card can never be painted over a
     * nearer one by a tie. 500 is arbitrary; nothing else on these pages uses
     * z-index in that range.
     */
    zIndex: 500 - Math.round(depth * 10),
    boxShadow: shadow,
    transition:
      duration > 0
        ? `transform ${duration}ms cubic-bezier(.2,.7,.2,1), filter ${duration}ms, opacity ${duration}ms`
        : 'none',
  };
}
