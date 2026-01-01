// test-api.js - API smoke tests for backend and DB connectivity via endpoints
const API_BASE_URL = 'http://localhost:5000/api';

async function safeFetchJson(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText} - ${text}`);
  }
  return res.json();
}

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // 1) Health
    console.log('1) Health check');
    const healthData = await safeFetchJson(`${API_BASE_URL}/test`);
    console.log('✅ Health:', healthData);

    // 2) Search (requires DB working)
    console.log('\n2) Search endpoint');
    const searchData = await safeFetchJson(`${API_BASE_URL}/search?q=test&page=1&limit=5`);
    console.log('✅ Search:', {
      productsCount: searchData.products?.length || 0,
      pagination: searchData.pagination,
    });

    // 3) Categories & Brands
    console.log('\n3) Categories & brands');
    const [categoriesData, brandsData] = await Promise.all([
      safeFetchJson(`${API_BASE_URL}/search/categories`),
      safeFetchJson(`${API_BASE_URL}/search/brands`),
    ]);
    console.log('✅ Categories:', categoriesData.length);
    console.log('✅ Brands:', brandsData.length);

    // 4) Products list
    console.log('\n4) Products list');
    const products = await safeFetchJson(`${API_BASE_URL}/products`);
    console.log('✅ Products:', products.length);

    // 5) Popular & Trending
    console.log('\n5) Popular & Trending');
    const [popular, trending] = await Promise.all([
      safeFetchJson(`${API_BASE_URL}/products/popular?limit=3`),
      safeFetchJson(`${API_BASE_URL}/products/trending?limit=3`),
    ]);
    console.log('✅ Popular count:', popular.length);
    console.log('✅ Trending count:', trending.length);

    // 6) Single product by id (if any)
    if (products.length > 0) {
      console.log('\n6) Single product');
      const firstId = products[0]._id;
      const product = await safeFetchJson(`${API_BASE_URL}/products/${firstId}`);
      console.log('✅ Product detail:', { _id: product._id, name: product.name });
    } else {
      console.log('ℹ️ No products found to test detail endpoint');
    }

    console.log('\n🎉 All tests completed.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exitCode = 1;
  }
}

testAPI();
