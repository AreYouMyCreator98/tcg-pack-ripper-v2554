import { loadSecondaryRuntime } from '../app/runtime-loader.js';
export async function openMultiplayer() {
  await loadSecondaryRuntime();
  document.querySelector('.nav [data-s="earn"]')?.click();
}
