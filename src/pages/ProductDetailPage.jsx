import { useState, useEffect } from "react";
import { Star, ShoppingCart, Heart, Share2, ArrowLeft, RefreshCw } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

const ProductDetailPage = ({ 
  onAddToCart = () => {}, 
  showNotification = () => {}, 
  NOTIFICATION_TYPES = { SUCCESS: 'success', ERROR: 'error' } 
}) => {
  const { id } = useParams(); // Get product ID from URL parameters
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Fallback product data structure
  const getFallbackProduct = (productId) => ({
    id: productId,
    name: "Product Not Found",
    brand: "Unknown",
    description: "This product information is currently unavailable. Please try again later.",
    price: 0,
    originalPrice: 0,
    rating: 0,
    reviewCount: 0,
    inStock: false,
    stock: 0,
    images: ["https://via.placeholder.com/600x600?text=Product+Unavailable"],
    specifications: {},
    category: "Unknown"
  });

  // Try multiple data sources for product information
  const fetchProductFromSource = async (productId, source) => {
    try {
      let response;
      
      switch (source) {
        case 'api':
          // Try main API endpoint
          response = await fetch(`http://localhost:5000/api/products/${productId}`);
          break;
        case 'search':
          // Try search endpoint as fallback
          response = await fetch(`http://localhost:5000/api/search?q=${productId}&limit=1`);
          break;
        case 'local':
          // Try to get from localStorage (if user has viewed this product before)
          const cachedProducts = localStorage.getItem('viewedProducts');
          if (cachedProducts) {
            const products = JSON.parse(cachedProducts);
            const cachedProduct = products.find(p => p._id === productId || p.id === productId);
            if (cachedProduct) {
              return cachedProduct;
            }
          }
          throw new Error('No cached data available');
        default:
          throw new Error('Invalid data source');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      let productData;
      if (source === 'search' && Array.isArray(data)) {
        // Search endpoint returns array, get first result
        productData = data[0];
      } else if (source === 'search' && data.results && Array.isArray(data.results)) {
        // Search endpoint returns object with results array
        productData = data.results[0];
      } else {
        // Direct product endpoint
        productData = data;
      }

      if (!productData) {
        throw new Error('Product not found in search results');
      }

      // Map _id to id for consistency and add fallback values
      const mappedProduct = {
        id: productData._id || productData.id || productId,
        name: productData.name || "Unnamed Product",
        brand: productData.brand || "Unknown Brand",
        description: productData.description || "No description available",
        price: productData.price || 0,
        originalPrice: productData.originalPrice || productData.price || 0,
        rating: productData.rating || 0,
        reviewCount: productData.reviewCount || 0,
        inStock: productData.inStock !== undefined ? productData.inStock : (productData.stock > 0),
        stock: productData.stock || 0,
        images: productData.images && productData.images.length > 0 
          ? productData.images 
          : ["https://via.placeholder.com/600x600?text=No+Image"],
        specifications: productData.specifications || {},
        category: productData.category || "General"
      };

      // Cache the product data
      try {
        const cachedProducts = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
        const existingIndex = cachedProducts.findIndex(p => p._id === mappedProduct.id || p.id === mappedProduct.id);
        
        if (existingIndex >= 0) {
          cachedProducts[existingIndex] = mappedProduct;
        } else {
          cachedProducts.push(mappedProduct);
        }
        
        // Keep only last 20 viewed products
        if (cachedProducts.length > 20) {
          cachedProducts.splice(0, cachedProducts.length - 20);
        }
        
        localStorage.setItem('viewedProducts', JSON.stringify(cachedProducts));
      } catch (cacheError) {
        console.warn('Failed to cache product:', cacheError);
      }

      return mappedProduct;
    } catch (err) {
      throw err;
    }
  };

  const fetchProduct = async () => {
    if (!id) {
      setError("No product ID provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let productData = null;
      let lastError = null;

      // Try multiple data sources in order of preference
      const sources = ['api', 'search', 'local'];
      
      for (const source of sources) {
        try {
          productData = await fetchProductFromSource(id, source);
          if (productData) {
            break; // Successfully got product data
          }
        } catch (err) {
          lastError = err;
          console.warn(`Failed to fetch from ${source}:`, err);
          continue; // Try next source
        }
      }

      if (productData) {
        setProduct(productData);
        showNotification?.(`Loaded ${productData.name}`, NOTIFICATION_TYPES?.SUCCESS);
      } else {
        // If all sources failed, use fallback data
        const fallbackProduct = getFallbackProduct(id);
        setProduct(fallbackProduct);
        setError("Unable to load product details. Showing limited information.");
        showNotification?.("Product data unavailable", NOTIFICATION_TYPES?.ERROR);
      }
      
    } catch (err) {
      console.error("Error fetching product:", err);
      const fallbackProduct = getFallbackProduct(id);
      setProduct(fallbackProduct);
      setError(err.message);
      showNotification?.(err.message, NOTIFICATION_TYPES?.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const retryFetch = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    fetchProduct();
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      await onAddToCart({ ...product, quantity });
      showNotification?.(`Added ${quantity} ${product.name}${quantity > 1 ? 's' : ''} to cart`, NOTIFICATION_TYPES?.SUCCESS);
    } catch (err) {
      showNotification?.("Failed to add to cart", NOTIFICATION_TYPES?.ERROR);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      // Add to cart first
      await onAddToCart({ ...product, quantity });
      showNotification?.(`Added ${quantity} ${product.name}${quantity > 1 ? 's' : ''} to cart`, NOTIFICATION_TYPES?.SUCCESS);
      
      // Then navigate to cart page
      setTimeout(() => {
        navigate('/cart');
      }, 500);
    } catch (err) {
      showNotification?.("Failed to add to cart", NOTIFICATION_TYPES?.ERROR);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star size={20} className="text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star size={20} className="fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} size={20} className="text-gray-300" />
        );
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-200 aspect-square rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <ShoppingCart size={64} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            {error}
          </h2>
          <p className="text-gray-500 mb-6">
            Unable to load product details. Please try again.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={retryFetch}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={20} />
              Retry
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={20} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const normalizeImg = (u, fallback) => {
    try {
      if (u && /^https?:\/\//i.test(u)) return u;
      const [size, query] = String(u || fallback).split('?');
      const [wStr, hStr] = size.split('x');
      const w = Math.max(1, parseInt(wStr || '600', 10) || 600);
      const h = Math.max(1, parseInt(hStr || '600', 10) || 600);
      const params = new URLSearchParams(query || '');
      const text = params.get('text') || 'No Image';
      return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='16'>${text}</text></svg>`;
    } catch {
      return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='16'>No Image</text></svg>`;
    }
  };
  const images = (product.images && product.images.length ? product.images : ["600x600?text=No+Image"]).map(u => normalizeImg(u, '600x600?text=No+Image'));
  const currentImage = images[selectedImageIndex] || images[0];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-yellow-800 text-sm">
                {error}
              </span>
            </div>
            <button 
              onClick={retryFetch}
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.src = "https://via.placeholder.com/600x600?text=Image+Not+Found"; }}
            />
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img 
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/80x80?text=No+Img"; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            
            {product.brand && (
              <p className="text-lg text-gray-600 mb-4">by {product.brand}</p>
            )}

            {product.category && (
              <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {product.category}
              </span>
            )}
          </div>

          {/* Rating and Reviews */}
          {product.rating > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {renderStars(product.rating)}
              </div>
              <span className="text-lg font-semibold text-gray-700">
                {product.rating}
              </span>
              {product.reviewCount > 0 && (
                <span className="text-gray-500">
                  ({product.reviewCount} reviews)
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ₹{product.price?.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                  </span>
                </>
              )}
            </div>
            
            {product.inStock === false && (
              <div className="text-red-600 font-medium">Out of Stock</div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Specifications</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <label htmlFor="quantity" className="font-medium text-gray-700">
                Quantity:
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors"
                  disabled={product.stock && quantity >= product.stock}
                >
                  +
                </button>
              </div>
              {product.stock > 0 && (
                <span className="text-sm text-gray-500">
                  {product.stock} available
                </span>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.inStock === false}
                className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={isAddingToCart || product.inStock === false}
                className="flex-1 bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isAddingToCart ? "Processing..." : "Buy Now"}
              </button>
            </div>

            <div className="flex gap-4">
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Heart size={20} className="text-gray-600" />
              </button>
              
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-sm text-gray-500 space-y-1 pt-4 border-t border-gray-200">
            <div>Free shipping on orders over ₹999</div>
            <div>Easy returns within 30 days</div>
            <div>1 year manufacturer warranty</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;