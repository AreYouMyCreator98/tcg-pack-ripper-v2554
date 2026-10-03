import { ensureBinderBridge, binderBridgeNow } from './binder-bridge.js';
import { renderBinderPage, currentBinderCards } from './binder-renderer.js';
import { openBinderCardV252, repairBinderImageV252 } from './binder-inspector.js';
import { installBinderArtworkStatus } from './binder-status.js';
import { artworkRepairReport, artworkStatus, prepareCollectionInBackground } from '../../artwork/index.js';

let activated = false;

export async function activateBinderScreen() {
  const bridge = await ensureBinderBridge();
  bridge.bindRenderer(renderBinderPage);
  bridge.bindInspector(openBinderCardV252);
  window.repairBinderImage = repairBinderImageV252;
  installBinderArtworkStatus(currentBinderCards);

  if (!activated) {
    activated = true;
    window.tcgBinderV252 = Object.freeze({
      render: renderBinderPage,
      openCard: openBinderCardV252,
      repairImage: repairBinderImageV252,
      status: artworkStatus,
      report: artworkRepairReport,
      prepare: () => prepareCollectionInBackground(currentBinderCards())
    });
  }
  return bridge;
}

export function binderScreenReady() {
  return activated && !!binderBridgeNow();
}
