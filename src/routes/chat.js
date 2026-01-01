import express from 'express';
import Product from '../data/products.js';
import User from '../data/user.js';
import { FileDB } from '../db/filedb.js';

const router = express.Router();

// Enhanced intent responses with context awareness
const intentResponses = [
  {
    pattern: /(shipping|delivery|ship)/i,
    reply: 'We offer fast, tracked shipping. Standard delivery is 3-5 business days and is free over $50. Need something sooner? Express options are available at checkout.',
    followUp: ['Would you like to see shipping rates?', 'Looking for express delivery options?']
  },
  {
    pattern: /(return|refund|exchange)/i,
    reply: 'Hassle-free returns within 30 days in original condition. Refunds are processed to the original payment method within 3-5 business days after inspection.',
    followUp: ['Need help with a return?', 'Questions about our return policy?']
  },
  {
    pattern: /(warranty|guarantee)/i,
    reply: 'Most products include a 1-year limited warranty covering manufacturing defects. Extended protection plans are available at checkout.',
    followUp: ['Want to know about specific product warranties?']
  },
  {
    pattern: /(support|help|contact)/i,
    reply: 'You can reach support via chat here or email support@smartshop.example. We\'re online 9am–9pm (IST).',
    followUp: ['How can I help you today?']
  },
  {
    pattern: /(cart|shopping cart|my cart)/i,
    reply: 'cart_action',
    followUp: ['Ready to checkout?', 'Want to continue shopping?']
  },
  {
    pattern: /(checkout|buy|purchase|order)/i,
    reply: 'checkout_action',
    followUp: ['Need help with checkout?']
  },
  {
    pattern: /(track|order status|my order)/i,
    reply: 'order_tracking',
    followUp: ['Need help with anything else?']
  }
];

// Greeting responses based on user history
function getPersonalizedGreeting(userHistory) {
  if (!userHistory || userHistory.length === 0) {
    return "Hi there! Welcome to SmartShop! I'm here to help you find the perfect products. What are you looking for today?";
  }
  
  const recentCategories = userHistory.slice(0, 3).map(h => h.category).filter(Boolean);
  if (recentCategories.length > 0) {
    return `Welcome back! I see you've been interested in ${recentCategories[0]}. How can I help you today?`;
  }
  
  return "Welcome back! What can I help you find today?";
}

// Enhanced price filter extraction
function extractPriceFilters(message) {
  const price = {};
  
  // Range patterns: between X and Y, X to Y, X-Y
  const rangePatterns = [
    /between\s*\$?(\d+(?:\.\d{1,2})?)\s*(?:and|to|-)\s*\$?(\d+(?:\.\d{1,2})?)/i,
    /\$?(\d+(?:\.\d{1,2})?)\s*(?:to|-)\s*\$?(\d+(?:\.\d{1,2})?)/i
  ];
  
  for (const pattern of rangePatterns) {
    const match = message.match(pattern);
    if (match) {
      price.$gte = Math.min(parseFloat(match[1]), parseFloat(match[2]));
      price.$lte = Math.max(parseFloat(match[1]), parseFloat(match[2]));
      break;
    }
  }
  
  // Upper limit patterns
  const underPatterns = [
    /(?:under|below|less than|max)\s*\$?(\d+(?:\.\d{1,2})?)/i,
    /budget\s*(?:of|is)?\s*\$?(\d+(?:\.\d{1,2})?)/i
  ];
  
  for (const pattern of underPatterns) {
    const match = message.match(pattern);
    if (match) {
      price.$lte = Math.min(price.$lte ?? Infinity, parseFloat(match[1]));
      break;
    }
  }
  
  // Lower limit patterns
  const overPatterns = [
    /(?:over|above|more than|min|minimum)\s*\$?(\d+(?:\.\d{1,2})?)/i
  ];
  
  for (const pattern of overPatterns) {
    const match = message.match(pattern);
    if (match) {
      price.$gte = Math.max(price.$gte ?? 0, parseFloat(match[1]));
      break;
    }
  }
  
  return Object.keys(price).length ? price : null;
}

