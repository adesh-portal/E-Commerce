import express from "express";
import Product from "../data/products.js";  // ✅ Product model import किया
import { FileDB } from "../db/filedb.js";

const router = express.Router();

// Utility: compute ranking score
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

// 👉 Get all products
router.get("/", async (req, res) => {
  try {
    if (process.env.USE_FILE_DB === 'true') {
      return res.json(FileDB.list('products'));
    } else {
      const products = await Product.find();
      return res.json(products);
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 👉 Get popular products (must come before /:id route)
router.get("/popular", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    if (process.env.USE_FILE_DB === 'true') {
      const all = FileDB.list('products');
      const sorted = [...all].sort((a,b) => (b.rating||0)-(a.rating||0) || (b.reviewCount||0)-(a.reviewCount||0)).slice(0, limit);
      return res.json(sorted);
    } else {
      const products = await Product.find()
        .sort({ rating: -1, reviewCount: -1 })
        .limit(limit);
      return res.json(products);
    }
  } catch (err) {
    console.error("Error fetching popular products:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 👉 Get trending products (must come before /:id route)
router.get("/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    if (process.env.USE_FILE_DB === 'true') {
      const all = FileDB.list('products');
      const sorted = [...all].sort((a,b) => (b.purchases||0)-(a.purchases||0) || (b.views||0)-(a.views||0)).slice(0, limit);
      return res.json(sorted);
    } else {
      const products = await Product.find()
        .sort({ purchases: -1, views: -1 })
        .limit(limit);
      return res.json(products);
    }
  } catch (err) {
    console.error("Error fetching trending products:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 👉 Get single product by ID
router.get("/:id", async (req, res) => {
  try {
    if (process.env.USE_FILE_DB === 'true') {
      const p = FileDB.getById('products', req.params.id);
      if (!p) return res.status(404).json({ error: 'Product not found' });
      FileDB.incById('products', p._id, { views: 1 });
      return res.json(p);
    } else {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      await Product.updateOne({ _id: product._id }, { $inc: { views: 1 } });
      return res.json(product);
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 👉 Create new product
router.post("/", async (req, res) => {
  try {
    if (process.env.USE_FILE_DB === 'true') {
      const saved = FileDB.insert('products', req.body);
      return res.status(201).json(saved);
    } else {
      const newProduct = new Product(req.body);
      const savedProduct = await newProduct.save();
      return res.status(201).json(savedProduct);
    }
  } catch (err) {
    res.status(400).json({ error: "Invalid product data" });
  }
});

// 👉 Update product by ID
router.put("/:id", async (req, res) => {
  try {
    if (process.env.USE_FILE_DB === 'true') {
      const updated = FileDB.updateById('products', req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Product not found' });
      return res.json(updated);
    } else {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedProduct)
        return res.status(404).json({ error: "Product not found" });
      return res.json(updatedProduct);
    }
  } catch (err) {
    res.status(400).json({ error: "Invalid update data" });
  }
});

// 👉 Delete product by ID
router.delete("/:id", async (req, res) => {
  try {
    if (process.env.USE_FILE_DB === 'true') {
      const ok = FileDB.deleteById('products', req.params.id);
      if (!ok) return res.status(404).json({ error: 'Product not found' });
      return res.json({ message: 'Product deleted successfully' });
    } else {
      const deletedProduct = await Product.findByIdAndDelete(req.params.id);
      if (!deletedProduct)
        return res.status(404).json({ error: "Product not found" });
      return res.json({ message: "Product deleted successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 👉 Track interactions (click, addToCart, purchase, view)
router.post("/:id/track", async (req, res) => {
  try {
    const { type } = req.body || {};
    const inc = {};
    if (type === 'click') inc.clicks = 1;
    else if (type === 'addToCart') inc.addToCart = 1;
    else if (type === 'purchase') inc.purchases = 1;
    else if (type === 'view') inc.views = 1;
    else if (type === 'impression') inc.impressions = 1;
    else return res.status(400).json({ error: 'Unknown interaction type' });

    if (process.env.USE_FILE_DB === 'true') {
      const updated = FileDB.incById('products', req.params.id, inc);
      if (!updated) return res.status(404).json({ error: 'Product not found' });
      return res.json({ ok: true });
    } else {
      const updated = await Product.findByIdAndUpdate(req.params.id, { $inc: inc }, { new: true });
      if (!updated) return res.status(404).json({ error: 'Product not found' });
      return res.json({ ok: true });
    }
  } catch (err) {
    console.error('Track error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
