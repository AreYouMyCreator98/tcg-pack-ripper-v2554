export const SCREEN_IDS = Object.freeze(['rip','collection','hub','profile']);
export function isPrimaryScreen(id) { return SCREEN_IDS.includes(id); }
