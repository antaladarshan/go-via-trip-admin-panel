import { API_BASE } from './api-base';
import { start, stop } from './loading-store';

type ApiInit = RequestInit & { silent?: boolean };

// The access-token cookie expires after 15 minutes (JWT_ACCESS_EXPIRY). A 401
// partway through a session doesn't mean the user is logged out — it means the
// access token needs a silent refresh via the still-valid refresh-token cookie.
// Dedup concurrent refreshes behind a single in-flight promise.
let refreshPromise: Promise<boolean> | null = null;

function isAuthRoute(input: RequestInfo | URL): boolean {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  return url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
}

function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(res => res.ok)
      .catch(() => false)
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: ApiInit
): Promise<Response> {
  const method = (init?.method ?? 'GET').toUpperCase();
  const block = init?.silent === true
    ? false
    : init?.silent === false
      ? true
      : method !== 'GET';
  if (block) start();
  try {
    let res = await fetch(input, init);
    if (res.status === 401 && !isAuthRoute(input)) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        res = await fetch(input, init);
      }
    }
    return res;
  } finally {
    if (block) stop();
  }
}
