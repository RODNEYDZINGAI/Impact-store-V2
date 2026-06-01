import assert from "node:assert/strict";
import {
  checkoutFormFromCustomerAddress,
  customerAddressFromShippingAddress,
} from "../src/lib/customer-address";

const shippingAddress = {
  fullName: "Jane Customer",
  address: "123 Main Road",
  city: "Cape Town",
  province: "Western Cape",
  postalCode: "8001",
  phone: "+27 21 555 0100",
};

assert.deepEqual(customerAddressFromShippingAddress(shippingAddress), {
  street: "123 Main Road",
  city: "Cape Town",
  province: "Western Cape",
  postalCode: "8001",
  country: "South Africa",
});

assert.deepEqual(
  checkoutFormFromCustomerAddress(
    {
      street: "456 Saved Street",
      city: "Johannesburg",
      province: "Gauteng",
      postalCode: "2000",
      country: "South Africa",
    },
    "Saved Customer"
  ),
  {
    fullName: "Saved Customer",
    address: "456 Saved Street",
    city: "Johannesburg",
    province: "Gauteng",
    postalCode: "2000",
    phone: "",
  }
);

assert.deepEqual(customerAddressFromShippingAddress({ ...shippingAddress, address: "   " }), null);

console.log("customer-address tests passed");
