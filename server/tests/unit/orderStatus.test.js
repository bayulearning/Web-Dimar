import { describe, expect, it } from "vitest";
import {
  allowedOrderTransitions,
  canTransitionOrderStatus,
} from "../../src/utils/orderStatus.js";

describe("order status transition", () => {
  it("mengizinkan transisi utama", () => {
    expect(canTransitionOrderStatus("PENDING_PAYMENT", "PAID")).toBe(true);
    expect(canTransitionOrderStatus("PAID", "PROCESSING")).toBe(true);
    expect(canTransitionOrderStatus("PROCESSING", "SHIPPED")).toBe(true);
    expect(canTransitionOrderStatus("SHIPPED", "DELIVERED")).toBe(true);
    expect(canTransitionOrderStatus("DELIVERED", "REFUNDED")).toBe(true);
  });

  it("menolak lompatan status", () => {
    expect(canTransitionOrderStatus("PENDING_PAYMENT", "SHIPPED")).toBe(false);
    expect(canTransitionOrderStatus("PAID", "DELIVERED")).toBe(false);
    expect(canTransitionOrderStatus("SHIPPED", "CANCELLED")).toBe(false);
  });

  it("menolak status yang sama", () => {
    expect(canTransitionOrderStatus("PAID", "PAID")).toBe(false);
  });

  it("mengembalikan daftar kosong untuk status terminal tidak dikenal", () => {
    expect(allowedOrderTransitions("CANCELLED")).toEqual([]);
    expect(allowedOrderTransitions("TIDAK_ADA")).toEqual([]);
  });
});
