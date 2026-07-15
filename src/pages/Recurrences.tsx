import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Plus, Edit2, Trash2, Calendar, ShieldCheck, CheckSquare, X, 
  TrendingUp, TrendingDown, RefreshCw, Layers, Coins
} from "lucide-react";
import { 
  useRecurrenceRules, 
  useCreateRecurrenceRule, 
  useUpdateRecurrenceRule, 
  useDeleteRecurrenceRule 
} from "../api/queries";
import { formatCurrency, formatDate } from "../utils/format";
import { useToast } from "../components/Toast";

const schema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["Income", "Expense"]),
  frequency: z.enum(["Weekly", "Monthly", "Yearly"]),
  nextDueDate: z.string().min(1, "Next due date is required"),
  autoPost: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export const Recurrences: React.FC = () => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any | null>(null);

  const { data: rules = [], isLoading, refetch } = useRecurrenceRules();
  const createMutation = useCreateRecurrenceRule();
  const updateMutation = useUpdateRecurrenceRule();
  const deleteMutation = useDeleteRecurrenceRule();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { autoPost: false, frequency: "Monthly", type: "Expense" },
  });

  const onSubmit = (values: FormValues) => {
    if (editingRule) {
      updateMutation.mutate(
        { id: editingRule.id, dto: values },
        {
          onSuccess: () => {
            showToast(`Recurrence rule updated!`, "success");
            setIsModalOpen(false);
            setEditingRule(null);
            reset();
          },
          onError: () => showToast("Failed to update recurrence rule.", "error"),
        }
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          showToast(`Recurrence rule created!`, "success");
          setIsModalOpen(false);
          reset();
        },
        onError: () => showToast("Failed to create recurrence rule.", "error"),
      });
    }
  };

  const handleOpenCreate = () => {
    setEditingRule(null);
    reset({
      description: "",
      amount: undefined as any,
      type: "Expense",
      frequency: "Monthly",
      nextDueDate: new Date().toISOString().split("T")[0],
      autoPost: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: any) => {
    setEditingRule(rule);
    reset({
      description: rule.description,
      amount: rule.amount,
      type: rule.type,
      frequency: rule.frequency,
      nextDueDate: rule.nextDueDate,
      autoPost: rule.autoPost,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, desc: string) => {
    if (confirm(`Are you sure you want to delete the recurring rule "${desc}"?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => showToast(`Deleted recurring rule "${desc}"`, "success"),
        onError: () => showToast("Failed to delete recurrence rule.", "error"),
      });
    }
  };

  // Calculations
  const fixedIncome = rules.filter(r => r.type === "Income").reduce((sum, r) => sum + r.amount, 0);
  const fixedCost = rules.filter(r => r.type === "Expense").reduce((sum, r) => sum + r.amount, 0);
  const netRecurring = fixedIncome - fixedCost;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Recurring Schedules</h1>
          <p className="text-xs text-slate-400 mt-1">Manage fixed expenses, subscriptions, or salaries with auto-posting mechanics</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Schedule
        </button>
      </div>

      {/* Recurrent Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fixed Expenses */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 block">Monthly Fixed Costs</span>
          <h3 className="text-2xl font-bold font-mono tracking-tight text-rose-400 mt-1.5">
            -{formatCurrency(fixedCost, "EUR")}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Total of all recurring expenses/subscriptions</p>
        </div>

        {/* Fixed Inflow */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 block">Monthly Recurring Income</span>
          <h3 className="text-2xl font-bold font-mono tracking-tight text-emerald-400 mt-1.5">
            +{formatCurrency(fixedIncome, "EUR")}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Stable monthly revenues (e.g. Salaries, Rent yields)</p>
        </div>

        {/* Net Flow */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 block">Recurring Net Baseline</span>
          <h3 className={`text-2xl font-bold font-mono tracking-tight mt-1.5 ${netRecurring >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {netRecurring >= 0 ? "+" : ""}{formatCurrency(netRecurring, "EUR")}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Calculated structural monthly baseline surplus</p>
        </div>
      </div>

      {/* Recurrence table */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-5">Active Recurring Rules</h3>
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(n => <div key={n} className="h-12 bg-slate-950/20 rounded-xl"></div>)}
          </div>
        ) : rules.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-12">No active rules configured. Click "Add Schedule" to configure.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Frequency</th>
                  <th className="py-3 px-4">Next Billing</th>
                  <th className="py-3 px-4 text-center">Auto-Post</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {rules.map((rule) => (
                  <tr key={rule.id} className="group hover:bg-slate-950/30 transition-all">
                    <td className="py-4 px-4 font-semibold text-slate-200">{rule.description}</td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-semibold ${rule.type === "Income" ? "text-emerald-400" : "text-rose-400"}`}>
                        {rule.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-bold font-mono text-xs">
                      <span className={rule.type === "Income" ? "text-emerald-400" : "text-rose-400"}>
                        {rule.type === "Income" ? "+" : "-"}
                        {formatCurrency(rule.amount, "EUR")}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-xs font-mono">{rule.frequency}</td>
                    <td className="py-4 px-4 text-slate-400 text-xs font-mono">{formatDate(rule.nextDueDate)}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                        rule.autoPost 
                          ? "bg-indigo-950 text-indigo-400 border border-indigo-500/10" 
                          : "bg-slate-950 text-slate-500 border border-slate-800"
                      }`}>
                        {rule.autoPost ? "Enabled" : "Manual"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(rule)}
                          className="p-1.5 rounded hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Edit rule"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id, rule.description)}
                          className="p-1.5 rounded hover:bg-slate-900 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-base font-semibold text-slate-100">
                {editingRule ? "Edit Recurring Rule" : "Create Recurring Rule"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description</label>
                <input
                  type="text"
                  placeholder="e.g., Netflix subscription, Rent"
                  {...register("description")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.description && <p className="text-xs text-rose-400 mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Amount (EUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("amount", { valueAsNumber: true })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.amount && <p className="text-xs text-rose-400 mt-1">{errors.amount.message}</p>}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Rule Inflow/Outflow</label>
                  <select
                    {...register("type")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="Expense">Expense / Outflow</option>
                    <option value="Income">Income / Inflow</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Frequency */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Billing Frequency</label>
                  <select
                    {...register("frequency")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

                {/* Next due date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Next Due Date</label>
                  <input
                    type="date"
                    {...register("nextDueDate")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                  {errors.nextDueDate && <p className="text-xs text-rose-400 mt-1">{errors.nextDueDate.message}</p>}
                </div>
              </div>

              {/* Auto post */}
              <div className="flex items-center gap-3 p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                <input
                  type="checkbox"
                  id="autoPost"
                  {...register("autoPost")}
                  className="w-4.5 h-4.5 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500 focus:ring-offset-slate-900"
                />
                <label htmlFor="autoPost" className="text-xs text-slate-300 font-medium select-none cursor-pointer">
                  <b>Auto-Post</b>: System automatically posts transaction ledger entry on due date without prompting confirmation.
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  {editingRule ? "Apply Changes" : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
