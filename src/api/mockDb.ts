import { components } from "./schema";

export type Account = components["schemas"]["Account"];
export type CreateAccountDto = components["schemas"]["CreateAccountDto"];
export type UpdateAccountDto = components["schemas"]["UpdateAccountDto"];
export type Transaction = components["schemas"]["Transaction"];
export type CreateTransactionDto = components["schemas"]["CreateTransactionDto"];
export type UpdateTransactionDto = components["schemas"]["UpdateTransactionDto"];
export type Category = components["schemas"]["Category"];
export type CategoryDto = components["schemas"]["CategoryDto"];
export type AssetPosition = components["schemas"]["AssetPosition"];
export type AssetEvent = components["schemas"]["AssetEvent"];
export type CreateAssetEventDto = components["schemas"]["CreateAssetEventDto"];
export type PassiveIncomeItem = components["schemas"]["PassiveIncomeItem"];
export type Budget = components["schemas"]["Budget"];
export type SavingsGoal = components["schemas"]["SavingsGoal"];
export type SavingsGoalDto = components["schemas"]["SavingsGoalDto"];
export type RecurrenceRule = components["schemas"]["RecurrenceRule"];
export type CreateRecurrenceRuleDto = components["schemas"]["CreateRecurrenceRuleDto"];
export type PendingRecurrence = components["schemas"]["PendingRecurrence"];
export type DashboardSummary = components["schemas"]["DashboardSummary"];
export type CashFlowProjection = components["schemas"]["CashFlowProjection"];

// Storage keys
const DB_PREFIX = "finorganizer_";
const KEY_ACCOUNTS = `${DB_PREFIX}accounts`;
const KEY_TRANSACTIONS = `${DB_PREFIX}transactions`;
const KEY_CATEGORIES = `${DB_PREFIX}categories`;
const KEY_ASSET_POSITIONS = `${DB_PREFIX}asset_positions`;
const KEY_ASSET_EVENTS = `${DB_PREFIX}asset_events`;
const KEY_BUDGETS = `${DB_PREFIX}budgets`;
const KEY_SAVINGS_GOALS = `${DB_PREFIX}savings_goals`;
const KEY_RECURRENCE_RULES = `${DB_PREFIX}recurrences`;
const KEY_PENDING_RECURRENCES = `${DB_PREFIX}pending_recurrences`;

// Seed data
const defaultCategories: Category[] = [
  { id: "cat-1", name: "Salary", color: "#10b981", icon: "Briefcase" },
  { id: "cat-2", name: "Rent & Housing", color: "#ef4444", icon: "Home" },
  { id: "cat-3", name: "Groceries", color: "#f59e0b", icon: "ShoppingCart" },
  { id: "cat-4", name: "Utilities", color: "#3b82f6", icon: "Zap" },
  { id: "cat-5", name: "Dividends & Interest", color: "#059669", icon: "Coins" },
  { id: "cat-6", name: "Dining Out", color: "#f97316", icon: "Utensils" },
  { id: "cat-7", name: "Leisure", color: "#ec4899", icon: "Coffee" },
  { id: "cat-8", name: "Investments", color: "#8b5cf6", icon: "TrendingUp" },
];

const defaultAccounts: Account[] = [
  { id: "acc-1", name: "Main Checking (EUR)", type: "Cash", currency: "EUR", balance: 5400, isArchived: false },
  { id: "acc-2", name: "Nubank Savings (BRL)", type: "Savings", currency: "BRL", balance: 12500, isArchived: false },
  { id: "acc-3", name: "DeGiro Portfolio (EUR)", type: "Investment", currency: "EUR", balance: 28400, isArchived: false },
  { id: "acc-4", name: "Chase Checking (USD)", type: "Cash", currency: "USD", balance: 4200, isArchived: false }
];

const defaultRecurrenceRules: RecurrenceRule[] = [
  { id: "rec-1", description: "Monthly Tech Salary", amount: 3500, type: "Income", frequency: "Monthly", nextDueDate: "2026-08-01", autoPost: true },
  { id: "rec-2", description: "Netflix Subscription", amount: 14.99, type: "Expense", frequency: "Monthly", nextDueDate: "2026-07-20", autoPost: false },
  { id: "rec-3", description: "Gym Membership", amount: 45.00, type: "Expense", frequency: "Monthly", nextDueDate: "2026-07-22", autoPost: true },
  { id: "rec-4", description: "Office Rent", amount: 850.00, type: "Expense", frequency: "Monthly", nextDueDate: "2026-08-01", autoPost: false }
];

const defaultPendingRecurrences: PendingRecurrence[] = [
  { id: "pend-1", recurrenceId: "rec-2", description: "Netflix Subscription", amount: 14.99, dueDate: "2026-07-20", type: "Expense", accountId: "acc-1" },
  { id: "pend-2", recurrenceId: "rec-4", description: "Office Rent", amount: 850.00, dueDate: "2026-07-01", type: "Expense", accountId: "acc-1" }
];

