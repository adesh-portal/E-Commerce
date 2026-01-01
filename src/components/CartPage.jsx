import React, { useState, useEffect } from "react";
import { Trash2, Plus, Minus, ShoppingBag, Star, Heart, Zap } from "lucide-react";
import { normalizeImageUrl } from "../utils/images.js";

const CartPage = ({ cartItems, updateQuantity, getCartTotal }) => {
  const TAX_RATE = 0.1;
  const [likedItems, setLikedItems] = useState(new Set());
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState(null);

  // Fetch recommendations from API
  const fetchRecommendations = async () => {
    try {
      setIsLoadingRecommendations(true);
      setRecommendationsError(null);
      
      const response = await fetch('http://localhost:5000/api/products/popular?limit=8');
      if (response.ok) {
        const data = await response.json();
        // Map _id to id for consistency
        const mappedData = data.map(product => ({
          ...product,
          id: product._id || product.id,
          image: normalizeImageUrl(product.image, '300x300', 'Product Image')
        }));
        setRecommendations(mappedData);
        // Cache recommendations in localStorage
        localStorage.setItem('cartRecommendations', JSON.stringify(mappedData));
        localStorage.setItem('cartRecommendationsTimestamp', Date.now().toString());
      } else {
        // Fallback to trending products if popular fails
        const trendingResponse = await fetch('http://localhost:5000/api/products/trending?limit=8');
        if (trendingResponse.ok) {
          const trendingData = await trendingResponse.json();
          const mappedData = trendingData.map(product => ({
            ...product,
            id: product._id || product.id,
            image: normalizeImageUrl(product.image, '300x300', 'Product Image')
          }));
          setRecommendations(mappedData);
          // Cache recommendations in localStorage
          localStorage.setItem('cartRecommendations', JSON.stringify(mappedData));
          localStorage.setItem('cartRecommendationsTimestamp', Date.now().toString());
        } else {
          throw new Error('Failed to fetch recommendations from both endpoints');
        }
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setRecommendationsError(error.message);
      // Try to load cached recommendations
      const cached = localStorage.getItem('cartRecommendations');
      const timestamp = localStorage.getItem('cartRecommendationsTimestamp');
      if (cached && timestamp && (Date.now() - parseInt(timestamp)) < 300000) { // 5 minutes cache
        try {
          setRecommendations(JSON.parse(cached));
        } catch (e) {
          console.error('Failed to parse cached recommendations:', e);
          setRecommendations([]);
        }
      } else {
        setRecommendations([]);
      }
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    // Try to load cached recommendations first
    const cached = localStorage.getItem('cartRecommendations');
    const timestamp = localStorage.getItem('cartRecommendationsTimestamp');
    if (cached && timestamp && (Date.now() - parseInt(timestamp)) < 300000) { // 5 minutes cache
      try {
        const parsedData = JSON.parse(cached);
        setRecommendations(parsedData);
        setIsLoadingRecommendations(false);
      } catch (e) {
        console.error('Failed to parse cached recommendations:', e);
        fetchRecommendations();
      }
    } else {
      fetchRecommendations();
    }
  }, []);

  // Refresh recommendations
  const handleRefreshRecommendations = () => {
    fetchRecommendations();
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateTax = () => {
    return calculateSubtotal() * TAX_RATE;
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const toggleLike = (itemId) => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(itemId)) {
      newLiked.delete(itemId);
    } else {
      newLiked.add(itemId);
    }
    setLikedItems(newLiked);
  };

  const addToCart = (item) => {
    // In real implementation, this would call the parent's addToCart function
    console.log('Adding to cart:', item);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 md:px-20 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-24">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 text-lg mb-8">Discover amazing products and start shopping!</p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105">
              Start Shopping
            </button>
          </div>
          
          {/* Recommendations for empty cart */}
          <div className="mt-16">
            <div className="flex items-center justify-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">
                <Zap className="inline w-6 h-6 text-yellow-500 mr-2" />
                Popular Items
              </h3>
              <button
                onClick={handleRefreshRecommendations}
                disabled={isLoadingRecommendations}
                className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-300"
              >
                <svg className={`w-4 h-4 ${isLoadingRecommendations ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            {isLoadingRecommendations ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                    <div className="w-full h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.map((item) => (
                  <RecommendationCard 
                    key={item.id} 
                    item={item} 
                    onAddToCart={addToCart}
                    onToggleLike={toggleLike}
                    isLiked={likedItems.has(item.id)}
                  />
                ))}
              </div>
            ) : recommendationsError ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">Failed to load recommendations: {recommendationsError}</p>
                <button
                  onClick={handleRefreshRecommendations}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recommendations available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 md:px-20 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <ShoppingBag className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">Shopping Cart</h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Side */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                    <button className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">Size: {item.size}</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹{item.price}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-gray-900 font-semibold min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xl font-bold text-blue-600">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bill Summary - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-6 text-gray-900">Order Summary</h3>

              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-600">
                    <span className="text-sm">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{calculateSubtotal()}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Tax ({TAX_RATE * 100}%)</span>
                  <span className="font-medium">₹{calculateTax().toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                  <span>Total</span>
                  <span>₹{calculateGrandTotal().toFixed(2)}</span>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105">
                  Proceed to Checkout
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Secure checkout powered by SSL encryption
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              <Zap className="inline w-6 h-6 text-yellow-500 mr-2" />
              You might also like
            </h3>
            <button
              onClick={handleRefreshRecommendations}
              disabled={isLoadingRecommendations}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-300"
            >
              <svg className={`w-4 h-4 ${isLoadingRecommendations ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          
          {isLoadingRecommendations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((item) => (
                <RecommendationCard 
                  key={item.id} 
                  item={item} 
                  onAddToCart={addToCart}
                  onToggleLike={toggleLike}
                  isLiked={likedItems.has(item.id)}
                />
              ))}
            </div>
          ) : recommendationsError ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Failed to load recommendations: {recommendationsError}</p>
              <button
                onClick={handleRefreshRecommendations}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recommendations available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RecommendationCard = ({ item, onAddToCart, onToggleLike, isLiked }) => {
  // Calculate discount if originalPrice exists
  const discount = item.originalPrice && item.price ? 
    Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="relative">
        <img
          src={normalizeImageUrl(item.image, '300x300', item.name)}
          alt={item.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = `data:image/svg+xml;base64,${btoa(`
              <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
                <rect width="300" height="300" fill="#f3f4f6"/>
                <text x="150" y="150" font-family="Arial" font-size="16" fill="#6b7280" text-anchor="middle" dy=".3em">${item.name}</text>
              </svg>
            `)}`;
          }}
        />
        <button
          onClick={() => onToggleLike(item.id)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
            isLiked 
              ? 'bg-red-500 text-white' 
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
        
        {item.category && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {item.category}
          </span>
        )}
        
        {discount && (
          <span className="absolute bottom-3 left-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {discount}% OFF
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {item.name}
        </h4>
        
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-600">
            {item.rating || 0} ({item.reviewCount || 0})
          </span>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-gray-900">
            ₹{item.price || 0}
          </span>
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="text-sm text-gray-500 line-through">
              ₹{item.originalPrice}
            </span>
          )}
        </div>
        
        <button
          onClick={() => onAddToCart(item)}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-300"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default CartPage;