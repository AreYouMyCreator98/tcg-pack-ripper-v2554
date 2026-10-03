import { PackSession } from './pack-session.js';
import { validateGeneratedPack } from './pack-generator.js';
import { summarizePackCards } from './pack-results.js';
import { GOD_PACK_RATE, PACK_RATE_SNAPSHOT, SV_REVERSE_UPGRADES } from './pack-rates.js';
import { installRevealController } from '../animations/packs/reveal-controller.js';
import { installPackHUD } from './pack-hud.js';
import { installTenPackController } from '../animations/packs/ten-pack-controller.js';
import { renderV253Summary } from '../animations/packs/pack-summary.js';
import { installRipStudio } from '../screens/rip/index.js';

let installed = null;

function zeroPayment() { return { cashSpent: 0, starterUsed: 0, creditsUsed: 0 }; }

export function installPackEngine(target = window) {
  if (installed) return installed;
  const bridge = target.TCG_PACK_LEGACY;
  if (!bridge?.snapshot) throw new Error('V253 pack bridge is unavailable');

  const session = new PackSession(bridge.readPersistentStats?.() || {});
  const reveal = installRevealController(target);
  let tenController = null;
  let openingPayment = zeroPayment();
  let openingGeneratedValue = 0;

  const resetSession = () => {
    session.reset();
    hud?.update(session.snapshot(), reveal.isFast());
    try { target.toast?.('Session pack stats reset.'); } catch {}
  };

  const hud = installPackHUD({
    onToggleFast: () => { reveal.toggle(); hud?.update(session.snapshot(), reveal.isFast()); },
    onRevealAll: () => tenController?.revealAll(),
    onResetSession: resetSession
  });
  tenController = installTenPackController({ bridge, hud });
  hud?.update(session.snapshot(), reveal.isFast());

  const onGenerated = event => {
    const detail = event.detail || {};
    const result = session.recordPack(detail);
    if (!result.accepted) {
      console.error('[TCG] V253 rejected generated pack', result.meta.valid);
      target.TCG_DIAGNOSTICS?.mark?.('pack-invalid', result.meta.valid);
      return;
    }
    openingPayment.cashSpent += result.meta.cashSpent;
    openingPayment.starterUsed += result.meta.starterUsed;
    openingPayment.creditsUsed += result.meta.creditsUsed;
    openingGeneratedValue += summarizePackCards(detail.cards || [], bridge.route).value;
    bridge.writePersistentStats?.(session.snapshot().persistent);
    hud?.update(session.snapshot(), reveal.isFast());
    target.TCG_DIAGNOSTICS?.mark?.('pack-generated', { set: detail.set?.id, god: !!detail.godPack, bestTier: result.meta.bestTier });
  };

  const onCollected = event => {
    session.recordCollection(event.detail || {});
    hud?.update(session.snapshot(), reveal.isFast());
  };

  const onSummary = event => {
    const detail = event.detail || {};
    const resolvedOpeningValue = summarizePackCards(detail.cards || [], bridge.route).value;
    session.reconcileOpeningValue(openingGeneratedValue, resolvedOpeningValue);
    target.__tcgV253LastPayment = { ...openingPayment };
    renderV253Summary(detail, { bridge, session, onResetSession: resetSession });
    openingPayment = zeroPayment();
    openingGeneratedValue = 0;
    hud?.update(session.snapshot(), reveal.isFast());
  };

  target.addEventListener('tcg:pack-generated', onGenerated);
  target.addEventListener('tcg:card-collected', onCollected);
  target.addEventListener('tcg:pack-summary', onSummary);
  target.addEventListener('tcg:fast-reveal-changed', () => hud?.update(session.snapshot(), reveal.isFast()));

  const api = Object.freeze({
    version: '0.253.2',
    snapshot: () => bridge.snapshot(),
    session: () => session.snapshot(),
    resetSession,
    fastReveal: Object.freeze({ enabled: () => reveal.isFast(), set: reveal.setFast, toggle: reveal.toggle }),
    revealAll: () => tenController?.revealAll(),
    validateGeneratedPack,
    rates: Object.freeze({ godPack: GOD_PACK_RATE, eras: PACK_RATE_SNAPSHOT, svReverse: SV_REVERSE_UPGRADES })
  });

  target.TCG_PACKS = api;
  installRipStudio(target);
  target.dispatchEvent(new CustomEvent('tcg:pack-engine-ready', { detail: { version: api.version } }));
  target.TCG_DIAGNOSTICS?.mark?.('pack-engine-ready', { version: api.version });
  installed = api;
  return api;
}

export function packEngineReady() { return !!installed; }
