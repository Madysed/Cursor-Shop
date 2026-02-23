import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'

export interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    images: {
      id: string
      url: string
    }[]
  }
}

interface CartStore {
  items: CartItem[]
  loading: boolean
  error: string | null
  lastUpdated: number
  fetchCart: () => Promise<void>
  addToCart: (productId: string, quantity?: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => void
  getCartTotal: () => number
  getItemsCount: () => number
}

// Configuration
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Enhanced cart store with improved caching, offline support,
 * retry mechanisms and optimistic updates
 */
export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,
      lastUpdated: 0,

      /**
       * Fetches the cart data from the server with caching
       */
      fetchCart: async () => {
        // Skip fetch if data is recent (within 5 minutes)
        const now = Date.now();
        if (!get().loading && get().lastUpdated > 0 && (now - get().lastUpdated < CACHE_TIMEOUT)) {
          return;
        }

        try {
          set({ loading: true, error: null });
          
          // Fetch with retry logic
          let retries = 0;
          let success = false;
          let data;
          
          while (retries < MAX_RETRIES && !success) {
            try {
              const res = await fetch('/api/cart', {
                headers: {
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache'
                }
              });
              
              if (!res.ok) {
                throw new Error(`Failed to fetch cart: ${res.status}`);
              }
              
              data = await res.json();
              success = true;
            } catch (error) {
              retries++;
              if (retries >= MAX_RETRIES) throw error;
              await new Promise(r => setTimeout(r, RETRY_DELAY * retries));
            }
          }
          
          set({ 
            items: data?.items || [], 
            lastUpdated: Date.now()
          });
        } catch (error) {
          console.error("Cart fetch error:", error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch cart' 
          });
          
          // Don't show error toast on initial load - only on explicit refresh attempts
          if (get().lastUpdated > 0) {
            toast.error('Failed to refresh cart. Using cached data.');
          }
        } finally {
          set({ loading: false });
        }
      },

      /**
       * Adds an item to the cart with optimistic updates
       */
      addToCart: async (productId: string, quantity = 1) => {
        try {
          set({ loading: true, error: null });
          
          // Optimistic update for better UX
          const currentItems = [...get().items];
          const existingItemIndex = currentItems.findIndex(
            item => item.product.id === productId
          );
          
          if (existingItemIndex >= 0) {
            // Optimistically update quantity for existing item
            const updatedItems = [...currentItems];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity
            };
            set({ items: updatedItems });
          }
          
          // Make API call
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity }),
          });

          const data = await res.json();
          
          if (!res.ok) {
            // Revert optimistic update on failure
            set({ items: currentItems });
            throw new Error(data.message || 'Failed to add to cart');
          }

          // Refresh cart after adding item
          const cartRes = await fetch('/api/cart');
          if (!cartRes.ok) {
            throw new Error('Failed to fetch updated cart');
          }
          
          const cartData = await cartRes.json();
          set({ 
            items: cartData.items || [],
            lastUpdated: Date.now()
          });
          
          toast.success('Item added to cart');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to add to cart';
          set({ error: message });
          toast.error(message);
        } finally {
          set({ loading: false });
        }
      },

      /**
       * Removes an item from the cart with optimistic update
       */
      removeFromCart: async (itemId: string) => {
        try {
          set({ loading: true, error: null });
          
          // Optimistic update - remove item immediately
          const currentItems = [...get().items];
          const updatedItems = currentItems.filter(item => item.id !== itemId);
          set({ items: updatedItems });
          
          // Make API call
          const res = await fetch(`/api/cart?itemId=${itemId}`, {
            method: 'DELETE',
          });

          if (!res.ok) {
            // Revert optimistic update on failure
            set({ items: currentItems });
            throw new Error('Failed to remove from cart');
          }

          // No need to refresh cart since we already updated optimistically
          set({ lastUpdated: Date.now() });
          toast.success('Item removed from cart');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to remove from cart';
          set({ error: message });
          toast.error(message);
        } finally {
          set({ loading: false });
        }
      },

      /**
       * Updates the quantity of an item with optimistic update
       */
      updateQuantity: async (itemId: string, quantity: number) => {
        if (quantity < 1) {
          // If quantity is less than 1, remove the item
          return get().removeFromCart(itemId);
        }
        
        try {
          set({ loading: true, error: null });
          
          // Optimistic update - update quantity immediately
          const currentItems = [...get().items];
          const itemIndex = currentItems.findIndex(item => item.id === itemId);
          
          if (itemIndex === -1) {
            throw new Error('Item not found in cart');
          }
          
          const updatedItems = [...currentItems];
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            quantity,
          };
          
          set({ items: updatedItems });
          
          // Make API call
          const res = await fetch(`/api/cart/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity }),
          });

          if (!res.ok) {
            // Revert optimistic update on failure
            set({ items: currentItems });
            throw new Error('Failed to update quantity');
          }

          // No need to refresh cart since we already updated optimistically
          set({ lastUpdated: Date.now() });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update quantity';
          set({ error: message });
          toast.error(message);
        } finally {
          set({ loading: false });
        }
      },

      /**
       * Clears the cart
       */
      clearCart: () => {
        set({ items: [], error: null, lastUpdated: Date.now() });
      },
      
      /**
       * Calculates the total price of all items in cart
       */
      getCartTotal: () => {
        return get().items.reduce((total, item) => {
          return total + (item.product.price * item.quantity);
        }, 0);
      },
      
      /**
       * Gets the total number of items in cart
       */
      getItemsCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'shopping-cart',
      storage: createJSONStorage(() => localStorage),
      // Only persist items, not loading state or error
      partialize: (state) => ({ 
        items: state.items,
        lastUpdated: state.lastUpdated
      }),
    }
  )
); 