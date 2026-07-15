import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Plus, ChevronRight, TrendingUp, TrendingDown, RefreshCw, 
  X, Briefcase, Landmark, Info, Coins, Tag, Trash2, HelpCircle
} from "lucide-react";
import { 
  usePortfolioPositions, 
  useCreateAssetEvent, 
  useRecordPriceSnapshot
} from "../api/queries";
import { formatCurrency, formatPercent } from "../utils/format";
import { useToast } from "../components/Toast";

const schema = z.object({
  ticker: z.string().min(1, "Ticker symbol is required").toUpperCase(),
  assetClass: z.enum(["Stock", "Crypto", "Bond", "REIT", "Gold"]),
  quantity: z.number().nonnegative("Quantity cannot be negative"),
  price: z.number().positive("Price must be positive"),
  date: z.string().min(1, "Purchase date is required"),
});

const tradeSchema = z.object({
  ticker: z.string().min(1, "Ticker is required").toUpperCase(),
  assetClass: z.enum(["Stock", "Crypto", "Bond", "REIT", "Gold"]),
  type: z.enum(["Buy", "Sell"]),
  quantity: z.number().positive("Quantity must be positive"),
  price: z.number().positive("Price must be positive"),
  date: z.string().min(1, "Date is required"),
});

const divSchema = z.object({
  ticker: z.string().min(1, "Ticker is required").toUpperCase(),
  assetClass: z.enum(["Stock", "Crypto", "Bond", "REIT", "Gold"]),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
});

type FormValues = z.infer<typeof schema>;
type TradeFormValues = z.infer<typeof tradeSchema>;
type DivFormValues = z.infer<typeof divSchema>;

