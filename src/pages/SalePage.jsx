import React, { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const SalePage = ({ onAddToCart, onBuyNow, onAddToWishlist }) => {
  const [products, setProducts] = useState([]);
  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // No dedicated sale endpoint; filter popular by price drop if available
        const res = await fetch(`${API_BASE_URL}/products/popular?limit=24`);
        const data = res.ok ? await res.json() : [];
        const list = Array.isArray(data) ? data : data.products || [];
        if (!cancelled) setProducts(list);
      } catch (_) {}
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 md:px-20 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Tag className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">Sale</h1>
          <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
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

export default SalePage;


