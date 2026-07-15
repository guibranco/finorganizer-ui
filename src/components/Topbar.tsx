import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Menu, Clock, Sun, TrendingUp, Sparkles } from "lucide-react";
import { useDashboardSummary } from "../api/queries";
import { formatCurrency } from "../utils/format";

interface TopbarProps {
  onMobileOpen: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMobileOpen }) => {
  const location = useLocation();
  const { data: summary } = useDashboardSummary();
  const [time, setTime] = useState<string>("");

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format Pathname to Title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path.startsWith("/accounts")) {
      if (path === "/accounts") return "Accounts";
      return "Account Details";
    }
    if (path === "/transactions") return "Transactions";
    if (path.startsWith("/portfolio")) {
      if (path === "/portfolio") return "Portfolio Assets";
      return "Asset Details";
    }
    if (path === "/planning") return "Budgets & Planning";
    if (path === "/recurrences") return "Recurrence Rules";
    return "FinOrganizer";
  };

  return (
    <header className="h-14 px-5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
      {/* Page Title & Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileOpen}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-100 lg:hidden transition-colors"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>
        <h2 className="text-sm font-semibold text-slate-100 tracking-tight">{getPageTitle()}</h2>
      </div>

      {/* Topbar Right */}
      <div className="flex items-center gap-4">
        {/* Net Worth Spark Card (Desktop only) */}
        {summary && (
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-medium">
            <span className="text-slate-500">Net Worth:</span>
            <span className="text-indigo-400 font-semibold font-mono">
              {formatCurrency(summary.netWorth, "EUR")}
            </span>
          </div>
        )}

        {/* Live Clock */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/30 border border-slate-800/40 px-2.5 py-1 rounded-lg font-mono select-none">
          <Clock className="w-3 h-3 text-indigo-400" />
          <span>{time}</span>
        </div>

        {/* Avatar badge */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-indigo-400 font-semibold shadow-inner font-mono shrink-0">
            ZO
          </div>
        </div>
      </div>
    </header>
  );
};
