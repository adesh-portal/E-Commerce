import Product from "../data/products.js";

// Helper: safe number
const n = (v, d = 0) => (typeof v === 'number' && !Number.isNaN(v) ? v : d);

// Normalize to 0..1 using log scaling to reduce extremes
const logNorm = (value, max = 1000) => {
  const v = Math.max(0, n(value));
  return Math.log10(1 + v) / Math.log10(1 + max);
};

// Compute global popularity score from engagement metrics
const computePopularity = (p) => {
  const impressions = Math.max(n(p.impressions, 0), 1);
  const views = n(p.views, 0);
  const clicks = n(p.clicks, 0);
  const addToCart = n(p.addToCart, 0);
  const purchases = n(p.purchases, 0);
  const rating = n(p.rating, 0);
  const reviewCount = n(p.reviewCount, 0);

  const clickRate = clicks / impressions;
  const viewRate = views / impressions;
  const cartRate = impressions ? addToCart / impressions : 0;
  const purchaseRate = impressions ? purchases / impressions : 0;
  const conversionRate = clicks ? purchases / clicks : 0;

  // Improved engagement calculation with better balance
  const engagement =
    0.15 * logNorm(views, 5000) +
    0.20 * logNorm(clicks, 2000) +
    0.15 * clickRate +
    0.18 * cartRate +
    0.22 * purchaseRate +
    0.05 * conversionRate +
    0.15 * (rating / 5) +
    0.05 * logNorm(reviewCount, 2000);

  return Math.min(1, Math.max(0, engagement));
};

// Compute similarity between two products based on attributes
const productSimilarity = (a, b) => {
  if (!a || !b) return 0;
  let score = 0;
  
  // Category similarity (highest weight)
  if (a.category && b.category && a.category === b.category) score += 0.35;
  
  // Brand similarity
  if (a.brand && b.brand && a.brand === b.brand) score += 0.25;
  
  // Price similarity (more nuanced)
  if (typeof a.price === 'number' && typeof b.price === 'number') {
    const diff = Math.abs(a.price - b.price);
    const avgPrice = (a.price + b.price) / 2;
    const relativeDiff = avgPrice > 0 ? diff / avgPrice : 0;
    score += 0.15 * (1 - Math.min(1, relativeDiff));
  }
  
  // Rating similarity
  if (typeof a.rating === 'number' && typeof b.rating === 'number') {
    score += 0.15 * (1 - Math.min(1, Math.abs(a.rating - b.rating) / 5));
  }
  
  // Subcategory similarity (if available)
  if (a.subcategory && b.subcategory && a.subcategory === b.subcategory) {
    score += 0.10;
  }
  
  return Math.min(1, Math.max(0, score));
};

// Create explanations/tags based on which rules contributed most
const buildExplanations = ({ boosters, isTrending }) => {
  const tags = [];
  const reasons = [];

  if (boosters.similarTo) {
    tags.push("Similar to what you viewed");
    reasons.push(`Similar to ${boosters.similarTo.name}`);
  }
  if (boosters.brand) {
    tags.push("Because you like this brand");
    reasons.push(`You engaged with ${boosters.brand}`);
  }
  if (boosters.category) {
    tags.push("Because you browsed this category");
    reasons.push(`You viewed ${boosters.category} items`);
  }
  if (boosters.priceAffinity) {
    tags.push("In your price range");
    reasons.push("Matches your typical price range");
  }
  if (isTrending) {
    tags.push("Trending now");
    reasons.push("Popular with other shoppers right now");
  }
  if (boosters.discount) {
    tags.push("On sale");
    reasons.push("Great discount available");
  }
  return { tags: Array.from(new Set(tags)), reason: reasons[0] || "Recommended for you" };
};

