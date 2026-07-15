import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MockDb } from "./mockDb";
import { 
  CreateAccountDto, UpdateAccountDto, CreateTransactionDto, UpdateTransactionDto,
  CategoryDto, CreateAssetEventDto, CreateRecurrenceRuleDto, SavingsGoalDto,
  PassiveIncomeItem
} from "./mockDb";
import {
  isApiConfigured,
  apiRequest,
  mapAccountToFrontend,
  mapAccountTypeToBackend,
  mapTransactionTypeToBackend,
  mapTransactionTypeToFrontend,
  mapCategoryToFrontend,
  mapAssetClassToBackend,
  mapAssetClassToFrontend,
  mapAssetEventTypeToBackend,
  mapAssetEventTypeToFrontend,
  mapAssetPositionToFrontend,
  mapAssetEventToFrontend,
  mapSavingsGoalToFrontend,
  mapRecurrenceFrequencyToBackend,
  mapRecurrenceFrequencyToFrontend,
  mapRecurrenceRuleToFrontend,
} from "./apiClient";

// Query Keys
export const queryKeys = {
  dashboardSummary: ["dashboardSummary"],
  accounts: ["accounts"],
  accountHistory: (id: string) => ["accountHistory", id],
  transactions: (filters: any) => ["transactions", filters],
  categories: ["categories"],
  portfolioPositions: (assetClass?: string) => ["portfolioPositions", { assetClass }],
  assetDetail: (id: string) => ["assetDetail", id],
  passiveIncome: ["passiveIncome"],
  budgets: (month?: string) => ["budgets", { month }],
  savingsGoals: ["savingsGoals"],
  cashFlowProjection: (horizon: number) => ["cashFlowProjection", { horizon }],
  recurrenceRules: ["recurrenceRules"],
  pendingRecurrences: ["pendingRecurrences"],
};

// --- DASHBOARD ---
export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboardSummary,
    queryFn: async () => {
      if (isApiConfigured()) {
        try {
          const [netWorthData, allocationData, incomeVsExpenseData, passiveIncomeData, topCategoriesData] = await Promise.all([
            apiRequest<any[]>("/api/v1/dashboard/net-worth?months=12"),
            apiRequest<any>("/api/v1/dashboard/allocation"),
            apiRequest<any[]>("/api/v1/dashboard/income-vs-expense?months=12"),
            apiRequest<any>("/api/v1/dashboard/passive-income?months=12"),
            apiRequest<any[]>(`/api/v1/dashboard/top-expense-categories?from=2026-07-01&to=2026-07-31&top=5`).catch(() => []),
          ]);

          let netWorthHistory: any[] = [];
          let cashBalance = 0;
          let investedAmount = 0;
          let netWorth = 0;

          if (netWorthData && netWorthData.length > 0) {
            netWorthHistory = netWorthData.map(pt => ({
              month: pt.month.substring(0, 7),
              amount: pt.netWorth || 0,
            }));
            const latest = netWorthData[netWorthData.length - 1];
            cashBalance = latest.accountsBalance || 0;
            investedAmount = latest.portfolioValue || 0;
            netWorth = latest.netWorth || 0;
          }

          let incomeVsExpenses: any[] = [];
          let thisMonthIncome = 0;
          let thisMonthExpense = 0;
          let thisMonthNet = 0;

          if (incomeVsExpenseData && incomeVsExpenseData.length > 0) {
            incomeVsExpenses = incomeVsExpenseData.map(item => ({
              month: item.month.substring(0, 7),
              income: item.income || 0,
              expenses: item.expense || 0,
              net: item.net || 0,
            }));
            const currentMonthStr = new Date().toISOString().substring(0, 7);
            const current = incomeVsExpenseData.find(item => item.month.startsWith(currentMonthStr)) || incomeVsExpenseData[incomeVsExpenseData.length - 1];
            if (current) {
              thisMonthIncome = current.income || 0;
              thisMonthExpense = current.expense || 0;
              thisMonthNet = current.net || 0;
            }
          }

          let passiveIncomeTrend: any[] = [];
          let trailing12MonthPassiveIncome = 0;
          if (passiveIncomeData) {
            const months = passiveIncomeData.months || [];
            passiveIncomeTrend = months.map((m: any) => ({
              month: m.month.substring(0, 7),
              amount: m.amount || 0,
            }));
            trailing12MonthPassiveIncome = passiveIncomeData.trailingTwelveMonthTotal || 0;
          }

          let allocationByAssetClass: any[] = [];
          let allocationByAccount: any[] = [];
          if (allocationData) {
            const classes = allocationData.byAssetClass || [];
            allocationByAssetClass = classes.map((c: any) => ({
              name: mapAssetClassToFrontend(c.class),
              value: c.marketValue || 0,
            }));

            const accs = allocationData.byAccount || [];
            allocationByAccount = accs.map((a: any) => ({
              name: a.accountName || "Account",
              value: a.balance || 0,
            }));
          }

          let topExpenseCategories: any[] = [];
          if (topCategoriesData && topCategoriesData.length > 0) {
            topExpenseCategories = topCategoriesData.map(c => ({
              category: c.categoryName || "Other",
              amount: c.amount || 0,
              percent: c.percent || 0,
            }));
          }

          return {
            cashBalance,
            investedAmount,
            netWorth,
            thisMonthIncome,
            thisMonthExpense,
            thisMonthNet,
            netWorthHistory,
            incomeVsExpenses,
            passiveIncomeTrend,
            trailing12MonthPassiveIncome,
            allocationByAssetClass,
            allocationByAccount,
            topExpenseCategories,
          };
        } catch (error) {
          console.error("Failed to load backend dashboard, falling back to mock", error);
          return MockDb.getDashboardSummary();
        }
      }
      return MockDb.getDashboardSummary();
    },
  });
}

