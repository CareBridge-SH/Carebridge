/**
 * Site-wide constants that more than one component needs.
 *
 * These live here rather than inside the component that happened to need them
 * first, so a page never has to import a constant out of a layout component to
 * avoid duplicating a URL.
 */

/**
 * The project's single Instagram profile URL, **canonically defined here**.
 *
 * It is the real profile the visible handle (`footer.instagramHandle`,
 * `@CAREBRIDGE.SHANGHAI`) points at, not Instagram's generic homepage. Any new
 * link to the profile must use this constant -- see docs/INSTAGRAM.md §9 for why
 * the feed itself is a build-time snapshot rather than a live embed.
 */
export const INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/carebridge.shanghai/';
