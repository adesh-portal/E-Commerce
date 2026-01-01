import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  brand: String,
  price: Number,
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  stock: Number,
  image: String,
  images: [String], // Array of image URLs for Header.jsx
  description: String,
  specifications: Object,
  // Engagement metrics for ranking/recommendations
  impressions: { type: Number, default: 0 }, // times shown in lists/search
  views: { type: Number, default: 0 },       // product detail views
  clicks: { type: Number, default: 0 },      // click from list/search
  addToCart: { type: Number, default: 0 },   // add to cart count
  purchases: { type: Number, default: 0 },   // completed purchases
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

// Force mongoose to use "products" collection
const Product = mongoose.model("Product", productSchema, "products");

export default Product;
