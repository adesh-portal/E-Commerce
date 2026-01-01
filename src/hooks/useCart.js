// hooks/useCart.js
import { useState, useCallback } from "react";

export const useCart = (initialCount = 0) => {
  const [cartCount, setCartCount] = useState(initialCount);
  const [cartItems, setCartItems] = useState([]);

  // Add a product to the cart
  const addToCart = useCallback((product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        // Increase quantity if item already exists
        setCartCount((count) => count + 1);
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Add as a new item
      setCartCount((count) => count + 1);
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  // Remove a product completely from the cart
  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => {
      const itemToRemove = prev.find((item) => item.id === productId);
      if (itemToRemove) {
        setCartCount((count) => count - itemToRemove.quantity);
      }
      return prev.filter((item) => item.id !== productId);
    });
  }, []);

  // Update quantity (can also decrease/increase)
  const updateQuantity = useCallback((productId, newQuantity) => {
    setCartItems((prev) => {
      return prev.map((item) => {
        if (item.id === productId) {
          const diff = newQuantity - item.quantity;
          setCartCount((count) => count + diff);
          return { ...item, quantity: Math.max(newQuantity, 1) };
        }
        return item;
      });
    });
  }, []);

  // Clear the cart entirely
  const clearCart = useCallback(() => {
    setCartCount(0);
    setCartItems([]);
  }, []);

  // Calculate total cost
  const getCartTotal = useCallback(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  return {
    cartCount,
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  };
};
