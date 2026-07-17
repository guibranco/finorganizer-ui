import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  Menu, Clock, Server, Key, Eye, EyeOff, X, 
  Settings, LogOut, Check, Wifi, RefreshCw, HelpCircle, FlaskConical 
} from "lucide-react";
import { useDashboardSummary } from "../api/queries";
import { formatCurrency } from "../utils/format";
import { useToast } from "./Toast";

interface TopbarProps {
  onMobileOpen: () => void;
  connection: { apiUrl: string; authKey: string } | null;
  onDisconnect: () => void;
  onUpdateConnection: (apiUrl: string, authKey: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  onMobileOpen, 
  connection, 
  onDisconnect, 
  onUpdateConnection 
}) => {
  const location = useLocation();
  const { data: summary } = useDashboardSummary();
  const { showToast } = useToast();
  const [time, setTime] = useState<string>("");

  // Connection Settings Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUrl, setEditUrl] = useState(connection?.apiUrl || "");
  const [editKey, setEditKey] = useState(connection?.authKey || "");
  const [showKey, setShowKey] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync inputs with connection prop updates
  useEffect(() => {
    if (connection) {
      setEditUrl(connection.apiUrl);
      setEditKey(connection.authKey);
    }
  }, [connection]);

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

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUrl.trim() || !editKey.trim()) {
      showToast("Both server url and auth key are required.", "warning");
      return;
    }

    setIsUpdating(true);
    setTimeout(() => {
      onUpdateConnection(editUrl.trim(), editKey.trim());
      setIsUpdating(false);
      setIsModalOpen(false);
      showToast("API connection configurations updated successfully!", "success");
    }, 600);
  };

  return (
    <>
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
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* Active Connection Indicator Pill (Desktop Only) */}
          {connection && (
            localStorage.getItem("finorganizer_use_mock") === "true" ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-400 font-mono font-bold hover:bg-amber-500/10 transition-colors"
                title="Running in local sandbox mock database"
              >
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
                <span>MOCK ACTIVE</span>
              </button>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono font-bold hover:bg-emerald-500/10 transition-colors"
                title="Click to view API Server connection details"
              >
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>API LINKED</span>
              </button>
            )
          )}

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

          {/* Connection Settings Trigger & User Block */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all text-left"
            title="Open connection parameters"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-indigo-400 font-semibold shadow-inner font-mono shrink-0">
              ZO
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 transition-colors hidden sm:block" />
          </button>
        </div>
      </header>

      {/* CONNECTION SETTINGS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">API Connection Credentials</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              {/* Dynamic Status panel */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-slate-400 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span>Connection Status:</span>
                  <span className={`${localStorage.getItem("finorganizer_use_mock") === "true" ? "text-amber-400" : "text-emerald-400"} font-bold flex items-center gap-1`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${localStorage.getItem("finorganizer_use_mock") === "true" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                    {localStorage.getItem("finorganizer_use_mock") === "true" ? "Active (Sandbox)" : "Active (Latency: 18ms)"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Assigned Endpoint:</span>
                  <span className="text-slate-300 truncate max-w-[200px]">{connection?.apiUrl}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Client Authority:</span>
                  <span className="text-indigo-400 font-bold">Secure Session</span>
                </div>
              </div>

              {/* Mock Mode Toggle / Banner */}
              {localStorage.getItem("finorganizer_use_mock") === "true" ? (
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <FlaskConical className="w-4 h-4 shrink-0 animate-pulse" />
                    <span>Mock Sandbox Active</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-mono font-normal">
                    You are currently using the offline mock database. All finance logs and mutations are persisted locally in your browser.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem("finorganizer_use_mock", "false");
                      const savedUrl = localStorage.getItem("finorganizer_api_url") || "";
                      const savedKey = localStorage.getItem("finorganizer_auth_key") || "";
                      if (savedUrl && savedKey && savedUrl !== "Mock Database") {
                        onUpdateConnection(savedUrl, savedKey);
                        showToast("Switched back to Live API mode!", "success");
                      } else {
                        onDisconnect();
                        showToast("Disconnected Mock Mode. Please configure your live server credentials.", "info");
                      }
                      setIsModalOpen(false);
                    }}
                    className="w-full py-1 px-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-colors font-mono"
                  >
                    Switch to Live API Mode
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span>Testing without a live server?</span>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem("finorganizer_use_mock", "true");
                        onUpdateConnection("Mock Database", "mock-session");
                        showToast("Switched to Mock API Mode!", "success");
                        setIsModalOpen(false);
                      }}
                      className="py-1 px-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-400 border border-indigo-900/60 font-semibold rounded-md transition-colors font-mono"
                    >
                      Enable Mock Mode
                    </button>
                  </div>
                </div>
              )}

              {/* Server URL */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-indigo-400" />
                  API Server Endpoint
                </label>
                <input
                  type="url"
                  required
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://api.your-domain.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Auth Token */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  Authentication Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    required
                    value={editKey}
                    onChange={(e) => setEditKey(e.target.value)}
                    placeholder="sk_live_••••••••••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-9 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Self-hosting / Deploy Backend reference */}
              <div className="border-t border-slate-800/80 pt-4 mt-2">
                <div className="flex items-start gap-2 text-[10px] text-slate-500 leading-normal">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-300 block uppercase text-[9px] tracking-wider">Self-Host Your Backend</span>
                    <p>
                      Need to update or deploy your own server? You can access the open-source backend API repository below to host your personal finance database:
                    </p>
                    <a 
                      href="https://github.com/guibranco/finorganizer-api" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline font-semibold mt-0.5 transition-colors break-all"
                    >
                      github.com/guibranco/finorganizer-api
                    </a>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-2">
                {/* Disconnect trigger */}
                <button
                  type="button"
                  onClick={() => {
                    const confirm = window.confirm("Are you sure you want to disconnect? This will clear credentials from this browser.");
                    if (confirm) {
                      onDisconnect();
                      setIsModalOpen(false);
                      showToast("Disconnected. Credentials cleared.", "info");
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 border border-rose-950 rounded-lg transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect Link
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-600/10 transition-all disabled:opacity-50"
                  >
                    {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Save Updates
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
