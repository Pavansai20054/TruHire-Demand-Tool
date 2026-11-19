// Shared navigation helpers so every page handles "Back" and post-login redirects the same way.
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DEFAULT_ROUTE, STORAGE_KEYS } from '../config/env';

export { DEFAULT_ROUTE };

// sessionStorage key holding the Ingestion History filters (its URL query string), so the
// "Ingestion History" button reopens the view the user last left.
export const HISTORY_QUERY_KEY = STORAGE_KEYS.ingestionHistoryQuery;

// Only allow in-app paths as redirect targets (no protocol-relative or external URLs, no login loop).
export function safeAppPath(path) {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return null;
  if (path === '/login' || path.startsWith('/login?') || path.startsWith('/login/')) return null;
  return path;
}

// Router state to attach to a <Link> so the destination can offer "Back to <label>".
export function fromState(location, label) {
  return { from: { path: `${location.pathname}${location.search}`, label } };
}

// Helper to deduce a human-friendly label from a path
export function labelFromPath(path) {
  if (!path) return null;
  if (path.startsWith('/candidate-history')) return 'Candidate History';
  if (path.startsWith('/search')) return 'Search';
  if (path.startsWith('/demands') || path.startsWith('/requirements') || path.startsWith('/job-descriptions') || path.startsWith('/positions')) return 'Requirements';
  if (path.startsWith('/ingestion/history')) return 'Ingestion History';
  if (path.startsWith('/ingestion')) return 'Ingestion';
  if (path.startsWith('/email')) return 'Email';
  if (path.startsWith('/analytics')) return 'Analytics';
  if (path.startsWith('/ai-audit') || path.startsWith('/audit')) return 'AI Audit';
  if (path.startsWith('/tracker')) return 'Requirement Tracker';
  if (path.startsWith('/assistant')) return 'Assistant';
  return null;
}

// Returns { goBack, backLabel }. When the user arrived through an in-app link that recorded
// `from` or has session history, Back pops the browser history (so the previous page keeps its query/filters and the
// Forward button still works). On a direct visit there is no in-app entry to pop, so it
// navigates to the fallback instead of leaving the app.
export function useBackNavigation(fallbackPath, fallbackLabel) {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from;
  const target = safeAppPath(from?.path);

  // Check if browser/router has history inside this app
  const hasHistory = typeof window !== 'undefined' && (
    (typeof window.history?.state?.idx === 'number' && window.history.state.idx > 0) ||
    (window.history?.length > 1 && location.key !== 'default')
  );

  let referrerPath = null;
  if (typeof window !== 'undefined' && document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      if (refUrl.origin === window.location.origin) {
        referrerPath = safeAppPath(refUrl.pathname);
      }
    } catch {
      // ignore URL parsing error
    }
  }

  const deducedLabel =
    from?.label ||
    labelFromPath(target) ||
    labelFromPath(referrerPath) ||
    fallbackLabel ||
    'Previous Page';

  const goBack = useCallback(() => {
    if (hasHistory) {
      navigate(-1);
    } else if (target) {
      navigate(target);
    } else if (referrerPath) {
      navigate(referrerPath);
    } else {
      navigate(fallbackPath || '/');
    }
  }, [hasHistory, target, referrerPath, navigate, fallbackPath]);

  return { goBack, backLabel: deducedLabel };
}
