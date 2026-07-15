import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  mapAccountTypeToBackend,
  mapAccountTypeToFrontend,
  mapTransactionTypeToBackend,
  mapTransactionTypeToFrontend,
  mapAssetClassToBackend,
  mapAssetClassToFrontend,
  mapAssetEventTypeToBackend,
  mapAssetEventTypeToFrontend,
  mapRecurrenceFrequencyToBackend,
  mapRecurrenceFrequencyToFrontend,
  mapAccountToFrontend,
  mapCategoryToFrontend,
  mapAssetPositionToFrontend,
  mapAssetEventToFrontend,
  mapSavingsGoalToFrontend,
  mapRecurrenceRuleToFrontend,
  isApiConfigured,
  apiRequest,
} from "../src/api/apiClient";

describe("API Client Mappers", () => {
  describe("Account Type Mappers", () => {
    it("should map account types to backend integers correctly", () => {
      expect(mapAccountTypeToBackend("Cash")).toBe(0);
      expect(mapAccountTypeToBackend("Savings")).toBe(1);
      expect(mapAccountTypeToBackend("Investment")).toBe(2);
      expect(mapAccountTypeToBackend("CreditCard")).toBe(3);
      expect(mapAccountTypeToBackend("Other")).toBe(4);
      expect(mapAccountTypeToBackend("InvalidType")).toBe(4);
    });

    it("should map backend integers to frontend account types correctly", () => {
      expect(mapAccountTypeToFrontend(0)).toBe("Cash");
      expect(mapAccountTypeToFrontend(1)).toBe("Savings");
      expect(mapAccountTypeToFrontend(2)).toBe("Investment");
      expect(mapAccountTypeToFrontend(3)).toBe("CreditCard");
      expect(mapAccountTypeToFrontend(4)).toBe("Other");
      expect(mapAccountTypeToFrontend(99)).toBe("Other");
    });
  });

  describe("Transaction Type Mappers", () => {
    it("should map transaction types to backend integers correctly", () => {
      expect(mapTransactionTypeToBackend("Income")).toBe(0);
      expect(mapTransactionTypeToBackend("Expense")).toBe(1);
      expect(mapTransactionTypeToBackend("Transfer")).toBe(2);
      expect(mapTransactionTypeToBackend("Invalid")).toBe(1);
    });

    it("should map backend integers to frontend transaction types correctly", () => {
      expect(mapTransactionTypeToFrontend(0)).toBe("Income");
      expect(mapTransactionTypeToFrontend(1)).toBe("Expense");
      expect(mapTransactionTypeToFrontend(2)).toBe("Transfer");
      expect(mapTransactionTypeToFrontend(99)).toBe("Expense");
    });
  });

  describe("Asset Class Mappers", () => {
    it("should map asset classes to backend integers correctly", () => {
      expect(mapAssetClassToBackend("Stock")).toBe(0);
      expect(mapAssetClassToBackend("ETF")).toBe(1);
      expect(mapAssetClassToBackend("Crypto")).toBe(2);
      expect(mapAssetClassToBackend("Bond")).toBe(3);
      expect(mapAssetClassToBackend("Commodity")).toBe(4);
      expect(mapAssetClassToBackend("RealEstate")).toBe(5);
      expect(mapAssetClassToBackend("Other")).toBe(6);
      expect(mapAssetClassToBackend("Invalid")).toBe(6);
    });

    it("should map backend integers to frontend asset classes correctly", () => {
      expect(mapAssetClassToFrontend(0)).toBe("Stock");
      expect(mapAssetClassToFrontend(1)).toBe("ETF");
      expect(mapAssetClassToFrontend(2)).toBe("Crypto");
      expect(mapAssetClassToFrontend(3)).toBe("Bond");
      expect(mapAssetClassToFrontend(4)).toBe("Commodity");
      expect(mapAssetClassToFrontend(5)).toBe("RealEstate");
      expect(mapAssetClassToFrontend(6)).toBe("Other");
      expect(mapAssetClassToFrontend(99)).toBe("Other");
    });
  });

  describe("Asset Event Type Mappers", () => {
    it("should map asset event types to backend integers correctly", () => {
      expect(mapAssetEventTypeToBackend("Buy")).toBe(0);
      expect(mapAssetEventTypeToBackend("Sell")).toBe(1);
      expect(mapAssetEventTypeToBackend("Dividend")).toBe(2);
      expect(mapAssetEventTypeToBackend("Distribution")).toBe(3);
      expect(mapAssetEventTypeToBackend("Split")).toBe(4);
      expect(mapAssetEventTypeToBackend("Other")).toBe(5);
      expect(mapAssetEventTypeToBackend("Invalid")).toBe(5);
    });

    it("should map backend integers to frontend asset event types correctly", () => {
      expect(mapAssetEventTypeToFrontend(0)).toBe("Buy");
      expect(mapAssetEventTypeToFrontend(1)).toBe("Sell");
      expect(mapAssetEventTypeToFrontend(2)).toBe("Dividend");
      expect(mapAssetEventTypeToFrontend(3)).toBe("Distribution");
      expect(mapAssetEventTypeToFrontend(4)).toBe("Split");
      expect(mapAssetEventTypeToFrontend(5)).toBe("Merge");
      expect(mapAssetEventTypeToFrontend(99)).toBe("Merge");
    });
  });

  describe("Recurrence Frequency Mappers", () => {
    it("should map frequencies to backend integers correctly", () => {
      expect(mapRecurrenceFrequencyToBackend("Weekly")).toBe(0);
      expect(mapRecurrenceFrequencyToBackend("Monthly")).toBe(1);
      expect(mapRecurrenceFrequencyToBackend("Yearly")).toBe(2);
      expect(mapRecurrenceFrequencyToBackend("Daily")).toBe(3);
      expect(mapRecurrenceFrequencyToBackend("Invalid")).toBe(3);
    });

    it("should map backend integers to frontend frequencies correctly", () => {
      expect(mapRecurrenceFrequencyToFrontend(0)).toBe("Weekly");
      expect(mapRecurrenceFrequencyToFrontend(1)).toBe("Monthly");
      expect(mapRecurrenceFrequencyToFrontend(2)).toBe("Yearly");
      expect(mapRecurrenceFrequencyToFrontend(3)).toBe("Daily");
      expect(mapRecurrenceFrequencyToFrontend(99)).toBe("Daily");
    });
  });

  describe("Data Transfer Object (DTO) Frontend Mappers", () => {
    it("should map account DTO to frontend model correctly", () => {
      const dto = {
        id: "acc-123",
        name: "Joint Savings",
        type: 1, // Savings
        currency: "USD",
        currentBalance: 5430.2,
        isArchived: true,
      };
      const result = mapAccountToFrontend(dto);
      expect(result).toEqual({
        id: "acc-123",
        name: "Joint Savings",
        type: "Savings",
        currency: "USD",
        balance: 5430.2,
        isArchived: true,
      });
    });

    it("should fallback to initialBalance or zero if currentBalance is not specified", () => {
      const dto = { id: "acc-456", name: "Empty", type: 0, currency: "EUR" };
      expect(mapAccountToFrontend(dto).balance).toBe(0);

      const dtoWithInitial = { id: "acc-789", name: "Initial", type: 0, currency: "EUR", initialBalance: 120 };
      expect(mapAccountToFrontend(dtoWithInitial).balance).toBe(120);
    });

    it("should map category DTO to frontend model correctly", () => {
      const dto = {
        id: "cat-1",
        name: "Groceries",
        color: "#10b981",
        icon: "ShoppingBag",
      };
      const result = mapCategoryToFrontend(dto);
      expect(result).toEqual({
        id: "cat-1",
        name: "Groceries",
        color: "#10b981",
        icon: "ShoppingBag",
      });
    });

    it("should map asset position DTO to frontend model correctly", () => {
      const dto = {
        assetId: "asset-btc",
        ticker: "BTC",
        name: "Bitcoin",
        class: 2, // Crypto
        quantity: 0.25,
        averageCost: 35000,
        totalInvested: 8750,
        marketPrice: 60000,
        marketValue: 15000,
        unrealizedPnL: 6250,
        incomeReceived: 0,
      };
      const result = mapAssetPositionToFrontend(dto);
      expect(result).toEqual({
        id: "asset-btc",
        ticker: "BTC",
        name: "Bitcoin",
        assetClass: "Crypto",
        quantity: 0.25,
        avgCost: 35000,
        invested: 8750,
        currentPrice: 60000,
        marketValue: 15000,
        unrealizedPl: 6250,
        unrealizedPlPercent: (6250 / 8750) * 100,
        incomeReceived: 0,
      });
    });

    it("should handle totalInvested zero or missing gracefully", () => {
      const dto = {
        assetId: "asset-zero",
        class: 0,
        totalInvested: 0,
        unrealizedPnL: 0,
      };
      const result = mapAssetPositionToFrontend(dto);
      expect(result.unrealizedPlPercent).toBe(0);
    });

    it("should map asset event DTO to frontend model correctly", () => {
      const dto = {
        id: "evt-123",
        assetId: "asset-apple",
        date: "2026-07-15",
        type: 0, // Buy
        quantity: 5,
        unitPrice: 150,
      };
      const result = mapAssetEventToFrontend(dto);
      expect(result).toEqual({
        id: "evt-123",
        assetId: "asset-apple",
        date: "2026-07-15",
        type: "Buy",
        quantity: 5,
        price: 150,
        amount: 750,
      });
    });

    it("should map savings goal DTO to frontend model correctly", () => {
      const dto = {
        id: "goal-1",
        name: "Tesla Roadster",
        targetAmount: 200000,
        currentAmount: 15000,
        targetDate: "2030-12-31",
      };
      const result = mapSavingsGoalToFrontend(dto);
      expect(result).toEqual({
        id: "goal-1",
        name: "Tesla Roadster",
        targetAmount: 200000,
        currentAmount: 15000,
        targetDate: "2030-12-31",
      });
    });

    it("should map recurrence rule DTO to frontend model correctly", () => {
      const dto = {
        id: "rec-123",
        name: "Gym Membership",
        amount: 45,
        type: 1, // Expense
        frequency: 1, // Monthly
        nextDueDate: "2026-08-01",
        autoPost: true,
      };
      const result = mapRecurrenceRuleToFrontend(dto);
      expect(result).toEqual({
        id: "rec-123",
        description: "Gym Membership",
        amount: 45,
        type: "Expense",
        frequency: "Monthly",
        nextDueDate: "2026-08-01",
        autoPost: true,
      });
    });
  });

  describe("API Client Configurations and Request wrapper", () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
      localStorage.clear();
      global.fetch = vi.fn();
    });

    afterEach(() => {
      global.fetch = originalFetch;
      localStorage.clear();
      vi.restoreAllMocks();
    });

    it("should return false for isApiConfigured when local storage is empty", () => {
      expect(isApiConfigured()).toBe(false);
    });

    it("should return true for isApiConfigured when local storage has url and key", () => {
      localStorage.setItem("finorganizer_api_url", "https://api.test.com/");
      localStorage.setItem("finorganizer_auth_key", "secret-key");
      expect(isApiConfigured()).toBe(true);
    });

    it("should throw error in apiRequest when not configured", async () => {
      await expect(apiRequest("/api/v1/test")).rejects.toThrow("API credentials are not configured.");
    });

    it("should fetch successfully and parse json data", async () => {
      localStorage.setItem("finorganizer_api_url", "https://api.test.com/");
      localStorage.setItem("finorganizer_auth_key", "secret-key");

      const mockData = { status: "ok" };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const res = await apiRequest<any>("/api/v1/health");
      expect(global.fetch).toHaveBeenCalledWith("https://api.test.com/api/v1/health", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer secret-key",
          "X-Api-Key": "secret-key",
        },
      });
      expect(res).toEqual(mockData);
    });

    it("should return empty object on 204 No Content status", async () => {
      localStorage.setItem("finorganizer_api_url", "https://api.test.com");
      localStorage.setItem("finorganizer_auth_key", "secret-key");

      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 204,
      });

      const res = await apiRequest<any>("/api/v1/delete");
      expect(res).toEqual({});
    });

    it("should handle error with structured detail or title error message", async () => {
      localStorage.setItem("finorganizer_api_url", "https://api.test.com");
      localStorage.setItem("finorganizer_auth_key", "secret-key");

      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({ detail: "Invalid UUID format" }),
      });

      await expect(apiRequest("/api/v1/invalid")).rejects.toThrow("Invalid UUID format");
    });

    it("should handle error fallback to statusText if json fails to parse", async () => {
      localStorage.setItem("finorganizer_api_url", "https://api.test.com");
      localStorage.setItem("finorganizer_auth_key", "secret-key");

      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => { throw new Error("JSON Parse Error"); },
      });

      await expect(apiRequest("/api/v1/error")).rejects.toThrow("HTTP Error 500: Internal Server Error");
    });
  });
});