// Enhanced search filter with category detection
function buildSearchFilterFromMessage(message, userHistory = []) {
  const tokens = message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2) // Filter out small words
    .slice(0, 10);

  const priceFilter = extractPriceFilters(message);
  
  // Category detection
  const categories = ['laptop', 'mouse', 'keyboard', 'headphones', 'monitor', 'smartphone', 'tablet', 'gaming'];
  const detectedCategory = categories.find(cat => 
    message.toLowerCase().includes(cat) || 
    message.toLowerCase().includes(cat + 's')
  );
  
  // Build search query
  const orConditions = [];
  
  if (tokens.length) {
    const tokenRegex = tokens.join('|');
    orConditions.push(
      { name: { $regex: tokenRegex, $options: 'i' } },
      { description: { $regex: tokenRegex, $options: 'i' } },
      { brand: { $regex: tokenRegex, $options: 'i' } },
      { tags: { $in: tokens } }
    );
  }
  
  const filter = {};
  if (orConditions.length) filter.$or = orConditions;
  if (priceFilter) filter.price = priceFilter;
  if (detectedCategory) filter.category = new RegExp(detectedCategory, 'i');
  
  // Add availability filter by default
  filter.inStock = { $gt: 0 };
  
  return Object.keys(filter).length ? filter : { inStock: { $gt: 0 } };
}

// Get personalized recommendations
async function getPersonalizedRecommendations(userId, limit = 5) {
  try {
    // Get user's recent activity
    const recentActivity = FileDB.find('user_activity', { userId })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);
    
    if (!recentActivity.length) {
      // New user - return popular products
      const products = FileDB.list('products');
      return products
        .filter(p => p.inStock > 0)
        .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
        .slice(0, limit);
    }
    
    // Extract categories and brands from user history
    const categories = [...new Set(recentActivity.map(a => a.category).filter(Boolean))];
    const brands = [...new Set(recentActivity.map(a => a.brand).filter(Boolean))];
    
    const products = FileDB.list('products');
    const recommendations = products
      .filter(p => p.inStock > 0 && (
        categories.includes(p.category) || brands.includes(p.brand)
      ))
      .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
      .slice(0, limit);
    
    return recommendations;
  } catch (error) {
    console.error('Recommendation error:', error);
    return [];
  }
}

