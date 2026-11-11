import { createPersistentStore } from "./persistentStore.js";
import { cartApi } from "../services/cart.js";

const store = createPersistentStore("stride.cart.v1", { items: [] });
let authenticated = false;

function keyOf(item) {
  return String(item.variantId);
}

function applyServerCart(payload) {
  store.setState({ items: payload.items ?? [] });
  return payload;
}

function findVariant(variantId) {
  return store
    .getSnapshot()
    .items.find((item) => keyOf(item) === String(variantId));
}

export const cartStore = {
  subscribe: store.subscribe,
  getSnapshot: store.getSnapshot,

  async add(item, quantity = 1) {
    if (authenticated) {
      const response = await cartApi.add(item.variantId, quantity);
      return applyServerCart(response.data);
    }

    store.setState((state) => {
      const existing = state.items.find(
        (entry) => keyOf(entry) === keyOf(item),
      );

      if (existing) {
        return {
          items: state.items.map((entry) =>
            keyOf(entry) === keyOf(item)
              ? {
                  ...entry,
                  quantity: Math.min(entry.quantity + quantity, 10),
                }
              : entry,
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            productId: item.productId,
            variantId: item.variantId,
            slug: item.slug,
            name: item.name,
            size: item.size,
            color: item.color,
            price: item.price,
            image: item.image,
            quantity: Math.min(quantity, 10),
          },
        ],
      };
    });

    return { items: store.getSnapshot().items };
  },

  async setQuantity(variantId, quantity) {
    const item = findVariant(variantId);

    if (authenticated) {
      if (!item) return null;
      if (quantity < 1) {
        const response = await cartApi.remove(item.id);
        return applyServerCart(response.data);
      }
      const response = await cartApi.update(item.id, Math.min(quantity, 10));
      return applyServerCart(response.data);
    }

    if (quantity < 1) {
      await cartStore.remove(variantId);
      return null;
    }

    store.setState((state) => ({
      items: state.items.map((entry) =>
        keyOf(entry) === String(variantId)
          ? { ...entry, quantity: Math.min(quantity, 10) }
          : entry,
      ),
    }));
    return null;
  },

  async remove(variantId) {
    if (authenticated) {
      const item = findVariant(variantId);
      if (!item) return null;
      const response = await cartApi.remove(item.id);
      return applyServerCart(response.data);
    }

    store.setState((state) => ({
      items: state.items.filter(
        (item) => keyOf(item) !== String(variantId),
      ),
    }));
    return null;
  },

  async clear() {
    if (authenticated) {
      const response = await cartApi.clear();
      return applyServerCart(response.data);
    }

    store.setState({ items: [] });
    return null;
  },

  async activateUser() {
    const guestItems = store.getSnapshot().items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    authenticated = true;

    try {
      const response = await cartApi.merge(guestItems);
      return applyServerCart(response.data);
    } catch {
      try {
        const response = await cartApi.get();
        return applyServerCart(response.data);
      } catch {
        store.setState({ items: [] });
        return null;
      }
    }
  },

  deactivate() {
    authenticated = false;
    store.setState({ items: [] });
  },

  async refresh() {
    if (!authenticated) return null;
    const response = await cartApi.get();
    return applyServerCart(response.data);
  },
};

export function cartCount(state) {
  return state.items.reduce((total, item) => total + item.quantity, 0);
}

export function cartSubtotal(state) {
  return state.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
}
