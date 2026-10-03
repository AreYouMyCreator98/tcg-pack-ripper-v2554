import { APP_CONFIG } from '../config/app-config.js';

export const BACKEND = Object.freeze({
  url: APP_CONFIG.supabase.url,
  projectRef: APP_CONFIG.supabase.projectRef,
  cardArtUrl: `${APP_CONFIG.supabase.url}/functions/v1/${APP_CONFIG.supabase.cardArtFunction}`
});

export function getSupabaseGlobal() {
  if (!window.supabase) throw new Error('Supabase client library is not loaded');
  return window.supabase;
}
