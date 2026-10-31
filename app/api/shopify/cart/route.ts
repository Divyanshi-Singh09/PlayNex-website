import {NextRequest, NextResponse} from 'next/server';
import {createCart, shopifyEnabled} from '@/lib/shopify';

export async function POST(req: NextRequest) {
  if (!shopifyEnabled) {
    return NextResponse.json(
      {error: 'Ordering is not yet enabled. Connect and publish your Shopify storefront to accept purchases.'},
      {status: 503}
    );
  }

  try {
    const body = await req.json();
    const lines = body.lines;
    if (
      !Array.isArray(lines) ||
      lines.length < 1 ||
      lines.length > 30 ||
      !lines.every(
        (x) =>
          x &&
          typeof x.merchandiseId === 'string' &&
          /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(x.merchandiseId) &&
          Number.isInteger(x.quantity) &&
          x.quantity >= 1 &&
          x.quantity <= 10
      )
    ) {
      return NextResponse.json({error: 'Invalid cart contents.'}, {status: 400});
    }

    const ip =
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-real-ip') ||
      (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();

    const customerToken = req.cookies.get('playnex_customer_token')?.value;
    const customerInfo = body.customerInfo && typeof body.customerInfo === 'object' ? body.customerInfo : undefined;

    const cart = await createCart(lines, ip, customerToken, customerInfo);
    return NextResponse.json({checkoutUrl: cart.checkoutUrl, cartId: cart.id});
  } catch (err) {
    console.error('Checkout failed:', err);
    const msg = err instanceof Error ? err.message : 'Could not begin checkout. Please try again.';
    return NextResponse.json(
      {error: msg},
      {status: 502}
    );
  }
}
