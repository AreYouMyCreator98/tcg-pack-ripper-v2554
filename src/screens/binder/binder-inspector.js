import { getArtworkUrl, peekArtworkUrl } from '../../artwork/index.js';
import { binderBridgeNow } from './binder-bridge.js';

let inspectorToken = 0;

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

async function setInspectorArtwork(img, card, token) {
  if (!img) return;
  try {
    let low = await peekArtworkUrl(card, 'low');
    if (!low) low = await getArtworkUrl(card, 'low', { priority: 140 });
    if (token !== inspectorToken || !img.isConnected) return;
    img.src = low;
    document.getElementById('inspect3d')?.classList.remove('v252InspectPending', 'v252InspectFailed');
    getArtworkUrl(card, 'high', { priority: 105 })
      .then(high => {
        if (token === inspectorToken && img.isConnected) img.src = high;
      })
      .catch(() => {});
  } catch {
    if (token !== inspectorToken) return;
    const host = document.getElementById('inspect3d');
    host?.classList.remove('v252InspectPending');
    host?.classList.add('v252InspectFailed');
  }
}

export async function openBinderCardV252(id) {
  const bridge = binderBridgeNow();
  const card = bridge?.getCard(id);
  if (!bridge || !card) return false;

  const token = ++inspectorToken;
  bridge.setSelected(id);
  const inspect = document.getElementById('inspect3d');
  const fx = bridge.effectClass(card);
  if (inspect) inspect.className = `inspect3d v252InspectPending${fx ? ` cardFx ${fx}` : ''}`;
  const img = document.getElementById('inspectImg');
  if (img) {
    img.removeAttribute('src');
    img.onerror = null;
    img.alt = card.name || 'Card';
  }

  setText('inspectName', card.name || 'Card');
  setText('inspectInfo', `${card.set || ''} • #${card.number || ''} • ${card.rarity || 'Card'}${card.finish ? ` • ${card.finish}` : ''} • ${card.qty} ${Number(card.qty) === 1 ? 'copy' : 'copies'}`);
  setText('sellValue', 'Loading market value…');
  document.getElementById('cardModal')?.classList.add('show');
  bridge.syncGrade();
  bridge.playInspectFx(card);
  setInspectorArtwork(img, card, token);

  try {
    await bridge.hydrateCard(card);
  } catch {}
  if (token === inspectorToken && bridge.getSelected() === id) {
    bridge.save();
    setText('sellValue', `Market sell value: $${bridge.sellPrice(card).toFixed(2)} each`);
  }
  return true;
}

export async function repairBinderImageV252(img, id) {
  const bridge = binderBridgeNow();
  const card = bridge?.getCard(id);
  if (!card) return false;
  try {
    const url = await getArtworkUrl(card, 'low', { force: true, priority: 150 });
    if (img?.isConnected) img.src = url;
    return true;
  } catch {
    return false;
  }
}
