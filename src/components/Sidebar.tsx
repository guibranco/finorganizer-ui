import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  CreditCard, 
  ArrowRightLeft, 
  PieChart, 
  TrendingUp, 
  Plus,
  Coins,
  Compass
} from "lucide-react";

interface SidebarProps {
  onQuickAddOpen: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onQuickAddOpen, isMobileOpen, onMobileClose }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/accounts", label: "Accounts", icon: CreditCard },
    { path: "/transactions", label: "Transactions", icon: ArrowRightLeft },
    { path: "/portfolio", label: "Portfolio", icon: PieChart },
    { path: "/planning", label: "Planning", icon: Compass },
    { path: "/recurrences", label: "Recurrences", icon: Coins },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800 text-slate-400">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-2 border-b border-slate-800">
        <div className="h-6 w-6 bg-indigo-600 rounded flex items-center justify-center font-bold text-[11px] text-white shrink-0">
          F
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold tracking-wider text-xs uppercase text-slate-100">FinOrganizer.Ui</span>
          <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-950/20 px-1 rounded border border-indigo-900/30">
            v1.0
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-4 mb-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Menu</div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentPath === link.path || (link.path !== "/" && currentPath.startsWith(link.path));
          
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-4 py-2 text-xs font-medium transition-all ${
                isActive
                  ? "bg-indigo-600/10 text-indigo-400 border-r-2 border-indigo-600"
                  : "hover:bg-slate-900/50 hover:text-slate-100"
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Quick Add Floating Button & Keyboard Hint */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          onClick={() => {
            onMobileClose?.();
            onQuickAddOpen();
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs active:scale-98 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Quick Add
        </button>
        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-mono text-center">
          <span>Press</span>
          <kbd className="px-1 bg-slate-900 border border-slate-800 rounded text-slate-400 text-[9px]">
            N
          </kbd>
          <span>anywhere to add</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Modal/Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose}></div>
          <div className="relative flex-1 max-w-xs w-full h-full bg-slate-950 animate-slide-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
