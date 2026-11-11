import midtransClient from "midtrans-client";
import { env } from "../../config/env.js";
import { verifyMidtransSignature } from "../../utils/midtransSignature.js";

function buildSnap() {
  return new midtransClient.Snap({
    isProduction: env.MIDTRANS_IS_PRODUCTION,
    serverKey: env.MIDTRANS_SERVER_KEY,
    clientKey: env.MIDTRANS_CLIENT_KEY,
  });
}

function itemName(value) {
  return String(value).slice(0, 50);
}

export const midtransPaymentProvider = {
  id: "midtrans",
  label: "Midtrans Snap",

  async createSnapTransaction({ order, items, customer }) {
    const snap = buildSnap();

    const itemDetails = items.map((item) => ({
      id: String(item.sku).slice(0, 50),
      price: item.unitPrice,
      quantity: item.quantity,
      name: itemName(`${item.productName} ${item.size} ${item.color}`),
    }));

    if (order.shippingCost > 0) {
      itemDetails.push({
        id: "SHIPPING",
        price: order.shippingCost,
        quantity: 1,
        name: itemName(
          `Ongkir ${order.shippingProvider || ""} ${order.shippingService || ""}`,
        ),
      });
    }

    if (order.discountTotal > 0) {
      itemDetails.push({
        id: "DISCOUNT",
        price: -order.discountTotal,
        quantity: 1,
        name: "Diskon voucher",
      });
    }

    const payload = {
      transaction_details: {
        order_id: order.orderNumber,
        gross_amount: order.total,
      },
      item_details: itemDetails,
      customer_details: customer,
      callbacks: {
        finish: `${env.corsOrigins[0]}/pesanan/${order.orderNumber}/sukses`,
        pending: `${env.corsOrigins[0]}/pesanan/${order.orderNumber}/pending`,
        error: `${env.corsOrigins[0]}/pesanan/${order.orderNumber}/gagal`,
      },
      expiry: {
        unit: "hours",
        duration: Math.max(
          1,
          Math.ceil((new Date(order.expiresAt).getTime() - Date.now()) / 3600000),
        ),
      },
    };

    const transaction = await snap.createTransaction(payload);
    return {
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      raw: JSON.stringify(transaction),
    };
  },

  verifySignature(payload) {
    return verifyMidtransSignature(payload, env.MIDTRANS_SERVER_KEY);
  },

  async getTransactionStatus(orderNumber) {
    const snap = buildSnap();
    return snap.transaction.status(orderNumber);
  },
};
