// components/ProductSection.jsx
import React from 'react';
import ProductCard from './ProductCard';

const ProductSection = ({ 
  title, 
  products = [],  
  onAddToCart, 
  onBuyNow, 
  onAddToWishlist, 
  onViewAll,
  layout = 'scroll' 
}) => {

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between px-6 pb-4 pt-6">
        <h2 className="text-[#1b140e] text-[22px] font-bold leading-tight tracking-[-0.015em]">
          {title}
        </h2>
        <button 
          onClick={() => onViewAll && onViewAll(title)}
          className="text-[#e88330] text-sm font-medium hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>
      
      {layout === 'scroll' ? (
        <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-6">
          <div className="flex items-stretch px-6 gap-6">
            {products.slice(0, 6).map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                onAddToWishlist={onAddToWishlist}
                size="small"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 px-6">
          {products.slice(0, 6).map(product => (
            <ProductCard 
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
              onAddToWishlist={onAddToWishlist}
              size="small"
            />
          ))}
        </div>
      )} 
    </div>
  );
};

export default ProductSection;
