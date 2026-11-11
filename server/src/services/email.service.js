import { sendEmail } from "../lib/email/index.js";
import { formatRupiah } from "../utils/money.js";

function orderLines(order) {
  return [
    `Nomor pesanan: ${order.orderNumber}`,
    `Total: ${formatRupiah(order.total)}`,
    `Pengiriman: ${order.shippingProvider} ${order.shippingService}`,
    `Penerima: ${order.recipientName}`,
  ].join("\n");
}

export async function sendOrderCreatedEmail(order) {
  return sendEmail({
    to: order.email,
    subject: `Pesanan ${order.orderNumber} berhasil dibuat`,
    text: `Terima kasih telah berbelanja di Stride Athletics.\n\n${orderLines(order)}\n\nSelesaikan pembayaran sebelum batas waktu berakhir.`,
  });
}

export async function sendOrderStatusEmail(order, status) {
  const copy = {
    PAID: "Pembayaran pesanan Anda telah terverifikasi.",
    SHIPPED: "Pesanan Anda sedang dalam perjalanan.",
    DELIVERED: "Pesanan Anda telah diterima.",
    CANCELLED: "Pesanan Anda telah dibatalkan.",
    EXPIRED: "Pesanan Anda kedaluwarsa sebelum dibayar.",
    FAILED: "Pembayaran pesanan Anda gagal.",
    REFUNDED: "Pesanan Anda telah direfund.",
  };

  return sendEmail({
    to: order.email,
    subject: `Status pesanan ${order.orderNumber}: ${status}`,
    text: `${copy[status] || "Status pesanan Anda diperbarui."}\n\n${orderLines(order)}`,
  });
}
