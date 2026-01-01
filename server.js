import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import Product from "./src/data/products.js";  
import productRoutes from "./src/routes/productRoutes.js";
import authRoutes from "./src/routes/auth.js";
import searchRoutes from "./src/routes/search.js";
import recommendationRoutes from "./src/routes/recommendations.js";
import chatRoutes from "./src/routes/chat.js";
import fs from 'fs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/products", productRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);

// Test endpoint to verify server is working
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running!", timestamp: new Date().toISOString() });
});

// ✅ Choose DB: MongoDB (default) or FileDB (SMART_DB-ai) via USE_FILE_DB=true
const USE_FILE_DB = String(process.env.USE_FILE_DB || '').toLowerCase() === 'true';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-with-ai-ecom';

if (!USE_FILE_DB) {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.connection.on("connected", () => {
    console.log("✅ Connected to DB:", mongoose.connection.name);
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ DB Connection Error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("❌ Disconnected from DB");
  });
} else {
  const dir = 'SMART_DB-ai';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  console.log('💾 Using FileDB at', dir);
}

// ✅ Backup direct route (optional, क्योंकि ऊपर routes में already है)
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB URI: ${MONGODB_URI}`);
  console.log(`🔍 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🗄️ DB Mode: ${USE_FILE_DB ? 'FileDB (SMART_DB-ai)' : 'MongoDB'}`);
});
