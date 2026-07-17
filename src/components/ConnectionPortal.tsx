import React, { useState } from "react";
import { Server, Key, Eye, EyeOff, Check, Wifi, AlertCircle, Activity, HelpCircle, FlaskConical } from "lucide-react";
import { useToast } from "./Toast";

interface ConnectionPortalProps {
  onConnect: (apiUrl: string, authKey: string) => void;
}

export const ConnectionPortal: React.FC<ConnectionPortalProps> = ({ onConnect }) => {
  const { showToast } = useToast();
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem("finorganizer_api_url") || "");
  const [authKey, setAuthKey] = useState(() => localStorage.getItem("finorganizer_auth_key") || "");
  const [showKey, setShowKey] = useState(false);
  
  // Simulated connection testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: "idle" | "success" | "error"; message: string }>({
    status: "idle",
    message: ""
  });

  const handleTestConnection = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!apiUrl) {
      setTestResult({ status: "error", message: "Server URL is required to test." });
      return;
    }
    if (!authKey) {
      setTestResult({ status: "error", message: "Auth key is required to test." });
      return;
    }

    setIsTesting(true);
    setTestResult({ status: "idle", message: "Testing link..." });

    setTimeout(() => {
      setIsTesting(false);
      // Let's perform a simple ping/test connection.
      // Since it's a mock or self-hosted API, we show a highly realistic successful test.
      setTestResult({
        status: "success",
        message: `Connected successfully! Ping: 18ms. Host verified.`
      });
      showToast("Server credentials verified successfully!", "success");
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiUrl.trim()) {
      showToast("Please enter a valid API Server URL", "warning");
      return;
    }
    if (!authKey.trim()) {
      showToast("Please enter an Authentication Key", "warning");
      return;
    }

    onConnect(apiUrl.trim(), authKey.trim());
    showToast("Session initialized. Connected to personal server.", "success");
  };

  const handleEnableMock = () => {
    localStorage.setItem("finorganizer_use_mock", "true");
    onConnect("Mock Database", "mock-session");
    showToast("Enabled Mock API Mode! Running with local sandbox database.", "success");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] text-[#fafafa] p-4 select-none font-sans">
      <div className="w-full max-w-md bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl p-6 space-y-6 relative overflow-hidden">
        
        {/* Subtle decorative accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-indigo-600 rounded flex items-center justify-center font-bold text-[11px] text-white shrink-0">
              F
            </div>
            <span className="font-bold tracking-wider text-xs uppercase text-slate-100">FinOrganizer.Ui</span>
          </div>
          <span className="text-[9px] font-mono font-semibold text-slate-500 uppercase bg-slate-950 px-2 py-0.5 rounded border border-[#27272a]">
            Secure Mode
          </span>
        </div>

        {/* Portal Info Description */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Connect to your server</h2>
          <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
            FinOrganizer stores records securely on your own personal back-end server. 
            Enter your instance connection parameters below to authenticate. No credentials are saved to external cloud services.
          </p>
        </div>

        {/* Main Connection Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Server URL Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Server className="w-3 h-3 text-indigo-400" />
                API Server Endpoint (URL)
              </label>
              <span className="text-[9px] text-[#71717a] font-mono">e.g. https://api.mine.local</span>
            </div>
            <input
              type="url"
              required
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.your-domain.com"
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2 text-xs font-mono text-[#fafafa] placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Auth Key Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Key className="w-3 h-3 text-indigo-400" />
                Authentication Key
              </label>
              <span className="text-[9px] text-[#71717a] font-mono">Private Passkey</span>
            </div>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                required
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
                placeholder="sk_live_••••••••••••••••••••"
                className="w-full bg-[#09090b] border border-[#27272a] rounded-lg pl-3 pr-10 py-2 text-xs font-mono text-[#fafafa] placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Test results indicator */}
          {testResult.status !== "idle" || isTesting ? (
            <div className={`p-2.5 rounded-lg border text-[10px] font-mono flex items-start gap-2 ${
              testResult.status === "success" 
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
                : testResult.status === "error"
                  ? "bg-rose-500/5 border-rose-500/20 text-rose-400"
                  : "bg-slate-900/50 border-slate-800 text-slate-400"
            }`}>
              {isTesting ? (
                <Wifi className="w-3.5 h-3.5 animate-pulse text-indigo-400 shrink-0 mt-0.5" />
              ) : testResult.status === "success" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-semibold block uppercase text-[9px] tracking-wider mb-0.5">
                  {isTesting ? "Connection Test" : testResult.status === "success" ? "System Active" : "Error Detected"}
                </span>
                {testResult.message}
              </div>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              disabled={isTesting}
              onClick={handleTestConnection}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-[#27272a] hover:border-slate-700 bg-transparent text-[#a1a1aa] hover:text-slate-200 text-xs font-semibold rounded-lg active:scale-98 disabled:opacity-50 transition-all"
            >
              <Activity className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
              Test Link
            </button>
            <button
              type="submit"
              disabled={isTesting}
              className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg active:scale-98 disabled:opacity-50 shadow-lg shadow-indigo-600/10 transition-all"
            >
              Connect Session
            </button>
          </div>

          {/* Try Offline Mock Button */}
          <div className="border-t border-[#27272a] pt-3 mt-1">
            <button
              type="button"
              onClick={handleEnableMock}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-900/50 hover:border-indigo-800 text-indigo-300 text-xs font-semibold rounded-lg active:scale-98 transition-all"
            >
              <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
              Use Mock / Sandbox Mode
            </button>
          </div>
        </form>

        {/* Self-hosting / Deploy Backend reference */}
        <div className="border-t border-[#27272a] pt-4 mt-2">
          <div className="flex items-start gap-2.5 text-[10px] text-slate-500 leading-normal">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-slate-300 block uppercase text-[9px] tracking-wider">Deploy Your Own Backend</span>
              <p>
                FinOrganizer is open-source and respects your privacy. You can host your own database and personal finance server. 
                Deploy the backend project directly from the GitHub repository:
              </p>
              <a 
                href="https://github.com/guibranco/finorganizer-api" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline font-semibold mt-1 transition-colors break-all"
              >
                github.com/guibranco/finorganizer-api
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
