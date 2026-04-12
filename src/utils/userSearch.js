export const MIN_USER_SEARCH_LEN = 2;
export const USER_SEARCH_LIMIT = 50;
export const USER_SEARCH_DEBOUNCE_MS = 300;

export function sanitizeIlikePrefix(raw) {
  return raw.trim().replace(/[%_\\]/g, "").slice(0, 80);
}
