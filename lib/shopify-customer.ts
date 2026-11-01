import {storefront, shopifyEnabled} from './shopify';

export type CustomerAddress = {
  id?: string;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  zip: string | null;
  formatted: string[];
};

export type CustomerAddressInput = {
  address1: string;
  address2?: string | null;
  city: string;
  province?: string | null;
  country?: string | null;
  zip: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  company?: string | null;
};

/**
 * Format mobile number to E.164 standard for Shopify (e.g. +91 9876543210 -> +919876543210)
 */
export function formatPhoneNumber(phone: string, defaultCountryCode = '+91'): string {
  if (!phone) return '';
  const digits = phone.replace(/[^\d+]/g, '');
  if (!digits) return '';
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) return `${defaultCountryCode}${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `${defaultCountryCode}${digits}`;
}

export type CustomerOrderItem = {
  title: string;
  quantity: number;
  variant?: {
    title: string;
    image?: { url: string } | null;
  } | null;
};

export type CustomerOrder = {
  id: string;
  name: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  statusUrl: string | null;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  lineItems: CustomerOrderItem[];
};

export type CustomerUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  email: string;
  phone: string | null;
  createdAt?: string;
  numberOfOrders?: string | number;
  defaultAddress?: CustomerAddress | null;
  orders?: CustomerOrder[];
};

export type CustomerAccessToken = {
  accessToken: string;
  expiresAt: string;
};

type CustomerUserError = {
  code?: string;
  field?: string[] | null;
  message: string;
};

/**
 * Log in a customer using email and password via Shopify Storefront API.
 */
export async function customerLogin(email: string, password: string): Promise<{ token: string; expiresAt: string; customer: CustomerUser }> {
  if (!shopifyEnabled) throw new Error('Shopify store is not configured');

  const mutation = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  type LoginResponse = {
    customerAccessTokenCreate: {
      customerAccessToken: CustomerAccessToken | null;
      customerUserErrors: CustomerUserError[];
    };
  };

  const data = await storefront<LoginResponse>(mutation, {
    input: { email: email.trim().toLowerCase(), password }
  });

  const res = data.customerAccessTokenCreate;
  if (res.customerUserErrors.length > 0 || !res.customerAccessToken) {
    const msg = res.customerUserErrors[0]?.message || 'Invalid email or password.';
    throw new Error(msg);
  }

  const customer = await getCustomerProfile(res.customerAccessToken.accessToken);
  if (!customer) {
    throw new Error('Could not retrieve customer details. Please try again.');
  }

  return {
    token: res.customerAccessToken.accessToken,
    expiresAt: res.customerAccessToken.expiresAt,
    customer
  };
}

/**
 * Create a new customer in Shopify and authenticate them.
 */
export async function customerRegister(input: {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
  address?: CustomerAddressInput;
}): Promise<{ customer: CustomerUser; token: string; expiresAt: string }> {
  if (!shopifyEnabled) throw new Error('Shopify store is not configured');

  const mutation = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          firstName
          lastName
          email
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  type RegisterResponse = {
    customerCreate: {
      customer: { id: string; email: string; firstName: string | null; lastName: string | null } | null;
      customerUserErrors: CustomerUserError[];
    };
  };

  const data = await storefront<RegisterResponse>(mutation, {
    input: {
      firstName: input.firstName?.trim() || '',
      lastName: input.lastName?.trim() || '',
      email: input.email.trim().toLowerCase(),
      password: input.password
    }
  });

  const res = data.customerCreate;
  if (res.customerUserErrors.length > 0 || !res.customer) {
    const msg = res.customerUserErrors[0]?.message || 'Could not create account. Please check your details.';
    throw new Error(msg);
  }

  // Automatically log them in after registration
  const session = await customerLogin(input.email, input.password);

  // If phone was provided, update the customer in Shopify
  if (input.phone) {
    try {
      await customerUpdate(session.token, {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone
      });
    } catch (err) {
      console.warn('Could not set phone on newly registered customer:', err);
    }
  }

  // If address was provided, create customer address in Shopify
  if (input.address && input.address.address1) {
    try {
      await customerAddressCreate(
        session.token,
        {
          ...input.address,
          firstName: input.address.firstName || input.firstName,
          lastName: input.address.lastName || input.lastName,
          phone: input.address.phone || input.phone
        },
        true
      );
    } catch (err) {
      console.warn('Could not save address on newly registered customer:', err);
    }
  }

  const refreshedCustomer = await getCustomerProfile(session.token);
  return {
    token: session.token,
    expiresAt: session.expiresAt,
    customer: refreshedCustomer || session.customer
  };
}

/**
 * Retrieve customer details from Shopify using their customerAccessToken.
 */
export async function getCustomerProfile(customerAccessToken: string): Promise<CustomerUser | null> {
  if (!shopifyEnabled || !customerAccessToken) return null;

  const query = `
    query getCustomer($token: String!) {
      customer(customerAccessToken: $token) {
        id
        firstName
        lastName
        displayName
        email
        phone
        createdAt
        numberOfOrders
        defaultAddress {
          id
          address1
          address2
          city
          province
          country
          zip
          formatted
        }
        orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
          nodes {
            id
            name
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            statusUrl
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 10) {
              nodes {
                title
                quantity
                variant {
                  title
                  image {
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  type RawCustomer = {
    id: string;
    firstName: string | null;
    lastName: string | null;
    displayName: string;
    email: string;
    phone: string | null;
    createdAt?: string;
    numberOfOrders?: string | number;
    defaultAddress?: CustomerAddress | null;
    orders?: {
      nodes: {
        id: string;
        name: string;
        orderNumber: number;
        processedAt: string;
        financialStatus: string;
        fulfillmentStatus: string;
        statusUrl: string | null;
        totalPrice: { amount: string; currencyCode: string };
        lineItems?: {
          nodes: CustomerOrderItem[];
        };
      }[];
    };
  };

  try {
    const data = await storefront<{ customer: RawCustomer | null }>(query, { token: customerAccessToken });
    if (!data.customer) return null;

    const raw = data.customer;
    const orders: CustomerOrder[] = (raw.orders?.nodes || []).map((o) => ({
      id: o.id,
      name: o.name,
      orderNumber: o.orderNumber,
      processedAt: o.processedAt,
      financialStatus: o.financialStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      statusUrl: o.statusUrl,
      totalPrice: o.totalPrice,
      lineItems: o.lineItems?.nodes || []
    }));

    return {
      id: raw.id,
      firstName: raw.firstName,
      lastName: raw.lastName,
      displayName: raw.displayName,
      email: raw.email,
      phone: raw.phone,
      createdAt: raw.createdAt,
      numberOfOrders: raw.numberOfOrders,
      defaultAddress: raw.defaultAddress,
      orders
    };
  } catch (err) {
    console.error('Error fetching customer profile:', err);
    return null;
  }
}

/**
 * Log out customer by invalidating the customer access token in Shopify.
 */
export async function customerLogout(customerAccessToken: string): Promise<boolean> {
  if (!shopifyEnabled || !customerAccessToken) return true;

  const mutation = `
    mutation customerAccessTokenDelete($token: String!) {
      customerAccessTokenDelete(customerAccessToken: $token) {
        deletedAccessToken
        deletedCustomerAccessTokenId
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    await storefront(mutation, { token: customerAccessToken });
    return true;
  } catch {
    return false;
  }
}

/**
 * Send a password reset email to the customer.
 */
export async function customerRecoverPassword(email: string): Promise<boolean> {
  if (!shopifyEnabled) throw new Error('Shopify store is not configured');

  const mutation = `
    mutation customerRecover($email: String!) {
      customerRecover(email: $email) {
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  type RecoverResponse = {
    customerRecover: {
      customerUserErrors: CustomerUserError[];
    };
  };

  const data = await storefront<RecoverResponse>(mutation, { email: email.trim().toLowerCase() });
  if (data.customerRecover.customerUserErrors.length > 0) {
    const msg = data.customerRecover.customerUserErrors[0]?.message || 'Could not send recovery email.';
    throw new Error(msg);
  }
  return true;
}

/**
 * Update customer's basic info (first name, last name, phone) in Shopify.
 */
export async function customerUpdate(
  customerAccessToken: string,
  input: { firstName?: string; lastName?: string; phone?: string }
): Promise<CustomerUser | null> {
  if (!shopifyEnabled || !customerAccessToken) return null;

  const mutation = `
    mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
      customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
        customer {
          id
          firstName
          lastName
          displayName
          email
          phone
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  type CustomerUpdateResponse = {
    customerUpdate: {
      customer: { id: string } | null;
      customerUserErrors: CustomerUserError[];
    };
  };

  const payload: { firstName?: string; lastName?: string; phone?: string } = {};
  if (input.firstName !== undefined) payload.firstName = input.firstName.trim();
  if (input.lastName !== undefined) payload.lastName = input.lastName.trim();
  if (input.phone) {
    const formatted = formatPhoneNumber(input.phone);
    if (formatted) payload.phone = formatted;
  }

  try {
    const data = await storefront<CustomerUpdateResponse>(mutation, {
      customerAccessToken,
      customer: payload
    });

    if (data.customerUpdate.customerUserErrors.length > 0) {
      const errMsg = data.customerUpdate.customerUserErrors[0].message;
      console.warn('customerUpdate notice:', errMsg);
      throw new Error(errMsg);
    }
  } catch (err) {
    console.error('Failed to update customer in Shopify:', err);
  }

  return await getCustomerProfile(customerAccessToken);
}

/**
 * Add a shipping address to the customer's Shopify account and set it as default.
 */
export async function customerAddressCreate(
  customerAccessToken: string,
  address: CustomerAddressInput,
  setDefault = true
): Promise<{ address: CustomerAddress | null; customer: CustomerUser | null }> {
  if (!shopifyEnabled || !customerAccessToken) throw new Error('Shopify is not configured');

  const mutation = `
    mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
      customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
        customerAddress {
          id
          address1
          address2
          city
          province
          country
          zip
          formatted
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  type AddressCreateResponse = {
    customerAddressCreate: {
      customerAddress: CustomerAddress | null;
      customerUserErrors: CustomerUserError[];
    };
  };

  const formattedPhone = address.phone ? formatPhoneNumber(address.phone) : undefined;

  const input = {
    address1: address.address1.trim(),
    address2: address.address2 ? address.address2.trim() : '',
    city: address.city.trim(),
    province: address.province ? address.province.trim() : '',
    zip: address.zip.trim(),
    country: address.country?.trim() || 'India',
    firstName: address.firstName ? address.firstName.trim() : '',
    lastName: address.lastName ? address.lastName.trim() : '',
    phone: formattedPhone || undefined
  };

  const data = await storefront<AddressCreateResponse>(mutation, {
    customerAccessToken,
    address: input
  });

  const res = data.customerAddressCreate;
  if (res.customerUserErrors.length > 0 || !res.customerAddress) {
    const msg = res.customerUserErrors[0]?.message || 'Could not save address.';
    throw new Error(msg);
  }

  // Set as default address if requested
  if (setDefault && res.customerAddress.id) {
    try {
      const defaultMutation = `
        mutation customerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
          customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
            customer {
              id
            }
            customerUserErrors {
              code
              field
              message
            }
          }
        }
      `;
      await storefront(defaultMutation, {
        customerAccessToken,
        addressId: res.customerAddress.id
      });
    } catch (err) {
      console.warn('Could not set address as default:', err);
    }
  }

  const refreshed = await getCustomerProfile(customerAccessToken);
  return {
    address: res.customerAddress,
    customer: refreshed
  };
}

