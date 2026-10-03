import { RANKS } from '../data/ranks.js';

export const HUB_VERSION = 256;
export const TABS = ['market', 'trades', 'battles', 'chat', 'ranked', 'activity', 'shops'];
export const TERMINAL = new Set(['completed', 'cancelled', 'expired']);
export const MONEY_LIMIT = 100_000_000;
export function money(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((Number(cents) || 0) / 100);
}
export function parsePrice(value) {
  const text = String(value).trim();
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(text)) throw new Error('Enter a price with up to two decimal places.');
  const [whole, fraction = ''] = text.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents < 10 || cents > MONEY_LIMIT) throw new Error('Price must be between $0.10 and $1,000,000.00.');
  return cents;
}
export function roomCode(value) {
  const code = String(value).trim().toUpperCase();
  if (!/^[A-F0-9]{8}$/.test(code)) throw new Error('Enter the eight-character room code.');
  return code;
}
export function rankProgress(value) {
  const rp = Number.isFinite(Number(value))?Math.max(0, Math.floor(Number(value))):0;
  const rank = [...RANKS].reverse().find(r => rp >= r.minRp) || RANKS[0];
  const next = RANKS[RANKS.indexOf(rank) + 1];
  return { rp, rank, next, percent: next ? Math.min(100, 100 * (rp - rank.minRp) / (next.minRp - rank.minRp)) : 100 };
}
export function safeImage(value) {
  try { const url = new URL(String(value)); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
}
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}
export function filterListings(rows, query = '', sort = 'newest', own = false, uid = '') {
  const term = query.trim().toLocaleLowerCase();
  const result = rows.filter(row => (!own || row.seller_id === uid) && `${row.card?.name || ''} ${row.card?.set || ''} ${row.seller_name || ''}`.toLocaleLowerCase().includes(term));
  return result.sort((a, b) => sort === 'price-low' ? a.price - b.price || a.id.localeCompare(b.id) : sort === 'price-high' ? b.price - a.price || a.id.localeCompare(b.id) : String(b.created_at).localeCompare(String(a.created_at)) || a.id.localeCompare(b.id));
}
export function availableInventory(inventory, room, uid) {
  // Offered cards live in escrow; add only this room's own escrow back to its picker.
  const map = new Map(inventory.map(c => [c.id, { ...c }]));
  const offer = room?.host_id === uid ? room.host_offer : room?.guest_id === uid ? room.guest_offer : [];
  for (const c of offer || []) map.set(c.id, { ...c, qty: (map.get(c.id)?.qty || 0) + 1 });
  return [...map.values()].filter(c => c.qty > 0).sort((a, b) => a.name.localeCompare(b.name));
}
export const ERROR_TEXT = {
  AUTH_REQUIRED: 'Sign in under Profile → Settings to join collectors online.',
  SAVE_REQUIRED: 'Sync your collection under Profile → Settings first.',
  SAVE_CONFLICT: 'Your collection changed. Refresh and review it before trying again.',
  INSUFFICIENT_FUNDS: 'There is not enough in-game cash for this action.',
  CARD_NOT_OWNED: 'That card is no longer available in your collection.',
  LISTING_CLOSED: 'Another collector already bought or cancelled that listing.',
  ROOM_CLOSED: 'This room has ended. Create or join another room.',
  ROOM_NOT_FOUND: 'Room not found, full, private to other players, or expired.',
  OFFER_CHANGED: 'The offer changed. Review both sides before confirming again.',
  BOTH_READY_REQUIRED: 'Both collectors must confirm before the battle starts.',
  CHAT_RATE_LIMIT: 'Wait a moment before sending another message.',
  BLOCKED: 'This interaction is unavailable because a player is blocked.',
  CATALOG_UNAVAILABLE: 'Battle cards are temporarily unavailable. Try another set.',
  ROOM_EXPIRED: 'This room timed out. Leave it or refresh after the next connection check.',
  RANKED_SET_LOCKED: 'Ranked battles use the same Paldean Fates card pool for both players.',
  SET_LOCKED: 'Unlock this expansion in your collection before using it in a battle.',
  BOTH_OFFERS_REQUIRED: 'Both collectors must save an offer before confirming.',
  BADGE_NOT_EARNED: 'Only badges earned in your collection can be showcased.',
  CHAT_MUTED: 'Chat is temporarily unavailable for this account.',
  ACTIVE_ROOM: 'Finish or leave your current room first.',
  REQUEST_REUSED: 'This request was already used for a different action. Refresh first.',
  SYNC_REQUIRED: 'Collection sync did not finish. Retry when your account is connected.',
};
export function errorMessage(error) {
  const message = String(error?.message || error || 'Could not complete that action.');
  return Object.entries(ERROR_TEXT).find(([key]) => message.includes(key))?.[1]
    || (/PGRST202|hub_command|does not exist/.test(message) ? 'The new Trade Hub service has not been installed on this server yet.' : message.slice(0,220));
}