// Handle cart operations
async function handleCartAction(userId, message) {
  try {
    const cart = FileDB.find('carts', { userId })[0];
    
    if (!cart || !cart.items.length) {
      return {
        reply: "Your cart is currently empty. Would you like me to help you find some products?",
        suggestions: [],
        followUp: ['Show me popular products', 'Help me find something specific']
      };
    }
    
    // Get product details for cart items
    const products = FileDB.list('products');
    const cartItems = cart.items.map(item => {
      const product = products.find(p => p._id === item.productId);
      return { ...item, product };
    }).filter(item => item.product);
    
    const cartSummary = cartItems.map(item => 
      `${item.product.name} (Qty: ${item.quantity}) - $${(item.product.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    const totalAmount = cartItems.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0
    );
    
    return {
      reply: `Here's what's in your cart:\n\n${cartSummary}\n\nTotal: $${totalAmount.toFixed(2)}`,
      suggestions: cartItems.slice(0, 3).map(item => ({
        id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity
      })),
      followUp: ['Proceed to checkout', 'Continue shopping', 'Remove items from cart']
    };
  } catch (error) {
    console.error('Cart error:', error);
    return {
      reply: "Sorry, I couldn't retrieve your cart. Please try again.",
      suggestions: [],
      followUp: ['Try again']
    };
  }
}

// Handle checkout process
async function handleCheckout(userId) {
  try {
    const cart = FileDB.find('carts', { userId })[0];
    
    if (!cart || !cart.items.length) {
      return {
        reply: "Your cart is empty. Add some products first!",
        suggestions: [],
        followUp: ['Browse products']
      };
    }
    
    // Get product details for cart items
    const products = FileDB.list('products');
    const cartItems = cart.items.map(item => {
      const product = products.find(p => p._id === item.productId);
      return { ...item, product };
    }).filter(item => item.product);
    
    const totalAmount = cartItems.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0
    );
    
    return {
      reply: `Ready to checkout! Your total is $${totalAmount.toFixed(2)}. Please provide your shipping address or select from saved addresses to continue.`,
      suggestions: cartItems.slice(0, 3).map(item => ({
        id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      followUp: ['Use saved address', 'Enter new address', 'Apply coupon code'],
      action: 'checkout_ready'
    };
  } catch (error) {
    console.error('Checkout error:', error);
    return {
      reply: "Sorry, there was an issue preparing your checkout. Please try again.",
      suggestions: [],
      followUp: ['Try again']
    };
  }
}

// Handle order tracking
async function handleOrderTracking(userId, message) {
  try {
    // Extract order number if provided
    const orderMatch = message.match(/#?(\w{8,})/);
    let orders;
    
    if (orderMatch) {
      orders = FileDB.find('orders', { 
        userId, 
        orderNumber: new RegExp(orderMatch[1], 'i') 
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 1);
    } else {
      orders = FileDB.find('orders', { userId })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
    }
    
    if (!orders.length) {
      return {
        reply: "I couldn't find any orders for your account. Have you made any purchases recently?",
        suggestions: [],
        followUp: ['Browse products', 'Contact support']
      };
    }
    
    const orderSummaries = orders.map(order => 
      `Order #${order.orderNumber}: ${order.status} (${new Date(order.createdAt).toDateString()})`
    );
    
    return {
      reply: `Here are your recent orders:\n\n${orderSummaries.join('\n')}`,
      suggestions: [],
      followUp: ['Get detailed order info', 'Track shipment', 'Contact support']
    };
  } catch (error) {
    console.error('Order tracking error:', error);
    return {
      reply: "Sorry, I couldn't retrieve your order information. Please try again.",
      suggestions: [],
      followUp: ['Try again', 'Contact support']
    };
  }
}

