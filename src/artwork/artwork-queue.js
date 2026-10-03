function recommendedConcurrency() {
  const ua = String(navigator.userAgent || '');
  const ios = /iPhone|iPad|iPod/i.test(ua);
  const inApp = /FBAN|FBAV|FBIOS|Messenger|Instagram/i.test(ua);
  const android = /Android/i.test(ua);
  if (ios || inApp) return 2;
  if (android) return 4;
  return 6;
}

class PriorityQueue {
  constructor(concurrency = recommendedConcurrency()) {
    this.concurrency = concurrency;
    this.running = 0;
    this.items = [];
    this.sequence = 0;
  }

  schedule(task, priority = 0) {
    return new Promise((resolve, reject) => {
      this.items.push({ task, priority, sequence: this.sequence++, resolve, reject });
      this.items.sort((a, b) => b.priority - a.priority || a.sequence - b.sequence);
      this.#pump();
    });
  }

  #pump() {
    while (this.running < this.concurrency && this.items.length) {
      const item = this.items.shift();
      this.running++;
      Promise.resolve()
        .then(item.task)
        .then(item.resolve, item.reject)
        .finally(() => {
          this.running--;
          this.#pump();
        });
    }
  }

  snapshot() {
    return Object.freeze({
      concurrency: this.concurrency,
      running: this.running,
      queued: this.items.length
    });
  }
}

export const artworkQueue = new PriorityQueue();
