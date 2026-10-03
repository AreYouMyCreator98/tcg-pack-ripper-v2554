export function binderEntries(binder) {
  return Object.values(binder || {}).filter(card => card && Number(card.qty || 0) > 0);
}

export function filterBinderCards(cards, {
  query = '',
  set = 'all',
  tier = () => 0
} = {}) {
  const q = String(query || '').trim().toLowerCase();
  return (cards || [])
    .filter(card => card && Number(card.qty || 0) > 0)
    .filter(card => set === 'all' || card.set === set)
    .filter(card => !q || String(card.name || '').toLowerCase().includes(q))
    .slice()
    .sort((a, b) => Number(tier(b) || 0) - Number(tier(a) || 0) || String(a.name || '').localeCompare(String(b.name || '')));
}

export function binderStats(cards) {
  return Object.freeze({
    unique: (cards || []).length,
    total: (cards || []).reduce((sum, card) => sum + Number(card?.qty || 0), 0)
  });
}

export function paginateBinder(cards, page = 0, pageSize = 9) {
  const totalPages = Math.max(1, Math.ceil((cards || []).length / pageSize));
  const safePage = Math.max(0, Math.min(Number(page || 0), totalPages - 1));
  const start = safePage * pageSize;
  return Object.freeze({
    page: safePage,
    totalPages,
    cards: (cards || []).slice(start, start + pageSize),
    start
  });
}
