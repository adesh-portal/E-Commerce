// App.jsx
import React, { useState, useEffect } from 'react';
import './App.css'; // Import global styles
// Components
import Header from './components/Header';
import Wishlist from './components/wishlistItems.jsx';
import HeroSection from './components/HeroSection';
import CategoryGrid from './components/CategoryGrid';
import ProductSection from './components/ProductSection';
// import { trendingProducts, popularProducts, bestSellerProducts, newSeasonProducts } from './data/products';
// npm install express@^4.18.2
import SpecialOfferBanner from './components/SpecialOfferBanner';
import Footer from './components/Footer';
import FloatingActionButtons from './components/FloatingActionButtons';
import NotificationCenter from './components/NotificationCenter.jsx';
import ChatSupport from './components/ChatSupport.jsx';
import ProductDetailPage from './pages/ProductDetailPage'; // Import for product details route

// New authentication pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Other pages
import NewArrivalsPage from './pages/NewArrivalsPage.jsx';
import FeaturedPage from './pages/FeaturedPage.jsx';
import SalePage from './pages/SalePage.jsx';
import BrandsPage from './pages/BrandsPage.jsx';

// Add CartPage import
import CartPage from './components/CartPage.jsx';
import SearchResultsPage from './pages/SearchResultsPage'; // New search results page
import WishlistPage from './pages/WishlistPage.jsx';

// Contexts
import { AuthProvider } from './contexts/AuthContext.jsx';

// Custom Hooks
import { useNotification } from './hooks/useNotification';
import { useCart } from './hooks/useCart';
import { useWishlist } from './hooks/useWishlist';
import { useScrollToTop } from './hooks/useScrollToTop';

// Constants
import { NOTIFICATION_TYPES, LAYOUT_TYPES } from './constants';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  return user ? element : null;
};

// Public Route Component (redirects authenticated users)
const PublicRoute = ({ element }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  return !user ? element : null;
};

