const IDS = ['rookie','bronze','silver','gold','platinum','diamond','master','apex'];
let installed = false;
let observer = null;
let scheduled = false;

function assets() {
  return window.tcgRankFrameAssetsV231 || window.tcgProfileFramesV228?.FRAME_ASSETS_V228 || {};
}

function cleanId(value) {
  const id = String(value || '').trim().toLowerCase();
  return IDS.includes(id) ? id : '';
}

function putImage(host, id) {
  const src = assets()[id];
  if (!host || !src) return false;
  try {
    host.style.removeProperty('--frame-image');
    host.style.backgroundImage = 'none';
  } catch {}
  let img = host.querySelector(':scope > img.rankFrameImgV240');
  if (!img) {
    img = document.createElement('img');
    img.className = 'rankFrameImgV240';
    img.alt = `${id} rank frame`;
    img.decoding = 'async';
    img.draggable = false;
    host.appendChild(img);
  }
  if (img.dataset.rankId !== id || img.getAttribute('src') !== src) {
    img.dataset.rankId = id;
    img.src = src;
  }
  return true;
}

function hydrateVault() {
  const vault = document.getElementById('profileFramesVaultV228');
  if (!vault) return;
  vault.querySelectorAll('.frameGridCardV228').forEach(card => {
    const id = cleanId(card.querySelector('.frameMetaV228 strong')?.textContent);
    if (id) putImage(card.querySelector('.miniFrameV228'), id);
  });
  const claim = vault.querySelector('.frameClaimBadgeV228');
  if (claim) {
    const label = String(claim.querySelector('strong')?.textContent || '').split(/\s+/)[0];
    const id = cleanId(label);
    if (id) putImage(claim.querySelector('.miniFrameV228'), id);
  }
}

function hydrateAvatar() {
  const button = document.getElementById('profileAvatarBtnV227');
  if (!button) return;
  const host = button.querySelector('.profileFrameImageV228');
  if (!host) return;
  const id = IDS.find(candidate => button.classList.contains(`frame-${candidate}`)) || '';
  if (id) putImage(host, id);
  else host.querySelectorAll('img.rankFrameImgV240').forEach(node => node.remove());
}

function hydrate() {
  scheduled = false;
  hydrateVault();
  hydrateAvatar();
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(hydrate);
}

function wrapPublicApi() {
  const api = window.tcgProfileFramesV228;
  if (!api || api.__v252RendererWrapped) return;
  for (const key of ['renderFrameVault','applyAvatarFrame','equipFrame','clearFrame','claimSeasonFrames']) {
    const original = api[key];
    if (typeof original !== 'function') continue;
    api[key] = function(...args) {
      const result = original.apply(this, args);
      queueMicrotask(schedule);
      return result;
    };
  }
  api.__v252RendererWrapped = true;
}

export function installRankFrameRenderer() {
  if (installed) return;
  installed = true;
  const activate = () => {
    wrapPublicApi();
    schedule();
    if (!observer && document.body) {
      observer = new MutationObserver(records => {
        if (records.some(record => [...record.addedNodes].some(node => node.nodeType === 1 && (node.id === 'profileFramesVaultV228' || node.querySelector?.('#profileFramesVaultV228,.profileFrameImageV228'))))) schedule();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  };
  window.addEventListener('tcg:secondary-ready', activate);
  if (window.tcgProfileFramesV228) activate();
}