export const Portfolio: React.FC = () => {
  const { data: assets = [], isLoading, refetch } = usePortfolioPositions();
  const createAssetEventMutation = useCreateAssetEvent();
  const recordPriceSnapshotMutation = useRecordPriceSnapshot();
  const { showToast } = useToast();

  // Modals
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isDivModalOpen, setIsDivModalOpen] = useState(false);
  
  // Quick price state
  const [updatingPriceTicker, setUpdatingPriceTicker] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1, price: 100, assetClass: "Stock", date: new Date().toISOString().split("T")[0] },
  });

  const { register: regTrade, handleSubmit: handleTrade, reset: resetTrade, setValue: setTradeValue, formState: { errors: tradeErrors } } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: { type: "Buy", assetClass: "Stock", date: new Date().toISOString().split("T")[0] },
  });

  const { register: regDiv, handleSubmit: handleDiv, reset: resetDiv, formState: { errors: divErrors } } = useForm<DivFormValues>({
    resolver: zodResolver(divSchema),
    defaultValues: { assetClass: "Stock", date: new Date().toISOString().split("T")[0] },
  });

  const onSubmitAsset = (values: FormValues) => {
    const amount = values.quantity * values.price;
    createAssetEventMutation.mutate(
      {
        ticker: values.ticker,
        assetClass: values.assetClass,
        date: values.date,
        type: "Buy",
        quantity: values.quantity,
        price: values.price,
        amount
      },
      {
        onSuccess: () => {
          showToast(`Asset "${values.ticker}" initialized successfully!`, "success");
          setIsAssetModalOpen(false);
          reset();
        },
        onError: () => showToast("Failed to record asset initialization.", "error"),
      }
    );
  };

  const onSubmitTrade = (values: TradeFormValues) => {
    const amount = values.quantity * values.price;
    createAssetEventMutation.mutate(
      {
        ticker: values.ticker,
        assetClass: values.assetClass,
        date: values.date,
        type: values.type,
        quantity: values.quantity,
        price: values.price,
        amount
      },
      {
        onSuccess: () => {
          showToast(`Trade logged successfully! Portfolio units updated.`, "success");
          setIsTradeModalOpen(false);
          resetTrade();
        },
        onError: (err: any) => showToast(err.message || "Trade record failed.", "error"),
      }
    );
  };

  const onSubmitDiv = (values: DivFormValues) => {
    createAssetEventMutation.mutate(
      {
        ticker: values.ticker,
        assetClass: values.assetClass,
        date: values.date,
        type: "Dividend",
        quantity: 0,
        price: 0,
        amount: values.amount
      },
      {
        onSuccess: () => {
          showToast(`Dividend distribution payout recorded successfully!`, "success");
          setIsDivModalOpen(false);
          resetDiv();
        },
        onError: () => showToast("Failed to record dividend.", "error"),
      }
    );
  };

  const handleQuickPriceUpdate = (ticker: string, current: number) => {
    const val = prompt(`Enter new market price for ${ticker}:`, current.toString());
    if (val === null) return;
    const price = parseFloat(val);
    if (isNaN(price) || price <= 0) {
      showToast("Invalid price entered.", "warning");
      return;
    }

    setUpdatingPriceTicker(ticker);
    recordPriceSnapshotMutation.mutate(
      { prices: [{ ticker, price }] },
      {
        onSuccess: () => {
          showToast(`Market price for ${ticker} updated to ${price}`, "success");
          setUpdatingPriceTicker(null);
        },
        onError: () => {
          showToast("Failed to update asset price.", "error");
          setUpdatingPriceTicker(null);
        },
      }
    );
  };

  // Compute overall portfolio stats
  const totalValue = assets.reduce((sum, a) => sum + a.marketValue, 0);
  const totalCost = assets.reduce((sum, a) => sum + a.invested, 0);
  const totalGainLoss = totalValue - totalCost;
  const gainPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-wider text-slate-100">Investment Portfolio</h1>
          <p className="text-[11px] text-slate-500 mt-1">Track stocks, index funds, real estate trusts, or cryptocurrencies</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Record Dividend trigger */}
          <button
            onClick={() => setIsDivModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-semibold text-[11px] rounded-lg border border-slate-800 transition-all"
          >
            <Coins className="w-3.5 h-3.5" />
            Log Dividend
          </button>

          {/* Record Trade trigger */}
          <button
            onClick={() => setIsTradeModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-[11px] rounded-lg border border-slate-800 transition-all"
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            Record Trade
          </button>

          {/* Create Asset trigger */}
          <button
            onClick={() => setIsAssetModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] rounded-lg shadow-lg hover:shadow-indigo-600/10 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Asset
          </button>
        </div>
      </div>

      {/* Portfolio Totals Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Value */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Portfolio Market Value</span>
          <h3 className="text-xl font-bold font-mono italic tracking-tight text-slate-100 mt-1">
            {formatCurrency(totalValue, "EUR")}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Current market value across active positions</p>
        </div>

        {/* Cost Basis */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Invested Cost Basis</span>
          <h3 className="text-xl font-bold font-mono italic tracking-tight text-slate-100 mt-1">
            {formatCurrency(totalCost, "EUR")}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Sum of average acquisition purchase costs</p>
        </div>

        {/* Total Gain/Loss */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Unrealized Capital Gains</span>
          <h3 className={`text-xl font-bold font-mono italic tracking-tight mt-1 ${totalGainLoss >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalGainLoss >= 0 ? "+" : ""}{formatCurrency(totalGainLoss, "EUR")}
          </h3>
          <p className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${totalGainLoss >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            {totalGainLoss >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{formatPercent(gainPercent)} (Total Return)</span>
          </p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Asset Holdings</h3>
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(n => <div key={n} className="h-10 bg-slate-950/20 rounded-lg"></div>)}
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            No assets registered. Click "Add Asset" to start tracking.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3 text-right">Units</th>
                  <th className="py-2.5 px-3 text-right">Avg Cost</th>
                  <th className="py-2.5 px-3 text-right">Market Price</th>
                  <th className="py-2.5 px-3 text-right">Total Value</th>
                  <th className="py-2.5 px-3 text-right">Profit / Loss</th>
                  <th className="py-2.5 px-3 text-center font-normal text-[10px] text-slate-500">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {assets.map((asset) => {
                  return (
                    <tr key={asset.id} className="group hover:bg-slate-950/30 transition-all">
                      <td className="py-4 px-4 font-semibold text-slate-100">
                        <Link to={`/portfolio/${asset.id}`} className="hover:text-indigo-400 flex items-center gap-2">
                          <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-indigo-400">
                            {asset.ticker}
                          </span>
                          <span className="text-xs truncate max-w-[120px] text-slate-300 font-medium">{asset.name}</span>
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-950 border border-slate-800/60 text-slate-400">
                          {asset.assetClass}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs font-semibold text-slate-200">
                        {asset.quantity.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs text-slate-400">
                        {formatCurrency(asset.avgCost, "EUR")}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs text-slate-200 font-semibold">
                        {formatCurrency(asset.currentPrice, "EUR")}
                      </td>
                      <td className="py-4 px-4 text-right font-bold font-mono text-xs text-slate-100">
                        {formatCurrency(asset.marketValue, "EUR")}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs">
                        <div className={asset.unrealizedPl >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                          {asset.unrealizedPl >= 0 ? "+" : ""}{formatCurrency(asset.unrealizedPl, "EUR")}
                        </div>
                        <div className={`text-[10px] font-semibold mt-0.5 ${asset.unrealizedPl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                          {formatPercent(asset.unrealizedPlPercent)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleQuickPriceUpdate(asset.ticker, asset.currentPrice)}
                          disabled={updatingPriceTicker === asset.ticker}
                          className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 hover:text-indigo-400 text-slate-400 transition-colors"
                          title="Record manual price snapshot"
                        >
                          {updatingPriceTicker === asset.ticker ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <TrendingUp className="w-3 h-3" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE ASSET MODAL */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-base font-semibold text-slate-100">Track New Asset</h2>
              <button onClick={() => setIsAssetModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitAsset)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Symbol */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Ticker Symbol</label>
                  <input
                    type="text"
                    placeholder="e.g., IWDA, BTC, AAPL"
                    {...register("ticker")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.ticker && <p className="text-xs text-rose-400 mt-1">{errors.ticker.message}</p>}
                </div>

                {/* Class */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Asset Class</label>
                  <select
                    {...register("assetClass")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="Stock">Stock / ETF</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Bond">Bond</option>
                    <option value="REIT">Real Estate (REIT)</option>
                    <option value="Gold">Commodity / Gold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Opening Units */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Units Purchased</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="1"
                    {...register("quantity", { valueAsNumber: true })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                </div>

                {/* Price basis */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Unit Cost (EUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    {...register("price", { valueAsNumber: true })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                </div>
              </div>

              {/* Purchase date */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Purchase Date</label>
                <input
                  type="date"
                  {...register("date")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD TRADE MODAL */}
      {isTradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-1.5">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                Record Trade Execution
              </h2>
              <button onClick={() => setIsTradeModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTrade(onSubmitTrade)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Select Asset */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Asset Ticker</label>
                  <select
                    {...regTrade("ticker")}
                    onChange={(e) => {
                      const ticker = e.target.value;
                      const selected = assets.find(a => a.ticker === ticker);
                      if (selected) {
                        setTradeValue("assetClass", selected.assetClass as any);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="">-- Choose Ticker --</option>
                    {assets.map(a => <option key={a.id} value={a.ticker}>{a.ticker} ({a.name})</option>)}
                  </select>
                </div>

                {/* Type Buy/Sell */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Action</label>
                  <select
                    {...regTrade("type")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="Buy">Buy Shares</option>
                    <option value="Sell">Sell Shares</option>
                  </select>
                </div>
              </div>

              {/* Hidden assetClass fallback to avoid zod errors */}
              <input type="hidden" {...regTrade("assetClass")} />

              <div className="grid grid-cols-2 gap-4">
                {/* Units quantity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Quantity / Units</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="0"
                    {...regTrade("quantity", { valueAsNumber: true })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                  {tradeErrors.quantity && <p className="text-xs text-rose-400 mt-1">{tradeErrors.quantity.message}</p>}
                </div>

                {/* Execution price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Execution Price</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...regTrade("price", { valueAsNumber: true })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                  {tradeErrors.price && <p className="text-xs text-rose-400 mt-1">{tradeErrors.price.message}</p>}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date</label>
                <input
                  type="date"
                  {...regTrade("date")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTradeModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  Log Execution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD DIVIDEND MODAL */}
      {isDivModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-1.5">
                <Coins className="w-5 h-5 text-emerald-400" />
                Log Dividend Payout Event
              </h2>
              <button onClick={() => setIsDivModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDiv(onSubmitDiv)} className="p-6 space-y-4">
              {/* Select Asset */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Payout Asset</label>
                <select
                  {...regDiv("ticker")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                >
                  <option value="">-- Choose Ticker --</option>
                  {assets.map(a => <option key={a.id} value={a.ticker}>{a.ticker} ({a.name})</option>)}
                </select>
              </div>

              {/* Hidden assetClass fallback to avoid zod errors */}
              <input type="hidden" {...regDiv("assetClass")} value="Stock" />

              <div className="grid grid-cols-2 gap-4">
                {/* Total amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Total Amount (EUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...regDiv("amount", { valueAsNumber: true })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                  {divErrors.amount && <p className="text-xs text-rose-400 mt-1">{divErrors.amount.message}</p>}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Payment Date</label>
                  <input
                    type="date"
                    {...regDiv("date")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDivModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors animate-pulse-slow"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
