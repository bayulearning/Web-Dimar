import { describe, expect, it } from "vitest";
import { cartItemSchema } from "../../src/validators/cart.validator.js";
import {
  createOrderSchema,
  orderListQuerySchema,
} from "../../src/validators/order.validator.js";

describe("validasi cart", () => {
  it("menerima quantity 1 sampai 10", () => {
    expect(cartItemSchema.safeParse({ variantId: 1, quantity: 1 }).success).toBe(
      true,
    );
    expect(
      cartItemSchema.safeParse({ variantId: 1, quantity: 10 }).success,
    ).toBe(true);
  });

  it("menolak ukuran/varian tidak valid dan quantity di luar batas", () => {
    expect(cartItemSchema.safeParse({ variantId: 0, quantity: 1 }).success).toBe(
      false,
    );
    expect(cartItemSchema.safeParse({ variantId: 1, quantity: 0 }).success).toBe(
      false,
    );
    expect(
      cartItemSchema.safeParse({ variantId: 1, quantity: 11 }).success,
    ).toBe(false);
  });
});

describe("validasi order", () => {
  it("mengubah kode voucher menjadi huruf besar", () => {
    const parsed = createOrderSchema.parse({
      addressId: 1,
      shippingProvider: "JNE",
      shippingService: "REG",
      couponCode: "stride10",
    });
    expect(parsed.couponCode).toBe("STRIDE10");
  });

  it("menolak status pesanan tidak dikenal", () => {
    expect(
      orderListQuerySchema.safeParse({ status: "STATUS_PALSU" }).success,
    ).toBe(false);
  });

  it("membatasi limit pagination", () => {
    expect(orderListQuerySchema.safeParse({ limit: 51 }).success).toBe(false);
    expect(orderListQuerySchema.safeParse({ limit: 50 }).success).toBe(true);
  });
});
