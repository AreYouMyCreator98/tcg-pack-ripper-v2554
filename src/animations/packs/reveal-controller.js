import { revealProfile } from './reveal-profile.js';
import { cinematicProfile } from './cinematic-profile.js';

const FAST_KEY = 'tcgFastRevealV253';
const STACK_CLASSES = [
  'v254RevealStage','v254-base','v254-holo','v254-ex','v254-ultra','v254-chase','v254-apex','v254-god','v254FastRare'
];

function ensureFxRoot() {
  let root = document.getElementById('v254RevealFX');
  if (root) return root;
  root = document.createElement('div');
  root.id = 'v254RevealFX';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = `
    <div class="v254FxBackdrop"></div>
    <div class="v254FxFlash"></div>
    <div class="v254FxHalo"></div>
    <div class="v254FxRays"></div>
    <div class="v254FxBolts"></div>
    <div class="v254FxParticles"></div>
    <div class="collectorFxRings"></div>
    <div class="collectorFxAurora"></div>
    <div class="v254FxBadge"><span></span></div>`;
  document.body.appendChild(root);
  return root;
}

function clearFx(root = ensureFxRoot()) {
  root.classList.remove('v254-active');
  root.dataset.v254Effect = '';
  root.querySelector('.v254FxParticles').innerHTML = '';
  root.querySelector('.v254FxBolts').innerHTML = '';
  root.querySelector('.collectorFxRings').innerHTML = '';
}

function spawnParticles(root, profile) {
  const host = root.querySelector('.v254FxParticles');
  host.innerHTML = '';
  const count = profile.particles || 0;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    const angle = (360 / Math.max(6, count)) * i + Math.random() * 18;
    const dist = 26 + Math.random() * 34;
    const delay = (Math.random() * 0.18).toFixed(3);
    const size = (0.75 + Math.random() * 1.2).toFixed(2);
    s.style.setProperty('--a', `${angle}deg`);
    s.style.setProperty('--d', `${dist}vmin`);
    s.style.setProperty('--delay', `${delay}s`);
    s.style.setProperty('--scale', size);
    host.appendChild(s);
  }
}

function spawnBolts(root, profile) {
  const host = root.querySelector('.v254FxBolts');
  host.innerHTML = '';
  const count = profile.bolts || 0;
  for (let i = 0; i < count; i++) {
    const bolt = document.createElement('i');
    bolt.style.setProperty('--x', `${i % 2 ? 80 + Math.random() * 12 : 8 + Math.random() * 12}%`);
    bolt.style.setProperty('--rot', `${-14 + Math.random() * 28}deg`);
    bolt.style.setProperty('--delay', `${(i * 0.06).toFixed(2)}s`);
    host.appendChild(bolt);
  }
}

function vibrate(profile, fast) {
  if (fast) return;
  const pattern = Array.isArray(profile.vibrate) ? profile.vibrate : [];
  if (!pattern.length || !navigator?.vibrate) return;
  try { navigator.vibrate(pattern); } catch {}
}

