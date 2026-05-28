import { NextRequest, NextResponse } from 'next/server';

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const TIMEOUT_MS = 8000;

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function getMeta(html: string, key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`, 'i'),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return decodeEntities(m[1]);
  }
  return null;
}

function getTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodeEntities(m[1].trim().replace(/\s+/g, ' ')) : null;
}

function findProductLd(
  html: string
): { name?: string; description?: string; image?: string; price?: number } | null {
  const matches = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );

  for (const match of matches) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(match[1].trim());
    } catch {
      continue;
    }

    const queue: unknown[] = Array.isArray(parsed) ? [...parsed] : [parsed];

    while (queue.length) {
      const node = queue.shift();
      if (!node || typeof node !== 'object') continue;
      const obj = node as Record<string, unknown>;

      const types = ([] as string[]).concat(
        Array.isArray(obj['@type']) ? (obj['@type'] as string[]) : ([obj['@type']] as string[])
      );

      if (types.includes('Product')) {
        const out: { name?: string; description?: string; image?: string; price?: number } = {};

        if (typeof obj.name === 'string') out.name = obj.name;
        if (typeof obj.description === 'string') out.description = obj.description;

        const img = obj.image;
        if (typeof img === 'string') out.image = img;
        else if (Array.isArray(img) && typeof img[0] === 'string') out.image = img[0] as string;
        else if (img && typeof img === 'object' && typeof (img as { url?: string }).url === 'string') {
          out.image = (img as { url: string }).url;
        }

        const offers = obj.offers;
        const offerList = Array.isArray(offers) ? offers : offers ? [offers] : [];
        for (const o of offerList) {
          if (!o || typeof o !== 'object') continue;
          const oo = o as Record<string, unknown>;
          const raw = oo.price ?? oo.lowPrice ?? (oo.priceSpecification as Record<string, unknown>)?.price;
          if (raw !== undefined && raw !== null) {
            const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
            if (!Number.isNaN(n)) {
              out.price = n;
              break;
            }
          }
        }

        return out;
      }

      // Walk into @graph and other nested arrays/objects
      if (Array.isArray(obj['@graph'])) {
        for (const g of obj['@graph']) queue.push(g);
      }
      for (const v of Object.values(obj)) {
        if (Array.isArray(v)) queue.push(...v);
        else if (v && typeof v === 'object') queue.push(v);
      }
    }
  }

  return null;
}

function absoluteUrl(maybeRelative: string | null, base: string): string | null {
  if (!maybeRelative) return null;
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { url } = await req.json().catch(() => ({}));

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return NextResponse.json({ error: 'URL must be http(s)' }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(parsed.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; JuliaJonWeddingAdmin/1.0; +https://juliajon.com)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
  } catch (err) {
    clearTimeout(timeout);
    return NextResponse.json(
      { error: `Fetch failed: ${(err as Error).message}` },
      { status: 502 }
    );
  }
  clearTimeout(timeout);

  if (!res.ok) {
    return NextResponse.json(
      { error: `Source returned ${res.status}` },
      { status: 502 }
    );
  }

  // Read with byte cap.
  const reader = res.body?.getReader();
  if (!reader) {
    return NextResponse.json({ error: 'No response body' }, { status: 502 });
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > MAX_BYTES) {
        await reader.cancel().catch(() => {});
        break;
      }
      chunks.push(value);
    }
  } catch (err) {
    return NextResponse.json(
      { error: `Read failed: ${(err as Error).message}` },
      { status: 502 }
    );
  }
  const html = new TextDecoder('utf-8').decode(Buffer.concat(chunks.map(c => Buffer.from(c))));

  const ld = findProductLd(html);
  const ogTitle = getMeta(html, 'og:title');
  const ogDesc = getMeta(html, 'og:description');
  const ogImage = getMeta(html, 'og:image');
  const ogPrice = getMeta(html, 'product:price:amount') || getMeta(html, 'og:price:amount');
  const twitterDesc = getMeta(html, 'twitter:description');
  const metaDesc = getMeta(html, 'description');

  const name = ld?.name || ogTitle || getTitle(html) || null;
  const description = ld?.description || ogDesc || twitterDesc || metaDesc || null;
  const imageRaw = ld?.image || ogImage || null;
  const image = absoluteUrl(imageRaw, parsed.toString());
  const priceRaw = ld?.price ?? (ogPrice ? parseFloat(ogPrice) : undefined);
  const price = typeof priceRaw === 'number' && !Number.isNaN(priceRaw) ? priceRaw : null;

  return NextResponse.json({
    url: parsed.toString(),
    name,
    description,
    image_url: image,
    price,
    found: {
      name: !!name,
      description: !!description,
      image: !!image,
      price: price !== null,
    },
  });
}
