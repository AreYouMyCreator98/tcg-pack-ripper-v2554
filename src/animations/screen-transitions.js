const seen = new WeakMap();

function animateIn(screen) {
  if (!screen?.classList.contains('active')) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const old = seen.get(screen);
  old?.cancel?.();
  const anim = screen.animate([
    { opacity: 0.65, transform: 'translate3d(0,8px,0)' },
    { opacity: 1, transform: 'translate3d(0,0,0)' }
  ], { duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)' });
  seen.set(screen, anim);
}

export function installScreenTransitions(root = document) {
  root.querySelectorAll?.('.screen.active').forEach(animateIn);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes' && record.attributeName === 'class') animateIn(record.target);
    }
  });
  root.querySelectorAll?.('.screen').forEach(screen => observer.observe(screen, { attributes: true, attributeFilter: ['class'] }));
  return observer;
}
