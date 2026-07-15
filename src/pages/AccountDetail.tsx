import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  X, ArrowLeft, ArrowUpRight, ArrowDownRight, RefreshCw, 
  Trash2, CreditCard, Sparkles, TrendingUp, HelpCircle
} from "lucide-react";
import { useAccounts, useAccountHistory, useTransactions, useDeleteTransaction } from "../api/queries";
import { formatCurrency, formatDate } from "../utils/format";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "../components/Toast";

export const AccountDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: accounts = [] } = useAccounts();
  const account = accounts.find((a) => a.id === id);

  const { data: history = [], isLoading: historyLoading } = useAccountHistory(id || "");
  const { data: txData, isLoading: txsLoading } = useTransactions({ accountId: id });
  const deleteTxMutation = useDeleteTransaction();

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-slate-900/40 border border-slate-900 rounded-2xl">
        <HelpCircle className="w-12 h-12 text-slate-500 mb-4" />
        <h3 className="text-base font-semibold text-slate-200">Account not found</h3>
        <p className="text-xs text-slate-400 mt-1">The account you are looking for does not exist or has been deleted.</p>
        <Link to="/accounts" className="mt-5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to Accounts
        </Link>
      </div>
    );
  }

  const handleDeleteTx = (txId: string, desc: string) => {
    if (confirm(`Are you sure you want to delete transaction "${desc}"?`)) {
      deleteTxMutation.mutate(txId, {
        onSuccess: () => showToast(`Deleted "${desc}"`, "success"),
        onError: () => showToast("Failed to delete transaction.", "error"),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/accounts")}
          className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hover:text-slate-400">
              <Link to="/accounts">Accounts</Link>
            </span>
            <span className="text-xs text-slate-700">/</span>
            <span className="text-xs text-slate-300 font-semibold">{account.name}</span>
          </div>
          <h1 className="text-lg font-bold text-slate-100 mt-1 flex items-center gap-2.5">
            {account.name}
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              {account.currency}
            </span>
          </h1>
        </div>
      </div>

      {/* Grid of Balance History & Account Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Sparkline */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-200 mb-5">Balance Evolution</h3>
          {historyLoading ? (
            <div className="h-60 bg-slate-950/20 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-500">
              Computing balance timeline...
            </div>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatDate} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                    labelStyle={{ color: "#94a3b8" }}
                    formatter={(val: any) => [formatCurrency(val, account.currency), "Balance"]}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Account metrics summary card */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Account Summary</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900">
                <span className="text-xs text-slate-500 uppercase font-medium">Current Balance</span>
                <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight mt-1">
                  {formatCurrency(account.balance, account.currency)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900/60">
                  <span className="text-[10px] text-slate-500 uppercase font-medium">Type</span>
                  <div className="text-xs font-semibold text-slate-300 mt-1">{account.type}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900/60">
                  <span className="text-[10px] text-slate-500 uppercase font-medium">Currency</span>
                  <div className="text-xs font-semibold text-slate-300 mt-1">{account.currency}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-900 text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>Balance updates with each ledger entry.</span>
          </div>
        </div>
      </div>

      {/* Account Transactions Ledger */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-5">Ledger Entries</h3>
        {txsLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 bg-slate-950/20 rounded-xl"></div>
            ))}
          </div>
        ) : !txData?.items || txData.items.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No transactions found for this account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold text-xs">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {txData.items.map((tx: any) => (
                  <tr key={tx.id} className="group hover:bg-slate-950/30 transition-all">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{formatDate(tx.date)}</td>
                    <td className="py-3.5 px-4 text-slate-200 font-medium">
                      {tx.description}
                      {tx.toAccountName && (
                        <span className="text-[10px] text-indigo-400 font-semibold ml-2 inline-flex items-center gap-0.5 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/20">
                          → {tx.toAccountName}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-950 border border-slate-800 text-slate-300">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-semibold ${
                        tx.type === "Income" ? "text-emerald-400" : tx.type === "Expense" ? "text-rose-400" : "text-indigo-400"
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold font-mono">
                      <span className={tx.type === "Income" ? "text-emerald-400" : tx.type === "Expense" ? "text-rose-400" : "text-indigo-400"}>
                        {tx.type === "Income" ? "+" : tx.type === "Expense" ? "-" : ""}
                        {formatCurrency(tx.amount, account.currency)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDeleteTx(tx.id, tx.description)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 hover:text-rose-400 text-slate-500 transition-all"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
