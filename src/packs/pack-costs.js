export function paymentLabel(detail = {}) {
  const parts = [];
  const starter = Math.max(0, Number(detail.starterUsed || 0));
  const credits = Math.max(0, Number(detail.creditsUsed || 0));
  const cash = Math.max(0, Number(detail.cashSpent || 0));
  if (starter) parts.push(`${starter} starter ${starter === 1 ? 'pack' : 'packs'}`);
  if (credits) parts.push(`${credits} sealed ${credits === 1 ? 'credit' : 'credits'}`);
  if (cash > 0.0001) parts.push(`$${cash.toFixed(2)}`);
  return parts.length ? parts.join(' + ') : 'no cash spent';
}
