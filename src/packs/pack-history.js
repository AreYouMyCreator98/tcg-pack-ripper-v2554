export function streakCopy(persistent = {}) {
  const sir = Number(persistent.packsSinceSirPlus || 0);
  const god = Number(persistent.packsSinceGod || 0);
  const hit = Number(persistent.hitStreak || 0);
  return {
    sir: sir === 0 ? 'SIR+ this pack' : `${sir} since SIR+`,
    god: god === 0 ? 'God Pack hit' : `${god} since God Pack`,
    hit: hit > 1 ? `${hit} hit streak` : hit === 1 ? '1 hit streak' : 'no hit streak'
  };
}
