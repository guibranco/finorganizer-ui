import { describe, it, expect, beforeAll } from "vitest";
import { formatCurrency, formatPercent, formatDate, formatMonth } from "../src/utils/format";

describe("Formatting Utilities", () => {
  // Ensure navigator exists in our environment for language settings
  beforeAll(() => {
    if (typeof global !== "undefined" && !global.navigator) {
      (global as any).navigator = { language: "en-US" };
    }
  });

  describe("formatCurrency", () => {
    it("should format EUR correctly", () => {
      const result = formatCurrency(1250.5, "EUR");
      // Intended Irish locale space representation or standard non-breaking space
      expect(result).toContain("1,250.50");
      expect(result).toContain("€");
    });

    it("should format USD correctly", () => {
      const result = formatCurrency(100, "USD");
      expect(result).toContain("100.00");
      expect(result).toContain("$");
    });

    it("should format BRL correctly", () => {
      const result = formatCurrency(50.25, "BRL");
      expect(result).toContain("50,25");
      expect(result).toContain("R$");
    });

    it("should fallback to en-US for unknown currencies", () => {
      const result = formatCurrency(10, "XYZ");
      expect(result).toContain("10.00");
      expect(result).toContain("XYZ");
    });
  });

  describe("formatPercent", () => {
    it("should add a plus sign for positive values", () => {
      expect(formatPercent(4.2)).toBe("+4.20%");
      expect(formatPercent(12.345)).toBe("+12.35%");
    });

    it("should format negative values correctly without double signs", () => {
      expect(formatPercent(-1.5)).toBe("-1.50%");
    });

    it("should handle zero correctly", () => {
      expect(formatPercent(0)).toBe("0.00%");
    });
  });

  describe("formatDate", () => {
    it("should return empty string for empty input", () => {
      expect(formatDate("")).toBe("");
    });

    it("should return original string for invalid date format", () => {
      expect(formatDate("not-a-date")).toBe("not-a-date");
    });

    it("should format valid dates correctly", () => {
      const formatted = formatDate("2026-07-15");
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe("string");
      // Since navigator.language is "en-US", check elements of formatted string
      expect(formatted).toContain("2026");
      expect(formatted).toContain("Jul");
    });

    it("should fall back to en-US if navigator is undefined", () => {
      const originalNavigator = (global as any).navigator;
      delete (global as any).navigator;

      try {
        const formatted = formatDate("2026-07-15");
        expect(formatted).toBeDefined();
        expect(formatted).toContain("2026");
        expect(formatted).toContain("Jul");
      } finally {
        (global as any).navigator = originalNavigator;
      }
    });
  });

  describe("formatMonth", () => {
    it("should return empty string for empty input", () => {
      expect(formatMonth("")).toBe("");
    });

    it("should format month-year string correctly", () => {
      const formatted = formatMonth("2026-07");
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe("string");
      expect(formatted).toContain("2026");
      expect(formatted).toContain("July");
    });

    it("should fall back to en-US if navigator is undefined", () => {
      const originalNavigator = (global as any).navigator;
      delete (global as any).navigator;

      try {
        const formatted = formatMonth("2026-07");
        expect(formatted).toBeDefined();
        expect(formatted).toContain("2026");
        expect(formatted).toContain("July");
      } finally {
        (global as any).navigator = originalNavigator;
      }
    });
  });
});
