import { loadBinderRuntime } from '../../app/runtime-loader.js';

let bridgePromise = null;

export async function ensureBinderBridge() {
  if (window.tcgBinderLegacyBridgeV252) return window.tcgBinderLegacyBridgeV252;
  if (!bridgePromise) {
    bridgePromise = loadBinderRuntime().then(() => {
      const bridge = window.tcgBinderLegacyBridgeV252;
      if (!bridge) throw new Error('Binder compatibility bridge failed to initialise');
      return bridge;
    }).catch(error => {
      bridgePromise = null;
      throw error;
    });
  }
  return bridgePromise;
}

export function binderBridgeNow() {
  return window.tcgBinderLegacyBridgeV252 || null;
}