// Main chat endpoint
router.post('/', async (req, res) => {
  try {
    const { message, userId = 'anonymous' } = req.body || {};
    
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const userMessage = String(message).trim();
    
    // Get user history for personalization
    const userHistory = FileDB.find('user_activity', { userId })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
    
    // Handle greeting
    if (/^(hi|hello|hey|greetings)/i.test(userMessage)) {
      const greeting = getPersonalizedGreeting(userHistory);
      const recommendations = await getPersonalizedRecommendations(userId, 3);
      
      return res.json({
        reply: greeting,
        suggestions: recommendations.slice(0, 3),
        followUp: ['Show me popular products', 'Help me find something specific', 'View my cart']
      });
    }
    
    // Check for special actions first
    const intent = intentResponses.find(intent => intent.pattern.test(userMessage));
    
    if (intent) {
      let response;
      
      switch (intent.reply) {
        case 'cart_action':
          response = await handleCartAction(userId, userMessage);
          break;
        case 'checkout_action':
          response = await handleCheckout(userId);
          break;
        case 'order_tracking':
          response = await handleOrderTracking(userId, userMessage);
          break;
        default:
          response = {
            reply: intent.reply,
            suggestions: [],
            followUp: intent.followUp
          };
      }
      
      // Still search for products if not a pure service query
      if (!['cart_action', 'checkout_action', 'order_tracking'].includes(intent.reply)) {
        const filter = buildSearchFilterFromMessage(userMessage, userHistory);
        const products = FileDB.list('products');
        const filteredProducts = products.filter(p => {
          // Simple filter implementation for FileDB
          if (filter.inStock && p.inStock <= 0) return false;
          if (filter.category && !p.category?.toLowerCase().includes(filter.category.toLowerCase())) return false;
          if (filter.price) {
            if (filter.price.$gte && p.price < filter.price.$gte) return false;
            if (filter.price.$lte && p.price > filter.price.$lte) return false;
          }
          return true;
        }).sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount)).slice(0, 6);
        
        if (filteredProducts.length > 0) {
          response.suggestions = filteredProducts.slice(0, 3);
          response.reply += ` Also, here are some products that might interest you: ${filteredProducts.slice(0, 3).map(p => p.name).join(', ')}.`;
        }
      }
      
      return res.json(response);
    }
    
    // Product search
    const filter = buildSearchFilterFromMessage(userMessage, userHistory);
    const products = FileDB.list('products');
    const filteredProducts = products.filter(p => {
      // Simple filter implementation for FileDB
      if (filter.inStock && p.inStock <= 0) return false;
      if (filter.category && !p.category?.toLowerCase().includes(filter.category.toLowerCase())) return false;
      if (filter.price) {
        if (filter.price.$gte && p.price < filter.price.$gte) return false;
        if (filter.price.$lte && p.price > filter.price.$lte) return false;
      }
      return true;
    }).sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount)).slice(0, 8);
    
    // Log user activity
    if (filteredProducts.length > 0) {
      FileDB.insert('user_activity', {
        userId,
        searchQuery: userMessage,
        category: filteredProducts[0].category,
        brand: filteredProducts[0].brand,
        timestamp: new Date().toISOString()
      });
    }
    
    let reply;
    let followUp;
    
    if (filteredProducts.length === 0) {
      // No products found - offer alternatives
      reply = "I couldn't find any products matching your search. Let me suggest some popular items or try a different search term.";
      const alternatives = await getPersonalizedRecommendations(userId, 3);
      
      return res.json({
        reply,
        suggestions: alternatives,
        followUp: ['Try different keywords', 'Browse categories', 'Show popular products']
      });
    }
    
    // Determine response tone based on query type
    if (/best|top|recommend|good|quality/i.test(userMessage)) {
      reply = `Here are the top-rated ${filteredProducts[0].category || 'products'} I found for you:`;
      followUp = ['Tell me more about any product', 'Add to cart', 'Compare options', 'Sort by price'];
    } else if (/cheap|budget|affordable|under/i.test(userMessage)) {
      reply = `Here are some budget-friendly options:`;
      followUp = ['Show product details', 'Add to cart', 'Find similar products'];
    } else {
      reply = `I found ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} matching your search:`;
      followUp = ['Get more details', 'Add to cart', 'Refine search', 'Sort results'];
    }
    
    return res.json({
      reply,
      suggestions: filteredProducts,
      followUp,
      totalResults: filteredProducts.length,
      searchTerms: userMessage
    });
    
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      reply: "I'm sorry, something went wrong. Please try again or contact support if the issue persists.",
      followUp: ['Try again', 'Contact support']
    });
  }
});

// Add product to cart endpoint
router.post('/add-to-cart', async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({ error: 'userId and productId are required' });
    }
    
    // Find or create cart
    let cart = FileDB.find('carts', { userId })[0];
    if (!cart) {
      cart = { userId, items: [] };
      FileDB.insert('carts', cart);
    }
    
    // Check if product exists in cart
    const existingItem = cart.items.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
      FileDB.updateById('carts', cart._id, cart);
    } else {
      cart.items.push({ productId, quantity });
      FileDB.updateById('carts', cart._id, cart);
    }
    
    // Get product details for response
    const products = FileDB.list('products');
    const product = products.find(p => p._id === productId);
    
    res.json({
      reply: `${product?.name || 'Product'} has been added to your cart!`,
      cart: cart.items.length,
      followUp: ['View cart', 'Continue shopping', 'Proceed to checkout']
    });
    
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add product to cart' });
  }
});

// Get product details endpoint
router.get('/product/:id', async (req, res) => {
  try {
    const products = FileDB.list('products');
    const product = products.find(p => p._id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get related products
    const relatedProducts = products
      .filter(p => p.category === product.category && p._id !== product._id)
      .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
      .slice(0, 4);
    
    res.json({
      product,
      relatedProducts,
      reply: `Here are the details for ${product.name}. It has a ${product.rating}/5 rating from ${product.reviewCount} reviews.`,
      followUp: ['Add to cart', 'See related products', 'Read reviews', 'Compare with similar items']
    });
    
  } catch (error) {
    console.error('Product details error:', error);
    res.status(500).json({ error: 'Failed to get product details' });
  }
});

export default router;