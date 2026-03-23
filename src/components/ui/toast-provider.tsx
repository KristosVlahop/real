import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  type: "success" | "error" | "call";
  title: string;
  message?: string;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-400" />,
    call: <Phone className="h-5 w-5 text-blue-400" />,
  };

  const borders = {
    success: "border-emerald-500/30",
    error: "border-red-500/30",
    call: "border-blue-500/30",
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border bg-card p-4 shadow-lg animate-in slide-in-from-right-full duration-300",
              borders[toast.type],
            )}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{toast.title}</p>
              {toast.message && <p className="text-xs text-muted-foreground mt-0.5">{toast.message}</p>}
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
