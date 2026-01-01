// components/ProductCard.jsx
import React from 'react';
import { normalizeImageUrl, makeSvgPlaceholder } from '../utils/images';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({
  product,
  onAddToCart,
  onBuyNow,
  onAddToWishlist,
  size = 'medium'
}) => {
  const navigate = useNavigate();
  
  // Determine card and button sizing based on prop
  const cardClass = size === 'large' ? 'min-w-72 p-0' : 'p-0';
  const buttonClass = size === 'large' ? 'h-12 px-6' : 'h-10 px-4';

  // Event handlers to prevent default behavior and call props
  const handleAddToCart = (e) => {
    e.preventDefault();
    onAddToCart(product);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    onBuyNow(product);
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToWishlist(product);
  };

  // Navigate to product detail page on card click
  const handleCardClick = () => {
    navigate(`/product/${product._id || product.id}`);
  };

  // Render star rating as a string of stars (★ for full, ☆ for empty/half)
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('☆'); // Note: For true half-star, consider using an icon library
    }
    while (stars.length < 5) {
      stars.push('☆');
    }
    return stars.join('');
  };

  // Normalize image URL and provide safe fallback
  const primaryImage = normalizeImageUrl(product.images?.[0] || product.image) || makeSvgPlaceholder(300, 300, 'No Image');

  return (
    <div
      onClick={handleCardClick}
      className={`group bg-white rounded-2xl shadow-sm border border-gray-100 product-card transition-all hover:shadow-xl cursor-pointer mx-2 my-2 overflow-hidden ${cardClass}`}
    >
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        <img
          src={primaryImage || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'><rect width=\'100%\' height=\'100%\' fill=\'%23e5e7eb\'/><text x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%239ca3af\' font-size=\'16\'>No Image</text></svg>'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'><rect width=\'100%\' height=\'100%\' fill=\'%23e5e7eb\'/><text x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%239ca3af\' font-size=\'16\'>Image Unavailable</text></svg>';
          }}
          loading="lazy"
        />

        {product.badge && (
          <div className={`absolute top-3 right-3 text-white px-3 py-1.5 rounded-full text-xs font-bold ${product.badgeColor || 'bg-red-500'}`}>
            {product.badge}
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2">
        <button
          onClick={handleAddToWishlist}
            aria-label="Add to wishlist"
            className="p-2.5 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-all hover:scale-110 shadow-sm"
        >
          <Heart size={18} />
        </button>
      </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 sm:p-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
          <div className="pointer-events-auto bg-white/90 backdrop-blur rounded-xl shadow-md grid grid-cols-2 gap-2 p-2">
            <button
              onClick={handleAddToCart}
              className="h-10 px-4 rounded-lg border border-[#e88330] text-[#e88330] hover:bg-[#e88330] hover:text-white transition-colors text-sm font-medium"
            >
              {size === 'large' ? 'Add to Cart' : 'Add'}
            </button>
            <button
              onClick={handleBuyNow}
              className="h-10 px-4 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 text-sm font-medium"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        <h3 className="text-[#1b140e] text-base font-semibold leading-normal line-clamp-2">
          {product.name}
        </h3>
        <p className="text-[#6b4f3a] text-sm leading-normal line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center">
            <span className="text-yellow-400">{renderStars(product.rating)}</span>
            <span className="text-gray-600 ml-2">({product.rating})</span>
          </div>
          <span className={`${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
            {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
          </span>
          </div>
          {product.tag && (
            <span className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${product.tagColor || 'bg-green-100 text-green-800'}`}>
              {product.tag}
            </span>
          )}
        </div>

        <div className="flex items-end gap-3">
          <span className="text-lg font-bold text-[#1b140e]">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;