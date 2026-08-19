/**
 * Best-effort geocoding via Nominatim (OpenStreetMap) — free, no API key, no
 * billing setup, which is why Leaflet/OSM is the map stack for this project.
 * Their usage policy requires a real User-Agent and caps requests around
 * 1/sec; this only ever runs fire-and-forget after a place is created, never
 * blocking the write, so that ceiling is in practice never in reach.
 */

const FETCH_TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days — addresses don't move

// In-memory only, same tradeoff as preview.service.js — resets on restart,
// cheap to re-fetch if lost, and this stack has no Redis yet.
const cache = new Map();

exports.geocode = async (address) => {
  const key = address.trim().toLowerCase();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let data = null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TrippioGeocoder/1.0 (+https://github.com/lefkosp/trippio-server)',
      },
    });
    if (res.ok) {
      const results = await res.json();
      if (results[0]) {
        data = { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
      }
    }
  } catch {
    data = null;
  } finally {
    clearTimeout(timeout);
  }

  cache.set(key, { data, fetchedAt: Date.now() });
  return data;
};
