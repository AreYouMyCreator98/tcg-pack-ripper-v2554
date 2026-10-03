function tune(img) {
  if (!(img instanceof HTMLImageElement)) return;
  const critical = img.classList.contains('packArt') || img.closest('.cardStack.show,.v128Hero,.gradeReturnStage,.mpModalV218');
  img.decoding = 'async';
  img.loading = critical ? 'eager' : 'lazy';
  if ('fetchPriority' in img) img.fetchPriority = critical ? 'high' : 'auto';
}

export function installImagePolicy(root = document) {
  root.querySelectorAll?.('img').forEach(tune);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.('img')) tune(node);
        node.querySelectorAll?.('img').forEach(tune);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}
