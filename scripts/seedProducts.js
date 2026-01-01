import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../src/data/products.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/smart-with-ai-ecom";

const sampleProducts = [
	{
		name: "Aurora Wireless Headphones",
		category: "Electronics",
		brand: "Aurora",
		price: 99.99,
		rating: 4.5,
		reviewCount: 142,
		stock: 120,
		image: "https://via.placeholder.com/600x600?text=Aurora+Headphones",
		images: [
			"https://via.placeholder.com/1200x800?text=Aurora+Headphones+1",
			"https://via.placeholder.com/1200x800?text=Aurora+Headphones+2",
		],
		description: "Comfortable, noise-isolating wireless headphones with 30-hour battery life.",
		specifications: { connectivity: "Bluetooth 5.3", battery: "30h", weight: "210g" },
	},
	{
		name: "Nimbus Smartwatch S2",
		category: "Wearables",
		brand: "Nimbus",
		price: 149.0,
		rating: 4.2,
		reviewCount: 89,
		stock: 80,
		image: "https://via.placeholder.com/600x600?text=Nimbus+S2",
		images: [
			"https://via.placeholder.com/1200x800?text=Nimbus+S2+1",
			"https://via.placeholder.com/1200x800?text=Nimbus+S2+2",
		],
		description: "Water-resistant smartwatch with heart-rate monitoring and GPS.",
		specifications: { waterResistance: "5 ATM", gps: true, battery: "7 days" },
	},
	{
		name: "Breeze Air Purifier Max",
		category: "Home Appliances",
		brand: "Breeze",
		price: 199.99,
		rating: 4.7,
		reviewCount: 231,
		stock: 45,
		image: "https://via.placeholder.com/600x600?text=Breeze+Max",
		images: [
			"https://via.placeholder.com/1200x800?text=Breeze+Max+1",
			"https://via.placeholder.com/1200x800?text=Breeze+Max+2",
		],
		description: "HEPA H13 filtration with real-time air quality monitoring.",
		specifications: { hepa: "H13", coverage: "60 m²", noise: "24-50 dB" },
	},
	{
		name: "Volt Portable Charger 20K",
		category: "Electronics",
		brand: "Volt",
		price: 39.95,
		rating: 4.4,
		reviewCount: 512,
		stock: 300,
		image: "https://via.placeholder.com/600x600?text=Volt+20K",
		images: [
			"https://via.placeholder.com/1200x800?text=Volt+20K+1",
			"https://via.placeholder.com/1200x800?text=Volt+20K+2",
		],
		description: "20000mAh fast-charging power bank with USB-C PD.",
		specifications: { capacity: "20000mAh", pd: "20W", ports: 3 },
	},
	{
		name: "Luma LED Desk Lamp",
		category: "Home & Office",
		brand: "Luma",
		price: 29.99,
		rating: 4.1,
		reviewCount: 64,
		stock: 200,
		image: "https://via.placeholder.com/600x600?text=Luma+Lamp",
		images: [
			"https://via.placeholder.com/1200x800?text=Luma+Lamp+1",
			"https://via.placeholder.com/1200x800?text=Luma+Lamp+2",
		],
		description: "Adjustable color temperature with wireless charging base.",
		specifications: { colorTemp: "2700K-6500K", brightness: "800 lm" },
	},
	{
		name: "Zen Ceramic Cookware Set (10pc)",
		category: "Kitchen",
		brand: "Zenware",
		price: 179.0,
		rating: 4.6,
		reviewCount: 178,
		stock: 60,
		image: "https://via.placeholder.com/600x600?text=Zen+Cookware",
		images: [
			"https://via.placeholder.com/1200x800?text=Zen+Cookware+1",
			"https://via.placeholder.com/1200x800?text=Zen+Cookware+2",
		],
		description: "Non-stick, PFAS-free ceramic set with even heat distribution.",
		specifications: { pieces: 10, ovenSafe: "260°C" },
	},
	{
		name: "Atlas Hiking Backpack 40L",
		category: "Outdoors",
		brand: "Atlas",
		price: 89.0,
		rating: 4.3,
		reviewCount: 96,
		stock: 110,
		image: "https://via.placeholder.com/600x600?text=Atlas+40L",
		images: [
			"https://via.placeholder.com/1200x800?text=Atlas+40L+1",
			"https://via.placeholder.com/1200x800?text=Atlas+40L+2",
		],
		description: "Lightweight pack with ventilated back panel and rain cover.",
		specifications: { capacity: "40L", weight: "980g" },
	},
	{
		name: "Pulse Fitness Tracker",
		category: "Wearables",
		brand: "Pulse",
		price: 49.5,
		rating: 4.0,
		reviewCount: 210,
		stock: 500,
		image: "https://via.placeholder.com/600x600?text=Pulse+Tracker",
		images: [
			"https://via.placeholder.com/1200x800?text=Pulse+Tracker+1",
		],
		description: "All-day activity, sleep tracking, and smartphone notifications.",
		specifications: { battery: "10 days", waterproof: "IP68" },
	},
];

async function run() {
	try {
		console.log("Connecting to:", MONGODB_URI);
		await mongoose.connect(MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("Connected. Seeding products...\n");

		const count = await Product.countDocuments();
		if (count > 0) {
			console.log(`Existing products found: ${count}. Clearing collection...`);
			await Product.deleteMany({});
		}

		const inserted = await Product.insertMany(sampleProducts);
		console.log(`Inserted ${inserted.length} products.`);

		const verifyCount = await Product.countDocuments();
		console.log(`Collection now has ${verifyCount} products.`);
	} catch (err) {
		console.error("Seed error:", err);
		process.exitCode = 1;
	} finally {
		await mongoose.disconnect();
		console.log("Disconnected.");
	}
}

run();


