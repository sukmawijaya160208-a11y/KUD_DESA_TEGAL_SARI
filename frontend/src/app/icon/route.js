const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#059669"/>
  <text x="16" y="22" font-family="Inter,Arial,sans-serif" font-size="16" font-weight="800" fill="white" text-anchor="middle">K</text>
</svg>`;

export async function GET() {
  try {
    const pengaturanRes = await fetch(`${BACKEND_URL}/api/pengaturan`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!pengaturanRes.ok) throw new Error('Pengaturan fetch failed');

    const data = await pengaturanRes.json();
    const logoUrl = data?.logo_kud;

    if (logoUrl) {
      const imageUrl = logoUrl.startsWith('http') ? logoUrl : `${BACKEND_URL}${logoUrl}`;
      const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(5000) });

      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const contentType = imgRes.headers.get('content-type') || 'image/png';
        return new Response(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          },
        });
      }
    }
  } catch {
  }

  return new Response(FALLBACK_SVG, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
