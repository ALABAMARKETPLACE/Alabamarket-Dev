import { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "@/redux/createSlices";

// Guest cart localStorage key
const GUEST_CART_KEY = "guest_cart_items";

// Helper to get guest cart from localStorage
const getGuestCartFromStorage = (): any[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to save guest cart to localStorage
const saveGuestCartToStorage = (items: any[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    console.error("Failed to save guest cart to localStorage");
  }
};

// Helper to clear guest cart from localStorage
export const clearGuestCartFromStorage = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    console.error("Failed to clear guest cart from localStorage");
  }
};

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  storeId?: string | number;
  storeName?: string;
  variantId?: string | null;
  combination?: any;
  unit?: number;
  status?: boolean;
  totalPrice?: number;
  [key: string]: any;
}

interface CartState {
  items: CartItem[];
  isGuestCart: boolean;
}

const initialState: CartState = {
  items: [],
  isGuestCart: false,
};

export const CartSlice = createAppSlice({
  name: "Cart",
  initialState,
  reducers: {
    // Store cart items (from API or after login sync)
    storeCart: (state: CartState, action: PayloadAction<any[]>) => {
      state.items = action.payload;
      state.isGuestCart = false;
    },
    
    // Clear cart
    clearCart: (state: CartState) => {
      state.items = [];
      state.isGuestCart = false;
      clearGuestCartFromStorage();
    },
    
    // Add item to guest cart (for non-authenticated users)
    addToGuestCart: (state: CartState, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => 
          item.productId === newItem.productId && 
          item.variantId === newItem.variantId
      );
      
      if (existingIndex >= 0) {
        // Update quantity if item already exists
        state.items[existingIndex].quantity += newItem.quantity;
        state.items[existingIndex].totalPrice = 
          state.items[existingIndex].price * state.items[existingIndex].quantity;
      } else {
        // Add new item
        state.items.push({
          ...newItem,
          totalPrice: newItem.price * newItem.quantity,
        });
      }
      
      state.isGuestCart = true;
      saveGuestCartToStorage(state.items);
    },
    
    // Update guest cart item quantity
    updateGuestCartQuantity: (
      state: CartState, 
      action: PayloadAction<{ productId: string; variantId?: string | null; quantity: number }>
    ) => {
      const { productId, variantId, quantity } = action.payload;
      const item = state.items.find(
        (i) => i.productId === productId && i.variantId === variantId
      );
      if (item && quantity > 0) {
        item.quantity = quantity;
        item.totalPrice = item.price * quantity;
        saveGuestCartToStorage(state.items);
      }
    },
    
    // Remove item from guest cart
    removeFromGuestCart: (
      state: CartState, 
      action: PayloadAction<{ productId: string; variantId?: string | null }>
    ) => {
      const { productId, variantId } = action.payload;
      state.items = state.items.filter(
        (item) => !(item.productId === productId && item.variantId === variantId)
      );
      saveGuestCartToStorage(state.items);
    },
    
    // Load guest cart from localStorage
    loadGuestCart: (state: CartState) => {
      const guestItems = getGuestCartFromStorage();
      if (guestItems.length > 0) {
        state.items = guestItems;
        state.isGuestCart = true;
      }
    },
    
    // Set guest cart flag
    setIsGuestCart: (state: CartState, action: PayloadAction<boolean>) => {
      state.isGuestCart = action.payload;
    },
  },
  selectors: {
    reduxCartItems: (cart: CartState) => cart?.items,
    reduxCartCount: (cart: CartState) => cart.items?.length ?? 0,
    reduxIsGuestCart: (cart: CartState) => cart.isGuestCart,
  },
});

export const { 
  storeCart, 
  clearCart, 
  addToGuestCart, 
  updateGuestCartQuantity, 
  removeFromGuestCart, 
  loadGuestCart,
  setIsGuestCart,
} = CartSlice.actions;

export const { reduxCartItems, reduxCartCount, reduxIsGuestCart } = CartSlice.selectors;

// Export helper for syncing guest cart
export { getGuestCartFromStorage };
