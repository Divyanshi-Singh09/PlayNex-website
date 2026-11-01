import { NextRequest, NextResponse } from 'next/server';
import { customerRecoverPassword } from '@/lib/shopify-customer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    await customerRecoverPassword(email);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not process password recovery.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}