const AppContent = () => {
  // State for search - removed unused state
  // const [searchResults, setSearchResults] = useState([]);
  // const [currentSearchQuery, setCurrentSearchQuery] = useState('');

  // Custom hooks for state management
  const { notifications, showNotification, hideNotification } = useNotification();
  const { cartCount, cartItems, addToCart, removeFromCart, updateQuantity, getCartTotal } = useCart(0);
  const { wishlistCount, wishlistItems, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { showScrollButton, scrollToTop } = useScrollToTop();

  // Enhanced Header component with navigation
  const HeaderWithNavigation = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    return (
      <Header
        {...props}
        user={user}
        onCartClick={() => navigate('/cart')}
        onWishlistClick={() => setIsWishlistOpen(true)}
        onNavClick={(section) => {
          switch (section) {
            case 'home':
              navigate('/');
              break;
            case 'New Arrivals':
              navigate('/new-arrivals');
              break;
            case 'Featured':
              navigate('/featured');
              break;
            case 'Sale':
              navigate('/sale');
              break;
            case 'Brands':
              navigate('/brands');
              break;
            case 'dashboard':
              navigate('/dashboard');
              break;
            case 'login':
              navigate('/login');
              break;
            case 'register':
              navigate('/register');
              break;
            default:
              break;
          }
        }}
        onSearch={(searchQuery) => {
          // Always redirect to search results page when user searches
          if (searchQuery && searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
          }
        }}
        onProductSelect={(product) => {
          // Navigate to specific product when selected from search dropdown
          navigate(`/product/${product._id}`);
        }}
        // Pass current location to header for active state management
        currentPath={location.pathname}
      />
    );
  };

  // Event handlers for user interactions
  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
    showNotification(`Searching for "${searchTerm}"...`, NOTIFICATION_TYPES.INFO);
  };

  const handleCategorySelect = (category) => {
    console.log('Selected category:', category);
    // Navigate to search page with category filter
    const navigate = useNavigate();
    navigate(`/search?category=${encodeURIComponent(category.name)}`);
    showNotification(`Browsing ${category.name} products`, NOTIFICATION_TYPES.INFO);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    showNotification('Item added to cart!', NOTIFICATION_TYPES.SUCCESS);
  };

  const handleBuyNow = (product) => {
    // Navigate directly to product detail page
    // The product detail page will handle adding to cart
    const navigate = useNavigate();
    navigate(`/product/${product._id || product.id}`);
    showNotification('Opening product details...', NOTIFICATION_TYPES.INFO);
  };

  const handleAddToWishlist = (product) => {
    const normalizedProduct = { ...product, id: product._id || product.id };
    if (!isInWishlist(normalizedProduct.id)) {
      addToWishlist(normalizedProduct);
      showNotification('Item added to wishlist!', NOTIFICATION_TYPES.SUCCESS);
    } else {
      showNotification('Item already in wishlist', NOTIFICATION_TYPES.INFO);
    }
  };

  const handleViewAll = (sectionTitle) => {
    console.log('View all for:', sectionTitle);
    // Navigate to search/category page based on section
    const navigate = useNavigate();
    switch (sectionTitle) {
      case 'Trending Now':
        navigate('/search?sort=trending');
        break;
      case 'Popular Products':
        navigate('/search?sort=popular');
        break;
      case 'Best Sellers':
        navigate('/search?sort=bestsellers');
        break;
      default:
        navigate('/search');
    }
    showNotification(`Loading all ${sectionTitle.toLowerCase()}...`, NOTIFICATION_TYPES.INFO);
  };

  const handleHeroShopNow = () => {
    showNotification('Welcome to SmartShop!', NOTIFICATION_TYPES.SUCCESS);
    // Scroll to trending section or navigate to products
    const trendingSection = document.querySelector('[data-section="trending"]');
    if (trendingSection) {
      trendingSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If no trending section, navigate to search page
      const navigate = useNavigate();
      navigate('/search');
    }
  };

  const handleHeroLearnMore = () => {
    showNotification('Learn more about our AI-powered shopping experience', NOTIFICATION_TYPES.INFO);
  };

  const handleOfferShopNow = () => {
    showNotification('Offer applied! Start shopping to save 20%', NOTIFICATION_TYPES.SUCCESS);
    // Navigate to products page with sale filter
    const navigate = useNavigate();
    navigate('/search?sale=true');
  };

  const handleSubscribeNewsletter = () => {
    showNotification('Newsletter subscription coming soon!', NOTIFICATION_TYPES.INFO);
  };

  const handleHelpSupport = () => {
    showNotification('Help & Support chat opening...', NOTIFICATION_TYPES.INFO);
  };

  const handleAIAssistant = () => {
    showNotification('AI Shopping Assistant is ready to help!', NOTIFICATION_TYPES.SUCCESS);
  };

  const handleImageSearch = () => {
    showNotification('Image search feature coming soon!', NOTIFICATION_TYPES.INFO);
  };

  const handleQuickActions = () => {
    showNotification('Quick actions menu opened', NOTIFICATION_TYPES.INFO);
  };

  const handleChatSupport = () => {
    showNotification('Connecting to support chat...', NOTIFICATION_TYPES.INFO);
  };

  // Home component with navigation hook
  const Home = () => {
    const navigate = useNavigate();
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [isLoadingHomeProducts, setIsLoadingHomeProducts] = useState(false);
    const API_BASE_URL = 'http://localhost:5000/api';

    useEffect(() => {
      let isCancelled = false;
      const fetchHomeProducts = async () => {
        setIsLoadingHomeProducts(true);
        try {
          const [trendingRes, popularRes] = await Promise.all([
            fetch(`${API_BASE_URL}/products/trending?limit=12`),
            fetch(`${API_BASE_URL}/products/popular?limit=12`),
          ]);

          const [trendingData, popularData] = await Promise.all([
            trendingRes.ok ? trendingRes.json() : Promise.resolve([]),
            popularRes.ok ? popularRes.json() : Promise.resolve([]),
          ]);

          // Map _id -> id so existing components work without changes
          const mapId = (list) => Array.isArray(list) ? list.map((p) => ({ ...p, id: p._id || p.id })) : [];

          if (!isCancelled) {
            setTrendingProducts(mapId(trendingData));
            setPopularProducts(mapId(popularData));
          }
        } catch (err) {
          console.error('Failed to load home products:', err);
        } finally {
          if (!isCancelled) setIsLoadingHomeProducts(false);
        }
      };

      fetchHomeProducts();
      return () => {
        isCancelled = true;
      };
    }, []);
    
    const handleCategorySelectWithNav = (category) => {
      console.log('Selected category:', category);
      navigate(`/search?category=${encodeURIComponent(category.name)}`);
      showNotification(`Browsing ${category.name} products`, NOTIFICATION_TYPES.INFO);
    };

    const handleViewAllWithNav = (sectionTitle) => {
      console.log('View all for:', sectionTitle);
      switch (sectionTitle) {
        case 'Trending Now':
          navigate('/search?sort=trending');
          break;
        case 'Popular Products':
          navigate('/search?sort=popular');
          break;
        case 'Best Sellers':
          navigate('/search?sort=bestsellers');
          break;
        default:
          navigate('/search');
      }
      showNotification(`Loading all ${sectionTitle.toLowerCase()}...`, NOTIFICATION_TYPES.INFO);
    };

    const handleHeroShopNowWithNav = () => {
      showNotification('Welcome to SmartShop!', NOTIFICATION_TYPES.SUCCESS);
      const trendingSection = document.querySelector('[data-section="trending"]');
      if (trendingSection) {
        trendingSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/search');
      }
    };

    const handleOfferShopNowWithNav = () => {
      showNotification('Offer applied! Start shopping to save 20%', NOTIFICATION_TYPES.SUCCESS);
      navigate('/search?sale=true');
    };

    return (
      <div className="px-10 py-5 flex flex-1 justify-center">
        <div className="layout-content-container flex flex-col flex-1">
          {/* Hero Section */}
          <HeroSection
            onShopNow={handleHeroShopNowWithNav}
            onLearnMore={handleHeroLearnMore}
            variant="glass"
          />

          {/* Category Grid */}
          <div className="px-2 md:px-0">
            <CategoryGrid
              onCategorySelect={handleCategorySelectWithNav}
            />
          </div>

          {/* Trending Products */}
          <div data-section="trending">
            <ProductSection
              title="Trending Now"
              products={trendingProducts}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onAddToWishlist={handleAddToWishlist}
              onViewAll={handleViewAllWithNav}
              layout={LAYOUT_TYPES.SCROLL}
              apiEndpoint="/products/trending"
            />
          </div>

          {/* Popular Products */}
          <div data-section="popular">
            <ProductSection
              title="Popular Products"
              products={popularProducts}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onAddToWishlist={handleAddToWishlist}
              onViewAll={handleViewAllWithNav}
              layout="grid"
              size="small"
              apiEndpoint="/products/popular"
            />
          </div>

          {/* Special Offer Banner */}
          <SpecialOfferBanner
            onShopNow={handleOfferShopNowWithNav}
          />

          {/* Footer */}
          <Footer
            onSubscribeNewsletter={handleSubscribeNewsletter}
            onHelpSupport={handleHelpSupport}
            onAIAssistant={handleAIAssistant}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#fcfaf8] group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* Header: Persistent across routes */}
        <HeaderWithNavigation
          cartCount={cartCount}
          wishlistCount={wishlistCount}
        />

        {/* Routed Content */}
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Product Detail Page */}
          <Route path="/product/:id" element={
            <ProductDetailPage
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onAddToWishlist={handleAddToWishlist}
              showNotification={showNotification}
              NOTIFICATION_TYPES={NOTIFICATION_TYPES}
            />
          } />
          
          {/* Cart Page Route */}
          <Route path="/cart" element={
            <CartPage
              cartItems={cartItems || []}
              removeFromCart={removeFromCart}
              updateQuantity={updateQuantity}
              getCartTotal={getCartTotal}
              showNotification={showNotification}
              NOTIFICATION_TYPES={NOTIFICATION_TYPES}
            />
          } />

          {/* Search Results Page */}
          <Route path="/search" element={
            <SearchResultsPage
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onAddToWishlist={handleAddToWishlist}
              showNotification={showNotification}
              NOTIFICATION_TYPES={NOTIFICATION_TYPES}
            />
          } />

          {/* Wishlist Page */}
          <Route path="/wishlist" element={
            <WishlistPage
              wishlistItems={wishlistItems || []}
              onRemoveFromWishlist={removeFromWishlist}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          } />

          {/* Category Page (optional - can use search with category filter) */}
          <Route path="/category/:categoryName" element={
            <SearchResultsPage
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onAddToWishlist={handleAddToWishlist}
              showNotification={showNotification}
              NOTIFICATION_TYPES={NOTIFICATION_TYPES}
            />
          } />

          {/* Authentication Routes */}
          <Route path="/login" element={
            <PublicRoute element={<Login />} />
          } />
          <Route path="/register" element={
            <PublicRoute element={<Register />} />
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute element={<Dashboard />} />
          } />

          {/* Header-linked Pages */}
          <Route path="/new-arrivals" element={
            <NewArrivalsPage
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onAddToWishlist={handleAddToWishlist}
            />
          } />
          <Route path="/featured" element={
            <FeaturedPage
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onAddToWishlist={handleAddToWishlist}
            />
          } />
          <Route path="/sale" element={
            <SalePage
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onAddToWishlist={handleAddToWishlist}
            />
          } />
          <Route path="/brands" element={<BrandsPage />} />
        </Routes>

        {/* Bottom quick links to all pages */}
        <div className="mt-6 px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-2">
              <Link to="/" className="hover:text-[#e88330] underline-offset-2 hover:underline">Home</Link>
              <Link to="/search" className="hover:text-[#e88330] underline-offset-2 hover:underline">Search</Link>
              <Link to="/new-arrivals" className="hover:text-[#e88330] underline-offset-2 hover:underline">New Arrivals</Link>
              <Link to="/featured" className="hover:text-[#e88330] underline-offset-2 hover:underline">Featured</Link>
              <Link to="/sale" className="hover:text-[#e88330] underline-offset-2 hover:underline">Sale</Link>
              <Link to="/brands" className="hover:text-[#e88330] underline-offset-2 hover:underline">Brands</Link>
              <Link to="/wishlist" className="hover:text-[#e88330] underline-offset-2 hover:underline">Wishlist</Link>
              <Link to="/cart" className="hover:text-[#e88330] underline-offset-2 hover:underline">Cart</Link>
            </div>
          </div>
        </div>

        {/* Floating Action Buttons: Persistent */}
        <FloatingActionButtons
          onImageSearch={handleImageSearch}
          onQuickActions={handleQuickActions}
          onChatSupport={() => setIsChatOpen(true)}
          onScrollToTop={scrollToTop}
          showScrollToTop={showScrollButton}
        />

        {/* Notifications: Stacked */}
        <NotificationCenter
          notifications={notifications}
          onDismiss={hideNotification}
          position="top-right"
        />

        {/* Wishlist Slide-over */}
        <Wishlist
          isOpen={isWishlistOpen}
          onClose={() => setIsWishlistOpen(false)}
          wishlistItems={wishlistItems || []}
          onRemoveFromWishlist={removeFromWishlist}
          onAddToCart={handleAddToCart}
        />

        {/* Chat Support Panel */}
        <ChatSupport
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onProductSelect={(product) => {
            const navigate = require('react-router-dom').useNavigate; // not callable here, fallback to window location
            window.location.href = `/product/${product._id || product.id}`;
          }}
        />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;