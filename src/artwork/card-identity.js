const BACK_PATTERNS = [
  /\/back(?:\.|\/|$)/i,
  /pokemon[-_ ]?back/i,
  /card[-_ ]?back/i,
  /\/base1\/back\.png/i
];

export function cardNumber(card) {
  let value = String(card?.number || card?.localId || '').trim();
  if (!value && card?.id) {
    const raw = String(card.id);
    const i = raw.lastIndexOf('-');
    if (i >= 0) value = raw.slice(i + 1);
  }
  return value;
}

export function cardSetId(card) {
  const subset = String(card?._subsetId || '').trim();
  if (subset) return subset;
  if (card?.id) {
    const raw = String(card.id);
    const i = raw.lastIndexOf('-');
    if (i > 0) return raw.slice(0, i);
  }
  return String(card?.setId || card?._parentSetId || '').trim();
}

export function cardIdentity(card) {
  return [
    String(card?.id || ''),
    cardSetId(card),
    cardNumber(card),
    String(card?.name || '')
  ].join('|');
}

export function artworkCacheKey(card, size = 'low') {
  // Keep V239 key compatibility so existing device caches survive V252.
  return `v239|${size}|${cardIdentity(card)}`;
}

export function isCardBackSource(source) {
  const value = String(source || '').trim();
  return !value || BACK_PATTERNS.some(pattern => pattern.test(value));
}

export function cleanArtworkSource(source) {
  const value = String(source || '')
    .trim()
    .replace(/[?&]_art_retry=[^&]+/g, '')
    .replace(/[?&]$/, '');
  return isCardBackSource(value) ? '' : value;
}

export function preferredArtworkSource(card, size = 'low') {
  if (!card) return '';
  const source = size === 'high'
    ? (card.img || card._artGoodV232 || card.thumb)
    : (card.thumb || card._artGoodV232 || card.img);
  return cleanArtworkSource(source);
}

export function artworkDiagnosticCard(card) {
  return Object.freeze({
    id: String(card?.id || ''),
    name: String(card?.name || 'Unknown card'),
    setId: cardSetId(card),
    setName: String(card?.set || ''),
    number: cardNumber(card)
  });
}
