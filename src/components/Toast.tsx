import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, toasts }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`flex items-center justify-between p-4 rounded-xl shadow-lg border text-sm ${
                toast.type === "success"
                  ? "bg-emerald-900/90 border-emerald-500/30 text-emerald-100"
                  : toast.type === "error"
                  ? "bg-rose-900/90 border-rose-500/30 text-rose-100"
                  : toast.type === "warning"
                  ? "bg-amber-900/90 border-amber-500/30 text-amber-100"
                  : "bg-slate-900/90 border-slate-700/30 text-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
                {toast.type === "error" && <X className="w-5 h-5 text-rose-400 shrink-0" />}
                {toast.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
                {toast.type === "info" && <Info className="w-5 h-5 text-sky-400 shrink-0" />}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
