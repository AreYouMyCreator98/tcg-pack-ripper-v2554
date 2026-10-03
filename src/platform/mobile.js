export function configurePlatform() {
  const ua = navigator.userAgent || '';
  const ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(ua);
  const inApp = /FBAN|FBAV|Instagram|Messenger/i.test(ua);
  const memory = Number(navigator.deviceMemory || 0);
  document.documentElement.dataset.platform = ios ? 'ios' : android ? 'android' : 'desktop';
  document.documentElement.dataset.browser = inApp ? 'in-app' : 'standard';
  const balanced = ios || inApp || (memory && memory <= 4);
  document.documentElement.dataset.performance = balanced ? 'balanced' : 'full';

  // Pause expensive CSS animations while the tab/app is backgrounded.
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('app-backgrounded', document.hidden);
  }, { passive: true });
}
