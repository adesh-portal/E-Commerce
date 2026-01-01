import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/search/brands`);
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setBrands(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 md:px-20 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Building2 className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
          <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">
            {brands.length}
          </span>
        </div>
        {loading && <div className="text-[#976f4e]">Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {brands.map((brand) => (
              <div key={brand} className="bg-white border border-[#f3ede7] rounded-lg p-4 text-center cursor-pointer hover:shadow">
                <span className="text-sm font-medium text-[#1b140e]">{brand}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandsPage;