export function installRevealController(target = window) {
  let fast = false;
  try { fast = localStorage.getItem(FAST_KEY) === '1'; } catch {}

  const originalHero = typeof target.v128PlayHero === 'function' ? target.v128PlayHero : null;
  const originalRare = typeof target.v125ForceRareReveal === 'function' ? target.v125ForceRareReveal : null;
  let clearTimer = null;
  let readyFrame = 0, serial = 0;
  const reduced = () => document.documentElement.classList.contains('v158ReducedMotion') || !!target.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (originalHero) {
    target.v128PlayHero = function(card) {
      if (fast || reduced()) return false;
      return originalHero.apply(this, arguments);
    };
  }

  if (originalRare) {
    target.v125ForceRareReveal = function(card, stack) {
      if (!fast && !reduced()) return originalRare.apply(this, arguments);
      const st = stack || document.getElementById('stack');
      if (!st) return;
      target.v124RareLockUntil = Date.now() + 220;
      st.classList.add('v254FastRare');
      setTimeout(() => st.classList.remove('v254FastRare'), 260);
    };
  }

  function cleanupVisuals() {
    serial++;
    clearTimeout(clearTimer);
    target.cancelAnimationFrame(readyFrame);
    const stack = document.getElementById('stack');
    if (stack) stack.classList.remove(...STACK_CLASSES);
    clearFx();
    delete document.documentElement.dataset.v254Reveal;
  }

  function paint(detail) {
    const card = detail?.card;
    const stack = document.getElementById('stack');
    const img = document.getElementById('cardImg');
    if (!card || !stack) return;
    const profile = cinematicProfile(card, { fast, reduced: reduced(), compact: target.innerWidth < 700 });
    const fx = ensureFxRoot();
    stack.classList.remove(...STACK_CLASSES);
    stack.classList.add('v254RevealStage', `v254-${profile.effect}`);
    const key = `${card.id || ''}|${detail.index ?? ''}`;
    stack.dataset.v254CardKey = key;
    if (img) img.dataset.v254CardKey = key;
    document.documentElement.dataset.v254Reveal = profile.effect;
    document.documentElement.classList.toggle('v254FastReveal', fast);

    fx.dataset.v254Effect = profile.effect;
    fx.classList.remove('v254-active');
    void fx.offsetWidth;
    fx.querySelector('.v254FxBadge span').textContent = profile.badge ? profile.label : '';
    fx.dataset.quiet = String(profile.quiet);
    spawnParticles(fx, profile);
    spawnBolts(fx, profile);
    const rings = fx.querySelector('.collectorFxRings');
    rings.innerHTML = '';
    for(let i=0;i<profile.rings;i++){
      const ring=document.createElement('i');
      ring.style.setProperty('--delay', `${i*.14}s`);
      rings.appendChild(ring);
    }
    fx.classList.add('v254-active');
    vibrate(profile, profile.quiet);

    clearTimeout(clearTimer);
    clearTimer = setTimeout(() => clearFx(fx), Math.max(260, fast ? 360 : profile.duration));
  }

  // Match the effect to the decoded card, never the previous image still on screen.
  function awaitCard(detail) {
    cleanupVisuals();
    const token=serial, started=Date.now();
    const poll=()=>{
      if(token!==serial || document.hidden) return;
      const stack=document.getElementById('stack'), hero=document.getElementById('v128Hero');
      const key=`${detail.card?.id||''}|${detail.card?.set||''}|${detail.card?.number||''}|${detail.card?.name||''}`;
      const heroReady=hero?.dataset.cardKey===key && hero.classList.contains('play');
      if(heroReady || (!target.v128HeroPlaying && stack?.dataset.faceReady==='1')) { paint(detail);return; }
      if(Date.now()-started<8000) readyFrame=target.requestAnimationFrame(poll);
    };
    readyFrame=target.requestAnimationFrame(poll);
  }

  target.addEventListener('tcg:card-reveal-start', cleanupVisuals);
  target.addEventListener('tcg:card-reveal', event => awaitCard(event.detail));
  target.addEventListener('tcg:pack-summary', () => cleanupVisuals());
  target.addEventListener('tcg:pack-open-start', () => cleanupVisuals());
  document.addEventListener('visibilitychange', () => { if(document.hidden) cleanupVisuals(); });
  document.addEventListener('click', event => { if(event.target.closest?.('.nav button')) cleanupVisuals(); });

  function setFast(next) {
    cleanupVisuals();
    fast = !!next;
    document.documentElement.classList.toggle('v254FastReveal', fast);
    try { localStorage.setItem(FAST_KEY, fast ? '1' : '0'); } catch {}
    target.dispatchEvent(new CustomEvent('tcg:fast-reveal-changed', { detail: { fast } }));
    return fast;
  }
  setFast(fast);

  return Object.freeze({
    isFast: () => fast,
    setFast,
    toggle: () => setFast(!fast),
    profile: revealProfile,
    clear: cleanupVisuals
  });
}
