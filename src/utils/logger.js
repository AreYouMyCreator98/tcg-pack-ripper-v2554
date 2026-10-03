import { APP_CONFIG } from '../config/app-config.js';
const prefix = `[TCG ${APP_CONFIG.version}]`;
export const log = Object.freeze({
  info: (...args) => console.info(prefix, ...args),
  warn: (...args) => console.warn(prefix, ...args),
  error: (...args) => console.error(prefix, ...args)
});
