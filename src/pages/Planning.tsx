import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Target, Compass, Plus, Edit2, Sparkles, TrendingUp, HelpCircle, 
  ChevronRight, Calendar, AlertTriangle, Check, RefreshCw, X, ArrowRight
} from "lucide-react";
import { 
  useBudgets, 
  useUpdateBudgetLimit, 
  useSavingsGoals, 
  useCreateSavingsGoal, 
  useUpdateSavingsGoalAmount, 
  useCashFlowProjection 
} from "../api/queries";
import { formatCurrency, formatDate, formatPercent } from "../utils/format";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "../components/Toast";

const goalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z.number().positive("Target amount must be greater than 0"),
  currentAmount: z.number().nonnegative("Starting amount cannot be negative"),
  targetDate: z.string().min(1, "Target date is required"),
});

type GoalFormValues = z.infer<typeof goalSchema>;

export const Planning: React.FC = () => {
  const { showToast } = useToast();
  
  // States
  const [selectedMonth, setSelectedMonth] = useState("2026-07");
  const [horizon, setHorizon] = useState(12); // 12 months cashflow
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  // Queries & Mutations
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets(selectedMonth);
  const updateBudgetMutation = useUpdateBudgetLimit();

  const { data: goals = [], isLoading: goalsLoading } = useSavingsGoals();
  const createGoalMutation = useCreateSavingsGoal();
  const updateGoalAmountMutation = useUpdateSavingsGoalAmount();

  const { data: projection = { history: [], upcoming: [] }, isLoading: projectionLoading } = useCashFlowProjection(horizon);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: { currentAmount: 0 },
  });

  const onSubmitGoal = (values: GoalFormValues) => {
    createGoalMutation.mutate(values, {
      onSuccess: () => {
        showToast(`Savings goal "${values.name}" created successfully!`, "success");
        setIsGoalModalOpen(false);
        reset();
      },
      onError: () => showToast("Failed to create savings goal.", "error"),
    });
  };

  const handleUpdateBudget = (category: string, currentLimit: number) => {
    const val = prompt(`Adjust monthly budget limit for "${category}":`, currentLimit.toString());
    if (val === null) return;
    const limit = parseFloat(val);
    if (isNaN(limit) || limit < 0) {
      showToast("Invalid budget amount.", "warning");
      return;
    }

    updateBudgetMutation.mutate(
      { category, limitAmount: limit, month: selectedMonth },
      {
        onSuccess: () => showToast(`Adjusted "${category}" budget to ${formatCurrency(limit, "EUR")}`, "success"),
        onError: () => showToast("Failed to update budget limit.", "error"),
      }
    );
  };

  const handleGoalContribution = (id: string, name: string, current: number) => {
    const val = prompt(`Enter new current savings amount for "${name}":`, current.toString());
    if (val === null) return;
    const amt = parseFloat(val);
    if (isNaN(amt) || amt < 0) {
      showToast("Invalid savings amount.", "warning");
      return;
    }

    updateGoalAmountMutation.mutate(
      { id, amount: amt },
      {
        onSuccess: () => showToast(`Updated "${name}" balance to ${formatCurrency(amt, "EUR")}`, "success"),
        onError: () => showToast("Failed to update goal amount.", "error"),
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Financial Planning & Forecasts</h1>
          <p className="text-xs text-slate-400 mt-1">Set monthly limit budgets, plan savings goals, and view cash forecasts</p>
        </div>
        <button
          onClick={() => setIsGoalModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Goal
        </button>
      </div>

      {/* Monthly Budgets Section */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-900 pb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Envelope Budget Allocation</h3>
            <p className="text-xs text-slate-500 mt-0.5">Control category-based spending thresholds</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Selected Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="2026-07">July 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-09">September 2026</option>
            </select>
          </div>
        </div>

        {budgetsLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(n => <div key={n} className="h-10 bg-slate-950/20 rounded-xl"></div>)}
          </div>
        ) : budgets.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No budgets set for this month.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((b) => {
              const spentPercent = b.limitAmount > 0 ? (b.spentAmount / b.limitAmount) * 100 : 0;
              const remaining = b.limitAmount - b.spentAmount;
              const isOver = b.spentAmount > b.limitAmount;

              return (
                <div key={b.id} className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200">{b.category}</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">Month: {b.month}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold font-mono text-slate-300">
                        {formatCurrency(b.spentAmount, "EUR")} / {formatCurrency(b.limitAmount, "EUR")}
                      </span>
                      <button
                        onClick={() => handleUpdateBudget(b.category, b.limitAmount)}
                        className="p-1 rounded hover:bg-slate-900 text-slate-500 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit limit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${isOver ? "bg-rose-500" : spentPercent > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(100, spentPercent)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-medium">
                    <span className={isOver ? "text-rose-400" : remaining > 50 ? "text-slate-500" : "text-amber-400"}>
                      {isOver 
                        ? `Over budget by ${formatCurrency(Math.abs(remaining), "EUR")}` 
                        : `${formatCurrency(remaining, "EUR")} remaining`
                      }
                    </span>
                    <span className="text-slate-500 font-mono">{spentPercent.toFixed(0)}%</span>
                  </div>

                  {isOver && (
                    <div className="absolute top-2 right-2 p-1 bg-rose-950/40 border border-rose-500/10 text-rose-400 rounded-lg">
                      <AlertTriangle className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Savings Goals Section */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-5">Durable Savings Goals</h3>
        {goalsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3].map(n => <div key={n} className="h-32 bg-slate-950/20 rounded-xl"></div>)}
          </div>
        ) : goals.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No savings goals logged.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map((g) => {
              const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
              const isFinished = g.currentAmount >= g.targetAmount;

              return (
                <div key={g.id} className="p-4 bg-slate-950 border border-slate-900 rounded-xl flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-semibold text-slate-200">{g.name}</h4>
                      {isFinished && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/10 animate-pulse">
                          <Check className="w-2.5 h-2.5" /> Met
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-100">
                      {formatCurrency(g.currentAmount, "EUR")}
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Goal limit target: {formatCurrency(g.targetAmount, "EUR")}
                    </span>
                  </div>

                  {/* Goal slider progress */}
                  <div className="mt-4 space-y-1.5">
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Target Date: {g.targetDate ? formatDate(g.targetDate) : "N/A"}</span>
                      <span className="font-mono font-semibold">{progress.toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Add contribution */}
                  <button
                    onClick={() => handleGoalContribution(g.id, g.name, g.currentAmount)}
                    className="w-full mt-4 py-1.5 text-[11px] font-semibold text-indigo-400 bg-slate-900 border border-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    Adjust Savings Amount
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cash Flow Projection Section */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">12-Month Cash Flow Forecasting</h3>
            <p className="text-xs text-slate-500 mt-0.5">Calculated using recurring rules and current checking liquid reserves</p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-900">
            {([6, 12, 24] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3 py-1 text-[10px] font-bold font-mono rounded-lg transition-all ${
                  horizon === h 
                    ? "bg-indigo-600 text-white" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {h}M
              </button>
            ))}
          </div>
        </div>

        {projectionLoading ? (
          <div className="h-64 bg-slate-950/20 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-500">
            Forecasting balances over time...
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projection?.history || []}>
                <defs>
                  <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `€${Math.round(v/1000)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                  labelStyle={{ color: "#94a3b8" }}
                  formatter={(val: number) => [formatCurrency(val, "EUR"), "Projected Balance"]}
                />
                <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProj)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* CREATE GOAL MODAL */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-base font-semibold text-slate-100">Set Savings Goal</h2>
              <button onClick={() => setIsGoalModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitGoal)} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Goal Description Name</label>
                <input
                  type="text"
                  placeholder="e.g., Tesla Downpayment, Downside Buffer"
                  {...register("name")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
                {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Target Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Amount (EUR)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="10000"
                    {...register("targetAmount", { valueAsNumber: true })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                  {errors.targetAmount && <p className="text-xs text-rose-400 mt-1">{errors.targetAmount.message}</p>}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Date</label>
                  <input
                    type="date"
                    {...register("targetDate")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                  {errors.targetDate && <p className="text-xs text-rose-400 mt-1">{errors.targetDate.message}</p>}
                </div>
              </div>

              {/* Starting Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Opening Saved Balance</label>
                <input
                  type="number"
                  step="1"
                  placeholder="0"
                  {...register("currentAmount", { valueAsNumber: true })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
                {errors.currentAmount && <p className="text-xs text-rose-400 mt-1">{errors.currentAmount.message}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
