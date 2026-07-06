import { create } from 'zustand';
import { wishlistAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useWishlistStore = create((set, get) => ({
  wishlist: null,
  isLoading: false,

  get productIds() {
    return get().wishlist?.products?.map(p => p._id || p) || [];
  },

  isInWishlist: (productId) => {
    const ids = get().wishlist?.products?.map(p => (p._id || p).toString()) || [];
    return ids.includes(productId.toString());
  },

  fetchWishlist: async () => {
    try {
      const data = await wishlistAPI.get();
      set({ wishlist: data.wishlist });
    } catch {}
  },

  toggleWishlist: async (productId) => {
    set({ isLoading: true });
    try {
      const data = await wishlistAPI.toggle(productId);
      await get().fetchWishlist();
      toast.success(data.action === 'added' ? '❤️ Added to wishlist' : 'Removed from wishlist');
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.message || 'Failed to update wishlist');
    }
  },

  clearWishlist: async () => {
    try {
      await wishlistAPI.clear();
      set({ wishlist: { products: [] } });
    } catch {}
  },
}));
