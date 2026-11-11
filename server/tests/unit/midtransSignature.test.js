import { describe, expect, it } from "vitest";
import {
  computeMidtransSignature,
  verifyMidtransSignature,
} from "../../src/utils/midtransSignature.js";

const payload = {
  order_id: "STR-TEST-1",
  status_code: "200",
  gross_amount: "10000",
  signature_key:
    "fdebb50315d7a107768e0c3b6221f7194ea813afe15ecdcbce155e2d7eecfc036c7c519d083265e6a4d9fb50770833c48851dd3c2cd25d1ba74476cf98d5f7b1",
};

describe("Midtrans signature", () => {
  it("menghitung SHA-512 sesuai dokumentasi Midtrans", () => {
    expect(
      computeMidtransSignature(
        { orderId: "STR-TEST-1", statusCode: "200", grossAmount: "10000" },
        "server-key",
      ),
    ).toBe(payload.signature_key);
  });

  it("menerima signature valid", () => {
    expect(verifyMidtransSignature(payload, "server-key")).toBe(true);
  });

  it("menolak signature dengan server key salah", () => {
    expect(verifyMidtransSignature(payload, "server-key-lain")).toBe(false);
  });

  it("menolak signature kosong atau panjang berbeda", () => {
    expect(verifyMidtransSignature({ ...payload, signature_key: "" }, "server-key")).toBe(
      false,
    );
    expect(
      verifyMidtransSignature({ ...payload, signature_key: "abc" }, "server-key"),
    ).toBe(false);
  });
});
