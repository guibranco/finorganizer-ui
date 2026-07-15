import React, { useState } from "react";
import { 
  Plus, Upload, Tag, Search, ArrowRightLeft, Trash2, Edit2, 
  ChevronLeft, ChevronRight, X, Calendar, Filter, CheckCircle
} from "lucide-react";
import { 
  useTransactions, 
  useAccounts, 
  useCategories, 
  useDeleteTransaction, 
  useCreateTransaction 
} from "../api/queries";
import { formatCurrency, formatDate } from "../utils/format";
import { CsvImportWizard } from "../components/CsvImportWizard";
import { CategoryManagement } from "../components/CategoryManagement";
import { useToast } from "../components/Toast";

export const Transactions: React.FC = () => {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const deleteMutation = useDeleteTransaction();
  const createMutation = useCreateTransaction();
  const { showToast } = useToast();

  // Filters state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [accountId, setAccountId] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modals state
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // Fetch transactions based on filters
  const { data: txData, isLoading } = useTransactions({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    accountId: accountId || undefined,
    category: category || undefined,
    type: type || undefined,
    search: search || undefined,
    page,
    pageSize: 15,
  });

  // Inline Quick-Add Row State
  const [inlineDate, setInlineDate] = useState(new Date().toISOString().split("T")[0]);
  const [inlineDesc, setInlineDesc] = useState("");
  const [inlineCat, setInlineCat] = useState("Groceries");
  const [inlineType, setInlineType] = useState<"Expense" | "Income">("Expense");
  const [inlineAmount, setInlineAmount] = useState<number | "">("");
  const [inlineAcc, setInlineAcc] = useState("");

  // Transfer Form State
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState<number | "">("");
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split("T")[0]);
  const [transferDesc, setTransferDesc] = useState("Funds Transfer");

  // Set default account for inline adding once accounts load
  React.useEffect(() => {
    if (accounts.length > 0 && !inlineAcc) {
      const active = accounts.find(a => !a.isArchived);
      if (active) {
        setInlineAcc(active.id);
        setTransferFrom(active.id);
      }
    }
  }, [accounts, inlineAcc]);

  // Set default category
  React.useEffect(() => {
    if (categories.length > 0) {
      setInlineCat(categories[1]?.name || "Groceries");
    }
  }, [categories]);

  const handleDelete = (id: string, desc: string) => {
    if (confirm(`Are you sure you want to delete transaction "${desc}"?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => showToast(`Deleted "${desc}"`, "success"),
        onError: () => showToast("Failed to delete transaction.", "error"),
      });
    }
  };

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineDesc) {
      showToast("Please enter a description.", "warning");
      return;
    }
    if (!inlineAmount || inlineAmount <= 0) {
      showToast("Please enter a positive amount.", "warning");
      return;
    }
    if (!inlineAcc) {
      showToast("Please select an account.", "warning");
      return;
    }

    createMutation.mutate(
      {
        accountId: inlineAcc,
        date: inlineDate,
        description: inlineDesc,
        category: inlineCat,
        type: inlineType,
        amount: Number(inlineAmount),
      },
      {
        onSuccess: () => {
          showToast(`Added transaction: ${inlineDesc}`, "success");
          setInlineDesc("");
          setInlineAmount("");
        },
        onError: () => {
          showToast("Failed to add transaction.", "error");
        },
      }
    );
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferFrom || !transferTo) {
      showToast("Please specify both From and To accounts.", "warning");
      return;
    }
    if (transferFrom === transferTo) {
      showToast("Source and destination accounts must differ.", "warning");
      return;
    }
    if (!transferAmount || transferAmount <= 0) {
      showToast("Please specify a valid transfer amount.", "warning");
      return;
    }

    createMutation.mutate(
      {
        accountId: transferFrom,
        date: transferDate,
        description: transferDesc,
        category: "Investments",
        type: "Transfer",
        amount: Number(transferAmount),
        toAccountId: transferTo,
      },
      {
        onSuccess: () => {
          showToast(`Successfully transferred funds!`, "success");
          setIsTransferOpen(false);
          setTransferAmount("");
          setTransferDesc("Funds Transfer");
        },
        onError: () => {
          showToast("Transfer execution failed.", "error");
        },
      }
    );
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setAccountId("");
    setCategory("");
    setType("");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Ledger & Transactions</h1>
          <p className="text-xs text-slate-400 mt-1">Review, filter, and quick add items to your double-entry book</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Transfer Flow trigger */}
          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-indigo-400 font-semibold text-xs rounded-xl border border-slate-800 transition-all"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transfer Funds
          </button>
          
          {/* Category management trigger */}
          <button
            onClick={() => setIsCatOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-slate-800 transition-all"
          >
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            Categories
          </button>

          {/* CSV Import Wizard trigger */}
          <button
            onClick={() => setIsCsvOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-98 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            CSV Import
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-slate-900 pb-3">
          <span className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-indigo-400" />
            Filter Ledger
          </span>
          {(startDate || endDate || accountId || category || type || search) && (
            <button onClick={handleClearFilters} className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Clear All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description, payee..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Account selector */}
          <div>
            <select
              value={accountId}
              onChange={(e) => { setAccountId(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Accounts</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* Category selector */}
          <div>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {/* Type selector */}
          <div>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
              <option value="Transfer">Transfer</option>
            </select>
          </div>

          {/* Date range trigger/display */}
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              title="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              title="End Date"
            />
          </div>
        </div>
      </div>

      {/* Inline Quick-Add Row */}
      <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-4">
        <h3 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-emerald-400" />
          Inline Quick-Add Transaction
        </h3>
        <form onSubmit={handleInlineSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          <input
            type="date"
            value={inlineDate}
            onChange={(e) => setInlineDate(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <input
            type="text"
            placeholder="Description / Payee"
            value={inlineDesc}
            onChange={(e) => setInlineDesc(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 lg:col-span-2"
          />

          <select
            value={inlineCat}
            onChange={(e) => setInlineCat(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>

          <select
            value={inlineType}
            onChange={(e) => setInlineType(e.target.value as any)}
            className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>

          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={inlineAmount}
            onChange={(e) => setInlineAmount(e.target.value === "" ? "" : Number(e.target.value))}
            className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <select
            value={inlineAcc}
            onChange={(e) => setInlineAcc(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {accounts.filter(a => !a.isArchived).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          <button
            type="submit"
            className="lg:col-span-7 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-xl text-xs transition-colors shadow-lg hover:shadow-indigo-600/15"
          >
            Quick Post
          </button>
        </form>
      </div>

      {/* Ledger Log Panel */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map(n => <div key={n} className="h-12 bg-slate-950/20 rounded-xl"></div>)}
          </div>
        ) : !txData || txData.items.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No ledger entries match your filter rules. Try relaxing search filters.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Account</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {txData.items.map((tx: any) => {
                    const acc = accounts.find(a => a.id === tx.accountId);
                    const currency = acc?.currency || "EUR";

                    return (
                      <tr key={tx.id} className="group hover:bg-slate-950/30 transition-all">
                        <td className="py-4 px-4 font-mono text-xs text-slate-400">{formatDate(tx.date)}</td>
                        <td className="py-4 px-4 text-slate-300 font-medium text-xs truncate max-w-[120px]" title={tx.accountName}>
                          {tx.accountName}
                        </td>
                        <td className="py-4 px-4 text-slate-100 font-semibold">
                          {tx.description}
                          {tx.toAccountName && (
                            <span className="text-[10px] text-indigo-400 font-semibold ml-2 inline-flex items-center gap-0.5 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/20">
                              → {tx.toAccountName}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-950 border border-slate-850 text-slate-300">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-xs font-bold ${
                            tx.type === "Income" ? "text-emerald-400" : tx.type === "Expense" ? "text-rose-400" : "text-indigo-400"
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-bold font-mono text-sm">
                          <span className={tx.type === "Income" ? "text-emerald-400" : tx.type === "Expense" ? "text-rose-400" : "text-indigo-400"}>
                            {tx.type === "Income" ? "+" : tx.type === "Expense" ? "-" : ""}
                            {formatCurrency(tx.amount, currency)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleDelete(tx.id, tx.description)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-slate-900 text-slate-500 hover:text-rose-400 transition-all"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {txData.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-900 pt-5 text-xs text-slate-400">
                <span>Showing page <b>{txData.page}</b> of {txData.totalPages} ({txData.totalCount} items)</span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-slate-400 hover:text-slate-200 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= txData.totalPages}
                    onClick={() => setPage(p => Math.min(txData.totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-slate-400 hover:text-slate-200 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      <CsvImportWizard isOpen={isCsvOpen} onClose={() => setIsCsvOpen(false)} />
      <CategoryManagement isOpen={isCatOpen} onClose={() => setIsCatOpen(false)} />

      {/* Transfer Funds Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
                Inter-Account Funds Transfer
              </h2>
              <button onClick={() => setIsTransferOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* From */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">From Account</label>
                  <select
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    {accounts.filter(a => !a.isArchived).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>

                {/* To */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">To Account</label>
                  <select
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="">Select recipient...</option>
                    {accounts.filter(a => !a.isArchived).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Memo Description</label>
                <input
                  type="text"
                  value={transferDesc}
                  onChange={(e) => setTransferDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
