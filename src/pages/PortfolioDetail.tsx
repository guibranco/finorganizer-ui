import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Briefcase, Coins, Sparkles, TrendingUp, TrendingDown, HelpCircle, 
  Calendar, Table, DollarSign, ListOrdered, Percent
} from "lucide-react";
import { useAssetDetail } from "../api/queries";
import { formatCurrency, formatDate, formatPercent } from "../utils/format";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const PortfolioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useAssetDetail(id || "");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 font-mono text-xs">
        Loading holding analytics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-slate-900 border border-slate-800 rounded-2xl max-w-md mx-auto">
        <HelpCircle className="w-12 h-12 text-slate-500 mb-4" />
        <h3 className="text-base font-semibold text-slate-200">Asset position not found</h3>
        <p className="text-xs text-slate-400 mt-1">The specified holding does not exist in your portfolio index.</p>
        <Link to="/portfolio" className="mt-5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </Link>
      </div>
    );
  }

  const { position, events, history } = data;

  // Split events into Trades and Dividends
  const tradeEvents = events.filter((e) => e.type === "Buy" || e.type === "Sell");
  const dividendEvents = events.filter((e) => e.type === "Dividend" || e.type === "Distribution");

  return (
    <div className="space-y-6">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/portfolio")}
          className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hover:text-slate-400">
              <Link to="/portfolio">Portfolio</Link>
            </span>
            <span className="text-xs text-slate-700">/</span>
            <span className="text-xs text-slate-300 font-semibold">{position.ticker}</span>
          </div>
          <h1 className="text-lg font-bold text-slate-100 mt-1 flex items-center gap-2.5">
            {position.name}
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              {position.ticker}
            </span>
          </h1>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Market Value */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Market Value</span>
          <div className="text-lg font-bold font-mono text-slate-100 mt-1">
            {formatCurrency(position.marketValue, "EUR")}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {position.quantity.toLocaleString()} units @ {formatCurrency(position.currentPrice, "EUR")}
          </div>
        </div>

        {/* Cost Basis */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Avg Cost Basis</span>
          <div className="text-lg font-bold font-mono text-slate-100 mt-1">
            {formatCurrency(position.avgCost, "EUR")}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Invested principal: {formatCurrency(position.invested, "EUR")}
          </div>
        </div>

        {/* Returns */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Unrealized Profit/Loss</span>
          <div className={`text-lg font-bold font-mono mt-1 ${position.unrealizedPl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {position.unrealizedPl >= 0 ? "+" : ""}{formatCurrency(position.unrealizedPl, "EUR")}
          </div>
          <div className={`text-[10px] font-semibold mt-1 flex items-center gap-0.5 ${position.unrealizedPl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            {position.unrealizedPl >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{formatPercent(position.unrealizedPlPercent)}</span>
          </div>
        </div>

        {/* Dividends received */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Dividends Received</span>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {formatCurrency(position.incomeReceived, "EUR")}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Passive cash flow payout history
          </div>
        </div>
      </div>

      {/* Evolution Chart */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-5">Valuation Evolution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatDate} />
              <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                labelStyle={{ color: "#94a3b8" }}
                formatter={(val: number) => [formatCurrency(val, "EUR"), "Market Value"]}
              />
              <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Divided Trade vs Dividend Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trades Table */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-1.5">
            <Table className="w-4 h-4 text-indigo-400" />
            Trade Transactions
          </h3>
          {tradeEvents.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">No buy/sell transactions recorded.</p>
          ) : (
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold py-2">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Action</th>
                    <th className="pb-2 text-right">Units</th>
                    <th className="pb-2 text-right">Price</th>
                    <th className="pb-2 text-right">Cash Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {tradeEvents.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-950/20">
                      <td className="py-3 font-mono text-slate-400">{formatDate(e.date)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          e.type === "Buy" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/10" : "bg-rose-950 text-rose-400 border border-rose-500/10"
                        }`}>
                          {e.type}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300">
                        {e.quantity.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300">
                        {formatCurrency(e.price || 0, "EUR")}
                      </td>
                      <td className="py-3 text-right font-bold font-mono text-slate-200">
                        {formatCurrency(e.amount || 0, "EUR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Dividends Table */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-emerald-400" />
            Passive Dividends History
          </h3>
          {dividendEvents.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">No dividend payouts recorded.</p>
          ) : (
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold py-2">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2 text-right">Cash Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {dividendEvents.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-950/20">
                      <td className="py-3 font-mono text-slate-400">{formatDate(e.date)}</td>
                      <td className="py-3 text-slate-300 font-medium">
                        {e.type}
                      </td>
                      <td className="py-3 text-right font-bold font-mono text-emerald-400">
                        +{formatCurrency(e.amount, "EUR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