// --- ACCOUNTS ---
export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: async () => {
      if (isApiConfigured()) {
        try {
          const res = await apiRequest<any[]>("/api/v1/accounts?includeArchived=true");
          return res.map(mapAccountToFrontend);
        } catch (e) {
          console.error("Backend accounts fetch error, using MockDb", e);
          return MockDb.getAccounts();
        }
      }
      return MockDb.getAccounts();
    },
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateAccountDto) => {
      if (isApiConfigured()) {
        const body = {
          name: dto.name,
          type: mapAccountTypeToBackend(dto.type),
          currency: dto.currency,
          initialBalance: dto.initialBalance || 0,
        };
        const res = await apiRequest<any>("/api/v1/accounts", {
          method: "POST",
          body: JSON.stringify(body),
        });
        return mapAccountToFrontend(res);
      }
      return MockDb.createAccount(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateAccountDto }) => {
      if (isApiConfigured()) {
        const body = {
          name: dto.name,
          type: mapAccountTypeToBackend(dto.type),
          currency: dto.currency,
          isArchived: dto.isArchived ?? false,
        };
        const res = await apiRequest<any>(`/api/v1/accounts/${id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        return mapAccountToFrontend(res);
      }
      return MockDb.updateAccount(id, dto);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: queryKeys.accountHistory(variables.id) });
    },
  });
}

export function useArchiveAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isApiConfigured()) {
        await apiRequest(`/api/v1/accounts/${id}`, {
          method: "DELETE",
        });
        return;
      }
      MockDb.archiveAccount(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary });
    },
  });
}

export function useAccountHistory(id: string) {
  return useQuery({
    queryKey: queryKeys.accountHistory(id),
    queryFn: async () => {
      if (isApiConfigured()) {
        try {
          // Reconstruct account history using real transaction feed
          const [txsResult, accs] = await Promise.all([
            apiRequest<any>(`/api/v1/transactions?accountId=${id}&pageSize=1000`),
            apiRequest<any[]>("/api/v1/accounts?includeArchived=true"),
          ]);
          
          const acc = accs.find(a => a.id === id);
          let currentBal = acc ? (acc.currentBalance ?? acc.initialBalance ?? 0) : 0;
          const history = [{ date: new Date().toISOString().split("T")[0], balance: currentBal }];
          
          const rawTxs = txsResult.items || [];
          const sortedTxs = [...rawTxs].sort((a, b) => b.date.localeCompare(a.date));
          sortedTxs.forEach((t: any) => {
            const isToThisAccount = t.counterpartyAccountId === id;
            const txType = mapTransactionTypeToFrontend(t.type);
            
            if (txType === "Income") {
              currentBal -= t.amount;
            } else if (txType === "Expense") {
              currentBal += t.amount;
            } else if (txType === "Transfer") {
              if (isToThisAccount) {
                currentBal -= t.amount;
              } else {
                currentBal += t.amount;
              }
            }
            history.push({ date: t.date, balance: currentBal });
          });

          return history.reverse();
        } catch (e) {
          console.error("Backend account history fetch failed, falling back to mock", e);
        }
      }

      const txs = MockDb.getTransactions().filter(t => t.accountId === id);
      const acc = MockDb.getAccounts().find(a => a.id === id);
      const currency = acc?.currency || "EUR";
      
      let currentBal = acc?.balance || 0;
      const history = [{ date: new Date().toISOString().split("T")[0], balance: currentBal }];
      
      const sortedTxs = [...txs].sort((a, b) => b.date.localeCompare(a.date));
      sortedTxs.forEach(t => {
        if (t.type === "Income") {
          currentBal -= t.amount;
        } else if (t.type === "Expense") {
          currentBal += t.amount;
        } else if (t.type === "Transfer") {
          currentBal += t.amount;
        }
        history.push({ date: t.date, balance: currentBal });
      });

      return history.reverse();
    },
    enabled: !!id,
  });
}

// --- TRANSACTIONS ---
export function useTransactions(filters: {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  category?: string;
  type?: string;
  search?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  return useQuery({
    queryKey: queryKeys.transactions(filters),
    queryFn: async () => {
      if (isApiConfigured()) {
        try {
          const [accs, cats] = await Promise.all([
            apiRequest<any[]>("/api/v1/accounts?includeArchived=true"),
            apiRequest<any[]>("/api/v1/categories"),
          ]);
          const accountMap = new Map(accs.map(a => [a.id, a.name]));
          const categoryMap = new Map(cats.map(c => [c.id, c.name]));

          const params = new URLSearchParams();
          if (filters.accountId) params.append("accountId", filters.accountId);
          if (filters.category) {
            const catObj = cats.find(c => c.name.toLowerCase() === filters.category!.toLowerCase());
            if (catObj) params.append("categoryId", catObj.id);
          }
          if (filters.type) {
            params.append("type", mapTransactionTypeToBackend(filters.type).toString());
          }
          if (filters.startDate) params.append("dateFrom", filters.startDate);
          if (filters.endDate) params.append("dateTo", filters.endDate);
          if (filters.search) params.append("search", filters.search);
          
          params.append("page", (filters.page || 1).toString());
          params.append("pageSize", (filters.pageSize || 15).toString());

          const pagedResult = await apiRequest<any>(`/api/v1/transactions?${params.toString()}`);

          const items = (pagedResult.items || []).map((t: any) => ({
            id: t.id,
            accountId: t.accountId,
            accountName: accountMap.get(t.accountId) || "Unknown Account",
            date: t.date,
            description: t.description || "",
            category: categoryMap.get(t.categoryId) || "Other",
            type: mapTransactionTypeToFrontend(t.type),
            amount: t.amount || 0,
            toAccountId: t.counterpartyAccountId,
            toAccountName: t.counterpartyAccountId ? accountMap.get(t.counterpartyAccountId) : undefined,
          }));

          return {
            items,
            totalCount: pagedResult.totalCount || 0,
            page: pagedResult.page || 1,
            pageSize: pagedResult.pageSize || 15,
            totalPages: pagedResult.totalPages || 1,
          };
        } catch (e) {
          console.error("Backend transactions fetch failure, using mock", e);
        }
      }

      let list = MockDb.getTransactions();
      if (filters.accountId) {
        list = list.filter(t => t.accountId === filters.accountId || t.toAccountId === filters.accountId);
      }
      if (filters.category) {
        list = list.filter(t => t.category === filters.category);
      }
      if (filters.type) {
        list = list.filter(t => t.type === filters.type);
      }
      if (filters.startDate) {
        list = list.filter(t => t.date >= filters.startDate!);
      }
      if (filters.endDate) {
        list = list.filter(t => t.date <= filters.endDate!);
      }
      if (filters.search) {
        const s = filters.search.toLowerCase();
        list = list.filter(t => 
          t.description.toLowerCase().includes(s) || 
          (t.accountName && t.accountName.toLowerCase().includes(s)) ||
          t.category.toLowerCase().includes(s)
        );
      }

      const page = filters.page || 1;
      const pageSize = filters.pageSize || 15;
      const totalCount = list.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const paginatedList = list.slice((page - 1) * pageSize, page * pageSize);

      return {
        items: paginatedList,
        totalCount,
        page,
        pageSize,
        totalPages
      };
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateTransactionDto) => {
      if (isApiConfigured()) {
        const cats = await apiRequest<any[]>("/api/v1/categories");
        const catObj = cats.find(c => c.name.toLowerCase() === dto.category.toLowerCase());
        const body = {
          accountId: dto.accountId,
          type: mapTransactionTypeToBackend(dto.type),
          amount: dto.amount,
          date: dto.date,
          description: dto.description,
          categoryId: catObj ? catObj.id : null,
          counterpartyAccountId: dto.toAccountId || null,
        };
        await apiRequest("/api/v1/transactions", {
          method: "POST",
          body: JSON.stringify(body),
        });
        return;
      }
      return MockDb.createTransaction(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateTransactionDto }) => {
      if (isApiConfigured()) {
        const cats = await apiRequest<any[]>("/api/v1/categories");
        const catObj = cats.find(c => c.name.toLowerCase() === dto.category.toLowerCase());
        const body = {
          accountId: dto.accountId,
          type: mapTransactionTypeToBackend(dto.type),
          amount: dto.amount,
          date: dto.date,
          description: dto.description,
          categoryId: catObj ? catObj.id : null,
          counterpartyAccountId: dto.toAccountId || null,
        };
        await apiRequest(`/api/v1/transactions/${id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        return;
      }
      return MockDb.updateTransaction(id, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isApiConfigured()) {
        await apiRequest(`/api/v1/transactions/${id}`, {
          method: "DELETE",
        });
        return;
      }
      MockDb.deleteTransaction(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useImportTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ accountId, rows }: { accountId: string; rows: any[] }) => {
      if (isApiConfigured()) {
        const cats = await apiRequest<any[]>("/api/v1/categories");
        let importedCount = 0;
        await Promise.all(rows.map(async (row) => {
          const date = row.Date || row.date || new Date().toISOString().split("T")[0];
          const desc = row.Description || row.description || "Imported transaction";
          const cat = row.Category || row.category || "Leisure";
          const type = row.Type || row.type || "Expense";
          const amt = parseFloat(row.Amount || row.amount || "0");

          if (amt > 0) {
            const catObj = cats.find(c => c.name.toLowerCase() === cat.toLowerCase());
            const body = {
              accountId,
              type: mapTransactionTypeToBackend(type),
              amount: amt,
              date,
              description: desc,
              categoryId: catObj ? catObj.id : null,
            };
            await apiRequest("/api/v1/transactions", {
              method: "POST",
              body: JSON.stringify(body),
            });
            importedCount++;
          }
        }));
        return importedCount;
      }
      return MockDb.importTransactions(accountId, rows);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary });
    },
  });
}

