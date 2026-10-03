import { loadSecondaryRuntime } from '../app/runtime-loader.js';
export async function openProfile() {
  await loadSecondaryRuntime();
  document.querySelector('.nav [data-s="profile"]')?.click();
}
