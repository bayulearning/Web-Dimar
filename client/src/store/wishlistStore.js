import { createPersistentStore } from "./persistentStore.js";
import { wishlistApi } from "../services/wishlist.js";
import { toastStore } from "./toastStore.js";

const store = createPersistentStore("stride.wishlist.v1", { items: [] });
let authenticated = false;

function applyServerWishlist(payload) {
  store.setState({ items: payload.items ?? [] });
  return payload;
}

export const wishlistStore = {
  subscribe: store.subscribe,
  getSnapshot: store.getSnapshot,

  async toggle(product) {
    const exists = isInWishlist(store.getSnapshot(), product.id);

    if (authenticated) {
      try {
        const response = exists
          ? await wishlistApi.remove(product.id)
          : await wishlistApi.add(product.id);
        applyServerWishlist(response.data);
      } catch (error) {
        toastStore.show(
          error?.message || "Gagal memperbarui wishlist.",
          "error",
        );
      }
      return;
    }

    store.setState((state) => {
      if (exists) {
        return {
          items: state.items.filter((item) => item.id !== product.id),
        };
      }
      return {
        items: [
          ...state.items,
          {
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            basePrice: product.basePrice,
            salePrice: product.salePrice,
            image: product.image,
            badge: product.badge,
            category: product.category,
          },
        ],
      };
    });
  },

  async remove(productId) {
    if (authenticated) {
      try {
        const response = await wishlistApi.remove(productId);
        applyServerWishlist(response.data);
      } catch (error) {
        toastStore.show(
          error?.message || "Gagal menghapus dari wishlist.",
          "error",
        );
      }
      return;
    }

    store.setState((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    }));
  },

  async activateUser() {
    const productIds = store.getSnapshot().items.map((item) => item.id);
    authenticated = true;

    try {
      const response = await wishlistApi.merge(productIds);
      return applyServerWishlist(response.data);
    } catch {
      try {
        const response = await wishlistApi.list();
        return applyServerWishlist(response.data);
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
};

export function isInWishlist(state, productId) {
  return state.items.some((item) => item.id === productId);
}
