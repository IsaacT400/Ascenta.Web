import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/** Restore the old router's scroll, fragment and keyboard-focus behavior. */
export function NavigationEffects() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(new Map<string, [number, number]>());
  const previousPath = useRef(location.pathname);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useLayoutEffect(() => {
    const scrollPositions = positions.current;
    const pathChanged = previousPath.current !== location.pathname;
    previousPath.current = location.pathname;
    const record = () => { scrollPositions.set(location.key, [window.scrollX, window.scrollY]); };
    const saved = scrollPositions.get(location.key);
    let fragment = '';
    try { fragment = decodeURIComponent(location.hash.slice(1)); } catch { /* Invalid fragments have no target. */ }
    const anchor = fragment ? document.getElementById(fragment) : null;

    if (navigationType === 'POP' && saved) window.scrollTo(...saved);
    else if (anchor) anchor.scrollIntoView({ block: 'start' });
    else if (pathChanged) window.scrollTo(0, 0);

    if (pathChanged) document.getElementById('main-content')?.focus({ preventScroll: true });
    record();
    window.addEventListener('scroll', record, { passive: true });
    // A new, shorter page can clamp scrollY before layout-effect cleanup runs.
    // Keep the last position recorded while this history entry was active.
    return () => { window.removeEventListener('scroll', record); };
  }, [location.key, location.pathname, location.hash, navigationType]);

  return null;
}
