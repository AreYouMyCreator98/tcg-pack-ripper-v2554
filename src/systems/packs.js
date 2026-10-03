import { installPackEngine, packEngineReady } from '../packs/index.js';

export function installPackModule() {
  if (packEngineReady()) return window.TCG_PACKS;
  return installPackEngine(window);
}
