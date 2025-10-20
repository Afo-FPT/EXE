'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
interface MysteryBag {
  _id: string;
  name: string;
  collection: {
    _id: string;
    name: string;
  };
  description: string;
  price: number;
  discountPercent: number;
  image: string;
  isActive: boolean;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  product: MysteryBag;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  totalDiscount: number;
  finalPrice: number;
}

interface CartContextType {
  cart: CartState;
  addToCart: (product: MysteryBag, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

// Initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  totalDiscount: 0,
  finalPrice: 0,
};

// Action types
type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: MysteryBag; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity } = action.payload;
      
      // Validate product data
      if (!product || !product._id || !product.name) {
        console.error('Invalid product data:', product);
        return state;
      }
      
      const existingItem = state.items.find(item => item.product && item.product._id === product._id);
      
      let newItems: CartItem[];
      if (existingItem) {
        // Update existing item
        newItems = state.items.map(item =>
          item.product && item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, { product, quantity }];
      }
      
      return calculateTotals({ ...state, items: newItems });
    }
    
    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(item => item.product && item.product._id !== action.payload.productId);
      return calculateTotals({ ...state, items: newItems });
    }
    
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: { productId } });
      }
      
      const newItems = state.items.map(item =>
        item.product && item.product._id === productId
          ? { ...item, quantity }
          : item
      );
      
      return calculateTotals({ ...state, items: newItems });
    }
    
    case 'CLEAR_CART':
      return initialState;
    
    case 'LOAD_CART':
      return action.payload;
    
    default:
      return state;
  }
}

// Helper function to calculate totals
function calculateTotals(state: CartState): CartState {
  const totalItems = state.items.reduce((sum, item) => {
    if (!item || !item.product) return sum;
    return sum + item.quantity;
  }, 0);
  
  const totalPrice = state.items.reduce((sum, item) => {
    if (!item || !item.product || !item.product.price) return sum;
    return sum + (item.product.price * item.quantity);
  }, 0);
  
  const totalDiscount = state.items.reduce((sum, item) => {
    if (!item || !item.product || !item.product.price || !item.product.discountPercent) return sum;
    const discountAmount = item.product.price * (item.product.discountPercent / 100);
    return sum + (discountAmount * item.quantity);
  }, 0);
  
  const finalPrice = totalPrice - totalDiscount;
  
  return {
    ...state,
    totalItems,
    totalPrice,
    totalDiscount,
    finalPrice,
  };
}

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('mystery-bag-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('mystery-bag-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: MysteryBag, quantity: number = 1) => {
    // Validate product data
    if (!product || !product._id || !product.name) {
      console.error('Invalid product data:', product);
      alert('Dữ liệu sản phẩm không hợp lệ');
      return;
    }
    
    // Check stock availability
    const existingItem = cart.items.find(item => item.product && item.product._id === product._id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    
    if (currentQuantity + quantity > product.stock) {
      alert(`Không thể thêm vào giỏ hàng. Chỉ còn ${product.stock} sản phẩm trong kho.`);
      return;
    }
    
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId } });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const item = cart.items.find(item => item.product && item.product._id === productId);
    if (item && quantity > item.product.stock) {
      alert(`Không thể cập nhật số lượng. Chỉ còn ${item.product.stock} sản phẩm trong kho.`);
      return;
    }
    
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (productId: string) => {
    return cart.items.some(item => item.product && item.product._id === productId);
  };

  const getItemQuantity = (productId: string) => {
    const item = cart.items.find(item => item.product && item.product._id === productId);
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
