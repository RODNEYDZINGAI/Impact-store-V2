import type { IRefundOrderSnapshot } from "@/models/RefundCase";

export type RefundStatus = "open" | "resolved" | "denied";

const VALID_TRANSITIONS: Record<RefundStatus, RefundStatus[]> = {
  open: ["resolved", "denied"],
  resolved: [],
  denied: ["open"],
};

export function isValidRefundStatusTransition(
  from: RefundStatus,
  to: RefundStatus
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function buildOrderSnapshot(order: {
  total: number;
  subtotal: number;
  discount: number;
  items: Array<{
    name: string;
    sku?: string;
    price: number;
    quantity: number;
    image?: string;
    variantTitle?: string;
  }>;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    phone: string;
  };
  status: string;
  paymentStatus: string;
  paymentId?: string;
  couponCode?: string;
  createdAt: Date;
}): IRefundOrderSnapshot {
  return {
    total: order.total,
    subtotal: order.subtotal,
    discount: order.discount,
    items: order.items.map((item) => ({
      name: item.name,
      sku: item.sku,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      variantTitle: item.variantTitle,
    })),
    shippingAddress: { ...order.shippingAddress },
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentId: order.paymentId,
    couponCode: order.couponCode,
    orderCreatedAt: order.createdAt,
  };
}