const defaultSavingsGoals: SavingsGoal[] = [
  { id: "goal-1", name: "Emergency Fund", targetAmount: 10000, currentAmount: 8500, targetDate: "2026-12-31" },
  { id: "goal-2", name: "New Mac Studio", targetAmount: 3000, currentAmount: 1800, targetDate: "2026-10-15" },
  { id: "goal-3", name: "Trip to Rio de Janeiro", targetAmount: 4000, currentAmount: 4000, targetDate: "2026-07-25" }
];

const defaultBudgets: Budget[] = [
  { id: "bud-1", category: "Groceries", limitAmount: 450, spentAmount: 320, month: "2026-07" },
  { id: "bud-2", category: "Dining Out", limitAmount: 200, spentAmount: 235, month: "2026-07" }, // Over budget (red/amber)
  { id: "bud-3", category: "Leisure", limitAmount: 150, spentAmount: 90, month: "2026-07" },
  { id: "bud-4", category: "Utilities", limitAmount: 120, spentAmount: 115, month: "2026-07" },
  { id: "bud-5", category: "Rent & Housing", limitAmount: 1200, spentAmount: 1200, month: "2026-07" }
];

const defaultAssetPositions: AssetPosition[] = [
  { id: "asset-1", ticker: "AAPL", name: "Apple Inc.", assetClass: "Stock", quantity: 50, avgCost: 150, invested: 7500, currentPrice: 195, marketValue: 9750, unrealizedPl: 2250, unrealizedPlPercent: 30.00, incomeReceived: 240 },
  { id: "asset-2", ticker: "IWDA", name: "iShares MSCI World ETF", assetClass: "ETF", quantity: 180, avgCost: 78, invested: 14040, currentPrice: 88, marketValue: 15840, unrealizedPl: 1800, unrealizedPlPercent: 12.82, incomeReceived: 120 },
  { id: "asset-3", ticker: "BTC", name: "Bitcoin", assetClass: "Crypto", quantity: 0.15, avgCost: 45000, invested: 6750, currentPrice: 63000, marketValue: 9450, unrealizedPl: 2700, unrealizedPlPercent: 40.00, incomeReceived: 0 }
];

const defaultAssetEvents: AssetEvent[] = [
  { id: "evt-1", assetId: "asset-1", date: "2025-08-12", type: "Buy", quantity: 20, price: 145, amount: 2900 },
  { id: "evt-2", assetId: "asset-1", date: "2025-11-15", type: "Buy", quantity: 30, price: 153, amount: 4600 },
  { id: "evt-3", assetId: "asset-1", date: "2026-02-15", type: "Dividend", quantity: 50, price: 0, amount: 110 },
  { id: "evt-4", assetId: "asset-1", date: "2026-05-15", type: "Dividend", quantity: 50, price: 0, amount: 130 },
  { id: "evt-5", assetId: "asset-2", date: "2025-09-01", type: "Buy", quantity: 100, price: 75, amount: 7500 },
  { id: "evt-6", assetId: "asset-2", date: "2026-01-10", type: "Buy", quantity: 80, price: 81.75, amount: 6540 },
  { id: "evt-7", assetId: "asset-2", date: "2026-06-18", type: "Dividend", quantity: 180, price: 0, amount: 120 },
  { id: "evt-8", assetId: "asset-3", date: "2025-12-20", type: "Buy", quantity: 0.15, price: 45000, amount: 6750 }
];

