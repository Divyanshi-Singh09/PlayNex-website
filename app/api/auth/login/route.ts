import {NextRequest, NextResponse} from 'next/server';
import {customerLogin} from '@/lib/shopify-customer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {email, password} = body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json({error: 'Email and password are required.'}, {status: 400});
    }

    const {token, expiresAt, customer} = await customerLogin(email, password);

    const response = NextResponse.json({
      success: true,
      customer
    });

    const isProd = process.env.NODE_ENV === 'production';
    const expires = new Date(expiresAt);

    response.cookies.set('playnex_customer_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      expires
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid login credentials.';
    return NextResponse.json({error: message}, {status: 401});
  }
}

