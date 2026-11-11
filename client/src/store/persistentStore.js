export function createPersistentStore(key, initialState) {
  const isBrowser = typeof window !== "undefined";

  function readInitial() {
    if (!isBrowser) return initialState;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialState;
    } catch {
      return initialState;
    }
  }

  let state = readInitial();
  const listeners = new Set();

  function getSnapshot() {
    return state;
  }

  function persist(next) {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // localStorage penuh atau diblokir: state tetap dipakai di memori.
    }
  }

  function setState(updater) {
    const next = typeof updater === "function" ? updater(state) : updater;
    state = next;
    persist(next);
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getSnapshot, setState, subscribe };
}
