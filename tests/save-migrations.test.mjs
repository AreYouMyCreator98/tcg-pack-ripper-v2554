import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectSave, createSaveEnvelope, CURRENT_SAVE_SCHEMA } from '../src/state/save-schema.js';
import { migrateSave } from '../src/state/migrations/index.js';

test('legacy save is identified without mutation', () => {
  const legacy = { coins: 80, binder: { abc: { qty: 1 } } };
  const inspected = inspectSave(legacy);
  assert.equal(inspected.format, 'legacy');
  assert.equal(inspected.payload, legacy);
  const result = migrateSave(legacy);
  assert.equal(result.legacy, true);
  assert.equal(result.value, legacy);
});

test('current envelope remains current', () => {
  const envelope = createSaveEnvelope({ coins: 80 });
  assert.equal(envelope.schemaVersion, CURRENT_SAVE_SCHEMA);
  const result = migrateSave(envelope);
  assert.equal(result.legacy, false);
  assert.equal(result.value.schemaVersion, CURRENT_SAVE_SCHEMA);
  assert.deepEqual(result.value.payload, { coins: 80 });
});
