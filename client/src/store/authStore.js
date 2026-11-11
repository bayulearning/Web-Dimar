import { createMemoryStore } from "./memoryStore.js";
import { authApi } from "../services/auth.js";
import { cartStore } from "./cartStore.js";
import { wishlistStore } from "./wishlistStore.js";

const store = createMemoryStore({
  user: null,
  status: "loading",
  error: null,
});

let initializePromise = null;

async function syncUserData() {
  await Promise.all([
    cartStore.activateUser(),
    wishlistStore.activateUser(),
  ]);
}

export const authStore = {
  subscribe: store.subscribe,
  getSnapshot: store.getSnapshot,

  initialize() {
    if (initializePromise) return initializePromise;

    initializePromise = authApi
      .me()
      .then(async ({ data }) => {
        store.setState({ user: data.user, status: "ready", error: null });
        await syncUserData();
        return data.user;
      })
      .catch(() => {
        store.setState({ user: null, status: "ready", error: null });
        return null;
      });

    return initializePromise;
  },

  async login(credentials) {
    const { data } = await authApi.login(credentials);
    store.setState({ user: data.user, status: "ready", error: null });
    await syncUserData();
    return data.user;
  },

  async register(payload) {
    const { data } = await authApi.register(payload);
    store.setState({ user: data.user, status: "ready", error: null });
    await syncUserData();
    return data.user;
  },

  async logout() {
    try {
      await authApi.logout();
    } finally {
      store.setState({ user: null, status: "ready", error: null });
      cartStore.deactivate();
      wishlistStore.deactivate();
    }
  },

  async updateProfile(payload) {
    const { data } = await authApi.updateProfile(payload);
    store.setState((state) => ({ ...state, user: data.user }));
    return data.user;
  },
};
