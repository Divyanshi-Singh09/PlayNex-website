import { NextRequest, NextResponse } from 'next/server';
import { customerRegister } from '@/lib/shopify-customer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, phone, address } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 5) {
      return NextResponse.json({ error: 'Password must be at least 5 characters long.' }, { status: 400 });
    }

    const { customer, token, expiresAt } = await customerRegister({
      firstName,
      lastName,
      email,
      password,
      phone,
      address
    });

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
    const message = err instanceof Error ? err.message : 'Could not complete registration.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