// --- CATEGORIES ---
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      if (isApiConfigured()) {
        try {
          const res = await apiRequest<any[]>("/api/v1/categories");
          return res.map(mapCategoryToFrontend);
        } catch (e) {
          console.error("Backend categories fetch error, using MockDb", e);
          return MockDb.getCategories();
        }
      }
      return MockDb.getCategories();
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CategoryDto) => {
      if (isApiConfigured()) {
        const body = {
          name: dto.name,
          color: dto.color,
          icon: dto.icon,
          kind: 1, // default to Expense kind
        };
        const res = await apiRequest<any>("/api/v1/categories", {
          method: "POST",
          body: JSON.stringify(body),
        });
        return mapCategoryToFrontend(res);
      }
      return MockDb.createCategory(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: CategoryDto }) => {
      if (isApiConfigured()) {
        const body = {
          name: dto.name,
          color: dto.color,
          icon: dto.icon,
          kind: 1,
        };
        const res = await apiRequest<any>(`/api/v1/categories/${id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        return mapCategoryToFrontend(res);
      }
      return MockDb.updateCategory(id, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isApiConfigured()) {
        await apiRequest(`/api/v1/categories/${id}`, {
          method: "DELETE",
        });
        return;
      }
      MockDb.deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

// --- PORTFOLIO ---
export function usePortfolioPositions(assetClass?: string) {
  return useQuery({
    queryKey: queryKeys.portfolioPositions(assetClass),
    queryFn: async () => {
      if (isApiConfigured()) {
        try {
          const list = await apiRequest<any[]>("/api/v1/assets/positions");
          const frontendList = list.map(mapAssetPositionToFrontend);
          if (assetClass) {
            return frontendList.filter(p => p.assetClass === assetClass);
          }
          return frontendList;
        } catch (e) {
          console.error("Backend positions fetch failed, using MockDb", e);
        }
      }

      let list = MockDb.getAssetPositions();
      if (assetClass) {
        list = list.filter(p => p.assetClass === assetClass);
      }
      return list;
    },
  });
}

export function useAssetDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.assetDetail(id),
    queryFn: async () => {
      if (isApiConfigured()) {
        try {
          const [asset, positionDto, eventsDto] = await Promise.all([
            apiRequest<any>(`/api/v1/assets/${id}`),
            apiRequest<any>(`/api/v1/assets/${id}/position`),
            apiRequest<any[]>(`/api/v1/asset-events?assetId=${id}`),
          ]);

          const position = mapAssetPositionToFrontend(positionDto);
          position.name = asset.name || position.name;
          position.ticker = asset.ticker || position.ticker;

          const assetEvents = eventsDto.map(mapAssetEventToFrontend);
          
          let qty = 0;
          let cost = 0;
          const history = [{ date: "2025-01-01", value: 0 }];
          const incomeHistory: { date: string; amount: number }[] = [];

          const chronEvents = [...assetEvents].reverse();
          chronEvents.forEach(e => {
            if (e.type === "Buy") {
              qty += e.quantity;
              cost += e.amount;
            } else if (e.type === "Sell") {
              qty = Math.max(0, qty - e.quantity);
              cost = qty * (cost / (qty + e.quantity));
            } else if (e.type === "Dividend" || e.type === "Distribution") {
              incomeHistory.push({ date: e.date, amount: e.amount });
            }
            history.push({
              date: e.date,
              value: Math.round(qty * (position.currentPrice || e.price || 100))
            });
          });

          return {
            position,
            events: assetEvents,
            history,
            incomeHistory: incomeHistory.sort((a, b) => a.date.localeCompare(b.date))
          };
        } catch (e) {
          console.error("Backend asset detail error, falling back", e);
        }
      }

      const positions = MockDb.getAssetPositions();
      const events = MockDb.getAssetEvents();

      const position = positions.find(p => p.id === id);
      if (!position) throw new Error("Asset position not found");

      const assetEvents = events.filter(e => e.assetId === id).sort((a, b) => b.date.localeCompare(a.date));

      let qty = 0;
      let cost = 0;
      const history = [{ date: "2025-01-01", value: 0 }];
      const incomeHistory: { date: string; amount: number }[] = [];

      const chronEvents = [...assetEvents].reverse();
      chronEvents.forEach(e => {
        if (e.type === "Buy") {
          qty += e.quantity;
          cost += e.amount;
        } else if (e.type === "Sell") {
          qty = Math.max(0, qty - e.quantity);
          cost = qty * (cost / (qty + e.quantity));
        } else if (e.type === "Dividend" || e.type === "Distribution") {
          incomeHistory.push({ date: e.date, amount: e.amount });
        }
        history.push({
          date: e.date,
          value: Math.round(qty * (position.currentPrice || e.price || 100))
        });
      });

      return {
        position,
        events: assetEvents,
        history,
        incomeHistory: incomeHistory.sort((a, b) => a.date.localeCompare(b.date))
      };
    },
    enabled: !!id,
  });
}

export function useCreateAssetEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateAssetEventDto) => {
      if (isApiConfigured()) {
        const assets = await apiRequest<any[]>("/api/v1/assets");
        let asset = assets.find(a => a.ticker?.toUpperCase() === dto.ticker.toUpperCase());
        if (!asset) {
          asset = await apiRequest("/api/v1/assets", {
            method: "POST",
            body: JSON.stringify({
              ticker: dto.ticker.toUpperCase(),
              name: `${dto.ticker.toUpperCase()} Asset`,
              class: mapAssetClassToBackend(dto.assetClass),
              currency: "EUR",
            }),
          });
        }

        const accs = await apiRequest<any[]>("/api/v1/accounts");
        const accountId = accs.length > 0 ? accs[0].id : "";

        const eventBody = {
          assetId: asset.id,
          accountId,
          type: mapAssetEventTypeToBackend(dto.type),
          quantity: dto.quantity,
          unitPrice: dto.price,
          fees: 0,
          date: dto.date,
          notes: "Recorded from UI",
        };

        const res = await apiRequest<any>("/api/v1/asset-events", {
          method: "POST",
          body: JSON.stringify(eventBody),
        });

        return { assetId: asset.id, ...res };
      }
      return MockDb.createAssetEvent(dto);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["portfolioPositions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["passiveIncome"] });
      if (data && data.assetId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.assetDetail(data.assetId) });
      }
    },
  });
}

export function useRecordPriceSnapshot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { prices: { ticker: string; price: number }[] }) => {
      if (isApiConfigured()) {
        const assets = await apiRequest<any[]>("/api/v1/assets");
        await Promise.all(dto.prices.map(async (p) => {
          const asset = assets.find(a => a.ticker?.toUpperCase() === p.ticker.toUpperCase());
          if (asset) {
            await apiRequest("/api/v1/assets/prices", {
              method: "POST",
              body: JSON.stringify({
                assetId: asset.id,
                date: new Date().toISOString().split("T")[0],
                price: p.price,
              }),
            });
          }
        }));
        return;
      }
      MockDb.recordPriceSnapshot(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolioPositions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}

export function usePassiveIncome() {
  return useQuery({
    queryKey: queryKeys.passiveIncome,
    queryFn: async () => {
      if (isApiConfigured()) {
        try {
          const [eventsDto, positionsDto] = await Promise.all([
            apiRequest<any[]>("/api/v1/asset-events"),
            apiRequest<any[]>("/api/v1/assets/positions"),
          ]);
          const events = eventsDto.map(mapAssetEventToFrontend).filter(e => e.type === "Dividend" || e.type === "Distribution");
          const positions = positionsDto.map(mapAssetPositionToFrontend);

          const monthlyBreakdown: Record<string, Record<string, number>> = {};
          events.forEach(e => {
            const m = e.date.substring(0, 7);
            const pos = positions.find(p => p.id === e.assetId);
            const ticker = pos ? pos.ticker : "Other";

            if (!monthlyBreakdown[m]) monthlyBreakdown[m] = {};
            monthlyBreakdown[m][ticker] = (monthlyBreakdown[m][ticker] || 0) + e.amount;
          });

          const list: PassiveIncomeItem[] = Object.entries(monthlyBreakdown).map(([month, details]) => {
            const breakdown = Object.entries(details).map(([ticker, amount]) => ({ ticker, amount }));
            const amount = breakdown.reduce((sum, item) => sum + item.amount, 0);
            return { month, amount, breakdown };
          });

          return list.sort((a, b) => a.month.localeCompare(b.month));
        } catch (e) {
          console.error("Backend passive income aggregation failed, using MockDb", e);
        }
      }

      const events = MockDb.getAssetEvents().filter(e => e.type === "Dividend" || e.type === "Distribution");
      const positions = MockDb.getAssetPositions();

      const monthlyBreakdown: Record<string, Record<string, number>> = {};
      events.forEach(e => {
        const m = e.date.substring(0, 7);
        const pos = positions.find(p => p.id === e.assetId);
        const ticker = pos ? pos.ticker : "Other";

        if (!monthlyBreakdown[m]) monthlyBreakdown[m] = {};
        monthlyBreakdown[m][ticker] = (monthlyBreakdown[m][ticker] || 0) + e.amount;
      });

      const list: PassiveIncomeItem[] = Object.entries(monthlyBreakdown).map(([month, details]) => {
        const breakdown = Object.entries(details).map(([ticker, amount]) => ({ ticker, amount }));
        const amount = breakdown.reduce((sum, item) => sum + item.amount, 0);
        return { month, amount, breakdown };
      });

      return list.sort((a, b) => a.month.localeCompare(b.month));
    },
  });
}

// --- PLANNING & BUDGETS ---
export function useBudgets(month: string = "2026-07") {
  return useQuery({
    queryKey: queryKeys.budgets(month),
    queryFn: async () => {
      if (isApiConfigured()) {
        try {
          const list = await apiRequest<any[]>(`/api/v1/budgets/vs-actual?month=${month}-01`);
          return list.map((dto: any) => ({
            id: dto.categoryId + "_" + dto.month,
            category: dto.categoryName || "Other",
            limitAmount: dto.limitAmount || 0,
            spentAmount: dto.actualAmount || 0,
            month: dto.month.substring(0, 7),
          }));
        } catch (e) {
          console.error("Backend budgets vs actual failed, using mock", e);
        }
      }
      return MockDb.getBudgets().filter(b => b.month === month);
    },
  });
}

export function useUpdateBudgetLimit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { category: string; limitAmount: number; month: string }) => {
      if (isApiConfigured()) {
        const cats = await apiRequest<any[]>("/api/v1/categories");
        const catObj = cats.find(c => c.name.toLowerCase() === dto.category.toLowerCase());
        if (!catObj) throw new Error(`Category ${dto.category} not found`);

        const budgets = await apiRequest<any[]>(`/api/v1/budgets?month=${dto.month}-01`);
        const existing = budgets.find(b => b.categoryId === catObj.id);

        if (existing) {
          const res = await apiRequest<any>(`/api/v1/budgets/${existing.id}`, {
            method: "PUT",
            body: JSON.stringify({
              limitAmount: dto.limitAmount,
            }),
          });
          return { ...dto, id: res.id };
        } else {
          const res = await apiRequest<any>("/api/v1/budgets", {
            method: "POST",
            body: JSON.stringify({
              categoryId: catObj.id,
              month: dto.month + "-01",
              limitAmount: dto.limitAmount,
            }),
          });
          return { ...dto, id: res.id };
        }
      }

      const budgets = MockDb.getBudgets();
      let budget = budgets.find(b => b.category === dto.category && b.month === dto.month);
      if (budget) {
        budget.limitAmount = dto.limitAmount;
      } else {
        budget = {
          id: `bud-${Date.now()}`,
          category: dto.category,
          limitAmount: dto.limitAmount,
          spentAmount: 0,
          month: dto.month
        };
        budgets.push(budget);
      }
      MockDb.saveBudgets(budgets);
      return budget;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets(data.month) });
    },
  });
}

export function useSavingsGoals() {
  return useQuery({
    queryKey: queryKeys.savingsGoals,
    queryFn: async () => {
      if (isApiConfigured()) {
        try {
          const res = await apiRequest<any[]>("/api/v1/savings-goals");
          return res.map(mapSavingsGoalToFrontend);
        } catch (e) {
          console.error("Backend savings goals fetch failed", e);
        }
      }
      return MockDb.getSavingsGoals();
    },
  });
}

export function useCreateSavingsGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: SavingsGoalDto) => {
      if (isApiConfigured()) {
        const body = {
          name: dto.name,
          targetAmount: dto.targetAmount,
          targetDate: dto.targetDate || new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0],
          linkedAccountId: null,
        };
        const res = await apiRequest<any>("/api/v1/savings-goals", {
          method: "POST",
          body: JSON.stringify(body),
        });
        return mapSavingsGoalToFrontend(res);
      }
      return MockDb.createSavingsGoal(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals });
    },
  });
}

export function useUpdateSavingsGoalAmount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      if (isApiConfigured()) {
        const goal = await apiRequest<any>(`/api/v1/savings-goals/${id}`);
        const diff = amount - (goal.currentAmount || 0);
        if (diff !== 0) {
          await apiRequest(`/api/v1/savings-goals/${id}/contributions`, {
            method: "POST",
            body: JSON.stringify({
              amount: diff,
              date: new Date().toISOString().split("T")[0],
              note: "Adjusted from UI",
            }),
          });
        }
        return { ...goal, currentAmount: amount };
      }

      const goals = MockDb.getSavingsGoals();
      const goal = goals.find(g => g.id === id);
      if (goal) {
        goal.currentAmount = amount;
        MockDb.saveSavingsGoals(goals);
      }
      return goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals });
    },
  });
}

export function useCashFlowProjection(horizon: number = 12) {
  return useQuery({
    queryKey: queryKeys.cashFlowProjection(horizon),
    queryFn: async () => {
      if (isApiConfigured()) {
        try {
          const list = await apiRequest<any[]>(`/api/v1/dashboard/projection?monthsAhead=${horizon}`);
          const history = list.map(item => ({
            month: item.month.substring(0, 7),
            balance: item.cumulativeNetWorth || 0,
            net: item.net || 0,
          }));

          const rules = await apiRequest<any[]>("/api/v1/recurrence-rules");
          const upcoming = rules.map(r => ({
            description: r.name || "",
            amount: r.amount || 0,
            type: mapTransactionTypeToFrontend(r.type),
            dueDate: r.nextDueDate || "",
          }));

          return {
            history,
            upcoming: upcoming.sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
          };
        } catch (e) {
          console.error("Backend projections failed, using mock", e);
        }
      }
      return MockDb.getCashFlowProjection(horizon);
    },
  });
}

// --- RECURRENCES ---
export function useRecurrenceRules() {
  return useQuery({
    queryKey: queryKeys.recurrenceRules,
    queryFn: async () => {
      if (isApiConfigured()) {
        try {
          const res = await apiRequest<any[]>("/api/v1/recurrence-rules");
          return res.map(mapRecurrenceRuleToFrontend);
        } catch (e) {
          console.error("Backend recurrence rules failed, using mock", e);
        }
      }
      return MockDb.getRecurrenceRules();
    },
  });
}

export function useCreateRecurrenceRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateRecurrenceRuleDto) => {
      if (isApiConfigured()) {
        const [accs, cats] = await Promise.all([
          apiRequest<any[]>("/api/v1/accounts"),
          apiRequest<any[]>("/api/v1/categories"),
        ]);
        const accountId = accs.length > 0 ? accs[0].id : "";
        const catObj = cats.find(c => c.name.toLowerCase().includes("rent") || c.name.toLowerCase().includes("salary")) || cats[0];

        const body = {
          name: dto.description,
          accountId,
          categoryId: catObj ? catObj.id : "",
          type: mapTransactionTypeToBackend(dto.type),
          amount: dto.amount,
          currency: "EUR",
          frequency: mapRecurrenceFrequencyToBackend(dto.frequency),
          dayOfMonth: 1,
          interval: 1,
          startDate: new Date().toISOString().split("T")[0],
          autoPost: !!dto.autoPost,
        };
        const res = await apiRequest<any>("/api/v1/recurrence-rules", {
          method: "POST",
          body: JSON.stringify(body),
        });
        return mapRecurrenceRuleToFrontend(res);
      }
      return MockDb.createRecurrenceRule(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurrenceRules });
      queryClient.invalidateQueries({ queryKey: ["cashFlowProjection"] });
    },
  });
}

export function useUpdateRecurrenceRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: CreateRecurrenceRuleDto }) => {
      if (isApiConfigured()) {
        const [accs, cats] = await Promise.all([
          apiRequest<any[]>("/api/v1/accounts"),
          apiRequest<any[]>("/api/v1/categories"),
        ]);
        const accountId = accs.length > 0 ? accs[0].id : "";
        const catObj = cats.find(c => c.name.toLowerCase().includes("rent") || c.name.toLowerCase().includes("salary")) || cats[0];

        const body = {
          name: dto.description,
          accountId,
          categoryId: catObj ? catObj.id : "",
          type: mapTransactionTypeToBackend(dto.type),
          amount: dto.amount,
          currency: "EUR",
          frequency: mapRecurrenceFrequencyToBackend(dto.frequency),
          dayOfMonth: 1,
          interval: 1,
          startDate: new Date().toISOString().split("T")[0],
          autoPost: !!dto.autoPost,
          isActive: true,
        };
        const res = await apiRequest<any>(`/api/v1/recurrence-rules/${id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        return mapRecurrenceRuleToFrontend(res);
      }
      return MockDb.updateRecurrenceRule(id, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurrenceRules });
      queryClient.invalidateQueries({ queryKey: ["cashFlowProjection"] });
    },
  });
}

