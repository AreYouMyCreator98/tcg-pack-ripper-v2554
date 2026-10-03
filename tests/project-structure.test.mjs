import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const dirs = ['src/screens','src/screens/binder','src/components','src/systems','src/multiplayer','src/animations','src/animations/packs','src/packs','src/artwork','src/state','src/services','src/workers','src/data','src/utils','supabase','scripts','docs'];
test('future-proof source areas exist', async () => {
  for (const dir of dirs) {
    await access(join(root, dir));
    assert.ok(dir.length > 0);
  }
});
