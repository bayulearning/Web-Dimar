import { describe, expect, it } from "vitest";
import { formatRupiah } from "../../src/utils/money.js";

describe("formatRupiah", () => {
  it("memformat angka sebagai rupiah tanpa desimal", () => {
    const formatted = formatRupiah(1_499_000);
    expect(formatted).toContain("1.499.000");
    expect(formatted).not.toContain(",00");
  });

  it("mengembalikan tanda hubung untuk nilai tidak valid", () => {
    expect(formatRupiah(null)).toBe("-");
    expect(formatRupiah(undefined)).toBe("-");
    expect(formatRupiah("bukan-angka")).toBe("-");
  });
});
