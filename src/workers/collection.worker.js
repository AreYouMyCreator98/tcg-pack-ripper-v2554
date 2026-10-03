self.onmessage = ({ data }) => {
  const { id, task, payload } = data || {};
  try {
    if (task === 'collectionStats') {
      const binder = payload?.binder || {};
      const graded = payload?.graded || [];
      let unique = 0, copies = 0, rawValue = 0;
      for (const value of Object.values(binder)) {
        unique++;
        const qty = Number(value?.qty ?? value?.count ?? 1) || 1;
        copies += qty;
        rawValue += (Number(value?.market ?? value?.price ?? value?.value ?? 0) || 0) * qty;
      }
      const gradedValue = graded.reduce((n, x) => n + (Number(x?.value ?? x?.market ?? 0) || 0), 0);
      self.postMessage({ id, ok: true, result: { unique, copies, rawValue, gradedValue, totalValue: rawValue + gradedValue } });
      return;
    }
    throw new Error(`Unknown worker task: ${task}`);
  } catch (error) {
    self.postMessage({ id, ok: false, error: String(error?.message || error) });
  }
};
