import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { ToastProvider } from "./components/Toast";
import { QuickAddModal } from "./components/QuickAddModal";
import { ConnectionPortal } from "./components/ConnectionPortal";

// Pages
import { Dashboard } from "./pages/Dashboard";
import { Accounts } from "./pages/Accounts";
import { AccountDetail } from "./pages/AccountDetail";
import { Transactions } from "./pages/Transactions";
import { Portfolio } from "./pages/Portfolio";
import { PortfolioDetail } from "./pages/PortfolioDetail";
import { Planning } from "./pages/Planning";
import { Recurrences } from "./pages/Recurrences";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Connection State setup (loaded from local storage)
  const [connection, setConnection] = useState<{ apiUrl: string; authKey: string } | null>(() => {
    const url = localStorage.getItem("finorganizer_api_url") || "";
    const key = localStorage.getItem("finorganizer_auth_key") || "";
    if (url && key) {
      return { apiUrl: url, authKey: key };
    }
    return null;
  });

  // Keyboard shortcut listener ('N' or 'n' opens Quick Add)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = 
        activeEl?.tagName === "INPUT" || 
        activeEl?.tagName === "SELECT" || 
        activeEl?.tagName === "TEXTAREA" || 
        activeEl?.getAttribute("contenteditable") === "true";

      if ((e.key === "n" || e.key === "N") && !isInput) {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleConnect = (apiUrl: string, authKey: string) => {
    localStorage.setItem("finorganizer_api_url", apiUrl);
    localStorage.setItem("finorganizer_auth_key", authKey);
    setConnection({ apiUrl, authKey });
  };

  const handleDisconnect = () => {
    localStorage.removeItem("finorganizer_api_url");
    localStorage.removeItem("finorganizer_auth_key");
    setConnection(null);
  };

  const handleUpdateConnection = (apiUrl: string, authKey: string) => {
    localStorage.setItem("finorganizer_api_url", apiUrl);
    localStorage.setItem("finorganizer_auth_key", authKey);
    setConnection({ apiUrl, authKey });
  };

  // If there's no active server URL and auth key, enforce connection setup first
  if (!connection) {
    return (
      <ToastProvider>
        <ConnectionPortal onConnect={handleConnect} />
      </ToastProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Persistent Sidebar */}
            <Sidebar
              onQuickAddOpen={() => setIsQuickAddOpen(true)}
              isMobileOpen={isMobileSidebarOpen}
              onMobileClose={() => setIsMobileSidebarOpen(false)}
            />

            {/* Main Workspace Panel */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <Topbar 
                onMobileOpen={() => setIsMobileSidebarOpen(true)} 
                connection={connection}
                onDisconnect={handleDisconnect}
                onUpdateConnection={handleUpdateConnection}
              />
              
              <main className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-6">
                <div className="max-w-7xl mx-auto pb-8">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/accounts" element={<Accounts />} />
                    <Route path="/accounts/:id" element={<AccountDetail />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/portfolio/:id" element={<PortfolioDetail />} />
                    <Route path="/planning" element={<Planning />} />
                    <Route path="/recurrences" element={<Recurrences />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </main>
            </div>

            {/* Keyboard-friendly Quick Add Modal */}
            <QuickAddModal 
              isOpen={isQuickAddOpen} 
              onClose={() => setIsQuickAddOpen(false)} 
            />
          </div>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  );
}
