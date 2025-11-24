"use client";

import { createContext, useReducer, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const StoreContext = createContext();

export function useStore() {
  return useContext(StoreContext);
}

const actionTypes = {
  SET_STATE_FROM_LOCALSTORAGE: 'SET_STATE_FROM_LOCALSTORAGE',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_CART_QUANTITY: 'UPDATE_CART_QUANTITY',
  TOGGLE_WISHLIST: 'TOGGLE_WISHLIST',
  SET_LOADING: 'SET_LOADING',
  CLEAR_CART: 'CLEAR_CART',
  LOGIN_USER: 'LOGIN_USER',
  LOGOUT_USER: 'LOGOUT_USER',
};

const initialState = {
  cart: [],
  wishlist: [],
  user: null,
  isStoreLoading: true,
};

function storeReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_STATE_FROM_LOCALSTORAGE:
      return { ...state, ...action.payload, isStoreLoading: false };
    case actionTypes.SET_LOADING:
      return { ...state, isStoreLoading: action.payload };
    case actionTypes.ADD_TO_CART: {
      const { product, quantity } = action.payload;
      const existingItem = state.cart.find(item => item.id === product.id);
      const newCart = existingItem
        ? state.cart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...state.cart, { ...product, quantity }];
      toast.success('تم إضافة المنتج للسلة!');
      return { ...state, cart: newCart };
    }
    case actionTypes.REMOVE_FROM_CART: {
      const newCart = state.cart.filter(item => item.id !== action.payload.productId);
      toast.success('تم إزالة المنتج من السلة.');
      return { ...state, cart: newCart };
    }
    case actionTypes.UPDATE_CART_QUANTITY: {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        const newCart = state.cart.filter(item => item.id !== productId);
        toast.success('تم إزالة المنتج من السلة.');
        return { ...state, cart: newCart };
      }
      const newCart = state.cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      return { ...state, cart: newCart };
    }
    case actionTypes.TOGGLE_WISHLIST: {
      const { product } = action.payload;
      const isWishlisted = state.wishlist.find(item => item.id === product.id);
      const newWishlist = isWishlisted
        ? state.wishlist.filter(item => item.id !== product.id)
        : [...state.wishlist, product];
      toast.success(isWishlisted ? 'تم إزالة المنتج من قائمة الرغبات.' : 'تم إضافة المنتج إلى قائمة الرغبات!');
      return { ...state, wishlist: newWishlist };
    }
    case actionTypes.CLEAR_CART: {
      toast.success('تم تفريغ السلة.');
      return { ...state, cart: [] };
    }

    case actionTypes.LOGIN_USER: {
      toast.success(`Welcome, ${action.payload.user.fullname}!`);
      return { ...state, user: action.payload.user };
    }
    case actionTypes.LOGOUT_USER: {
      // Clear user from state and also from localStorage
      localStorage.removeItem('user');
      toast.success('تم تسجيل الخروج بنجاح.');
      return { ...state, user: null, cart: [], wishlist: [] };
    }

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  // Load cart and wishlist from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      const savedWishlist = localStorage.getItem('wishlist');
      const savedUser = localStorage.getItem('user');
      dispatch({
        type: actionTypes.SET_STATE_FROM_LOCALSTORAGE,
        payload: {
          cart: savedCart ? JSON.parse(savedCart) : [],
          wishlist: savedWishlist ? JSON.parse(savedWishlist) : [],
          user: savedUser ? JSON.parse(savedUser) : null,
        },
      });
    } catch (error) {
      console.error("Failed to load from localStorage", error);
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  }, []);

  // Save cart and wishlist to localStorage whenever they change
  useEffect(() => {
    if (!state.isStoreLoading) {
      localStorage.setItem('cart', JSON.stringify(state.cart));
      localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
      if (state.user) {
        localStorage.setItem('user', JSON.stringify(state.user));
      } else {
        localStorage.removeItem('user');
      }
    }
  }, [state.cart, state.wishlist, state.user, state.isStoreLoading]);

  const addToCart = (product, quantity = 1) => {
    dispatch({ type: actionTypes.ADD_TO_CART, payload: { product, quantity } });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: { productId } });
  };

  const updateCartQuantity = (productId, quantity) => {
    dispatch({ type: actionTypes.UPDATE_CART_QUANTITY, payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: actionTypes.CLEAR_CART });
  };

  const toggleWishlist = (product) => {
    dispatch({ type: actionTypes.TOGGLE_WISHLIST, payload: { product } });
  };

  const loginUser = (userData) => {
    dispatch({ type: actionTypes.LOGIN_USER, payload: { user: userData } });
  };

  const logoutUser = () => {
    // First, call the API to clear the server session cookie
    fetch('/api/logout', { method: 'POST' })
      .then(response => {
        if (response.ok) {
          // Then, update the client-side state
          dispatch({ type: actionTypes.LOGOUT_USER });
          // Finally, do a full page reload to ensure all server components are updated
          window.location.href = '/login';
        }
      })
      .catch(error => console.error('Logout failed:', error));
  };

  const totalCartItems = state.cart.reduce((total, item) => total + item.quantity, 0);
  const totalCartPrice = state.cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const value = {
    ...state,
    totalCartItems,
    totalCartPrice,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    toggleWishlist,
    loginUser,
    logoutUser,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}