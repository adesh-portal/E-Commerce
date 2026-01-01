import React, { useState, useEffect, useRef, useCallback } from "react";
import { Heart, ShoppingBag, Search, X, Loader2, Clock, TrendingUp, AlertCircle, Sun, Moon, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = ({
  cartCount = 0,
  wishlistCount = 0,
  user = null,
  onSearch,
  onWishlistClick,
  onCartClick,
  onNavClick,
  onProductSelect,
  currentPath = "/"
}) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const autoSearchTimeoutRef = useRef(null);
  
  // Theme: load persisted value and apply on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldDark = saved ? saved === 'dark' : prefersDark;
      setIsDarkMode(shouldDark);
      document.documentElement.classList.toggle('dark', shouldDark);
    } catch (_) {
      // no-op
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch (_) {}
      return next;
    });
  };

  // API helper function with better error handling
  const apiCall = async (endpoint, options = {}) => {
    try {
      const url = `http://localhost:5000/api${endpoint}`;
      console.log('Making API call to:', url); // Debug log
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', response.status, errorText);
        throw new Error(`API error: ${response.status} - ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      return data;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      
      // If it's a network error, provide more specific error message
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check if the server is running.');
      }
      
      throw error;
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback((query) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // First try exact match search
        const exactResults = await apiCall(`/search?q="${encodeURIComponent(query)}"&limit=3`);
        
        // If no exact matches, try fuzzy search
        let results = exactResults;
        if (!exactResults || exactResults.length === 0) {
          const fuzzyResults = await apiCall(`/search?q=${encodeURIComponent(query)}&limit=5`);
          results = fuzzyResults;
        }
        
        setSearchResults(Array.isArray(results) ? results : []);
        setHasSearched(true);
        
        // Save to recent searches (max 5)
        setRecentSearches(prev => {
          const filtered = prev.filter(item => item.toLowerCase() !== query.toLowerCase());
          return [query, ...filtered].slice(0, 5);
        });
      } catch (err) {
        console.error('Search error:', err);
        setError(err.message);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      setSearchResults([]);
      setHasSearched(false);
    }
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
      setIsSearchOpen(false);
    }
  };

  // Handle product selection from search dropdown
  const handleSelectSearch = (productOrQuery) => {
    if (typeof productOrQuery === 'string') {
      // It's a search query
      setSearchQuery(productOrQuery);
      onSearch?.(productOrQuery);
    } else {
      // It's a product object
      onProductSelect?.(productOrQuery);
    }
    setIsSearchOpen(false);
  };

  // Clear recent search
  const clearRecentSearch = (search, e) => {
    e.stopPropagation();
    setRecentSearches(prev => prev.filter(item => item !== search));
  };

  // Load popular searches on mount
  useEffect(() => {
    const loadPopularSearches = async () => {
      try {
        // Mock popular searches - in a real app, this would come from an API
        setPopularSearches(['Smartphone', 'Laptop', 'Headphones', 'Watch', 'Camera']);
      } catch (err) {
        console.warn('Failed to load popular searches:', err);
      }
    };
    
    loadPopularSearches();
  }, []);

  // Auto-focus search input when search panel opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      // Delay focus to ensure DOM is ready
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isSearchOpen]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSearchOpen]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (err) {
      console.warn('Failed to load recent searches:', err);
    }
  }, []);

  // Save recent searches to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    } catch (err) {
      console.warn('Failed to save recent searches:', err);
    }
  }, [recentSearches]);

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f3ede7] px-6 py-4 bg-white shadow-sm">
      {/* Logo & Nav */}
      <div className="flex items-center gap-8">
        <div
          className="flex items-center gap-4 text-[#1b140e] cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onNavClick?.("home")}
        >
          <div className="size-4">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-[#1b140e] text-lg font-bold leading-tight tracking-[-0.015em]">
            SmartShop
          </h2>
        </div>

        <nav className="flex items-center gap-9">
          {["New Arrivals", "Featured", "Sale", "Brands"].map((item) => (
            <span
              key={item}
              onClick={() => onNavClick?.(item)}
              className={`text-[#1b140e] text-sm font-medium leading-normal hover:text-[#e88330] transition-colors cursor-pointer ${
                currentPath === `/${item.toLowerCase().replace(' ', '-')}` ? 'text-[#e88330]' : ''
              }`}
            >
              {item}
            </span>
          ))}
        </nav>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative" ref={searchRef}>
          <form 
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 rounded-lg bg-[#f3ede7] pl-3 pr-2 py-2 focus-within:ring-2 focus-within:ring-[#e88330]"
          >
            <Search 
              size={20} 
              className="text-[#8c7e71]" 
              onClick={() => setIsSearchOpen(true)}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchOpen(true)}
              className="bg-transparent border-none outline-none text-[#1b140e] placeholder-[#8c7e71] w-40 lg:w-64"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setHasSearched(false);
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-full hover:bg-[#e8d9cc] transition-colors"
              >
                <X size={16} className="text-[#8c7e71]" />
              </button>
            )}
          </form>

          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[#f3ede7] z-50 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin text-[#e88330]" />
                </div>
              ) : error ? (
                <div className="p-4 flex items-center gap-2 text-red-500">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-2">
                    Products
                  </div>
                  {searchResults.map((product) => (
                    <div
                      key={product._id || product.id}
                      onClick={() => handleSelectSearch(product)}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer rounded group"
                    >
                      <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span className="text-xs text-gray-500">
                          {product.name?.charAt(0) || 'P'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${product.price?.toFixed(2) || 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery && hasSearched ? (
                <div className="p-4 text-center text-gray-500">
                  No products found for "{searchQuery}"
                </div>
              ) : null}

              {/* Popular Searches */}
              {!searchQuery && popularSearches.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-2 flex items-center gap-1">
                    <TrendingUp size={12} />
                    Popular Searches
                  </div>
                  {popularSearches.map((search, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectSearch(search)}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded text-sm text-gray-700"
                    >
                      <TrendingUp size={14} className="text-gray-400" />
                      {search}
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {!searchQuery && recentSearches.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-2 flex items-center gap-1">
                    <Clock size={12} />
                    Recent Searches
                  </div>
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectSearch(search)}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded group"
                    >
                      <span className="text-sm text-gray-700">{search}</span>
                      <button
                        onClick={(e) => clearRecentSearch(search, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={onWishlistClick}
          className="relative flex items-center justify-center rounded-lg h-10 bg-[#f3ede7] text-[#1b140e] gap-2 text-sm font-bold px-2.5 hover:bg-[#e88330] hover:text-white transition-all"
        >
          <Heart size={20} />
          {wishlistCount > 0 && (
            <div className="absolute -top-2 -right-2 pointer-events-none bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">
              {wishlistCount > 99 ? '99+' : wishlistCount}
            </div>
          )}
        </button>

        {/* Cart */}
        <button
          onClick={onCartClick}
          className="relative flex items-center justify-center rounded-lg h-10 bg-[#e88330] text-white gap-2 text-sm font-bold px-2.5 hover:bg-[#d67429] transition-all"
        >
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <div className="absolute -top-2 -right-2 pointer-events-none bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">
              {cartCount > 99 ? '99+' : cartCount}
            </div>
          )}
        </button>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-gray-200 text-[#1b140e] hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {!user ? (
            <>
              <button
                onClick={() => onNavClick?.("login")}
                className="px-3 h-10 rounded-lg border border-gray-200 text-[#1b140e] hover:bg-gray-50 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => onNavClick?.("register")}
                className="px-3 h-10 rounded-lg bg-[#e88330] text-white hover:bg-[#d67429] transition-colors"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <div
                onClick={() => onNavClick?.("dashboard")}
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 border-2 border-[#e88330] cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold dark:border-gray-500"
                title={user.name || user.email}
              >
                {user.name ? user.name.charAt(0) : <User size={20} />}
              </div>
              <button
                onClick={() => {
                  // Handle logout
                  localStorage.removeItem('token');
                  onNavClick?.("login");
                }}
                className="px-3 h-10 rounded-lg border border-gray-200 text-[#1b140e] hover:bg-gray-50 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;