export function useDeleteRecurrenceRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isApiConfigured()) {
        await apiRequest(`/api/v1/recurrence-rules/${id}`, {
          method: "DELETE",
        });
        return;
      }
      MockDb.deleteRecurrenceRule(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurrenceRules });
      queryClient.invalidateQueries({ queryKey: ["cashFlowProjection"] });
    },
  });
}

export function usePendingRecurrences() {
  return useQuery({
    queryKey: queryKeys.pendingRecurrences,
    queryFn: async () => {
      if (isApiConfigured()) {
        try {
          const pendings = await apiRequest<any[]>("/api/v1/recurrence-rules/pending-occurrences");
          const rules = await apiRequest<any[]>("/api/v1/recurrence-rules");
          const ruleMap = new Map(rules.map(r => [r.id, r]));

          return pendings.map(p => {
            const rule = ruleMap.get(p.recurrenceRuleId);
            return {
              id: p.id,
              recurrenceId: p.recurrenceRuleId,
              description: p.recurrenceRuleName || rule?.name || "Recurring transaction",
              amount: p.amount || rule?.amount || 0,
              dueDate: p.dueDate,
              type: rule ? mapTransactionTypeToFrontend(rule.type) : "Expense",
              accountId: rule?.accountId || "acc-1",
            };
          });
        } catch (e) {
          console.error("Backend pending occurrences failed, using mock", e);
        }
      }
      return MockDb.getPendingRecurrences();
    },
  });
}

export function useConfirmPendingRecurrence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isApiConfigured()) {
        await apiRequest(`/api/v1/recurrence-rules/occurrences/${id}/confirm`, {
          method: "POST",
        });
        return;
      }
      MockDb.confirmPendingRecurrence(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingRecurrences });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useSkipPendingRecurrence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isApiConfigured()) {
        await apiRequest(`/api/v1/recurrence-rules/occurrences/${id}/skip`, {
          method: "POST",
        });
        return;
      }
      MockDb.skipPendingRecurrence(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingRecurrences });
    },
  });
}
