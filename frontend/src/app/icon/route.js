import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#059669"/>
  <text x="16" y="22" font-family="Inter,Arial,sans-serif" font-size="16" font-weight="800" fill="white" text-anchor="middle">K</text>
</svg>`;

const cacheHeaders = { 'Cache-Control': 'public, max-age=300, s-maxage=300' };

export async function GET() {
  try {
    const pengaturanRes = await fetch(`${BACKEND_URL}/api/pengaturan`, {
      signal: AbortSignal.timeout(5000),
    });

    if (pengaturanRes.ok) {
      const data = await pengaturanRes.json();
      const logoUrl = data?.logo_kud;

      if (logoUrl) {
        const imageUrl = logoUrl.startsWith('http') ? logoUrl : `${BACKEND_URL}${logoUrl}`;
        const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(5000) });

        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          const contentType = imgRes.headers.get('content-type') || 'image/png';
          return new Response(buffer, { headers: { 'Content-Type': contentType, ...cacheHeaders } });
        }
      }
    }
  } catch {}

  try {
    const filePath = join(process.cwd(), 'public', 'logo', 'logo.jpg');
    const buffer = await readFile(filePath);
    return new Response(buffer, { headers: { 'Content-Type': 'image/jpeg', ...cacheHeaders } });
  } catch {}

  return new Response(FALLBACK_SVG, { headers: { 'Content-Type': 'image/svg+xml', ...cacheHeaders } });
}
