import { useTranslation } from 'react-i18next';
import postsJson from '../data/instagram-posts.json';
import type { InstagramPost } from '../data/types';
import { INSTAGRAM_PROFILE_URL } from '../data/site';
import { Container, Plate } from './ui';

/**
 * Build-time snapshot, imported from JSON — no `fetch`, no network, no token,
 * no `.env`. Array order is display order; nothing is re-sorted by `date` in
 * code.
 */
const posts: InstagramPost[] = postsJson;

/**
 * This component is rendered **outside** a `Container`, inside a full-bleed
 * band (ROUND4-PLAN §3.1), so it owns its own gutters in both branches.
 */
export function InstagramFeed() {
  /*
   * `[]` is the shipped state, so this is the design and not a fallback.
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

        No `role`/`aria-label` here: a name would need a locale key that does not
        exist yet (`home.instagram.rowLabel`, raised in T21's key list), and
        guessing one is not allowed. Adding the role without a name would be
        worse than the honest nameless tab stop.
      */}
      <div className="overflow-x-auto" tabIndex={0}>
        <ul className="flex w-max gap-3 px-5 pb-2 sm:px-6 lg:px-8">
          {posts.map((post) => (
            <Tile key={post.id} post={post} />
          ))}
        </ul>
      </div>
    </>
  );
}

/**
 * The profile header above the grid: circular avatar, the handle, a real post
 * count (the array length — never a fabricated number), all linking out to the
 * real profile. No invented follower/verified numbers appear here.
 */
function ProfileChrome({ count }: { count: number }) {
  const { t } = useTranslation();

  return (
    <div className="mb-4 flex items-center gap-4">
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
        <span className="font-sans text-lg font-semibold text-white">
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

interface TileProps {
  post: InstagramPost;
}

function Tile({ post }: TileProps) {
  const { t } = useTranslation();

  const image = (
    <img
      /*
       * `post.image` is stored as "/instagram/<file>" and validated that way by
       * check-instagram.mjs, but it is a runtime string, so Vite cannot rewrite
       * it. Used verbatim it would resolve against the ORIGIN root, which on
       * GitHub Pages sits one level above this site. BASE_URL is always
       * slash-terminated.
       */
      src={`${import.meta.env.BASE_URL}${post.image.replace(/^\/+/, '')}`}
      /*
       * The documented fallback, wired at last. `docs/team/INTERFACES.md`
       * describes `home.instagram.altFallback` as what a post with no alt shows,
       * but this rendered a bare `alt={post.alt}` — so a post without one got an
       * empty alt and read as decorative. Round 4 deferred it; T30 closes it.
       */
      alt={post.alt || t('home.instagram.altFallback')}
      loading="lazy"
      className="h-full w-full object-cover"
    />
  );

  /*
   * The hover/focus overlay reveals the post's real caption and date over a
   * dark gradient scrim. Deliberately no engagement numbers: real Instagram
   * shows like/comment counts here, but the snapshot does not carry them, and
   * inventing them would be fabrication.
   */
  const overlay = (
    <span className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-1 bg-linear-to-t from-navy-deep/90 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
      {post.caption ? (
        <span className="line-clamp-3 font-sans text-sm leading-snug text-white">
          {post.caption}
        </span>
      ) : null}
      {post.date ? (
        <span className="font-sans text-xs font-medium text-lavender">
          {post.date}
        </span>
      ) : null}
    </span>
  );

  const inner = (
    <>
      {image}
      {overlay}
      {post.isVideo ? (
        <span
          aria-hidden="true"
          className="absolute right-2 top-2 bg-navy-deep/80 px-2 py-0.5 font-sans text-xs font-semibold text-white"
        >
          {t('home.instagram.videoLabel')}
        </span>
      ) : null}
    </>
  );

  if (post.permalink) {
    return (
      <li className={TILE_WIDTH}>
        <a
          href={post.permalink}
          target="_blank"
          rel="noreferrer noopener"
          className="group relative block aspect-square overflow-hidden bg-navy-soft"
        >
          {inner}
          <span className="sr-only">
            {' '}
            {t('home.instagram.viewPost')} {t('a11y.externalLink')}
          </span>
        </a>
      </li>
    );
  }

  return (
    <li className={TILE_WIDTH}>
      <figure className="group relative aspect-square overflow-hidden bg-navy-soft">
        {inner}
      </figure>
    </li>
  );
}
