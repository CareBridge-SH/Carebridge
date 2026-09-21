import { useCallback, useSyncExternalStore } from 'react';

/**
 * The one storage key the theme uses. `index.html`'s inline pre-paint script
 * reads the same string, so changing it here without changing it there would
 * reintroduce a flash of the wrong theme.
 */
export const THEME_STORAGE_KEY = 'carebridge-theme';

export type Theme = 'dark' | 'light';

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * The single source of truth for "what theme is showing right now".
 *
 * It reads `document.documentElement.dataset.theme` — the attribute the pre-paint
 * script set and that `src/index.css` keys its light-mode block off — and *never*
 * the stored value. A stale stored value has already produced a false
 * "the toggle is broken" report on this project.
 */
function readAppliedTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  const applied = document.documentElement.getAttribute('data-theme');
  if (applied === 'light' || applied === 'dark') return applied;
  // No attribute at all (only reachable if the inline script did not run):
  // fall back to the OS preference, exactly as that script does.
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

/** No server render here; this only keeps `useSyncExternalStore` happy. */
function getServerSnapshot(): Theme {
  return 'dark';
}

function applyTheme(next: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Private mode / storage disabled: the choice just is not remembered.
  }
  document.documentElement.setAttribute('data-theme', next);
  for (const listener of listeners) listener();
}

export interface UseThemeResult {
  /** What is actually applied to the DOM right now — not what is stored. */
  theme: Theme;
  setTheme: (next: Theme) => void;
  /** Flips to the other theme. Reads the DOM at call time, so it cannot go stale. */
  toggle: () => void;
}

/**
 * Theme preference, shared by every caller.
 *
 * State lives in the DOM attribute, so all consumers stay in sync without a
 * provider and without fighting the pre-paint script: on mount the hook simply
 * adopts whatever `index.html` already applied.
 */
export function useTheme(): UseThemeResult {
  const theme = useSyncExternalStore(
    subscribe,
    readAppliedTheme,
    getServerSnapshot,
  );

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
  }, []);

  const toggle = useCallback(() => {
    applyTheme(readAppliedTheme() === 'dark' ? 'light' : 'dark');
  }, []);

  return { theme, setTheme, toggle };
}
