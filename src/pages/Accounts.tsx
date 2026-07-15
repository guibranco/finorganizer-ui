import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  CreditCard, Plus, Edit2, Archive, ChevronRight, X, ArrowUpRight, 
  Wallet, Landmark, ShieldAlert, Sparkles, Check, Trash
} from "lucide-react";
import { useAccounts, useCreateAccount, useUpdateAccount, useArchiveAccount } from "../api/queries";
import { formatCurrency } from "../utils/format";
import { useToast } from "../components/Toast";

const schema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.string().min(1, "Account type is required"),
  currency: z.string().min(1, "Currency is required"),
  initialBalance: z.number().min(0, "Initial balance cannot be negative").optional(),
});

type FormValues = z.infer<typeof schema>;

export const Accounts: React.FC = () => {
  const { data: accounts = [], isLoading } = useAccounts();
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const archiveMutation = useArchiveAccount();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const handleOpenCreate = () => {
    setEditingAccount(null);
    reset({
      name: "",
      type: "Cash",
      currency: "EUR",
      initialBalance: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: any, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingAccount(acc);
    reset({
      name: acc.name,
      type: acc.type,
      currency: acc.currency,
      initialBalance: acc.balance,
    });
    setIsModalOpen(true);
  };

  const handleArchive = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm(`Are you sure you want to archive account "${name}"?`)) {
      archiveMutation.mutate(id, {
        onSuccess: () => showToast(`Archived account "${name}"`, "success"),
        onError: () => showToast("Failed to archive account.", "error"),
      });
    }
  };

  const onSubmit = (values: FormValues) => {
    if (editingAccount) {
      updateMutation.mutate(
        {
          id: editingAccount.id,
          dto: {
            name: values.name,
            type: values.type,
            currency: values.currency,
            isArchived: editingAccount.isArchived,
          },
        },
        {
          onSuccess: () => {
            showToast(`Account "${values.name}" updated successfully!`, "success");
            setIsModalOpen(false);
          },
          onError: () => {
            showToast("Failed to update account.", "error");
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          name: values.name,
          type: values.type,
          currency: values.currency,
          initialBalance: values.initialBalance || 0,
        },
        {
          onSuccess: () => {
            showToast(`Account "${values.name}" created successfully!`, "success");
            setIsModalOpen(false);
          },
          onError: () => {
            showToast("Failed to create account.", "error");
          },
        }
      );
    }
  };

  const getAccountIcon = (type: string) => {
    if (type === "Investment") return <Landmark className="w-5 h-5 text-indigo-400" />;
    if (type === "Savings") return <Sparkles className="w-5 h-5 text-emerald-400" />;
    return <Wallet className="w-5 h-5 text-sky-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Your Accounts</h1>
          <p className="text-xs text-slate-400 mt-1">Manage physical checking, digital savings, or brokers</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Account
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-slate-900/40 border border-slate-900 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => (
            <Link
              key={acc.id}
              to={`/accounts/${acc.id}`}
              className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                acc.isArchived
                  ? "bg-slate-950/20 border-slate-950/40 opacity-50"
                  : "bg-slate-900/40 border-slate-900 hover:border-slate-800 hover:shadow-xl hover:shadow-slate-950/30"
              }`}
            >
              {/* Account Top info */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 transition-colors">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-200 group-hover:text-slate-100 transition-colors text-sm">
                        {acc.name}
                      </h3>
                      <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-[10px] font-medium font-mono bg-slate-950 text-slate-400 border border-slate-800/60">
                        {acc.type}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  {!acc.isArchived && (
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleOpenEdit(acc, e)}
                        className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Edit account"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleArchive(acc.id, acc.name, e)}
                        className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Archive account"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Account Balance */}
                <div className="mt-6">
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">Balance</span>
                  <div className="text-xl font-bold font-mono text-slate-100 tracking-tight mt-0.5">
                    {formatCurrency(acc.balance, acc.currency)}
                  </div>
                </div>
              </div>

              {/* Card Footer link indicator */}
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-900/60 text-xs text-slate-400">
                <span>View full ledger</span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </div>

              {acc.isArchived && (
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-rose-950/40 border border-rose-500/20 text-[10px] font-mono text-rose-400 font-semibold">
                  Archived
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Creation/Editing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-slate-100">
                {editingAccount ? "Edit Account" : "Create New Account"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Account Name */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g., DeGiro Broker, Checking (EUR)"
                  {...register("name")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Account Type */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
                  <select
                    {...register("type")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Cash">Cash / Checking</option>
                    <option value="Savings">Savings Account</option>
                    <option value="Investment">Investment Portfolio</option>
                    <option value="Credit">Credit Card</option>
                  </select>
                  {errors.type && <p className="text-xs text-rose-400 mt-1">{errors.type.message}</p>}
                </div>

                {/* Account Currency */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Currency</label>
                  <select
                    {...register("currency")}
                    disabled={!!editingAccount} // locks currency on editing
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="BRL">BRL (R$)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                  {errors.currency && <p className="text-xs text-rose-400 mt-1">{errors.currency.message}</p>}
                </div>
              </div>

              {/* Initial Balance - Only on Create */}
              {!editingAccount && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Initial Opening Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("initialBalance", { valueAsNumber: true })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.initialBalance && <p className="text-xs text-rose-400 mt-1">{errors.initialBalance.message}</p>}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {editingAccount ? "Update Account" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
