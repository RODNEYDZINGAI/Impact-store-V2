export interface CustomerAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface CheckoutShippingAddress {
  fullName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
}

const DEFAULT_COUNTRY = "South Africa";

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export function customerAddressFromShippingAddress(
  shippingAddress: Partial<CheckoutShippingAddress> | null | undefined
): CustomerAddress | null {
  const street = clean(shippingAddress?.address);
  const city = clean(shippingAddress?.city);
  const province = clean(shippingAddress?.province);
  const postalCode = clean(shippingAddress?.postalCode);

  if (!street || !city || !province || !postalCode) {
    return null;
  }

  return {
    street,
    city,
    province,
    postalCode,
    country: DEFAULT_COUNTRY,
  };
}

export function checkoutFormFromCustomerAddress(
  address: Partial<CustomerAddress> | null | undefined,
  fullName = ""
): CheckoutShippingAddress | null {
  const street = clean(address?.street);
  const city = clean(address?.city);
  const province = clean(address?.province);
  const postalCode = clean(address?.postalCode);

  if (!street && !city && !province && !postalCode) {
    return null;
  }

  return {
    fullName: clean(fullName),
    address: street,
    city,
    province,
    postalCode,
    phone: "",
  };
}
