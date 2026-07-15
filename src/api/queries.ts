import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MockDb } from "./mockDb";
import { 
  CreateAccountDto, UpdateAccountDto, CreateTransactionDto, UpdateTransactionDto,
  CategoryDto, CreateAssetEventDto, CreateRecurrenceRuleDto, SavingsGoalDto,
  PassiveIncomeItem
} from "./mockDb";

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
    queryFn: () => MockDb.getDashboardSummary(),
  });
}

// --- ACCOUNTS ---
export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: () => MockDb.getAccounts(),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAccountDto) => Promise.resolve(MockDb.createAccount(dto)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAccountDto }) => 
      Promise.resolve(MockDb.updateAccount(id, dto)),
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
    mutationFn: (id: string) => {
      MockDb.archiveAccount(id);
      return Promise.resolve();
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
    queryFn: () => {
      const txs = MockDb.getTransactions().filter(t => t.accountId === id);
      const acc = MockDb.getAccounts().find(a => a.id === id);
      const currency = acc?.currency || "EUR";
      
      // Compute history
      let currentBal = acc?.balance || 0;
      const history = [{ date: new Date().toISOString().split("T")[0], balance: currentBal }];
      
      // Backtrack
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
    queryFn: () => {
      let list = MockDb.getTransactions();
      const accounts = MockDb.getAccounts();

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

      // Pagination
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
    mutationFn: (dto: CreateTransactionDto) => Promise.resolve(MockDb.createTransaction(dto)),
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
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTransactionDto }) => 
      Promise.resolve(MockDb.updateTransaction(id, dto)),
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
    mutationFn: (id: string) => {
      MockDb.deleteTransaction(id);
      return Promise.resolve();
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
    mutationFn: ({ accountId, rows }: { accountId: string; rows: any[] }) => 
      Promise.resolve(MockDb.importTransactions(accountId, rows)),
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
    queryFn: () => MockDb.getCategories(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CategoryDto) => Promise.resolve(MockDb.createCategory(dto)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CategoryDto }) => 
      Promise.resolve(MockDb.updateCategory(id, dto)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      MockDb.deleteCategory(id);
      return Promise.resolve();
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
    queryFn: () => {
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
    queryFn: () => {
      const positions = MockDb.getAssetPositions();
      const events = MockDb.getAssetEvents();

      const position = positions.find(p => p.id === id);
      if (!position) throw new Error("Asset position not found");

      const assetEvents = events.filter(e => e.assetId === id).sort((a, b) => b.date.localeCompare(a.date));

      // Reconstruct position evolution chart
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
          cost = qty * (cost / (qty + e.quantity)); // simple adjustment
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
    mutationFn: (dto: CreateAssetEventDto) => Promise.resolve(MockDb.createAssetEvent(dto)),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["portfolioPositions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["passiveIncome"] });
      if (data.assetId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.assetDetail(data.assetId) });
      }
    },
  });
}

export function useRecordPriceSnapshot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { prices: { ticker: string; price: number }[] }) => {
      MockDb.recordPriceSnapshot(dto);
      return Promise.resolve();
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
    queryFn: () => {
      // Aggregate income events by month
      const events = MockDb.getAssetEvents().filter(e => e.type === "Dividend" || e.type === "Distribution");
      const positions = MockDb.getAssetPositions();

      const monthlyBreakdown: Record<string, Record<string, number>> = {};
      events.forEach(e => {
        const m = e.date.substring(0, 7); // YYYY-MM
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
    queryFn: () => MockDb.getBudgets().filter(b => b.month === month),
  });
}

export function useUpdateBudgetLimit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { category: string; limitAmount: number; month: string }) => {
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
      return Promise.resolve(budget);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets(data.month) });
    },
  });
}

export function useSavingsGoals() {
  return useQuery({
    queryKey: queryKeys.savingsGoals,
    queryFn: () => MockDb.getSavingsGoals(),
  });
}

export function useCreateSavingsGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SavingsGoalDto) => Promise.resolve(MockDb.createSavingsGoal(dto)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals });
    },
  });
}

export function useUpdateSavingsGoalAmount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => {
      const goals = MockDb.getSavingsGoals();
      const goal = goals.find(g => g.id === id);
      if (goal) {
        goal.currentAmount = amount;
        MockDb.saveSavingsGoals(goals);
      }
      return Promise.resolve(goal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals });
    },
  });
}

export function useCashFlowProjection(horizon: number = 12) {
  return useQuery({
    queryKey: queryKeys.cashFlowProjection(horizon),
    queryFn: () => MockDb.getCashFlowProjection(horizon),
  });
}

// --- RECURRENCES ---
export function useRecurrenceRules() {
  return useQuery({
    queryKey: queryKeys.recurrenceRules,
    queryFn: () => MockDb.getRecurrenceRules(),
  });
}

export function useCreateRecurrenceRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRecurrenceRuleDto) => Promise.resolve(MockDb.createRecurrenceRule(dto)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurrenceRules });
      queryClient.invalidateQueries({ queryKey: ["cashFlowProjection"] });
    },
  });
}

export function useUpdateRecurrenceRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CreateRecurrenceRuleDto }) => 
      Promise.resolve(MockDb.updateRecurrenceRule(id, dto)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurrenceRules });
      queryClient.invalidateQueries({ queryKey: ["cashFlowProjection"] });
    },
  });
}

export function useDeleteRecurrenceRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      MockDb.deleteRecurrenceRule(id);
      return Promise.resolve();
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
    queryFn: () => MockDb.getPendingRecurrences(),
  });
}

export function useConfirmPendingRecurrence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      MockDb.confirmPendingRecurrence(id);
      return Promise.resolve();
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
    mutationFn: (id: string) => {
      MockDb.skipPendingRecurrence(id);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingRecurrences });
    },
  });
}
