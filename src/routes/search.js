// routes/search.js
import express from 'express';
import Product from '../data/products.js';
import { FileDB, textMatchAny } from '../db/filedb.js';

const router = express.Router();

// Search endpoint
router.get('/', async (req, res) => {
  try {
    console.log('Search request received:', req.query);
    
    const { 
      q, 
      page = 1, 
      limit = 12, 
      category, 
      brand, 
      minPrice, 
      maxPrice, 
      sortBy = 'relevance', 
      sortOrder = 'asc' 
    } = req.query;

    if (!q || !q.trim()) {
      console.log('Search query missing');
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Build search filter
    const searchFilter = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } }
      ]
    };

    // Add additional filters
    if (category) searchFilter.category = { $regex: category, $options: 'i' };
    if (brand) searchFilter.brand = { $regex: brand, $options: 'i' };
    if (minPrice || maxPrice) {
      searchFilter.price = {};
      if (minPrice) searchFilter.price.$gte = parseFloat(minPrice);
      if (maxPrice) searchFilter.price.$lte = parseFloat(maxPrice);
    }

    // Build sort options
    let sortOptions = {};
    if (sortBy === 'price') {
      sortOptions.price = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'rating') {
      sortOptions.rating = -1;
    } else if (sortBy === 'createdAt') {
      sortOptions.createdAt = -1;
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    console.log('Search filter:', JSON.stringify(searchFilter));
    console.log('Sort options:', JSON.stringify(sortOptions));
    console.log('Pagination:', { pageNumber, pageSize, skip });

    // Execute search (Mongo or FileDB)
    let products = [];
    let totalCount = 0;
    if (process.env.USE_FILE_DB === 'true') {
      const all = FileDB.list('products');
      const filtered = all.filter(p => {
        if (q && !textMatchAny(p, ['name','description','category','brand'], q)) return false;
        if (category && !textMatchAny(p, ['category'], category)) return false;
        if (brand && !textMatchAny(p, ['brand'], brand)) return false;
        if ((minPrice || maxPrice)) {
          const price = Number(p.price || 0);
          if (minPrice && price < parseFloat(minPrice)) return false;
          if (maxPrice && price > parseFloat(maxPrice)) return false;
        }
        return true;
      });
      // naive sort
      let sorted = [...filtered];
      if (sortBy === 'price') sorted.sort((a,b) => (sortOrder==='desc'?-1:1) * ((a.price||0)-(b.price||0)));
      else if (sortBy === 'rating') sorted.sort((a,b) => (b.rating||0)-(a.rating||0));
      else if (sortBy === 'createdAt') sorted.sort((a,b) => new Date(b.createdAt||0)-new Date(a.createdAt||0));
      totalCount = sorted.length;
      products = sorted.slice(skip, skip + pageSize);
      // impressions++
      products.forEach(p => FileDB.incById('products', p._id, { impressions: 1 }));
    } else {
      [products, totalCount] = await Promise.all([
        Product.find(searchFilter)
          .sort(sortOptions)
          .skip(skip)
          .limit(pageSize)
          .lean(),
        Product.countDocuments(searchFilter)
      ]);
      const ids = products.map(p => p._id);
      if (ids.length) await Product.updateMany({ _id: { $in: ids } }, { $inc: { impressions: 1 } });
    }

    // Compute ranking score and sort by it if default relevance
    const computeScore = (p) => {
      const impressions = Math.max(p.impressions || 0, 1);
      const views = p.views || 0;
      const clicks = p.clicks || 0;
      const added = p.addToCart || 0;
      const purchases = p.purchases || 0;
      const clickRate = clicks / impressions;
      const addRate = added / Math.max(views || impressions, 1);
      const conversionRate = purchases / Math.max(added, 1);
      return (views * 0.2) + (clickRate * 0.3) + (addRate * 0.2) + (conversionRate * 0.3);
    };

    if (!sortOptions || Object.keys(sortOptions).length === 0) {
      products = products
        .map(p => ({ ...p, _score: computeScore(p) }))
        .sort((a, b) => b._score - a._score)
        .map(({ _score, ...rest }) => rest);
    }

    console.log(`Found ${products.length} products out of ${totalCount} total`);

    // Return paginated results
    res.json({
      products,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / pageSize),
        totalItems: totalCount,
        hasNext: pageNumber * pageSize < totalCount,
        hasPrev: pageNumber > 1
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get categories endpoint
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get brands endpoint
router.get('/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json(brands);
  } catch (error) {
    console.error('Brands error:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Personalized recommendations for a query (lightweight demo)
router.get('/recommend', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) return res.status(400).json({ error: 'q is required' });

    const searchFilter = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } }
      ]
    };

    let products;
    if (process.env.USE_FILE_DB === 'true') {
      const all = FileDB.list('products');
      products = all.filter(p => textMatchAny(p, ['name','description','category','brand'], q)).slice(0, parseInt(limit));
    } else {
      products = await Product.find(searchFilter).limit(parseInt(limit)).lean();
    }

    const computeScore = (p) => {
      const impressions = Math.max(p.impressions || 0, 1);
      const views = p.views || 0;
      const clicks = p.clicks || 0;
      const added = p.addToCart || 0;
      const purchases = p.purchases || 0;
      const clickRate = clicks / impressions;
      const addRate = added / Math.max(views || impressions, 1);
      const conversionRate = purchases / Math.max(added, 1);
      return (views * 0.2) + (clickRate * 0.3) + (addRate * 0.2) + (conversionRate * 0.3);
    };

    const ranked = products
      .map(p => ({ ...p, ranking: computeScore(p) }))
      .sort((a, b) => b.ranking - a.ranking);

    let trending;
    if (process.env.USE_FILE_DB === 'true') {
      const all = FileDB.list('products').filter(p => textMatchAny(p, ['name','description','category','brand'], q));
      trending = all.sort((a,b) => (b.purchases||0)-(a.purchases||0) || (b.views||0)-(a.views||0)).slice(0,5).map(p => ({ _id: p._id, name: p.name, price: p.price }));
    } else {
      trending = await Product.find(searchFilter)
        .sort({ purchases: -1, views: -1 })
        .limit(5)
        .select('_id name price')
        .lean();
    }

    res.json({ searchQuery: q, recommendedProducts: ranked, trendingProducts: trending });
  } catch (error) {
    console.error('Recommend error:', error);
    res.status(500).json({ error: 'Failed to build recommendations' });
  }
});

export default router;
