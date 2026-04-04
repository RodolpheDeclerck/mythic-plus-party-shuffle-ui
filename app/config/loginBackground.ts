/** Fond : `public/background.png` (art void / portail), ou `NEXT_PUBLIC_LOGIN_BACKGROUND_URL`. */
export const loginBackgroundImageUrl =
  process.env.NEXT_PUBLIC_LOGIN_BACKGROUND_URL?.trim() ||
  '/background.png';
