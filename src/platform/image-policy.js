import {cardFromImageSource,applyCardImage,imageQualityForElement} from '../artwork/card-assets.js';
import {installCardImagePolicy} from '../artwork/card-image.js';
function tune(img) {
  if (!(img instanceof HTMLImageElement)) return;
  const critical = img.classList.contains('packArt') || img.closest('.cardStack.show,.hub-reveal,.v128Hero,.gradeReturnStage,.mpModalV218');
  const raw=img.getAttribute('src');
  if(raw&&!img.__cardAssetCandidates?.includes(raw)){const id=img.closest('[data-card-image]')?.dataset.cardImage;const card=id?{id,thumb:img.dataset.cardSource,img:img.dataset.cardHigh}:cardFromImageSource(raw);if(card)applyCardImage(img,card,imageQualityForElement(img));}
  img.decoding = 'async';
  img.loading = critical ? 'eager' : 'lazy';
  if ('fetchPriority' in img) img.fetchPriority = critical ? 'high' : 'auto';
}

export function installImagePolicy(root = document) {
  installCardImagePolicy(root);
  root.querySelectorAll?.('img').forEach(tune);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if(record.type==='attributes'){tune(record.target);continue;}
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.('img')) tune(node);
        node.querySelectorAll?.('img').forEach(tune);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes:true, attributeFilter:['src'] });
  return observer;
}
