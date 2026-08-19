/**
 * Best-effort OpenGraph link preview. Instagram/TikTok actively block scrapers
 * and their oEmbed endpoints need app tokens we don't have — expect those to
 * fail and fall back to the caller's manual title. Not worth sinking more time
 * into; a title + thumbnail when it works is a bonus, not a requirement.
 */

const FETCH_TIMEOUT_MS = 5000;
const MAX_BODY_BYTES = 500_000; // enough for <head>; avoids downloading huge pages
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 1 day

// In-memory only — resets on restart. No Redis/persistent cache in this stack
// yet, and preview results are cheap to re-fetch if lost.
const cache = new Map();

function getMetaContent(html, property) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return undefined;
}

function getTitleTag(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : undefined;
}

async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        // A generic browser UA — some sites 403 requests with no UA at all.
        'User-Agent':
          'Mozilla/5.0 (compatible; TrippioLinkPreview/1.0; +https://github.com/lefkosp/trippio-server)',
        Accept: 'text/html',
      },
    });
    if (!res.ok || !res.body) return null;

    const reader = res.body.getReader();
    const chunks = [];
    let received = 0;
    while (received < MAX_BODY_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
    }
    reader.cancel().catch(() => {});
    return Buffer.concat(chunks).toString('utf8');
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

exports.fetchPreview = async (url) => {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const html = await fetchHtml(url);
  const data = html
    ? {
        title: getMetaContent(html, 'og:title') || getTitleTag(html) || null,
        imageUrl: getMetaContent(html, 'og:image') || null,
      }
    : { title: null, imageUrl: null };

  cache.set(url, { data, fetchedAt: Date.now() });
  return data;
};
