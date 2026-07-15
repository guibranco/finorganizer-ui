import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, ArrowRightLeft } from "lucide-react";
import { useAccounts, useCategories, useCreateTransaction } from "../api/queries";
import { useToast } from "./Toast";

const schema = z.object({
  type: z.enum(["Income", "Expense", "Transfer"]),
  accountId: z.string().min(1, "Account is required"),
  toAccountId: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be greater than 0"),
});

type FormValues = z.infer<typeof schema>;

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createTxMutation = useCreateTransaction();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "Expense",
      date: new Date().toISOString().split("T")[0],
      amount: undefined as any,
    },
  });

  const txType = watch("type");

  // Keyboard shortcut submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Let standard form submit handle it
    }
  };

  useEffect(() => {
    if (isOpen) {
      reset({
        type: "Expense",
        date: new Date().toISOString().split("T")[0],
        accountId: accounts.find(a => !a.isArchived)?.id || "",
        category: categories[1]?.name || "Groceries",
        amount: undefined as any,
        description: "",
      });
    }
  }, [isOpen, reset, accounts, categories]);

  if (!isOpen) return null;

  const onSubmit = (values: FormValues) => {
    if (values.type === "Transfer" && !values.toAccountId) {
      showToast("Destination account is required for transfers.", "error");
      return;
    }
    if (values.type === "Transfer" && values.accountId === values.toAccountId) {
      showToast("Cannot transfer to the same account.", "error");
      return;
    }

    createTxMutation.mutate(
      {
        accountId: values.accountId,
        date: values.date,
        description: values.description,
        category: values.type === "Transfer" ? "Investments" : values.category,
        type: values.type,
        amount: values.amount,
        toAccountId: values.type === "Transfer" ? values.toAccountId : undefined,
      },
      {
        onSuccess: () => {
          showToast(`Transaction "${values.description}" created successfully!`, "success");
          onClose();
        },
        onError: () => {
          showToast("Failed to create transaction.", "error");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden" onKeyDown={handleKeyDown}>
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
            Quick Add Transaction
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Type</label>
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl">
              {(["Expense", "Income", "Transfer"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue("type", t)}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    txType === t
                      ? t === "Income"
                        ? "bg-emerald-500 text-white shadow-md"
                        : t === "Expense"
                        ? "bg-rose-500 text-white shadow-md"
                        : "bg-indigo-500 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Account */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {txType === "Transfer" ? "From Account" : "Account"}
              </label>
              <select
                {...register("accountId")}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {accounts.filter(a => !a.isArchived).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.currency})
                  </option>
                ))}
              </select>
              {errors.accountId && <p className="text-xs text-rose-400 mt-1">{errors.accountId.message}</p>}
            </div>

            {/* To Account (if transfer) */}
            {txType === "Transfer" ? (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">To Account</label>
                <select
                  {...register("toAccountId")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select recipient...</option>
                  {accounts.filter(a => !a.isArchived).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </option>
                  ))}
                </select>
                {errors.toAccountId && <p className="text-xs text-rose-400 mt-1">{errors.toAccountId.message}</p>}
              </div>
            ) : (
              /* Category (if not transfer) */
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
                <select
                  {...register("category")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-xs text-rose-400 mt-1">{errors.category.message}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("amount", { valueAsNumber: true })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.amount && <p className="text-xs text-rose-400 mt-1">{errors.amount.message}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Date</label>
              <input
                type="date"
                {...register("date")}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.date && <p className="text-xs text-rose-400 mt-1">{errors.date.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
            <input
              type="text"
              placeholder="Rent, Groceries, Salary, etc."
              {...register("description")}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.description && <p className="text-xs text-rose-400 mt-1">{errors.description.message}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTxMutation.isPending}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              {createTxMutation.isPending ? "Adding..." : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