// Seed 12 months of transactions to show rich charts
const generateSeedTransactions = (): Transaction[] => {
  const list: Transaction[] = [
    // Income
    { id: "tx-1", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-07-01", description: "Monthly Tech Salary", category: "Salary", type: "Income", amount: 3500 },
    { id: "tx-2", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-06-01", description: "Monthly Tech Salary", category: "Salary", type: "Income", amount: 3500 },
    { id: "tx-3", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-05-01", description: "Monthly Tech Salary", category: "Salary", type: "Income", amount: 3500 },
    { id: "tx-4", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-04-01", description: "Monthly Tech Salary", category: "Salary", type: "Income", amount: 3500 },
    { id: "tx-5", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-03-01", description: "Monthly Tech Salary", category: "Salary", type: "Income", amount: 3500 },
    
    // Expenses
    { id: "tx-6", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-07-02", description: "Apartment Rent", category: "Rent & Housing", type: "Expense", amount: 1200 },
    { id: "tx-7", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-06-02", description: "Apartment Rent", category: "Rent & Housing", type: "Expense", amount: 1200 },
    { id: "tx-8", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-05-02", description: "Apartment Rent", category: "Rent & Housing", type: "Expense", amount: 1200 },
    
    // Groceries
    { id: "tx-9", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-07-05", description: "Supermarket Weekly", category: "Groceries", type: "Expense", amount: 110 },
    { id: "tx-10", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-07-12", description: "Organic Markets", category: "Groceries", type: "Expense", amount: 95 },
    { id: "tx-11", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-06-08", description: "Weekly Grocery Run", category: "Groceries", type: "Expense", amount: 130 },
    { id: "tx-12", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-06-22", description: "Monthly Stockup", category: "Groceries", type: "Expense", amount: 155 },
    
    // Dining
    { id: "tx-13", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-07-04", description: "Sushi Night with Friends", category: "Dining Out", type: "Expense", amount: 75 },
    { id: "tx-14", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-07-10", description: "Italian Dinner", category: "Dining Out", type: "Expense", amount: 90 },
    { id: "tx-15", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-07-14", description: "Espresso & Bakeries", category: "Dining Out", type: "Expense", amount: 20 },
    { id: "tx-16", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-06-15", description: "Fine Dining B-Day", category: "Dining Out", type: "Expense", amount: 180 },

    // Transfer
    { id: "tx-17", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-07-06", description: "Transfer to DeGiro Broker", category: "Investments", type: "Transfer", amount: 500, toAccountId: "acc-3", toAccountName: "DeGiro Portfolio (EUR)" },
    { id: "tx-18", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-06-10", description: "Investing DeGiro", category: "Investments", type: "Transfer", amount: 750, toAccountId: "acc-3", toAccountName: "DeGiro Portfolio (EUR)" },

    // BRL Transactions
    { id: "tx-19", accountId: "acc-2", accountName: "Nubank Savings (BRL)", date: "2026-07-01", description: "Consulting Income BRL", category: "Salary", type: "Income", amount: 4800 },
    { id: "tx-20", accountId: "acc-2", accountName: "Nubank Savings (BRL)", date: "2026-07-08", description: "Gym Membership", category: "Leisure", type: "Expense", amount: 250 },
    { id: "tx-21", accountId: "acc-2", accountName: "Nubank Savings (BRL)", date: "2026-06-12", description: "Weekend Resort Stay", category: "Leisure", type: "Expense", amount: 1200 },

    // Apple Dividends
    { id: "tx-22", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-05-15", description: "Apple Dividends payout", category: "Dividends & Interest", type: "Income", amount: 130 },
    { id: "tx-23", accountId: "acc-1", accountName: "Main Checking (EUR)", date: "2026-02-15", description: "Apple Dividends payout", category: "Dividends & Interest", type: "Income", amount: 110 }
  ];

  // Fill in past months so charts look stunningly complete
  const months = ["2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05"];
  months.forEach((m, idx) => {
    // Add Salary
    list.push({
      id: `seed-salary-${idx}`,
      accountId: "acc-1",
      accountName: "Main Checking (EUR)",
      date: `${m}-01`,
      description: "Monthly Tech Salary",
      category: "Salary",
      type: "Income",
      amount: 3500
    });
    // Add Rent
    list.push({
      id: `seed-rent-${idx}`,
      accountId: "acc-1",
      accountName: "Main Checking (EUR)",
      date: `${m}-02`,
      description: "Apartment Rent",
      category: "Rent & Housing",
      type: "Expense",
      amount: 1200
    });
    // Add Groceries
    list.push({
      id: `seed-groc-${idx}`,
      accountId: "acc-1",
      accountName: "Main Checking (EUR)",
      date: `${m}-14`,
      description: "Supermarket Weekly",
      category: "Groceries",
      type: "Expense",
      amount: 150 + Math.random() * 80
    });
    // Add Leisure / Dining
    list.push({
      id: `seed-dining-${idx}`,
      accountId: "acc-1",
      accountName: "Main Checking (EUR)",
      date: `${m}-21`,
      description: "Restaurants",
      category: "Dining Out",
      type: "Expense",
      amount: 80 + Math.random() * 120
    });
    // Add some random dividend in Nov, Feb, May
    if (m === "2025-11" || m === "2026-02" || m === "2026-05") {
      list.push({
        id: `seed-div-${idx}`,
        accountId: "acc-1",
        accountName: "Main Checking (EUR)",
        date: `${m}-15`,
        description: "Portfolio Dividends",
        category: "Dividends & Interest",
        type: "Income",
        amount: 80 + idx * 10
      });
    }
  });

  return list.sort((a, b) => b.date.localeCompare(a.date));
};

export class MockDb {
  static getAccounts(): Account[] {
    const raw = localStorage.getItem(KEY_ACCOUNTS);
    if (!raw) {
      localStorage.setItem(KEY_ACCOUNTS, JSON.stringify(defaultAccounts));
      return defaultAccounts;
    }
    return JSON.parse(raw);
  }

  static saveAccounts(data: Account[]) {
    localStorage.setItem(KEY_ACCOUNTS, JSON.stringify(data));
  }

  static getTransactions(): Transaction[] {
    const raw = localStorage.getItem(KEY_TRANSACTIONS);
    if (!raw) {
      const list = generateSeedTransactions();
      localStorage.setItem(KEY_TRANSACTIONS, JSON.stringify(list));
      return list;
    }
    return JSON.parse(raw);
  }

  static saveTransactions(data: Transaction[]) {
    localStorage.setItem(KEY_TRANSACTIONS, JSON.stringify(data));
  }

  static getCategories(): Category[] {
    const raw = localStorage.getItem(KEY_CATEGORIES);
    if (!raw) {
      localStorage.setItem(KEY_CATEGORIES, JSON.stringify(defaultCategories));
      return defaultCategories;
    }
    return JSON.parse(raw);
  }

  static saveCategories(data: Category[]) {
    localStorage.setItem(KEY_CATEGORIES, JSON.stringify(data));
  }

  static getAssetPositions(): AssetPosition[] {
    const raw = localStorage.getItem(KEY_ASSET_POSITIONS);
    if (!raw) {
      localStorage.setItem(KEY_ASSET_POSITIONS, JSON.stringify(defaultAssetPositions));
      return defaultAssetPositions;
    }
    return JSON.parse(raw);
  }

  static saveAssetPositions(data: AssetPosition[]) {
    localStorage.setItem(KEY_ASSET_POSITIONS, JSON.stringify(data));
  }

  static getAssetEvents(): AssetEvent[] {
    const raw = localStorage.getItem(KEY_ASSET_EVENTS);
    if (!raw) {
      localStorage.setItem(KEY_ASSET_EVENTS, JSON.stringify(defaultAssetEvents));
      return defaultAssetEvents;
    }
    return JSON.parse(raw);
  }

  static saveAssetEvents(data: AssetEvent[]) {
    localStorage.setItem(KEY_ASSET_EVENTS, JSON.stringify(data));
  }

  static getRecurrenceRules(): RecurrenceRule[] {
    const raw = localStorage.getItem(KEY_RECURRENCE_RULES);
    if (!raw) {
      localStorage.setItem(KEY_RECURRENCE_RULES, JSON.stringify(defaultRecurrenceRules));
      return defaultRecurrenceRules;
    }
    return JSON.parse(raw);
  }

  static saveRecurrenceRules(data: RecurrenceRule[]) {
    localStorage.setItem(KEY_RECURRENCE_RULES, JSON.stringify(data));
  }

  static getPendingRecurrences(): PendingRecurrence[] {
    const raw = localStorage.getItem(KEY_PENDING_RECURRENCES);
    if (!raw) {
      localStorage.setItem(KEY_PENDING_RECURRENCES, JSON.stringify(defaultPendingRecurrences));
      return defaultPendingRecurrences;
    }
    return JSON.parse(raw);
  }

  static savePendingRecurrences(data: PendingRecurrence[]) {
    localStorage.setItem(KEY_PENDING_RECURRENCES, JSON.stringify(data));
  }

  static getSavingsGoals(): SavingsGoal[] {
    const raw = localStorage.getItem(KEY_SAVINGS_GOALS);
    if (!raw) {
      localStorage.setItem(KEY_SAVINGS_GOALS, JSON.stringify(defaultSavingsGoals));
      return defaultSavingsGoals;
    }
    return JSON.parse(raw);
  }

  static saveSavingsGoals(data: SavingsGoal[]) {
    localStorage.setItem(KEY_SAVINGS_GOALS, JSON.stringify(data));
  }

  static getBudgets(): Budget[] {
    const raw = localStorage.getItem(KEY_BUDGETS);
    if (!raw) {
      localStorage.setItem(KEY_BUDGETS, JSON.stringify(defaultBudgets));
      return defaultBudgets;
    }
    return JSON.parse(raw);
  }

  static saveBudgets(data: Budget[]) {
    localStorage.setItem(KEY_BUDGETS, JSON.stringify(data));
  }

  // Business operations
  static createAccount(dto: CreateAccountDto): Account {
    const accounts = this.getAccounts();
    const newAcc: Account = {
      id: `acc-${Date.now()}`,
      name: dto.name,
      type: dto.type,
      currency: dto.currency,
      balance: dto.initialBalance || 0,
      isArchived: false,
    };
    accounts.push(newAcc);
    this.saveAccounts(accounts);

    // If initialBalance > 0, create an initial transaction as well
    if (dto.initialBalance && dto.initialBalance > 0) {
      this.createTransaction({
        accountId: newAcc.id,
        date: new Date().toISOString().split("T")[0],
        description: "Initial Balance Setup",
        category: "Salary",
        type: "Income",
        amount: dto.initialBalance,
      });
    }
    return newAcc;
  }

  static updateAccount(id: string, dto: UpdateAccountDto): Account {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex(a => a.id === id);
    if (idx === -1) throw new Error("Account not found");
    
    const updated = {
      ...accounts[idx],
      name: dto.name,
      type: dto.type,
      currency: dto.currency,
      isArchived: dto.isArchived ?? accounts[idx].isArchived
    };
    accounts[idx] = updated;
    this.saveAccounts(accounts);
    return updated;
  }

  static archiveAccount(id: string): void {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex(a => a.id === id);
    if (idx !== -1) {
      accounts[idx].isArchived = true;
      this.saveAccounts(accounts);
    }
  }

  static createTransaction(dto: CreateTransactionDto): Transaction {
    const transactions = this.getTransactions();
    const accounts = this.getAccounts();
    const account = accounts.find(a => a.id === dto.accountId);
    if (!account) throw new Error("Source account not found");

    const txId = `tx-${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      accountId: dto.accountId,
      accountName: account.name,
      date: dto.date,
      description: dto.description,
      category: dto.category,
      type: dto.type,
      amount: dto.amount,
      toAccountId: dto.toAccountId || undefined,
      toAccountName: dto.toAccountId ? (accounts.find(a => a.id === dto.toAccountId)?.name || "") : undefined
    };

    transactions.unshift(newTx);
    this.saveTransactions(transactions);

    // Update account balances
    if (dto.type === "Income") {
      account.balance += dto.amount;
    } else if (dto.type === "Expense") {
      account.balance -= dto.amount;
      // Increment budget expense
      const m = dto.date.substring(0, 7); // YYYY-MM
      const budgets = this.getBudgets();
      const budget = budgets.find(b => b.category === dto.category && b.month === m);
      if (budget) {
        budget.spentAmount += dto.amount;
        this.saveBudgets(budgets);
      }
    } else if (dto.type === "Transfer" && dto.toAccountId) {
      const toAccount = accounts.find(a => a.id === dto.toAccountId);
      if (toAccount) {
        // Multi-currency simplifications: we assume 1:1 conversion for simplicity in mock,
        // but let's do a realistic dummy exchange if currency differs
        let convAmount = dto.amount;
        if (account.currency !== toAccount.currency) {
          if (account.currency === "EUR" && toAccount.currency === "BRL") convAmount = dto.amount * 6.0;
          else if (account.currency === "BRL" && toAccount.currency === "EUR") convAmount = dto.amount / 6.0;
          else if (account.currency === "USD" && toAccount.currency === "EUR") convAmount = dto.amount * 0.92;
          else if (account.currency === "EUR" && toAccount.currency === "USD") convAmount = dto.amount * 1.09;
        }
        account.balance -= dto.amount;
        toAccount.balance += convAmount;
      }
    }

    this.saveAccounts(accounts);
    return newTx;
  }

  static updateTransaction(id: string, dto: UpdateTransactionDto): Transaction {
    const transactions = this.getTransactions();
    const idx = transactions.findIndex(t => t.id === id);
    if (idx === -1) throw new Error("Transaction not found");

    const oldTx = transactions[idx];
    
    // Reverse old balance changes
    const accounts = this.getAccounts();
    const oldAccount = accounts.find(a => a.id === oldTx.accountId);
    if (oldAccount) {
      if (oldTx.type === "Income") oldAccount.balance -= oldTx.amount;
      else if (oldTx.type === "Expense") oldAccount.balance += oldTx.amount;
      else if (oldTx.type === "Transfer" && oldTx.toAccountId) {
        const oldToAccount = accounts.find(a => a.id === oldTx.toAccountId);
        oldAccount.balance += oldTx.amount;
        if (oldToAccount) {
          // Simplification
          let oldConvAmount = oldTx.amount;
          if (oldAccount.currency !== oldToAccount.currency) {
            if (oldAccount.currency === "EUR" && oldToAccount.currency === "BRL") oldConvAmount = oldTx.amount * 6.0;
            else if (oldAccount.currency === "BRL" && oldToAccount.currency === "EUR") oldConvAmount = oldTx.amount / 6.0;
          }
          oldToAccount.balance -= oldConvAmount;
        }
      }
    }

    // Apply new balance changes
    const newAccount = accounts.find(a => a.id === dto.accountId);
    if (!newAccount) throw new Error("New account not found");

    const newTx: Transaction = {
      ...oldTx,
      accountId: dto.accountId,
      accountName: newAccount.name,
      date: dto.date,
      description: dto.description,
      category: dto.category,
      type: dto.type,
      amount: dto.amount,
      toAccountId: dto.toAccountId || undefined,
      toAccountName: dto.toAccountId ? (accounts.find(a => a.id === dto.toAccountId)?.name || "") : undefined
    };

    transactions[idx] = newTx;
    this.saveTransactions(transactions);

    if (dto.type === "Income") {
      newAccount.balance += dto.amount;
    } else if (dto.type === "Expense") {
      newAccount.balance -= dto.amount;
    } else if (dto.type === "Transfer" && dto.toAccountId) {
      const toAccount = accounts.find(a => a.id === dto.toAccountId);
      if (toAccount) {
        let convAmount = dto.amount;
        if (newAccount.currency !== toAccount.currency) {
          if (newAccount.currency === "EUR" && toAccount.currency === "BRL") convAmount = dto.amount * 6.0;
          else if (newAccount.currency === "BRL" && toAccount.currency === "EUR") convAmount = dto.amount / 6.0;
        }
        newAccount.balance -= dto.amount;
        toAccount.balance += convAmount;
      }
    }

    this.saveAccounts(accounts);
    return newTx;
  }

  static deleteTransaction(id: string): void {
    const transactions = this.getTransactions();
    const idx = transactions.findIndex(t => t.id === id);
    if (idx === -1) return;

    const tx = transactions[idx];
    const accounts = this.getAccounts();
    const account = accounts.find(a => a.id === tx.accountId);
    if (account) {
      if (tx.type === "Income") account.balance -= tx.amount;
      else if (tx.type === "Expense") account.balance += tx.amount;
      else if (tx.type === "Transfer" && tx.toAccountId) {
        const toAccount = accounts.find(a => a.id === tx.toAccountId);
        account.balance += tx.amount;
        if (toAccount) {
          let convAmount = tx.amount;
          if (account.currency !== toAccount.currency) {
            if (account.currency === "EUR" && toAccount.currency === "BRL") convAmount = tx.amount * 6.0;
            else if (account.currency === "BRL" && toAccount.currency === "EUR") convAmount = tx.amount / 6.0;
          }
          toAccount.balance -= convAmount;
        }
      }
    }

    transactions.splice(idx, 1);
    this.saveTransactions(transactions);
    this.saveAccounts(accounts);
  }

  static createAssetEvent(dto: CreateAssetEventDto): AssetEvent {
    const positions = this.getAssetPositions();
    const events = this.getAssetEvents();
    
    // Find or create position
    let asset = positions.find(p => p.ticker === dto.ticker.toUpperCase());
    if (!asset) {
      asset = {
        id: `asset-${Date.now()}`,
        ticker: dto.ticker.toUpperCase(),
        name: `${dto.ticker.toUpperCase()} Asset`,
        assetClass: dto.assetClass,
        quantity: 0,
        avgCost: 0,
        invested: 0,
        currentPrice: dto.price,
        marketValue: 0,
        unrealizedPl: 0,
        unrealizedPlPercent: 0,
        incomeReceived: 0,
      };
      positions.push(asset);
    }

    const newEvt: AssetEvent = {
      id: `evt-${Date.now()}`,
      assetId: asset.id,
      date: dto.date,
      type: dto.type,
      quantity: dto.quantity,
      price: dto.price,
      amount: dto.amount
    };

    events.push(newEvt);
    this.saveAssetEvents(events);

    // Update asset statistics
    if (dto.type === "Buy") {
      const oldCost = asset.invested;
      asset.invested += dto.amount;
      asset.quantity += dto.quantity;
      asset.avgCost = asset.quantity > 0 ? asset.invested / asset.quantity : 0;
    } else if (dto.type === "Sell") {
      asset.quantity = Math.max(0, asset.quantity - dto.quantity);
      asset.invested = asset.quantity * asset.avgCost; // Reduce invested proportionally
    } else if (dto.type === "Dividend" || dto.type === "Distribution") {
      asset.incomeReceived += dto.amount;

      // Add to income transactions automatically!
      this.createTransaction({
        accountId: "acc-1", // default checking account for income receipts
        date: dto.date,
        description: `${asset.ticker} Payout: ${dto.type}`,
        category: "Dividends & Interest",
        type: "Income",
        amount: dto.amount
      });
    }

    asset.marketValue = asset.quantity * asset.currentPrice;
    asset.unrealizedPl = asset.marketValue - asset.invested;
    asset.unrealizedPlPercent = asset.invested > 0 ? (asset.unrealizedPl / asset.invested) * 100 : 0;

    this.saveAssetPositions(positions);
    return newEvt;
  }

  static recordPriceSnapshot(dto: { prices: { ticker: string; price: number }[] }): void {
    const positions = this.getAssetPositions();
    dto.prices.forEach(p => {
      const asset = positions.find(pos => pos.ticker === p.ticker.toUpperCase());
      if (asset) {
        asset.currentPrice = p.price;
        asset.marketValue = asset.quantity * asset.currentPrice;
        asset.unrealizedPl = asset.marketValue - asset.invested;
        asset.unrealizedPlPercent = asset.invested > 0 ? (asset.unrealizedPl / asset.invested) * 100 : 0;
      }
    });
    this.saveAssetPositions(positions);
  }

  static createCategory(dto: CategoryDto): Category {
    const categories = this.getCategories();
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: dto.name,
      color: dto.color,
      icon: dto.icon
    };
    categories.push(newCat);
    this.saveCategories(categories);
    return newCat;
  }

  static updateCategory(id: string, dto: CategoryDto): Category {
    const categories = this.getCategories();
    const idx = categories.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("Category not found");
    const updated = { ...categories[idx], name: dto.name, color: dto.color, icon: dto.icon };
    categories[idx] = updated;
    this.saveCategories(categories);
    return updated;
  }

  static deleteCategory(id: string): void {
    const categories = this.getCategories();
    const idx = categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      categories.splice(idx, 1);
      this.saveCategories(categories);
    }
  }

  static createRecurrenceRule(dto: CreateRecurrenceRuleDto): RecurrenceRule {
    const rules = this.getRecurrenceRules();
    const newRule: RecurrenceRule = {
      id: `rec-${Date.now()}`,
      description: dto.description,
      amount: dto.amount,
      type: dto.type,
      frequency: dto.frequency,
      nextDueDate: dto.nextDueDate,
      autoPost: dto.autoPost
    };
    rules.push(newRule);
    this.saveRecurrenceRules(rules);
    return newRule;
  }

  static updateRecurrenceRule(id: string, dto: CreateRecurrenceRuleDto): RecurrenceRule {
    const rules = this.getRecurrenceRules();
    const idx = rules.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Rule not found");
    const updated: RecurrenceRule = {
      ...rules[idx],
      description: dto.description,
      amount: dto.amount,
      type: dto.type,
      frequency: dto.frequency,
      nextDueDate: dto.nextDueDate,
      autoPost: dto.autoPost
    };
    rules[idx] = updated;
    this.saveRecurrenceRules(rules);
    return updated;
  }

  static deleteRecurrenceRule(id: string): void {
    const rules = this.getRecurrenceRules();
    const idx = rules.findIndex(r => r.id === id);
    if (idx !== -1) {
      rules.splice(idx, 1);
      this.saveRecurrenceRules(rules);
    }
  }

  static confirmPendingRecurrence(id: string): void {
    const pendings = this.getPendingRecurrences();
    const idx = pendings.findIndex(p => p.id === id);
    if (idx === -1) return;

    const p = pendings[idx];
    // Create actual transaction
    this.createTransaction({
      accountId: p.accountId || "acc-1",
      date: p.dueDate,
      description: p.description,
      category: p.type === "Income" ? "Salary" : "Rent & Housing",
      type: p.type as any,
      amount: p.amount
    });

    // Remove pending
    pendings.splice(idx, 1);
    this.savePendingRecurrences(pendings);
  }

  static skipPendingRecurrence(id: string): void {
    const pendings = this.getPendingRecurrences();
    const idx = pendings.findIndex(p => p.id === id);
    if (idx !== -1) {
      pendings.splice(idx, 1);
      this.savePendingRecurrences(pendings);
    }
  }

  static createSavingsGoal(dto: SavingsGoalDto): SavingsGoal {
    const goals = this.getSavingsGoals();
    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      name: dto.name,
      targetAmount: dto.targetAmount,
      currentAmount: dto.currentAmount,
      targetDate: dto.targetDate
    };
    goals.push(newGoal);
    this.saveSavingsGoals(goals);
    return newGoal;
  }

  // Dashboard calculations
  static getDashboardSummary(): DashboardSummary {
    const accounts = this.getAccounts();
    const transactions = this.getTransactions();
    const positions = this.getAssetPositions();

    // Rates relative to EUR
    // EUR = 1, BRL = 0.17 EUR, USD = 0.92 EUR
    const getEurMultiplier = (currency: string) => {
      if (currency === "BRL") return 0.17;
      if (currency === "USD") return 0.92;
      return 1.0;
    };

    let cashBalance = 0;
    let investedAmount = 0;

    accounts.forEach(a => {
      if (a.isArchived) return;
      const mult = getEurMultiplier(a.currency);
      const balanceInEur = a.balance * mult;
      if (a.type === "Investment") {
        investedAmount += balanceInEur;
      } else {
        cashBalance += balanceInEur;
      }
    });

    // Also include stock market value in investedAmount
    let marketInvestments = 0;
    positions.forEach(p => {
      marketInvestments += p.marketValue; // Mock values are EUR
    });
    investedAmount += marketInvestments;

    const netWorth = cashBalance + investedAmount;

    // Calculate this month's net in EUR (July 2026 is current month)
    const thisMonth = "2026-07";
    let thisMonthIncome = 0;
    let thisMonthExpense = 0;
    transactions.forEach(t => {
      if (t.date.startsWith(thisMonth)) {
        const acc = accounts.find(a => a.id === t.accountId);
        const mult = acc ? getEurMultiplier(acc.currency) : 1.0;
        const amtEur = t.amount * mult;
        if (t.type === "Income") {
          thisMonthIncome += amtEur;
        } else if (t.type === "Expense") {
          thisMonthExpense += amtEur;
        }
      }
    });
    const thisMonthNet = thisMonthIncome - thisMonthExpense;

    // 12 Months Net Worth History (simulated evolution based on transactions)
    const netWorthHistory = [];
    const months = ["2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07"];
    
    // Set a base net worth starting in Aug 2025 and build up
    let runningNetWorth = netWorth - 15000;
    months.forEach((m, idx) => {
      runningNetWorth += 1200 + idx * 110; // realistic upward trend
      netWorthHistory.push({ month: m, amount: Math.round(runningNetWorth) });
    });

    // 12 Months Income vs Expenses
    const incomeVsExpenses = months.map((m, idx) => {
      let income = 3500;
      let expenses = 2000 + Math.sin(idx) * 300;
      // Add consulting income for BRL Nubank
      if (idx > 6) income += 800; // EUR equivalent of BRL consultings
      return {
        month: m,
        income: Math.round(income),
        expenses: Math.round(expenses)
      };
    });

    // Passive income trend (dividends over last 12 months)
    const passiveIncomeTrend = months.map((m) => {
      let amount = 0;
      if (m === "2025-11") amount = 85;
      else if (m === "2026-02") amount = 110;
      else if (m === "2026-05") amount = 130;
      else if (m === "2026-06") amount = 120;
      return { month: m, amount };
    });

    const trailing12MonthPassiveIncome = passiveIncomeTrend.reduce((sum, item) => sum + item.amount, 0);

    // Allocation charts
    const assetClasses: Record<string, number> = { "Cash": cashBalance };
    positions.forEach(p => {
      assetClasses[p.assetClass] = (assetClasses[p.assetClass] || 0) + p.marketValue;
    });
    const allocationByAssetClass = Object.entries(assetClasses).map(([name, value]) => ({ name, value: Math.round(value) }));

    const allocationByAccount = accounts.filter(a => !a.isArchived).map(a => {
      const mult = getEurMultiplier(a.currency);
      let value = a.balance * mult;
      if (a.id === "acc-3") {
        // DeGiro contains the market value of positions as well
        value += marketInvestments;
      }
      return { name: a.name, value: Math.round(value) };
    });

    return {
      netWorth: Math.round(netWorth),
      cashBalance: Math.round(cashBalance),
      investedAmount: Math.round(investedAmount),
      thisMonthNet: Math.round(thisMonthNet),
      netWorthHistory,
      incomeVsExpenses,
      passiveIncomeTrend,
      trailing12MonthPassiveIncome,
      allocationByAssetClass,
      allocationByAccount
    };
  }

  // Cash flow projection
  static getCashFlowProjection(horizon: number): CashFlowProjection {
    const summary = this.getDashboardSummary();
    const recurrenceRules = this.getRecurrenceRules();

    let balance = summary.netWorth;
    const history = [];
    const upcoming = [];

    // Monthly recurring costs
    let recurringIncome = 0;
    let recurringExpense = 0;
    recurrenceRules.forEach(r => {
      if (r.type === "Income") recurringIncome += r.amount;
      else recurringExpense += r.amount;
    });

    const monthlyNet = recurringIncome - recurringExpense;

    const currentYear = 2026;
    const currentMonth = 7; // July
    
    for (let i = 1; i <= horizon; i++) {
      balance += monthlyNet;
      
      let nextM = currentMonth + i;
      let nextY = currentYear;
      if (nextM > 12) {
        nextM -= 12;
        nextY += 1;
      }
      const monthStr = `${nextY}-${String(nextM).padStart(2, "0")}`;
      history.push({
        month: monthStr,
        balance: Math.round(balance),
        net: Math.round(monthlyNet)
      });
    }

    // List upcoming recurring transactions
    recurrenceRules.forEach(r => {
      upcoming.push({
        description: r.description,
        amount: r.amount,
        type: r.type,
        dueDate: r.nextDueDate
      });
    });

    return {
      history,
      upcoming: upcoming.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    };
  }

  // Import CSV
  static importTransactions(accountId: string, rows: any[]): number {
    const accounts = this.getAccounts();
    const account = accounts.find(a => a.id === accountId);
    if (!account) throw new Error("Account not found");

    let importedCount = 0;
    rows.forEach(row => {
      const date = row.Date || row.date || new Date().toISOString().split("T")[0];
      const desc = row.Description || row.description || "Imported transaction";
      const cat = row.Category || row.category || "Leisure";
      const type = row.Type || row.type || "Expense";
      const amt = parseFloat(row.Amount || row.amount || "0");

      if (amt > 0) {
        this.createTransaction({
          accountId,
          date,
          description: desc,
          category: cat,
          type: type as any,
          amount: amt
        });
        importedCount++;
      }
    });

    return importedCount;
  }
}
