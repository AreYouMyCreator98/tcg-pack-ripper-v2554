import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { criticalRuntime, binderRuntime, packRuntime, secondaryRuntime } from '../src/config/runtime-manifest.js';

const root = fileURLToPath(new URL('../public/', import.meta.url));
test('every runtime manifest entry exists', async () => {
  for (const file of [...criticalRuntime, ...binderRuntime, ...packRuntime, ...secondaryRuntime]) {
    await access(join(root, file));
    assert.ok(file.endsWith('.js'));
  }
});
