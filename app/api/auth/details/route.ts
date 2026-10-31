import {NextRequest, NextResponse} from 'next/server';
import {
  customerUpdate,
  customerAddressCreate,
  getCustomerProfile,
  formatPhoneNumber
} from '@/lib/shopify-customer';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('playnex_customer_token')?.value;
    if (!token) {
      return NextResponse.json(
        {error: 'Authentication is required. Please sign in to save your delivery details.'},
        {status: 401}
      );
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      phone,
      address1,
      address2,
      city,
      province,
      zip,
      country = 'India'
    } = body;

    // Validate phone number
    if (!phone || typeof phone !== 'string' || phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json(
        {error: 'Please enter a valid 10-digit mobile phone number for order updates & delivery.'},
        {status: 400}
      );
    }

    // Validate street address
    if (!address1 || typeof address1 !== 'string' || address1.trim().length < 3) {
      return NextResponse.json(
        {error: 'Please provide a valid street address (house/flat no., building, street).'},
        {status: 400}
      );
    }

    // Validate city
    if (!city || typeof city !== 'string' || city.trim().length < 2) {
      return NextResponse.json({error: 'Please enter your city.'}, {status: 400});
    }

    // Validate state / province
    if (!province || typeof province !== 'string' || province.trim().length < 2) {
      return NextResponse.json({error: 'Please enter your state / province.'}, {status: 400});
    }

    // Validate postal code / PIN
    if (!zip || typeof zip !== 'string' || zip.trim().length < 4) {
      return NextResponse.json({error: 'Please enter a valid postal / PIN code.'}, {status: 400});
    }

    const formattedPhone = formatPhoneNumber(phone);

    // 1. Update basic profile (name + phone) in Shopify
    try {
      await customerUpdate(token, {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        phone: formattedPhone
      });
    } catch (err) {
      console.warn('customerUpdate error in /api/auth/details:', err);
    }

    // 2. Add / set default delivery address in Shopify
    const res = await customerAddressCreate(
      token,
      {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        phone: formattedPhone,
        address1: address1.trim(),
        address2: address2 ? address2.trim() : '',
        city: city.trim(),
        province: province.trim(),
        zip: zip.trim(),
        country: country?.trim() || 'India'
      },
      true
    );

    const updatedCustomer = res.customer || (await getCustomerProfile(token));

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
      address: res.address
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not save delivery details.';
    return NextResponse.json({error: message}, {status: 400});
  }
}