// Main recommendation function
export async function getRecommendations({
  userContext = {},
  limit = 16,
  excludeIds = [],
} = {}) {
  // Fetch candidates
  const products = await Product.find().lean();
  if (!products || products.length === 0) return [];

  const excludeSet = new Set((excludeIds || []).map(String));

  const viewedIds = new Set((userContext.viewedIds || []).map(String));
  const clickedIds = new Set((userContext.clickedIds || []).map(String));
  const purchasedIds = new Set((userContext.purchasedIds || []).map(String));
  const wishlistIds = new Set((userContext.wishlistIds || []).map(String));

  const preferredCategories = new Set(userContext.preferredCategories || []);
  const preferredBrands = new Set(userContext.preferredBrands || []);
  const [minPrice, maxPrice] = userContext.priceRange || [];

  // Representative product from last interaction for similarity
  const lastViewed = products.find(p => viewedIds.has(String(p._id))) || null;
  const lastClicked = products.find(p => clickedIds.has(String(p._id))) || null;
  const anchor = lastClicked || lastViewed;

  const scored = products
    .filter(p => !excludeSet.has(String(p._id)))
    .map(p => {
      const basePopularity = computePopularity(p); // 0..1

      let score = 0.4 * basePopularity;
      const boosters = {};

      // Personalization boosts
      if (preferredCategories.size && p.category && preferredCategories.has(p.category)) {
        score += 0.20;
        boosters.category = p.category;
      }
      if (preferredBrands.size && p.brand && preferredBrands.has(p.brand)) {
        score += 0.15;
        boosters.brand = p.brand;
      }
      if (typeof minPrice === 'number' || typeof maxPrice === 'number') {
        const within = (
          (typeof minPrice !== 'number' || p.price >= minPrice) &&
          (typeof maxPrice !== 'number' || p.price <= maxPrice)
        );
        if (within) {
          score += 0.10;
          boosters.priceAffinity = true;
        } else {
          score -= 0.10; // increased penalty if out of range
        }
      }

      // Similarity to anchor product
      if (anchor) {
        const sim = productSimilarity(anchor, p); // 0..1
        score += 0.25 * sim;
        if (sim > 0.55) boosters.similarTo = anchor;
      }

      // Recency & seasonality approximation: newer products get a small boost
      if (p.createdAt) {
        const ageDays = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const recency = Math.max(0, 1 - Math.min(1, ageDays / 90)); // within ~3 months
        score += 0.05 * recency;
      }

      // Discount signal
      if (typeof p.originalPrice === 'number' && typeof p.price === 'number' && p.originalPrice > p.price) {
        const discount = (p.originalPrice - p.price) / p.originalPrice;
        score += 0.08 * Math.min(1, Math.max(0, discount * 2));
        boosters.discount = true;
      }

      // Availability
      if (typeof p.stock === 'number') {
        if (p.stock <= 0) score -= 0.4; // avoid OOS
        else if (p.stock < 5) score -= 0.15; // low stock, higher penalty
        else if (p.stock < 10) score -= 0.05; // limited stock penalty
      }

      const isTrending = basePopularity > 0.6;
      const explain = buildExplanations({ boosters, isTrending });

      return { product: p, score, ...explain };
    })
    .sort((a, b) => b.score - a.score);

  // Blend: ensure some trending items are included for discovery
  const top = [];
  const trending = scored.filter(s => s.score >= 0.6).slice(0, Math.ceil(limit * 0.25));
  const personalized = scored.filter(s => !trending.includes(s)).slice(0, limit - trending.length);
  top.push(...personalized, ...trending);

  return top.slice(0, limit);
}

export async function getSimilarProducts(productId, { limit = 12 } = {}) {
  const base = await Product.findById(productId).lean();
  if (!base) return [];
  const candidates = await Product.find({ _id: { $ne: productId } }).lean();
  const scored = candidates
    .map(p => ({ product: p, score: productSimilarity(base, p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product, score }) => ({ product, score, reason: "Similar to what you viewed", tags: ["Similar to what you viewed"] }));
  return scored;
}

// Enhanced complements: find products that are often bought together
const categoryComplements = (category) => {
  if (!category) return [];
  const map = {
    Electronics: ["Accessories", "Wearables", "Cases"],
    Wearables: ["Accessories", "Electronics", "Chargers"],
    "Home Appliances": ["Home & Office", "Kitchen", "Furniture"],
    Kitchen: ["Home & Office", "Appliances", "Cookware"],
    Outdoors: ["Accessories", "Home & Office", "Sports"],
    Clothing: ["Shoes", "Accessories", "Bags"],
    Books: ["Stationery", "Electronics"],
    "Beauty & Personal Care": ["Health", "Accessories"],
  };
  return map[category] || [];
};

// Enhanced complementary products function with more sophisticated logic
export async function getComplementaryProducts(productId, { limit = 12 } = {}) {
  const base = await Product.findById(productId).lean();
  if (!base) return [];
  
  // Get related categories
  const cats = categoryComplements(base.category);
  
  // Get products that are frequently bought together
  const candidates = await Product.find({
    _id: { $ne: productId },
    ...(cats.length ? { category: { $in: cats } } : {}),
  }).lean();
  
  // Enhanced scoring with more factors
  const scored = candidates
    .map(p => {
      const popularity = computePopularity(p);
      
      // Calculate additional factors
      let score = 0.6 * popularity; // Base popularity score
      
      // Category complement bonus
      if (cats.includes(p.category)) {
        score += 0.2;
      }
      
      // Price compatibility (not too expensive compared to base product)
      if (base.price && p.price) {
        const priceRatio = p.price / base.price;
        if (priceRatio <= 1.5) { // Complement should not be more than 1.5x base price
          score += 0.1 * (1 - Math.min(1, Math.abs(priceRatio - 0.5))); // Optimal if 50% of base price
        }
      }
      
      // Rating boost
      if (p.rating >= 4) {
        score += 0.1;
      }
      
      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product, score }) => ({ 
      product, 
      score, 
      reason: "Frequently bought together", 
      tags: ["Frequently bought together", "Complementary"] 
    }));
    
  return scored;
}


