import json
import os
import sys
from pathlib import Path

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv


def load_products_from_filedb(json_path: Path):
    try:
        with json_path.open('r', encoding='utf-8') as f:
            data = json.load(f)
        # FileDB format may be a list or an object with items
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            # common patterns: {"items": [...]} or keyed by _id
            if 'items' in data and isinstance(data['items'], list):
                return data['items']
            # fallback: values that look like product documents
            return [v for v in data.values() if isinstance(v, dict)]
    except Exception as e:
        print(f"⚠️ Failed to read products from {json_path}: {e}")
    return []


def generate_sample_products():
    return [
        {
            "name": "Aurora Wireless Headphones",
            "category": "Electronics",
            "brand": "Aurora",
            "price": 99.99,
            "rating": 4.5,
            "reviewCount": 142,
            "stock": 120,
            "image": "https://via.placeholder.com/600x600?text=Aurora+Headphones",
            "images": [
                "https://via.placeholder.com/1200x800?text=Aurora+Headphones+1",
                "https://via.placeholder.com/1200x800?text=Aurora+Headphones+2",
            ],
            "description": "Comfortable, noise-isolating wireless headphones with 30-hour battery life.",
            "specifications": {"connectivity": "Bluetooth 5.3", "battery": "30h", "weight": "210g"},
        },
        {
            "name": "Nimbus Smartwatch S2",
            "category": "Wearables",
            "brand": "Nimbus",
            "price": 149.0,
            "rating": 4.2,
            "reviewCount": 89,
            "stock": 80,
            "image": "https://via.placeholder.com/600x600?text=Nimbus+S2",
            "images": [
                "https://via.placeholder.com/1200x800?text=Nimbus+S2+1",
                "https://via.placeholder.com/1200x800?text=Nimbus+S2+2",
            ],
            "description": "Water-resistant smartwatch with heart-rate monitoring and GPS.",
            "specifications": {"waterResistance": "5 ATM", "gps": True, "battery": "7 days"},
        },
    ]


def main() -> int:
    load_dotenv()

    mongo_uri = os.getenv("MONGODB_URI") or "mongodb://127.0.0.1:27017/smart-with-ai-ecom"
    db_name = None

    # Extract db name from URI if present (mongodb://host:port/db)
    try:
        tail = mongo_uri.split("/", 3)[-1]
        if tail:
            db_name = tail.split("?")[0]
    except Exception:
        pass
    if not db_name:
        db_name = "smart-with-ai-ecom"

    print(f"🔌 Connecting to MongoDB: {mongo_uri}")
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=4000)
        client.admin.command("ping")
    except ConnectionFailure as e:
        print(f"❌ Unable to connect to MongoDB: {e}")
        return 2

    db = client[db_name]
    col = db["products"]

    existing = col.count_documents({})
    print(f"📦 products collection current count: {existing}")

    products = []
    filedb_path = Path("SMART_DB-ai") / "products.json"
    if filedb_path.exists():
        print(f"📁 Found FileDB products at {filedb_path}, loading...")
        products = load_products_from_filedb(filedb_path)

    if not products:
        print("ℹ️ No products found in FileDB, generating sample products...")
        products = generate_sample_products()

    if not products:
        print("❌ No products to insert.")
        return 3

    # Clean any _id that may conflict
    for p in products:
        p.pop("_id", None)

    try:
        if existing > 0:
            print("🧹 Clearing existing products...")
            col.deleteMany({})  # type: ignore[attr-defined]
    except Exception:
        # fallback for old pymongo attribute
        col.delete_many({})

    try:
        result = col.insert_many(products)
        print(f"✅ Inserted {len(result.inserted_ids)} products.")
    except Exception as e:
        print(f"❌ Failed to insert products: {e}")
        return 4

    final_count = col.count_documents({})
    print(f"📈 products collection now has {final_count} documents.")
    return 0


if __name__ == "__main__":
    sys.exit(main())


