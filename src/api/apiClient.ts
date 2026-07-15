import { Account, Transaction, Category, AssetPosition, AssetEvent, Budget, SavingsGoal, RecurrenceRule, PendingRecurrence, DashboardSummary } from "./mockDb";

// Dynamic configuration loader
const getApiConfig = () => {
  const url = localStorage.getItem("finorganizer_api_url") || "";
  const key = localStorage.getItem("finorganizer_auth_key") || "";
  return { 
    url: url.trim().replace(/\/$/, ""), 
    key: key.trim() 
  };
};

export const isApiConfigured = (): boolean => {
  const { url, key } = getApiConfig();
  return !!url && !!key;
};

// Standard Fetch API Request wrapper
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { url, key } = getApiConfig();
  if (!url || !key) {
    throw new Error("API credentials are not configured.");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${key}`,
    "X-Api-Key": key,
    ...(options.headers || {}),
  };

  const response = await fetch(`${url}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      errorMessage = errJson.detail || errJson.title || JSON.stringify(errJson);
    } catch {
      // failed to parse json
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// --- BI-DIRECTIONAL TYPE MAPPERS ---

export const mapAccountTypeToBackend = (type: string): number => {
  switch (type) {
    case "Cash": return 0;
    case "Savings": return 1;
    case "Investment": return 2;
    case "CreditCard": return 3;
    default: return 4;
  }
};

export const mapAccountTypeToFrontend = (typeNum: number): string => {
  switch (typeNum) {
    case 0: return "Cash";
    case 1: return "Savings";
    case 2: return "Investment";
    case 3: return "CreditCard";
    default: return "Other";
  }
};

export const mapTransactionTypeToBackend = (type: string): number => {
  switch (type) {
    case "Income": return 0;
    case "Expense": return 1;
    case "Transfer": return 2;
    default: return 1;
  }
};

export const mapTransactionTypeToFrontend = (typeNum: number): string => {
  switch (typeNum) {
    case 0: return "Income";
    case 1: return "Expense";
    case 2: return "Transfer";
    default: return "Expense";
  }
};

export const mapAssetClassToBackend = (cl: string): number => {
  switch (cl) {
    case "Stock": return 0;
    case "ETF": return 1;
    case "Crypto": return 2;
    case "Bond": return 3;
    case "Commodity": return 4;
    case "RealEstate": return 5;
    default: return 6;
  }
};

export const mapAssetClassToFrontend = (clNum: number): string => {
  switch (clNum) {
    case 0: return "Stock";
    case 1: return "ETF";
    case 2: return "Crypto";
    case 3: return "Bond";
    case 4: return "Commodity";
    case 5: return "RealEstate";
    default: return "Other";
  }
};

export const mapAssetEventTypeToBackend = (type: string): number => {
  switch (type) {
    case "Buy": return 0;
    case "Sell": return 1;
    case "Dividend": return 2;
    case "Distribution": return 3;
    case "Split": return 4;
    default: return 5;
  }
};

export const mapAssetEventTypeToFrontend = (typeNum: number): string => {
  switch (typeNum) {
    case 0: return "Buy";
    case 1: return "Sell";
    case 2: return "Dividend";
    case 3: return "Distribution";
    case 4: return "Split";
    default: return "Merge";
  }
};

export const mapRecurrenceFrequencyToBackend = (freq: string): number => {
  switch (freq) {
    case "Weekly": return 0;
    case "Monthly": return 1;
    case "Yearly": return 2;
    default: return 3;
  }
};

export const mapRecurrenceFrequencyToFrontend = (freqNum: number): string => {
  switch (freqNum) {
    case 0: return "Weekly";
    case 1: return "Monthly";
    case 2: return "Yearly";
    default: return "Daily";
  }
};

// --- MAPPING FUNCTIONS TO FRONTEND ---

export const mapAccountToFrontend = (dto: any): Account => ({
  id: dto.id,
  name: dto.name || "",
  type: mapAccountTypeToFrontend(dto.type),
  currency: dto.currency || "EUR",
  balance: dto.currentBalance ?? dto.initialBalance ?? 0,
  isArchived: !!dto.isArchived,
});

export const mapCategoryToFrontend = (dto: any): Category => ({
  id: dto.id,
  name: dto.name || "",
  color: dto.color || "#6366f1",
  icon: dto.icon || "Tag",
});

export const mapAssetPositionToFrontend = (dto: any): AssetPosition => ({
  id: dto.assetId,
  ticker: dto.ticker || "",
  name: dto.name || "",
  assetClass: mapAssetClassToFrontend(dto.class),
  quantity: dto.quantity || 0,
  avgCost: dto.averageCost || 0,
  invested: dto.totalInvested || 0,
  currentPrice: dto.marketPrice || 0,
  marketValue: dto.marketValue || 0,
  unrealizedPl: dto.unrealizedPnL || 0,
  unrealizedPlPercent: dto.totalInvested > 0 ? (dto.unrealizedPnL / dto.totalInvested) * 100 : 0,
  incomeReceived: dto.incomeReceived || 0,
});

export const mapAssetEventToFrontend = (dto: any): AssetEvent => ({
  id: dto.id,
  assetId: dto.assetId,
  date: dto.date,
  type: mapAssetEventTypeToFrontend(dto.type),
  quantity: dto.quantity || 0,
  price: dto.unitPrice || 0,
  amount: dto.quantity * dto.unitPrice,
});

export const mapSavingsGoalToFrontend = (dto: any): SavingsGoal => ({
  id: dto.id,
  name: dto.name || "",
  targetAmount: dto.targetAmount || 0,
  currentAmount: dto.currentAmount || 0,
  targetDate: dto.targetDate || "",
});

export const mapRecurrenceRuleToFrontend = (dto: any): RecurrenceRule => ({
  id: dto.id,
  description: dto.name || "",
  amount: dto.amount || 0,
  type: mapTransactionTypeToFrontend(dto.type),
  frequency: mapRecurrenceFrequencyToFrontend(dto.frequency),
  nextDueDate: dto.nextDueDate || "",
  autoPost: !!dto.autoPost,
});
