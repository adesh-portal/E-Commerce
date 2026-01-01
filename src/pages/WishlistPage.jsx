// pages/WishlistPage.jsx
import React from 'react';
import { Heart, X, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const WishlistPage = ({ wishlistItems, onRemoveFromWishlist, onAddToCart, onBuyNow }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f5f1]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#f3ede7]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-[#f3ede7] rounded-lg transition-colors"
              >
                <ArrowLeft size={24} className="text-[#1b140e]" />
              </button>
              <div className="flex items-center gap-3">
                <Heart size={32} className="text-[#e88330]" />
                <h1 className="text-2xl font-bold text-[#1b140e]">
                  My Wishlist
                </h1>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#976f4e] mb-1">
                {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in wishlist
              </p>
              {wishlistItems.length > 0 && (
                <button
                  onClick={() => {
                    wishlistItems.forEach(item => onAddToCart(item));
                  }}
                  className="bg-[#e88330] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#d67429] transition-colors"
                >
                  Add All to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {wishlistItems.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="bg-white rounded-full p-12 mb-8 shadow-lg">
              <Heart size={80} className="text-[#976f4e]" />
            </div>
            <h2 className="text-3xl font-bold text-[#1b140e] mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-xl text-[#976f4e] mb-8 max-w-md">
              Save items you love by clicking the heart icon on any product
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/')}
                className="bg-[#e88330] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#d67429] transition-colors text-lg"
              >
                Start Shopping
              </button>
              <button 
                onClick={() => navigate('/categories')}
                className="border border-[#e88330] text-[#e88330] px-8 py-4 rounded-lg font-medium hover:bg-[#e88330] hover:text-white transition-colors text-lg"
              >
                Browse Categories
              </button>
            </div>
          </div>
        ) : (
          // Wishlist Items Grid
          <div className="space-y-8">
            {/* Section Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#1b140e] mb-2">
                Saved Items ({wishlistItems.length})
              </h2>
              <p className="text-[#976f4e]">
                Items you've saved for later. Click on any item to view details or add to cart.
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div key={item.id} className="relative group">
                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveFromWishlist(item.id)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    title="Remove from wishlist"
                  >
                    <X size={18} />
                  </button>
                  
                  {/* Product Card */}
                  <ProductCard
                    product={item}
                    onAddToCart={onAddToCart}
                    onBuyNow={onBuyNow}
                    onAddToWishlist={() => {}} // Disabled since it's already in wishlist
                    size="large"
                  />
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#1b140e] mb-4">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    wishlistItems.forEach(item => onAddToCart(item));
                  }}
                  className="flex items-center gap-2 bg-[#e88330] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#d67429] transition-colors"
                >
                  <ShoppingBag size={20} />
                  Add All to Cart
                </button>
                <button
                  onClick={() => {
                    wishlistItems.forEach(item => onBuyNow(item));
                  }}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Buy All Now
                </button>
                <button
                  onClick={() => {
                    wishlistItems.forEach(item => onRemoveFromWishlist(item.id));
                  }}
                  className="flex items-center gap-2 border border-red-500 text-red-500 px-6 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                  <X size={20} />
                  Clear Wishlist
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
