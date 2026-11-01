import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';
/** Shopify webhook verification uses the raw body, never parsed/re-serialized JSON. */
export async function POST(request: NextRequest) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  const length = Number(request.headers.get('content-length') || '0');
  if (length > 1024 * 1024) return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  const body = Buffer.from(await request.arrayBuffer());
  if (body.length > 1024 * 1024) return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  const signature = request.headers.get('x-shopify-hmac-sha256') || '';
  const expected = createHmac('sha256', secret).update(body).digest();
  const received = Buffer.from(signature, 'base64');
  if (received.length !== expected.length || !timingSafeEqual(expected, received)) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  const topic = (request.headers.get('x-shopify-topic') || '').toLowerCase();
  if (topic.startsWith('products/') || topic.startsWith('collections/')) {
    revalidateTag('shopify-products', 'max');
  } else if (topic.startsWith('metaobjects/') || topic.startsWith('files/')) {
    revalidateTag('shopify-perspectives', 'max');
  }
  return NextResponse.json({ received: true });
}
