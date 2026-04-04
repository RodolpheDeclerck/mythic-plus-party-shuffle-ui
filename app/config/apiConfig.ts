// src/config/apiConfig.ts
// next.config.js merges REACT_APP_API_URL into NEXT_PUBLIC_API_URL for CRA parity with main.
const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const apiUrl = raw.replace(/\/$/, '');

if (
  typeof window !== 'undefined' &&
  process.env.NODE_ENV === 'production' &&
  apiUrl.includes('localhost')
) {
  // eslint-disable-next-line no-console
  console.error(
    '[mythic-plus] Production build is using a localhost API URL. Set NEXT_PUBLIC_API_URL or REACT_APP_API_URL before `next build`.',
  );
}

export default apiUrl;
