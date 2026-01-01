// Normalize image URLs and provide safe fallbacks
export const makeSvgPlaceholder = (w = 300, h = 300, text = 'No Image') => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='16'>${text}</text></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
};

// Normalize image URLs to a reliable host (placehold.co) when needed.
// Rules:
// - If absolute http(s) and host is via.placeholder.com -> switch to placehold.co
// - If absolute http(s) other host -> keep as is
// - If pattern like "600x600?text=..." -> return https://placehold.co/size?text=...
// - If filename like "image.png" -> https://placehold.co/600x600?text=image
// - Otherwise -> https://placehold.co/300x300?text=No+Image
export const normalizeImageUrl = (url, fallbackText = 'No Image', fallbackSize = '300x300') => {
  try {
    if (!url || typeof url !== 'string') {
      const [fw, fh] = (fallbackSize || '300x300').split('x');
      return `https://placehold.co/${fw || 300}x${fh || 300}?text=${encodeURIComponent(fallbackText)}`;
    }

    // Root-relative path (served from public/). Keep as-is.
    if (url.startsWith('/')) return url;

    // Already absolute
    if (/^https?:\/\//i.test(url)) {
      try {
        const u = new URL(url);
        if (u.hostname.includes('via.placeholder.com')) {
          u.hostname = 'placehold.co';
          return u.toString();
        }
        return url;
      } catch {
        return url;
      }
    }

    // size pattern like 600x600?text=...
    const sizePattern = /^(\d+)x(\d+)(\?.*)?$/i;
    const m = url.match(sizePattern);
    if (m) {
      const w = m[1];
      const h = m[2];
      const q = m[3] || '';
      // preserve text param if present
      const params = new URLSearchParams(q.replace(/^\?/, ''));
      const text = params.get('text') || fallbackText;
      return `https://placehold.co/${w}x${h}?text=${encodeURIComponent(text)}`;
    }

    // Bare filename -> use its basename as text
    const fileMatch = url.match(/([^/\\]+)\.(png|jpg|jpeg|gif|webp)$/i);
    if (fileMatch) {
      // Assume asset located at public/images/<filename>
      const filename = fileMatch[0];
      return `/images/${filename}`;
    }

    // Fallback fixed size
    const [fw, fh] = (fallbackSize || '300x300').split('x');
    return `https://placehold.co/${fw || 300}x${fh || 300}?text=${encodeURIComponent(fallbackText)}`;
  } catch {
    return `https://placehold.co/300x300?text=${encodeURIComponent(fallbackText)}`;
  }
};


