import React from "react";
import { Link } from "react-router-dom";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, TrendingDown, Landmark, Wallet, Layers, ArrowUpRight, 
  Clock, AlertCircle, Check, X, RefreshCw
} from "lucide-react";
import { 
  useDashboardSummary, 
  usePendingRecurrences, 
  useConfirmPendingRecurrence, 
  useSkipPendingRecurrence 
} from "../api/queries";
import { formatCurrency } from "../utils/format";
import { useToast } from "../components/Toast";

const COLORS_ASSETS = ["#8b5cf6", "#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#ec4899"];
const COLORS_ACCOUNTS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#ef4444"];

export const Dashboard: React.FC = () => {
  const { data: summary, isLoading, error, refetch } = useDashboardSummary();
  const { data: pending = [] } = usePendingRecurrences();
  const confirmMutation = useConfirmPendingRecurrence();
  const skipMutation = useSkipPendingRecurrence();
  const { showToast } = useToast();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-mono">Loading financial dashboard...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-md mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-semibold text-slate-200">Failed to load summary</h3>
        <p className="text-sm text-slate-400 mt-2">There was an issue fetching dashboard data. Please check your network connection.</p>
        <button onClick={() => refetch()} className="mt-5 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-500 transition-colors">
          Retry Fetch
        </button>
      </div>
    );
  }

  const handleConfirmPending = (id: string, name: string) => {
    confirmMutation.mutate(id, {
      onSuccess: () => showToast(`Posted recurrence: ${name}`, "success"),
      onError: () => showToast("Failed to post transaction.", "error"),
    });
  };

  const handleSkipPending = (id: string, name: string) => {
    skipMutation.mutate(id, {
      onSuccess: () => showToast(`Skipped recurrence: ${name}`, "info"),
      onError: () => showToast("Failed to skip transaction.", "error"),
    });
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Net Worth</span>
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold font-mono italic tracking-tight text-slate-100">
            {formatCurrency(summary.netWorth, "EUR")}
          </h3>
          <p className="text-[10px] text-emerald-500 font-medium mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+4.2% from last month</span>
          </p>
        </div>

        {/* Cash Balance */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cash Balance</span>
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold font-mono italic tracking-tight text-slate-100">
            {formatCurrency(summary.cashBalance, "EUR")}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1.5">Liquid across connected accounts</p>
        </div>

        {/* Invested Amount */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Invested Amount</span>
            <Landmark className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <h3 className="text-xl font-bold font-mono italic tracking-tight text-slate-100">
            {formatCurrency(summary.investedAmount, "EUR")}
          </h3>
          <p className="text-[10px] text-indigo-400 font-medium mt-1.5">84% of total asset allocation</p>
        </div>

        {/* This Month Net */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">This Month Net</span>
            {summary.thisMonthNet >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>
          <h3 className={`text-xl font-bold font-mono italic tracking-tight ${summary.thisMonthNet >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {summary.thisMonthNet >= 0 ? "+" : ""}{formatCurrency(summary.thisMonthNet, "EUR")}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1.5">Target net saving: €1,800.00</p>
        </div>
      </div>

      {/* Pending Recurrences Panel */}
      {pending.length > 0 && (
        <div className="bg-slate-900/25 border border-amber-500/10 rounded-2xl p-6 bg-gradient-to-r from-amber-500/[0.02] to-transparent">
          <h3 className="text-sm font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <Clock className="w-4.5 h-4.5" />
            Pending Recurring Transactions Awaiting Confirmation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-900">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{p.description}</h4>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                    <span className="font-mono font-semibold text-indigo-400">{formatCurrency(p.amount, "EUR")}</span>
                    <span>•</span>
                    <span>Due: {p.dueDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSkipPending(p.id, p.description)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-all border border-slate-800"
                    title="Skip instance"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleConfirmPending(p.id, p.description)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/10 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Post
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Charts: Net Worth & Income vs Expense */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Net Worth Area Chart */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-5">Net Worth Trend (Monthly)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.netWorthHistory}>
                <defs>
                  <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `€${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                  formatter={(val: any) => [formatCurrency(val, "EUR"), "Net Worth"]}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorNetWorth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income vs Expense Bar Chart */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-5">Income vs Expenses (Trailing 12 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.incomeVsExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `€${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                  labelStyle={{ color: "#94a3b8" }}
                  formatter={(val: any) => [formatCurrency(val, "EUR")]}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Passive Income Trend & Donut Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Passive Income Line Chart */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-200">Passive Income Trend</h3>
            <span className="text-[10px] font-mono bg-emerald-950/50 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg" title="Trailing 12 Month Passive Income">
              TTM: {formatCurrency(summary.trailing12MonthPassiveIncome, "EUR")}
            </span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.passiveIncomeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                  labelStyle={{ color: "#94a3b8" }}
                  formatter={(val: any) => [formatCurrency(val, "EUR"), "Dividends"]}
                />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation by Asset Class */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 lg:col-span-1 flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Asset Class Allocation</h3>
          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.allocationByAssetClass}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {summary.allocationByAssetClass.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_ASSETS[index % COLORS_ASSETS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                  formatter={(val: any) => [formatCurrency(val, "EUR")]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {summary.allocationByAssetClass.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS_ASSETS[index % COLORS_ASSETS.length] }} />
                <span className="truncate">{item.name}</span>
                <span className="font-mono ml-auto font-semibold text-slate-300">{formatCurrency(item.value, "EUR")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Allocation by Account */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 lg:col-span-1 flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Account Allocation</h3>
          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.allocationByAccount}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {summary.allocationByAccount.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_ACCOUNTS[index % COLORS_ACCOUNTS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                  formatter={(val: any) => [formatCurrency(val, "EUR")]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {summary.allocationByAccount.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS_ACCOUNTS[index % COLORS_ACCOUNTS.length] }} />
                <span className="truncate">{item.name}</span>
                <span className="font-mono ml-auto font-semibold text-slate-300">{formatCurrency(item.value, "EUR")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
