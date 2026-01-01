// components/Wishlist.jsx
import React from 'react';
import { Heart, X, ShoppingBag } from 'lucide-react';

const Wishlist = ({ isOpen, onClose, wishlistItems, onRemoveFromWishlist, onAddToCart }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      {/* Wishlist Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#f3ede7] bg-[#f8f5f1]">
            <div className="flex items-center gap-4">
              <Heart size={28} className="text-[#e88330]" />
              <h2 className="text-xl font-bold text-[#1b140e]">
                My Wishlist ({wishlistItems.length})
              </h2>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 hover:bg-[#e88330] hover:text-white rounded-full transition-all"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {wishlistItems.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center h-full text-center p-10">
                <div className="bg-[#f3ede7] rounded-full p-8 mb-6">
                  <Heart size={56} className="text-[#976f4e]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1b140e] mb-3">Your wishlist is empty</h3>
                <p className="text-[#976f4e] mb-6 text-lg">Save items you love by clicking the heart icon</p>
                <button 
                  onClick={onClose}
                  className="bg-[#e88330] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#d67429] transition-colors text-lg"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              // Wishlist Items
              <div className="p-6 space-y-5">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="bg-white border border-[#f3ede7] rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex gap-5">
                      {/* Product Image */}
                      <div className="relative">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        {item.discount && (
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                            -{item.discount}%
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-[#1b140e] text-base">{item.name}</h3>
                          <button
                            onClick={() => onRemoveFromWishlist(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        
                        <p className="text-sm text-[#976f4e] mb-3">{item.category}</p>
                        
                        {/* Price */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-xl font-bold text-[#e88330]">${item.price}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">${item.originalPrice}</span>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => onAddToCart(item)}
                            className="flex items-center gap-2 bg-[#e88330] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d67429] transition-colors"
                          >
                            <ShoppingBag size={16} />
                            Add to Cart
                          </button>
                          <button
                            onClick={() => onRemoveFromWishlist(item.id)}
                            className="px-4 py-2 text-sm font-medium text-[#976f4e] border border-[#f3ede7] rounded-lg hover:bg-[#f3ede7] transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {wishlistItems.length > 0 && (
            <div className="p-6 border-t border-[#f3ede7] bg-[#f8f5f1]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base text-[#976f4e]">
                  {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in wishlist
                </span>
              </div>
              <button
                onClick={() => {
                  // Add all wishlist items to cart
                  wishlistItems.forEach(item => onAddToCart(item));
                  // Optionally clear wishlist after adding all to cart
                  // wishlistItems.forEach(item => onRemoveFromWishlist(item.id));
                }}
                className="w-full bg-[#e88330] text-white py-4 rounded-lg font-medium hover:bg-[#d67429] transition-colors text-lg"
              >
                Add All to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;