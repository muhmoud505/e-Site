'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const StoreContext = createContext();

export function useStore() {
  return useContext(StoreContext);
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    const storedWishlist = localStorage.getItem('wishlist');
    if (storedCart) setCart(JSON.parse(storedCart));
    if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
  }, []);

  // Save data to localStorage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [cart, wishlist]);

  const addToCart = (product, quantity = 1) => {
    const parsedQty = parseInt(quantity) || 1;
    const exist = cart.find((item) => item.id === product.id);

    if (exist) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...exist, quantity: (parseInt(exist.quantity) || 0) + parsedQty } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: parsedQty }]);
    }

    toast.success(`${product.name} أضيف إلى السلة`);
  };

  const updateQuantity = (productId, quantity) => {
    const parsedQty = parseInt(quantity);
    if (parsedQty < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === productId ? { ...item, quantity: parsedQty } : item))
    );
  };

  const toggleWishlist = (product) => {
    const exist = wishlist.find((item) => item.id === product.id);
    if (exist) {
      setWishlist(wishlist.filter((item) => item.id !== product.id));
      toast.error(`${product.name} أزيل من قائمة الرغبات`);
    } else {
      setWishlist([...wishlist, product]);
      toast.success(`${product.name} أضيف إلى قائمة الرغبات`);
    }
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    toast.success('تم إزالة المنتج من السلة');
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    wishlist,
    toggleWishlist,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}