function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function availableStock(inventory) {
  if (!inventory) return 0;
  return Math.max(toNumber(inventory.quantity) - toNumber(inventory.reserved), 0);
}

export function calculateDiscount({ type, value, maxDiscount = null, subtotal }) {
  const base = Math.max(0, toNumber(subtotal));

  let discount =
    type === "PERCENT"
      ? Math.floor((base * toNumber(value)) / 100)
      : toNumber(value);

  if (maxDiscount !== null && maxDiscount !== undefined) {
    discount = Math.min(discount, toNumber(maxDiscount));
  }

  return Math.max(0, Math.min(discount, base));
}

export function calculateOrderTotal({
  subtotal,
  discountTotal = 0,
  shippingCost = 0,
}) {
  return Math.max(
    0,
    toNumber(subtotal) - toNumber(discountTotal) + toNumber(shippingCost),
  );
}
