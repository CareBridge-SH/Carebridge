import { useTranslation } from 'react-i18next';
import postsJson from '../data/instagram-posts.json';
import type { InstagramPost } from '../data/types';
import { INSTAGRAM_PROFILE_URL } from '../data/site';

/**
 * Build-time snapshot, imported from JSON — no `fetch`, no network, no token,
 * no `.env`. Array order is display order; nothing is re-sorted by `date` in
 * code.
 */
const posts: InstagramPost[] = postsJson;

export function InstagramFeed() {
  if (posts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <ProfileChrome count={posts.length} />
      <ul className="grid grid-cols-3 gap-1">
        {posts.map((post) => (
          <Tile key={post.id} post={post} />
        ))}
      </ul>
    </div>
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

/**
 * `[]` is the shipped state until real photos exist, so this is the primary
 * design, not a fallback: it renders real copy (`home.instagram.emptyTitle` /
 * `.emptyBody`) and no image element at all, so it can never show a broken
 * image, a spinner, or a network error.
 */
function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg border border-dashed border-lavender-dk p-8 text-center sm:p-12">
      <p className="font-serif text-xl font-semibold text-white sm:text-2xl">
        {t('home.instagram.emptyTitle')}
      </p>
      <p className="mx-auto mt-3 max-w-xl font-sans text-sm text-white">
        {t('home.instagram.emptyBody')}
      </p>
    </div>
  );
}

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
      alt={post.alt}
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
      <li>
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
    <li>
      <figure className="group relative aspect-square overflow-hidden bg-navy-soft">
        {inner}
      </figure>
    </li>
  );
}
