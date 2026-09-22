import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface RouteMetaProps {
  /**
   * The i18n namespace whose SEO pair applies, e.g. `'home'`, `'involved'`.
   *
   * A namespace rather than two raw key strings on purpose: the pair is always
   * `<ns>.meta.title` / `<ns>.meta.description`, and this
   * shape makes it impossible to pass the visible `<h1>`/intro key by mistake.
   * Note the namespace is not always the route path -- `/get-involved` -> `involved`.
   */
  namespace: string;
}

/**
 * Sets the document `<title>` and `<meta name="description">` for the route
 * currently mounted. Renders nothing.
 */
export function RouteMeta({ namespace }: RouteMetaProps) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t(`${namespace}.meta.title`);

    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', t(`${namespace}.meta.description`));
    // `i18n.language` is a dependency as well as `t`: switching locale must
    // re-title the page even if the `t` identity happens to be stable.
  }, [t, i18n.language, namespace]);

  return null;
}
