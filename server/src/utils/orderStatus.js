export const ORDER_TRANSITIONS = {
  PENDING_PAYMENT: ["PAID", "CANCELLED", "EXPIRED"],
  PAID: ["PROCESSING", "CANCELLED", "REFUNDED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["REFUNDED"],
};

export function allowedOrderTransitions(status) {
  return ORDER_TRANSITIONS[status] ?? [];
}

export function canTransitionOrderStatus(fromStatus, toStatus) {
  return allowedOrderTransitions(fromStatus).includes(toStatus);
}
