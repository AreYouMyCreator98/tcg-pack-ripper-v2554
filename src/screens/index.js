export const SCREEN_IDS = Object.freeze(['rip','binder','bulk','trade','profile']);
export function isPrimaryScreen(id) { return SCREEN_IDS.includes(id); }
