// src/config/apiConfig.ts
// next.config.js merges REACT_APP_API_URL into NEXT_PUBLIC_API_URL for CRA parity with main.
//
// Production browser: REST uses same-origin /api/be → proxied via next.config.js rewrites.
// Socket.IO still needs the real backend URL — use getSocketUrl().

function serverBackend(): string {
  return (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.REACT_APP_API_URL ||
    'http://localhost:8080'
  ).replace(/\/$/, '');
}

function computeRestBase(): string {
  if (process.env.NODE_ENV !== 'production') {
    return serverBackend();
  }
  if (typeof window === 'undefined') {
    return serverBackend();
  }
  return '/api/be';
}

const apiUrl = computeRestBase();

if (
  typeof window !== 'undefined' &&
  process.env.NODE_ENV === 'production' &&
  serverBackend().includes('localhost')
) {
  // eslint-disable-next-line no-console
  console.error(
    '[mythic-plus] Production API URL resolves to localhost. Set NEXT_PUBLIC_API_URL or REACT_APP_API_URL before `next build`.',
  );
}

export default apiUrl;

/** Real API origin for Socket.IO (not proxied). */
export function getSocketUrl(): string {
  return serverBackend();
}
