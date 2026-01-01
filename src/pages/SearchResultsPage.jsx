// pages/SearchResultsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Loader2, SortAsc, SortDesc } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const SearchResultsPage = ({
  onAddToCart,
  onBuyNow,
  onAddToWishlist,
  showNotification,
  NOTIFICATION_TYPES
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    brand: '',
    rating: ''
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  const API_BASE_URL = 'http://localhost:5000/api';

    // Search products from database
  const searchProducts = useCallback(async (searchQuery, page = 1, appliedFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(searchQuery.trim() && { q: searchQuery.trim() }),
        ...(appliedFilters.category && { category: appliedFilters.category }),
        ...(appliedFilters.minPrice && { minPrice: appliedFilters.minPrice }),
        ...(appliedFilters.maxPrice && { maxPrice: appliedFilters.maxPrice }),
        ...(appliedFilters.brand && { brand: appliedFilters.brand }),
        ...(sortBy !== 'relevance' && { 
          sortBy: sortBy === 'price_asc' ? 'price' : sortBy === 'price_desc' ? 'price' : sortBy,
          sortOrder: sortBy.includes('_desc') ? 'desc' : 'asc'
        })
      });

      // If no search query, fetch all products
      const searchUrl = searchQuery.trim() 
        ? `${API_BASE_URL}/search?${params}`
        : `${API_BASE_URL}/products?${params}`;
      
      console.log('Fetching products with URL:', searchUrl);
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', response.status, errorText);
        throw new Error(`Failed to fetch products: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (Array.isArray(data)) {
        // Simple array response
        setProducts(data);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: data.length });
      } else if (data.products && Array.isArray(data.products)) {
        // Paginated response with products array
        setProducts(data.products);
        setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalItems: data.products.length });
      } else if (data.results && Array.isArray(data.results)) {
        // Alternative response format
        setProducts(data.results);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: data.results.length });
      } else {
        // Unexpected response format
        console.warn('Unexpected response format:', data);
        setProducts([]);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
      }

    } catch (err) {
      console.error('Search error:', err);
      setError(`Failed to fetch products: ${err.message}`);
      setProducts([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  // Load filter options
  const loadFilterOptions = useCallback(async () => {
    setLoadingFilters(true);
    try {
      console.log('Loading filter options from:', `${API_BASE_URL}/search/categories`);
      
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/search/categories`),
        fetch(`${API_BASE_URL}/search/brands`)
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        console.log('Categories loaded:', categoriesData);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } else {
        console.error('Categories response error:', categoriesRes.status);
        // Try to fetch from products endpoint to extract categories
        try {
          const productsRes = await fetch(`${API_BASE_URL}/products?limit=100`);
          if (productsRes.ok) {
            const productsData = await productsRes.json();
            const uniqueCategories = [...new Set(productsData.map(p => p.category).filter(Boolean))];
            setCategories(uniqueCategories.length > 0 ? uniqueCategories : ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books']);
          } else {
            setCategories(['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books']);
          }
        } catch {
          setCategories(['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books']);
        }
      }

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        console.log('Brands loaded:', brandsData);
        setBrands(Array.isArray(brandsData) ? brandsData : []);
      } else {
        console.error('Brands response error:', brandsRes.status);
        // Try to fetch from products endpoint to extract brands
        try {
          const productsRes = await fetch(`${API_BASE_URL}/products?limit=100`);
          if (productsRes.ok) {
            const productsData = await productsRes.json();
            const uniqueBrands = [...new Set(productsData.map(p => p.brand).filter(Boolean))];
            setBrands(uniqueBrands.length > 0 ? uniqueBrands : ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony']);
          } else {
            setBrands(['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony']);
          }
        } catch {
          setBrands(['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony']);
        }
      }
    } catch (err) {
      console.error('Failed to load filter options:', err);
      // Set fallback data on error
      setCategories(['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books']);
      setBrands(['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony']);
    } finally {
      setLoadingFilters(false);
    }
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    
    // Apply filters immediately
    searchProducts(query, 1, newFilters);
  }, [filters, query, searchProducts]);

  // Handle sort changes
  const handleSortChange = useCallback((newSortBy) => {
    setSortBy(newSortBy);
    
    // Reset to first page when sorting changes
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    
    // Apply new sorting immediately
    searchProducts(query, 1, filters);
  }, [query, filters, searchProducts]);

  // Handle page changes
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    searchProducts(query, page, filters);
  }, [query, filters, searchProducts]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    const newFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
      rating: ''
    };
    setFilters(newFilters);
    
    // Reset to first page when clearing filters
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    
    // Fetch products without filters
    searchProducts(query, 1, newFilters);
  }, [query, searchProducts]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Initial search when component mounts or query changes
  useEffect(() => {
    if (query) {
      console.log('Query changed, searching for:', query);
      searchProducts(query);
      loadFilterOptions();
    } else {
      // If no query, fetch all products
      searchProducts('');
      loadFilterOptions();
    }
  }, [query, searchProducts, loadFilterOptions]);

  return (
    <div className="px-10 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col flex-1 max-w-7xl">
        
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Search size={24} className="text-[#976f4e]" />
            <h1 className="text-2xl font-bold text-[#1b140e]">
              {query ? 'Search Results' : 'All Products'}
            </h1>
          </div>
          
          {query ? (
            <p className="text-[#976f4e]">
              Showing results for "<span className="font-semibold">{query}</span>"
              {pagination.totalItems > 0 && (
                <span className="ml-2 text-green-600 font-medium">
                  {pagination.totalItems} product{pagination.totalItems !== 1 ? 's' : ''} found
                </span>
              )}
            </p>
          ) : (
            <p className="text-[#976f4e]">
              Browse all available products
              {pagination.totalItems > 0 && (
                <span className="ml-2 text-green-600 font-medium">
                  {pagination.totalItems} product{pagination.totalItems !== 1 ? 's' : ''} available
                </span>
              )}
            </p>
          )}
          
          {/* Search Summary */}
          {pagination.totalItems > 0 && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{query ? 'Found' : 'Showing'} {pagination.totalItems} product{pagination.totalItems !== 1 ? 's' : ''}</strong> 
                {filters.category && ` in ${filters.category}`}
                {filters.brand && ` from ${filters.brand}`}
                {filters.minPrice && filters.maxPrice && ` between $${filters.minPrice} - $${filters.maxPrice}`}
                {filters.minPrice && !filters.maxPrice && ` above $${filters.minPrice}`}
                {!filters.minPrice && filters.maxPrice && ` below $${filters.maxPrice}`}
              </p>
            </div>
          )}
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          
          {/* Filters Sidebar */}
          <div className="lg:w-64 bg-white rounded-lg border border-[#f3ede7] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1b140e]">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-[#e88330] hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1b140e] mb-2">
                Category
              </label>
              {loadingFilters ? (
                <div className="flex items-center justify-center p-2 border border-gray-200 rounded-lg">
                  <Loader2 size={16} className="animate-spin text-[#e88330]" />
                  <span className="ml-2 text-sm text-[#976f4e]">Loading...</span>
                </div>
              ) : (
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e88330]"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Brand Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1b140e] mb-2">
                Brand
              </label>
              {loadingFilters ? (
                <div className="flex items-center justify-center p-2 border border-gray-200 rounded-lg">
                  <Loader2 size={16} className="animate-spin text-[#e88330]" />
                  <span className="ml-2 text-sm text-[#976f4e]">Loading...</span>
                </div>
              ) : (
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e88330]"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1b140e] mb-2">
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e88330]"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e88330]"
                />
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1">
            
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 bg-white rounded-lg border border-[#f3ede7] p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#976f4e]">
                  {pagination.totalItems} products
                </span>
                <button
                  onClick={() => searchProducts(query, 1, filters)}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <svg className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e88330]"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="createdAt">Newest</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-[#e88330] text-white' : 'bg-white text-[#976f4e]'}`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-[#e88330] text-white' : 'bg-white text-[#976f4e]'}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-[#e88330]" />
                <span className="ml-3 text-[#976f4e]">Searching products...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => searchProducts(query)}
                  className="px-4 py-2 bg-[#e88330] text-white rounded-lg hover:bg-[#d67429] transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && products.length === 0 && query && (
              <div className="text-center py-12">
                <Search size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-[#1b140e] mb-2">
                  No products found for "{query}"
                </h3>
                <p className="text-[#976f4e] mb-4">
                  Try these suggestions:
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-[#e88330] text-white rounded-lg hover:bg-[#d67429] transition-colors text-sm"
                  >
                    Browse All Products
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => searchProducts(query)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Try Different Search
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  <p>• Check your spelling</p>
                  <p>• Try more general keywords</p>
                  <p>• Remove some filters</p>
                </div>
              </div>
            )}

            {/* No Query State - Show Browse Message */}
            {!loading && !error && products.length === 0 && !query && (
              <div className="text-center py-12">
                <Search size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-[#1b140e] mb-2">
                  No Products Available
                </h3>
                <p className="text-[#976f4e] mb-4">
                  There are currently no products in the database
                </p>
                <button
                  onClick={() => searchProducts('')}
                  className="px-6 py-2 bg-[#e88330] text-white rounded-lg hover:bg-[#d67429] transition-colors"
                >
                  Refresh Products
                </button>
              </div>
            )}

            {/* Products Grid/List */}
            {!loading && !error && products.length > 0 && (
              <>
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={() => onAddToCart(product)}
                      onBuyNow={() => onBuyNow(product)}
                      onAddToWishlist={() => onAddToWishlist(product)}
                      onClick={() => navigate(`/product/${product._id}`)}
                      layout={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center mt-8 gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    {[...Array(pagination.totalPages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg ${
                            page === pagination.currentPage
                              ? 'bg-[#e88330] text-white'
                              : 'border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;