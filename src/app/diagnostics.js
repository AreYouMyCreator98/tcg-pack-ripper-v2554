const MAX_EVENTS = 80;
const events = [];

function push(type, detail = {}) {
  events.push({ type, at: Date.now(), ...detail });
  if (events.length > MAX_EVENTS) events.shift();
}

export function installDiagnostics() {
  window.TCG_DIAGNOSTICS = {
    events,
    mark: (name, detail = {}) => push('mark', { name, detail }),
    snapshot: () => ({
      href: location.href,
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      visibility: document.visibilityState,
      events: events.slice()
    })
  };
  window.addEventListener('error', event => push('error', { message: event.message, file: event.filename, line: event.lineno }));
  window.addEventListener('unhandledrejection', event => push('rejection', { message: String(event.reason?.message || event.reason || 'Unknown rejection') }));
  push('mark', { name: 'diagnostics-installed' });
  return window.TCG_DIAGNOSTICS;
}

export function bootMark(name, detail = {}) {
  push('mark', { name, detail });
}
