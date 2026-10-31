import {NextRequest, NextResponse} from 'next/server';
import {getCustomerProfile} from '@/lib/shopify-customer';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('playnex_customer_token')?.value;

  if (!token) {
    return NextResponse.json({customer: null});
  }

  const customer = await getCustomerProfile(token);
  if (!customer) {
    const res = NextResponse.json({customer: null});
    res.cookies.delete('playnex_customer_token');
    return res;
  }

  return NextResponse.json({customer});
}

