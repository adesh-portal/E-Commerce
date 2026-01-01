import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const FeaturedPage = ({ onAddToCart, onBuyNow, onAddToWishlist }) => {
  const [products, setProducts] = useState([]);
  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/popular?limit=24`);
        const data = res.ok ? await res.json() : [];
        if (!cancelled) setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (_) {}
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 md:px-20 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Star className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900">Featured Products</h1>
          <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
            {products.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
              onAddToWishlist={onAddToWishlist}
              size="large"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedPage;


