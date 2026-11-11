import { describe, expect, it } from "vitest";
import {
  estimateArrival,
  findShippingService,
  listShippingServices,
} from "../../src/lib/shipping/mock.provider.js";

describe("shipping mock provider", () => {
  it("menyediakan layanan JNE, J&T, dan SiCepat", () => {
    const providers = new Set(
      listShippingServices().map((service) => service.provider),
    );
    expect(providers).toEqual(new Set(["JNE", "J&T", "SiCepat"]));
  });

  it("mencari layanan tanpa membedakan huruf besar/kecil", () => {
    expect(findShippingService("jne", "reg")).toMatchObject({
      provider: "JNE",
      service: "REG",
      cost: 18_000,
    });
  });

  it("menolak layanan yang tidak tersedia", () => {
    expect(findShippingService("JNE", "SAME_DAY")).toBeNull();
    expect(findShippingService("KURIR", "REG")).toBeNull();
  });

  it("menandai tarif sebagai mock", () => {
    expect(listShippingServices().every((service) => service.isMock)).toBe(true);
  });

  it("menghitung estimasi tiba dari jumlah hari", () => {
    const before = Date.now();
    const arrival = estimateArrival(2);
    const diff = arrival.getTime() - before;
    expect(diff).toBeGreaterThanOrEqual(2 * 24 * 60 * 60 * 1000);
    expect(diff).toBeLessThan(2 * 24 * 60 * 60 * 1000 + 5000);
  });
});
