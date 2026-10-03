import { APP_CONFIG } from '../config/app-config.js';

export const CURRENT_SAVE_SCHEMA = APP_CONFIG.saveSchemaVersion;

export function isSaveEnvelope(value) {
  return !!value && typeof value === 'object' && Number.isInteger(value.schemaVersion) && 'payload' in value;
}

export function createSaveEnvelope(payload, metadata = {}) {
  return {
    schemaVersion: CURRENT_SAVE_SCHEMA,
    createdAt: metadata.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    gameVersion: APP_CONFIG.version,
    payload
  };
}

// The live V245/V250 runtime still saves the legacy state object directly.
// This adapter is intentionally non-destructive: it lets future code recognize an
// old save without rewriting it until a tested migration is explicitly enabled.
export function inspectSave(raw) {
  if (isSaveEnvelope(raw)) {
    return { format: 'envelope', schemaVersion: raw.schemaVersion, payload: raw.payload };
  }
  return { format: 'legacy', schemaVersion: 0, payload: raw };
}
