export const fetchJSON = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('fetchJSON error:', err);
    throw err;
  }
};

export const trackProduct = async (productId, type) => {
  try {
    await fetch(`http://localhost:5000/api/products/${productId}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    });
  } catch (err) {
    // non-blocking on purpose
  }
};


