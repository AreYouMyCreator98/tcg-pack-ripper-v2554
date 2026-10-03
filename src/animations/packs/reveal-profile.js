export function revealTier(card = {}) {
  const rarity = String(card.rarity || '').toLowerCase().trim();
  const name = String(card.name || '').toLowerCase().trim();
  const finish = String(card.finish || '').toLowerCase().trim();
  const text = `${rarity} ${name} ${finish}`;
  if (card.secret || /hyper|secret|rainbow|gold rare/.test(text)) return 5;
  if (/special illustration|shiny ultra/.test(text)) return 4;
  if (/illustration|ultra rare|radiant|amazing|trainer gallery|galarian gallery|rare holo vmax|holo rare vmax|rare holo vstar|holo rare vstar|\bvmax\b|\bvstar\b/.test(text)) return 3;
  if (/double rare|ace spec|rare holo v|holo rare v|rare holo gx|holo rare gx|\bex\b|\bgx\b|(?:^|\s)v(?:$|\s)/.test(text)) return 2;
  if (/holo|reverse|rare/.test(text)) return 1;
  return Math.max(0, Math.min(5, Number(card.tier || 0)));
}

export function revealProfile(card = {}) {
  const rarity = String(card.rarity || 'Card');
  const lower = rarity.toLowerCase();
  const finish = String(card.finish || '').toLowerCase();
  const tier = revealTier(card);
  const god = /god pack/.test(finish);
  const secret = /secret|gold|hyper|rainbow/.test(lower);
  const sirPlus = tier >= 4 || secret;
  let effect = 'base';
  if (god) effect = 'god';
  else if (tier === 1) effect = 'holo';
  else if (tier === 2) effect = 'ex';
  else if (tier === 3) effect = 'ultra';
  else if (tier === 4) effect = 'chase';
  else if (tier >= 5) effect = 'apex';

  let label = rarity.toUpperCase();
  if (/special illustration/.test(lower)) label = 'SPECIAL ILLUSTRATION RARE';
  else if (/illustration/.test(lower)) label = 'ILLUSTRATION RARE';
  else if (/hyper/.test(lower)) label = 'HYPER RARE';
  else if (/secret/.test(lower)) label = 'SECRET RARE';
  else if (/gold/.test(lower)) label = 'GOLD RARE';
  else if (/double rare/.test(lower) || /\bex\b/.test(lower)) label = 'EX HIT';
  else if (/ultra/.test(lower)) label = 'ULTRA RARE';
  else if (/ace spec/.test(lower)) label = 'ACE SPEC';
  else if (/holo/.test(lower) || /reverse/.test(finish)) label = 'HOLO HIT';
  if (god) label = 'GOD PACK HIT';

  const byEffect = {
    base:  { duration: 360, particles: 0,  vibrate: [],               shake: 0, badge: false },
    holo:  { duration: 820, particles: 8,  vibrate: [10],             shake: 0, badge: false },
    ex:    { duration: 980, particles: 12, vibrate: [12,18,18],       shake: 1, badge: true  },
    ultra: { duration: 1220,particles: 16, vibrate: [14,18,28],       shake: 1, badge: true  },
    chase: { duration: 1650,particles: 22, vibrate: [18,32,26,42],    shake: 2, badge: true  },
    apex:  { duration: 1900,particles: 26, vibrate: [22,36,30,50],    shake: 2, badge: true  },
    god:   { duration: 2200,particles: 34, vibrate: [26,42,34,56,40], shake: 3, badge: true  }
  };

  return Object.freeze({
    tier,
    effect,
    intensity: effect,
    label,
    god,
    hit: tier >= 2,
    holo: tier >= 1,
    sirPlus,
    chase: tier >= 4,
    apex: tier >= 5,
    secret,
    finish,
    ...byEffect[effect]
  });
}
