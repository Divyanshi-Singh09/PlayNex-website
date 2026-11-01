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
        {error: 'Authentication is required. Please sign in to edit your profile.'},
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

    const hasNameOrPhone =
      firstName !== undefined || lastName !== undefined || (phone !== undefined && phone !== '');
    const hasAddress =
      address1 !== undefined && typeof address1 === 'string' && address1.trim().length > 0;

    if (!hasNameOrPhone && !hasAddress) {
      return NextResponse.json(
        {error: 'Please provide profile details or a delivery address to update.'},
        {status: 400}
      );
    }

    let formattedPhone: string | undefined = undefined;
    if (phone && typeof phone === 'string' && phone.trim()) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 10) {
        return NextResponse.json(
          {error: 'Please enter a valid 10-digit mobile phone number for order updates & delivery.'},
          {status: 400}
        );
      }
      formattedPhone = formatPhoneNumber(phone);
    }

    // 1. Update basic profile (name + phone) in Shopify
    if (hasNameOrPhone) {
      try {
        await customerUpdate(token, {
          firstName: firstName !== undefined ? firstName.trim() : undefined,
          lastName: lastName !== undefined ? lastName.trim() : undefined,
          phone: formattedPhone
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not update profile.';
        console.warn('customerUpdate warning in /api/auth/details:', msg);
        if (msg.toLowerCase().includes('phone') || msg.toLowerCase().includes('already')) {
          return NextResponse.json({error: msg}, {status: 400});
        }
      }
    }

    // 2. Add / set default delivery address in Shopify if provided
    let createdAddress = null;
    if (hasAddress) {
      if (address1.trim().length < 3) {
        return NextResponse.json(
          {error: 'Please provide a valid street address (house/flat no., building, street).'},
          {status: 400}
        );
      }

      if (!city || typeof city !== 'string' || city.trim().length < 2) {
        return NextResponse.json({error: 'Please enter your city.'}, {status: 400});
      }

      if (!province || typeof province !== 'string' || province.trim().length < 2) {
        return NextResponse.json({error: 'Please enter your state / province.'}, {status: 400});
      }

      if (!zip || typeof zip !== 'string' || zip.trim().length < 4) {
        return NextResponse.json({error: 'Please enter a valid postal / PIN code.'}, {status: 400});
      }

      const res = await customerAddressCreate(
        token,
        {
          firstName: firstName ? firstName.trim() : undefined,
          lastName: lastName ? lastName.trim() : undefined,
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
      createdAddress = res.address;
    }

    const updatedCustomer = await getCustomerProfile(token);

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
      address: createdAddress
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not save profile details.';
    return NextResponse.json({error: message}, {status: 400});
  }
}
