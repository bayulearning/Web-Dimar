import { describe, expect, it } from "vitest";
import {
  availableStock,
  calculateDiscount,
  calculateOrderTotal,
} from "../../src/utils/pricing.js";

describe("availableStock", () => {
  it("mengurangi stok dengan reservasi", () => {
    expect(availableStock({ quantity: 10, reserved: 3 })).toBe(7);
  });

  it("tidak pernah negatif", () => {
    expect(availableStock({ quantity: 2, reserved: 5 })).toBe(0);
  });

  it("mengembalikan 0 saat inventory tidak ada", () => {
    expect(availableStock(null)).toBe(0);
    expect(availableStock(undefined)).toBe(0);
  });
});

describe("calculateDiscount", () => {
  it("menghitung diskon persen dan membulatkan ke bawah", () => {
    expect(
      calculateDiscount({ type: "PERCENT", value: 10, subtotal: 1_999_000 }),
    ).toBe(199_900);
  });

  it("membatasi diskon persen dengan maxDiscount", () => {
    expect(
      calculateDiscount({
        type: "PERCENT",
        value: 20,
        maxDiscount: 300_000,
        subtotal: 3_000_000,
      }),
    ).toBe(300_000);
  });

  it("mendukung diskon nominal", () => {
    expect(
      calculateDiscount({ type: "FIXED", value: 150_000, subtotal: 1_000_000 }),
    ).toBe(150_000);
  });

  it("tidak melebihi subtotal dan tidak negatif", () => {
    expect(
      calculateDiscount({ type: "FIXED", value: 2_000_000, subtotal: 1_500_000 }),
    ).toBe(1_500_000);
    expect(
      calculateDiscount({ type: "FIXED", value: -50_000, subtotal: 1_500_000 }),
    ).toBe(0);
  });

  it("menangani input tidak valid tanpa NaN", () => {
    expect(
      calculateDiscount({ type: "PERCENT", value: "abc", subtotal: 100_000 }),
    ).toBe(0);
  });
});

describe("calculateOrderTotal", () => {
  it("menghitung subtotal - diskon + ongkir", () => {
    expect(
      calculateOrderTotal({
        subtotal: 1_000_000,
        discountTotal: 100_000,
        shippingCost: 18_000,
      }),
    ).toBe(918_000);
  });

  it("tidak pernah negatif", () => {
    expect(
      calculateOrderTotal({
        subtotal: 10_000,
        discountTotal: 50_000,
        shippingCost: 0,
      }),
    ).toBe(0);
  });
});
