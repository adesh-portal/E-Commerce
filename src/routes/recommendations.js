import express from "express";
import { getRecommendations, getSimilarProducts, getComplementaryProducts } from "../services/recommendationService.js";

const router = express.Router();

// GET /api/recommendations
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || null;
    // Parse user context if provided
    const context = {
      viewedIds: req.query.viewedIds ? String(req.query.viewedIds).split(',') : [],
      clickedIds: req.query.clickedIds ? String(req.query.clickedIds).split(',') : [],
      purchasedIds: req.query.purchasedIds ? String(req.query.purchasedIds).split(',') : [],
      wishlistIds: req.query.wishlistIds ? String(req.query.wishlistIds).split(',') : [],
      preferredCategories: req.query.categories ? String(req.query.categories).split(',') : [],
      preferredBrands: req.query.brands ? String(req.query.brands).split(',') : [],
      priceRange: req.query.minPrice || req.query.maxPrice ? [
        req.query.minPrice ? parseFloat(String(req.query.minPrice)) : undefined,
        req.query.maxPrice ? parseFloat(String(req.query.maxPrice)) : undefined,
      ] : undefined,
      userId,
    };

    const limit = parseInt(req.query.limit || '16', 10);
    const excludeIds = req.query.exclude ? String(req.query.exclude).split(',') : [];

    const results = await getRecommendations({ userContext: context, limit, excludeIds });
    res.json(results);
  } catch (err) {
    console.error('recommendations error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/recommendations/similar/:productId
router.get('/similar/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit || '12', 10);
    const results = await getSimilarProducts(productId, { limit });
    res.json(results);
  } catch (err) {
    console.error('similar error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/recommendations/complementary/:productId
router.get('/complementary/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit || '12', 10);
    const results = await getComplementaryProducts(productId, { limit });
    res.json(results);
  } catch (err) {
    console.error('complementary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;


