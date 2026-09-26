import { useTranslation } from 'react-i18next';
import postsJson from '../data/instagram-posts.json';
import type { InstagramPost } from '../data/types';
import { Grid } from './ui';

/**
 * Build-time snapshot, imported from JSON — no `fetch` here, no network, no
 * token, no `.env`. The data may be refreshed by `scripts/sync-instagram.mjs`
 * (see docs/INSTAGRAM.md §9), but that happens off the visitor's machine: this
 * component only ever reads the committed file. Array order is display order;
 * nothing is re-sorted by `date` in code.
 */
const posts: InstagramPost[] = postsJson;

/** First N tiles load eagerly (the above-the-fold row); the rest lazy-load. */
const EAGER_COUNT = 3;

export function InstagramFeed() {
  if (posts.length === 0) {
    return <EmptyState />;
  }

  return (
    <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="md">
      {posts.map((post, index) => (
        <Tile key={post.id} post={post} eager={index < EAGER_COUNT} />
      ))}
    </Grid>
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
  eager: boolean;
}

function Tile({ post, eager }: TileProps) {
  const { t } = useTranslation();

  /*
   * Fixed aspect box BEFORE the image loads is what stops layout shift. Use the
   * post's intrinsic `width`/`height` when present; a maintainer who forgets
   * them still gets a correct-looking 1:1 tile (and a warning from
   * `check-instagram.mjs`), never a distorted or jumping image.
   */
  const aspectRatio =
    post.width && post.height ? `${post.width} / ${post.height}` : '1 / 1';

  const image = (
    <div
      className="relative overflow-hidden rounded-lg border border-lavender-dk bg-navy-soft"
      style={{ aspectRatio }}
    >
      <img
        /*
         * `post.image` is stored as "/instagram/<file>" and validated that way by
         * check-instagram.mjs, but it is a runtime string, so Vite cannot rewrite
         * it. Used verbatim it would resolve against the ORIGIN root, which on
         * GitHub Pages sits one level above this site -- every feed image would
         * 404 once the account has posts. BASE_URL is always slash-terminated.
         */
        src={`${import.meta.env.BASE_URL}${post.image.replace(/^\/+/, '')}`}
        alt={post.alt || t('home.instagram.altFallback')}
        loading={eager ? 'eager' : 'lazy'}
        width={post.width}
        height={post.height}
        className="h-full w-full object-cover"
      />
      {post.isVideo ? (
        <span
          aria-hidden="true"
          className="absolute top-2 left-2 rounded bg-navy-deep px-2 py-0.5 font-sans text-xs font-semibold text-white"
        >
          {t('home.instagram.videoLabel')}
        </span>
      ) : null}
    </div>
  );

  return (
    <figure className="flex h-full flex-col">
      {post.permalink ? (
        /*
         * The image's `alt` IS the link's accessible name; the new-tab hint and
         * the "view on Instagram" suffix are `sr-only` text INSIDE the link --
         * never an `aria-label`, which would replace the alt and break WCAG
         * 2.5.3 (label in name).
         */
        <a
          href={post.permalink}
          target="_blank"
          rel="noreferrer noopener"
          className="block"
        >
          {image}
          <span className="sr-only">
            {' '}
            {t('home.instagram.viewPost')} {t('a11y.externalLink')}
          </span>
        </a>
      ) : (
        image
      )}

      {post.caption || post.date ? (
        <figcaption className="mt-3 flex flex-col gap-1">
          {post.date ? (
            <span className="font-sans text-sm font-medium text-lavender">
              {post.date}
            </span>
          ) : null}
          {post.caption ? (
            <span className="font-sans text-sm text-white">{post.caption}</span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
