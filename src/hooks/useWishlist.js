// hooks/useWishlist.js
import { useState, useCallback } from 'react';

export const useWishlist = (initialItems = []) => {
  const [wishlistItems, setWishlistItems] = useState(initialItems);
  const [wishlistCount, setWishlistCount] = useState(initialItems.length);

  const addToWishlist = useCallback((product) => {
    setWishlistItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev; // Item already in wishlist
      }
      setWishlistCount(prevCount => prevCount + 1);
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems(prev => {
      const filtered = prev.filter(item => item.id !== productId);
      setWishlistCount(filtered.length);
      return filtered;
    });
  }, []);

  const toggleWishlist = useCallback((product) => {
    setWishlistItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        const filtered = prev.filter(item => item.id !== product.id);
        setWishlistCount(filtered.length);
        return filtered;
      } else {
        setWishlistCount(prevCount => prevCount + 1);
        return [...prev, product];
      }
    });
  }, []);

  const isInWishlist = useCallback(
    (productId) => wishlistItems.some(item => item.id === productId),
    [wishlistItems]
  );

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
    setWishlistCount(0);
  }, []);

  const moveToCart = useCallback(
    (product, addToCartFunction) => {
      if (addToCartFunction) {
        addToCartFunction(product);
        removeFromWishlist(product.id);
      }
    },
    [removeFromWishlist]
  );

  const addAllToCart = useCallback(
    (addToCartFunction) => {
      if (addToCartFunction && wishlistItems.length > 0) {
        wishlistItems.forEach(item => {
          addToCartFunction(item);
        });
        // Optionally clear wishlist after adding all to cart
        // clearWishlist();
      }
    },
    [wishlistItems]
  );

  return {
    wishlistItems,
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    moveToCart,
    addAllToCart,
  };
};
