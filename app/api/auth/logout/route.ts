import {NextRequest, NextResponse} from 'next/server';
import {customerLogout} from '@/lib/shopify-customer';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('playnex_customer_token')?.value;

  if (token) {
    try {
      await customerLogout(token);
    } catch {
      // Ignored
    }
  }

  const res = NextResponse.json({success: true});
  res.cookies.delete('playnex_customer_token');
  return res;
}

