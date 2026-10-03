const PREFIX = 'tcg:';

export function namespacedKey(key) { return `${PREFIX}${key}`; }

export function safeLocalGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(namespacedKey(key));
    return raw == null ? fallback : JSON.parse(raw);
  } catch (_) { return fallback; }
}

export function safeLocalSet(key, value) {
  try { localStorage.setItem(namespacedKey(key), JSON.stringify(value)); return true; }
  catch (_) { return false; }
}
