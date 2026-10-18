import { useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import postsJson from '../data/instagram-posts.json';
import type { InstagramPost } from '../data/types';
import { INSTAGRAM_PROFILE_URL } from '../data/site';
import { Container, Plate } from './ui';
import { deckCard } from './ui/deck';

/**
 * Build-time snapshot, imported from JSON — no `fetch`, no network, no token,
 * no `.env`. Array order is display order; nothing is re-sorted by `date` in
 * code.
 */
const posts: InstagramPost[] = postsJson;

/**
 * A post's pictures are a *deck*, not a grid: the same rolling method as the
 * Events page, at a much higher overlap.
 *
 * 85% — the same picture-rolling method as Events, at a high overlap. The
 * number is not a style choice — it is what makes the
 * gesture legible at tile size. The Events deck at 40% shows each neighbour as a
 * *picture*; these tiles are 160–256 px wide, where a 40% overlap would show
 * three unreadable slivers of photo. At 85% each neighbour is a 15% edge, which
 * reads as one object with thickness — "there is more in here" — which is the
 * only thing a carousel badge has to say in a 224 px tile.
 *
 * The step is expressed as a percentage rather than a measured pixel width: in
 * `translateX`, a percentage resolves against the element's own width, so 15% is
 * 15% of the card at 160 px and at 256 px alike, with no ResizeObserver and no
 * resize listener. `deckCard` takes it as a CSS length for exactly this reason.
 */
const DECK_OVERLAP = 0.85;
const DECK_STEP = `${Math.round((1 - DECK_OVERLAP) * 100)}%`;

/**
 * How far the fan may reach, in steps — 1, so a multi-picture tile shows the
 * active picture plus one edge either side.
 *
 * This is a width budget, not a taste call. A fan of N cards is
 * `card × (1 + N × 15%)` wide, and the tile is deliberately 1.3 cards wide (see
 * MULTI_TILE_WIDTH), so exactly one step each way fits and a second would be
 * sliced by the tile's `overflow-hidden`. At 85% overlap a stack only ever reads
 * as three: past the first neighbour the edges are behind each other anyway.
 * The counter is what says "five", not the number of slivers.
 */
const DECK_DEPTH = 1;

/**
 * The card inside a multi-picture tile: one step of room on each side, so
 * `1.3 × 76.9231% = 100%` of the tile.
 *
 * The number exists so a carousel's photographs are the SAME SIZE as a single
 * post's photograph (160×213 px at the smallest size, exactly like the tile next
 * to it) and the extra width is the fan's room rather than a bigger picture. A
 * row where carousels are visibly bigger than single photos reads as two
 * different components.
 */
const DECK_CARD_WIDTH = '76.9231%';

/**
 * This component is rendered **outside** a `Container`, inside a full-bleed
 * band, so it owns its own gutters in both branches.
 */
export function InstagramFeed() {
  /*
   * `[]` is a valid shipped state, so this is a design and not a fallback.
   *
   * It used to be an `EmptyState` — a dashed box carrying "Photos coming soon",
   * which is an apology and reads as a void. It is now the **plate band**: the
   * engraved plate at bleed width, captioned with the club's real handle. Nothing
   * is invented and nothing is promised; the band is simply composed. The caption
   * is an existing key (`footer.instagramHandle`), not new copy.
   */
  if (posts.length === 0) {
    return <Plate slug="instagram" captionKey="footer.instagramHandle" />;
  }

  return (
    <>
      <Container>
        <ProfileChrome count={posts.length} />
      </Container>

      {/*
        The row, not the grid: it runs edge to edge and the tiles past the
        viewport are cut, which is what says "there is more where this came
        from". A plain `overflow-x-auto` — no `snap-mandatory` and no touch
        handler, so a vertical swipe still scrolls the page and the row is not
        a scroll jail.

        The track is `w-max` so it takes its natural width and overflows; the
        `px-*` gutter matches `Container`'s, so the first tile lines up with the
        heading above it. `pb-2` keeps a scrollbar off the tiles.

        Keyboard: `tabIndex={0}` makes the row itself scrollable from the
        keyboard, which matters for the case where a snapshot has no tile to
        focus (a post with no `permalink` renders a `<figure>`, not a link) —
        content past the edge would otherwise be unreachable, and that is WCAG
        2.1.1, not a nicety. Measured clean by axe in both themes at 375 and
        1440 with a populated, overflowing row.
      */}
      <div className="overflow-x-auto" tabIndex={0}>
        <ul className="flex w-max items-start gap-3 px-5 pb-2 sm:px-6 lg:px-8">
          {posts.map((post) => (
            <Tile key={post.id} post={post} />
          ))}
        </ul>
      </div>
    </>
  );
}

/**
 * The profile header above the row: circular avatar, the handle, a real post
 * count (the array length — never a fabricated number), all linking out to the
 * real profile. No invented follower/verified numbers appear here.
 */
function ProfileChrome({ count }: { count: number }) {
  const { t } = useTranslation();

  return (
    /*
      `flex-wrap` is load-bearing on phones. The handle is a single unbreakable
      token, so at 375 the avatar + handle + count came to 358 px inside a 335 px
      column and the whole document scrolled sideways by 14 px. This header only
      exists once there is at least one post, which is why it went unseen for as
      long as the feed was empty: add the first post and the home page broke on
      every phone. Wrapping sends the count to its own line instead.
    */
    <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1">
      <a
        href={INSTAGRAM_PROFILE_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="flex items-center gap-3"
      >
        <img
          src={`${import.meta.env.BASE_URL}favicon.png`}
          alt=""
          className="h-14 w-14 shrink-0 rounded-full bg-navy-soft object-cover"
        />
        {/*
          `text-base` until the 640px breakpoint. The handle is one unbreakable
          word: at 18px it is 235px wide, and 235 + a 56px avatar + the gap + the
          section's padding is wider than a 320px phone, so the page scrolled
          sideways. 16px fits with 11px to spare and the whole handle stays
          readable — truncating it would be worse than a smaller size.
        */}
        <span className="font-sans text-base font-semibold text-white sm:text-lg">
          {t('footer.instagramHandle')}
        </span>
        <span className="sr-only"> {t('a11y.externalLink')}</span>
      </a>
      <span className="font-sans text-sm font-medium text-lavender">
        {t('home.instagram.postCount', { count })}
      </span>
    </div>
  );
}

/*
 * A fixed width, because the tiles are a flex row now rather than grid cells:
 * without it each tile would collapse to its content and the row would never
 * overflow, so nothing would be cut and the bleed would be decorative.
 */
const TILE_WIDTH = 'w-40 shrink-0 sm:w-56 lg:w-64';

/**
 * A carousel's tile is 1.3× as wide as a single post's, at the SAME height.
 *
 * The extra 30% is the fan's room: a card plus one 15% step on each side. That is
 * the whole trick — the photograph inside a carousel tile is 76.9231% of the tile
 * and therefore identical in size to the photograph in the neighbouring single
 * post (160×213, 224×299, 256×341), while the tile itself reserves the space the
 * overlapping edges need. Without it a full-width card leaves the fan nowhere to
 * go and the neighbours are clipped to nothing: an 85% overlap you cannot see.
 *
 * 39/40 is 1.3 × 3/4 — the tile's own ratio at that width, so the two tile kinds
 * are exactly the same height and the row has one baseline.
 */
const MULTI_TILE_WIDTH = 'w-[13rem] shrink-0 sm:w-[18.2rem] lg:w-[20.8rem]';
const MULTI_FRAME = 'relative aspect-[39/40] overflow-hidden bg-navy-soft';

/**
 * 3:4, not 1:1.
 *
 * Every photograph published so far is 3:4 portrait (1080×1440 and
 * friends) — it is what Instagram itself composes. A square tile crops 25% of
 * the picture, and on a portrait shot of people, the 25% it takes is their legs
 * or their heads. The tile takes the shape of the thing it holds.
 */
const FRAME = 'relative aspect-[3/4] overflow-hidden bg-navy-soft';

/**
 * `post.images[].src` is stored as "/instagram/<file>" and validated that way by
 * check-instagram.mjs, but it is a runtime string, so Vite cannot rewrite it.
 * Used verbatim it would resolve against the ORIGIN root, which on GitHub Pages
 * sits one level above this site. BASE_URL is always slash-terminated.
 */
function resolve(src: string) {
  return `${import.meta.env.BASE_URL}${src.replace(/^\/+/, '')}`;
}

interface TileProps {
  post: InstagramPost;
}

function Tile({ post }: TileProps) {
  const { t } = useTranslation();
  const multi = post.images.length > 1;

  /*
   * Belt and braces. `check-instagram.mjs` fails a post with no pictures, so
   * this should be unreachable — but `images[0]` on an empty array is a runtime
   * crash, and a crash here takes the whole home page down, not one tile.
   */
  if (post.images.length === 0) return null;

  /*
   * The hover/focus overlay reveals the post's real caption and date over a
   * dark gradient scrim. Deliberately no engagement numbers: real Instagram
   * shows like/comment counts here, but the snapshot does not carry them, and
   * inventing them would be fabrication.
   */
  const overlay = (
    <span className="pointer-events-none absolute inset-0 z-[550] flex flex-col justify-end gap-1 bg-linear-to-t from-navy-deep/90 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
      {post.caption ? (
        <span className="line-clamp-3 font-sans text-sm leading-snug text-white">
          {post.caption}
        </span>
      ) : null}
      {post.date ? (
        <span className="font-sans text-xs font-medium text-lavender">{post.date}</span>
      ) : null}
    </span>
  );

  /*
   * A carousel cannot be an `<a>`.
   *
   * Advancing a deck is a button's job, and a button inside a link is invalid
   * markup that axe fails outright — so the post's permalink moves to its own
   * control in the corner instead of wrapping the whole tile. That is also what
   * Instagram does, and it is honest: a link that looks like it opens the post
   * while it actually advances the deck is worse than two explicit controls.
   */
  if (multi) {
    return (
      <li className={MULTI_TILE_WIDTH}>
        <div className={`group ${MULTI_FRAME}`}>
          <PhotoDeck post={post} />
          {overlay}
          {post.isVideo ? <VideoBadge label={t('home.instagram.videoLabel')} /> : null}
          {post.permalink ? (
            <a
              href={post.permalink}
              target="_blank"
              rel="noreferrer noopener"
              className="absolute right-2 top-2 z-[600] flex h-6 w-6 items-center justify-center bg-navy-deep/80 font-sans text-sm text-white outline-none transition-colors hover:bg-navy-deep focus-visible:ring-2 focus-visible:ring-cream"
            >
              <span aria-hidden="true">↗</span>
              <span className="sr-only">
                {t('home.instagram.viewPost')} {t('a11y.externalLink')}
              </span>
            </a>
          ) : null}
        </div>
      </li>
    );
  }

  const image = post.images[0];

  return (
    <li className={TILE_WIDTH}>
      {post.permalink ? (
        <a href={post.permalink} target="_blank" rel="noreferrer noopener" className={`group block ${FRAME}`}>
          <img
            src={resolve(image.src)}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          {overlay}
          {post.isVideo ? <VideoBadge label={t('home.instagram.videoLabel')} /> : null}
          <span className="sr-only">
            {t('home.instagram.viewPost')} {t('a11y.externalLink')}
          </span>
        </a>
      ) : (
        <figure className={`group ${FRAME}`}>
          <img
            src={resolve(image.src)}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          {overlay}
          {post.isVideo ? <VideoBadge label={t('home.instagram.videoLabel')} /> : null}
        </figure>
      )}
    </li>
  );
}

function VideoBadge({ label }: { label: string }) {
  return (
    <span
      aria-hidden="true"
      className="absolute left-2 top-2 z-[600] bg-navy-deep/80 px-2 py-0.5 font-sans text-xs font-semibold text-white"
    >
      {label}
    </span>
  );
}

/**
 * One post's pictures, fanned at 85% overlap.
 *
 * Deliberately the same method as `EventCoverflow` — every card at the same
 * centre point, pushed out by `distance × step`, with `deckCard` doing the
 * arithmetic — and deliberately a different component, because that one is a
 * page-scale viewer with drag, a keyboard model, a live counter and its own
 * i18n, and dragging a deck that lives *inside* a horizontally scrolling row
 * would fight the row for the same gesture. Here the deck advances by button or
 * arrow key; the row keeps the swipe.
 */
function PhotoDeck({ post }: { post: InstagramPost }) {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const total = post.images.length;

  const go = (next: number) => setActive(Math.max(0, Math.min(total - 1, next)));

  /*
   * Arrow keys are handled once, on the wrapper, not per button. Both buttons sit
   * inside it so their key events bubble here, and ArrowRight then means "next"
   * whichever button happens to have focus — per-button handling would make
   * ArrowRight on the *left* button go backwards.
   */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    go(active + (event.key === 'ArrowRight' ? 1 : -1));
  };

  return (
    <div className="absolute inset-0" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 overflow-hidden">
        {post.images.map((image, index) => {
          const distance = index - active;
          const isActive = distance === 0;

          const style = deckCard({
            distance,
            step: DECK_STEP,
            /*
             * A shallower tilt than the Events deck's 26°. At this size a big
             * rotateY foreshortens a 160 px card by ~1% and steals ~4 px from the
             * very sliver the overlap exists to show; 4° keeps a hint of turn
             * without eating the visible step.
             */
            tiltDeg: 4,
            maxTilt: 2,
            scaleStep: 0.05,
            maxScale: 0.15,
            dimStep: 0.14,
            maxDim: 0.45,
            fadeFrom: 2,
            fadeStep: 0.3,
            shadow: 'var(--shadow-deck)',
            duration: 420,
          });

          /*
           * Past the fan's reach the picture stays mounted but invisible: it is
           * already decoded, so stepping back to it is instant, and unmounting
           * would put a blank frame in the middle of a gesture.
           */
          if (Math.abs(distance) > DECK_DEPTH) {
            style.opacity = 0;
            style.pointerEvents = 'none';
          }

          return (
            <img
              key={image.src}
              src={resolve(image.src)}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading={index < 2 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              /* Only the picture facing you is announced; the rest are edges. */
              aria-hidden={!isActive || undefined}
              /*
               * Width, not `h-full`: the card is one step narrower than the tile
               * on each side, so the neighbours have somewhere to be seen. The
               * height follows from the 3:4 ratio, which lands it exactly on the
               * tile's height — see MULTI_TILE_WIDTH.
               */
              className="absolute left-1/2 top-1/2 aspect-[3/4] select-none object-cover"
              style={{ ...style, width: DECK_CARD_WIDTH }}
            />
          );
        })}
      </div>

      {/*
        The counter is one <span> for the eye and one for the ear. "2/5" is
        legible but reads as "two slash five"; the live region carries the
        sentence. It is `polite` so stepping through a deck never interrupts
        whatever the person was already listening to.
      */}
      <span
        aria-hidden="true"
        className="absolute bottom-2 left-2 z-[600] bg-navy-deep/80 px-2 py-0.5 font-sans text-xs font-semibold tabular-nums text-white"
      >
        {active + 1}/{total}
      </span>
      <span className="sr-only" aria-live="polite">
        {t('home.instagram.imagePosition', { index: active + 1, total })}
      </span>

      <div className="absolute bottom-2 right-2 z-[600] flex gap-1">
        <DeckButton
          label={t('home.instagram.prevImage')}
          disabled={active === 0}
          onClick={() => go(active - 1)}
        >
          ←
        </DeckButton>
        <DeckButton
          label={t('home.instagram.nextImage')}
          disabled={active === total - 1}
          onClick={() => go(active + 1)}
        >
          →
        </DeckButton>
      </div>
    </div>
  );
}

/**
 * 24×24, which is the WCAG 2.5.8 (AA) minimum tap target and about as much
 * chrome as a 160 px tile can carry.
 */
function DeckButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center border border-white/25 bg-navy-deep/80 font-sans text-xs leading-none text-white outline-none transition-colors hover:bg-navy-deep disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-cream"
    >
      {children}
    </button>
  );
}
