import { create } from 'zustand';
import { cartAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useCartStore = create((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,

  get itemCount() {
    return get().cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  },

  get subtotal() {
    return get().cart?.items?.reduce((sum, item) => {
      const price = item.product?.price || item.price || 0;
      return sum + price * item.quantity;
    }, 0) || 0;
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set(state => ({ isOpen: !state.isOpen })),

  fetchCart: async () => {
    try {
      const data = await cartAPI.get();
      set({ cart: data.cart });
    } catch {}
  },

  addToCart: async (productId, quantity = 1, size, color) => {
    set({ isLoading: true });
    try {
      const data = await cartAPI.add({ productId, quantity, size, color });
      set({ cart: data.cart, isOpen: true, isLoading: false });
      toast.success('Added to cart!');
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.message || 'Failed to add to cart');
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      const data = await cartAPI.update(itemId, { quantity });
      set({ cart: data.cart });
    } catch (error) {
      toast.error(error.message || 'Failed to update cart');
    }
  },

  removeItem: async (itemId) => {
    try {
      const data = await cartAPI.remove(itemId);
      set({ cart: data.cart });
      toast.success('Item removed');
    } catch (error) {
      toast.error(error.message || 'Failed to remove item');
    }
  },

  clearCart: async () => {
    try {
      await cartAPI.clear();
      set({ cart: { items: [] } });
    } catch {}
  },
}));
