import { CURRENT_SAVE_SCHEMA, createSaveEnvelope, inspectSave } from '../save-schema.js';

const migrations = new Map();

export function registerSaveMigration(fromVersion, migrate) {
  if (!Number.isInteger(fromVersion) || fromVersion < 0) throw new TypeError('fromVersion must be a non-negative integer');
  if (typeof migrate !== 'function') throw new TypeError('migrate must be a function');
  migrations.set(fromVersion, migrate);
}

export function migrateSave(raw) {
  const inspected = inspectSave(raw);
  let version = inspected.schemaVersion;
  let payload = inspected.payload;
  if (version > CURRENT_SAVE_SCHEMA) throw new Error('Save was created by a newer game version');
  if (version === CURRENT_SAVE_SCHEMA) return { migrated: false, legacy: false, value: raw };

  // Legacy saves are deliberately returned untouched for now. The first real
  // schema migration should be registered only after live-device regression tests.
  if (version === 0) return { migrated: false, legacy: true, value: raw };

  while (version < CURRENT_SAVE_SCHEMA) {
    const migrate = migrations.get(version);
    if (!migrate) throw new Error(`Missing save migration ${version} -> ${version + 1}`);
    payload = migrate(payload);
    version += 1;
  }

  return {
    migrated: version !== inspected.schemaVersion,
    legacy: false,
    value: createSaveEnvelope(payload, { createdAt: raw.createdAt })
  };
}

export function registeredMigrationVersions() {
  return [...migrations.keys()].sort((a, b) => a - b);
}
