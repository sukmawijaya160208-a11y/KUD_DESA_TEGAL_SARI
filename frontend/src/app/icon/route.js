import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { statSync } from 'node:fs';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#059669"/>
  <text x="16" y="22" font-family="Inter,Arial,sans-serif" font-size="16" font-weight="800" fill="white" text-anchor="middle">K</text>
</svg>`;

const noCacheHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

async function fetchImage(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/png';
    return { buffer, contentType };
  } catch {
    return null;
  }
}

async function tryReadFile(...parts) {
  try {
    const filePath = join(process.cwd(), ...parts);
    statSync(filePath);
    const buffer = await readFile(filePath);
    const ext = parts[parts.length - 1].split('.').pop().toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : ext === 'ico' ? 'image/x-icon' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
    return { buffer, contentType: mime };
  } catch {
    return null;
  }
}

export async function GET() {
  // 1. Try backend pengaturan API for logo_kud
  try {
    const pengaturanRes = await fetch(`${BACKEND_URL}/api/pengaturan`, {
      signal: AbortSignal.timeout(4000),
    });
    if (pengaturanRes.ok) {
      const data = await pengaturanRes.json();
      const logoUrl = data?.logo_kud;
      if (logoUrl) {
        const imageUrl = logoUrl.startsWith('http') ? logoUrl : `${BACKEND_URL}${logoUrl}`;
        const result = await fetchImage(imageUrl);
        if (result) {
          return new Response(result.buffer, {
            headers: { 'Content-Type': result.contentType, ...noCacheHeaders },
          });
        }
      }
    }
  } catch {}

  // 2. Try backend setting-kud for logo field
  try {
    const skRes = await fetch(`${BACKEND_URL}/api/pengaturan`, {
      signal: AbortSignal.timeout(4000),
    });
    if (skRes.ok) {
      const data = await skRes.json();
      if (data?.logo_kud) {
        const imageUrl = data.logo_kud.startsWith('http') ? data.logo_kud : `${BACKEND_URL}${data.logo_kud}`;
        const result = await fetchImage(imageUrl);
        if (result) {
          return new Response(result.buffer, {
            headers: { 'Content-Type': result.contentType, ...noCacheHeaders },
          });
        }
      }
    }
  } catch {}

  // 3. Try static logo files
  const staticLogos = [
    ['public', 'logo', 'logo.jpg'],
    ['public', 'logo', 'logo.png'],
    ['public', 'images', 'logo.jpg'],
    ['public', 'images', 'logo.png'],
    ['public', 'favicon.ico'],
    ['public', 'favicon.png'],
  ];

  for (const parts of staticLogos) {
    const result = await tryReadFile(...parts);
    if (result) {
      return new Response(result.buffer, {
        headers: { 'Content-Type': result.contentType, ...noCacheHeaders },
      });
    }
  }

  // 4. Ultimate fallback
  return new Response(FALLBACK_SVG, {
    headers: { 'Content-Type': 'image/svg+xml', ...noCacheHeaders },
  });
}
