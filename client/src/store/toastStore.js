import { createMemoryStore } from "./memoryStore.js";

const store = createMemoryStore({ toasts: [] });

let counter = 0;

export const toastStore = {
  subscribe: store.subscribe,
  getSnapshot: store.getSnapshot,

  show(message, type = "success") {
    const id = ++counter;
    store.setState((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    setTimeout(() => {
      toastStore.dismiss(id);
    }, 3000);
  },

  dismiss(id) {
    store.setState((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
};
