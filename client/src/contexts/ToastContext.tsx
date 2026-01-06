// src/contexts/ToastContext.tsx
import { createContext, useContext, useState, useCallback } from "react";
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion } from "motion/react";
type ToastType = "success" | "error" | "info";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

const ToastContext = createContext<{
    toast: {
        success: (msg: string) => void;
        error: (msg: string) => void;
        info: (msg: string) => void;
    };
} | null>(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx.toast;
};

/* ---------------------------------------------
   EXACT size-preserving style map
--------------------------------------------- */
const toastConfig = {
    success: {
        bg: "bg-green-50",
        text: "text-green-800",
        icon: CheckCircleIcon,
        iconColor: "text-green-400",
        hover: "hover:bg-green-100",
        ring: "focus-visible:ring-green-600",
    },
    error: {
        bg: "bg-red-50",
        text: "text-red-800",
        icon: ExclamationTriangleIcon,
        iconColor: "text-red-400",
        hover: "hover:bg-red-100",
        ring: "focus-visible:ring-red-600",
    },
    info: {
        bg: "bg-blue-50",
        text: "text-blue-800",
        icon: InformationCircleIcon,
        iconColor: "text-blue-400",
        hover: "hover:bg-blue-100",
        ring: "focus-visible:ring-blue-600",
    },
} as const;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const show = useCallback((message: string, type: ToastType) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const dismiss = (id: number) =>
        setToasts((prev) => prev.filter((t) => t.id !== id));

    const toast = {
        success: (msg: string) => show(msg, "success"),
        error: (msg: string) => show(msg, "error"),
        info: (msg: string) => show(msg, "info"),
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}


            <div className="fixed top-5 left-1/2 -translate-x-1/2 space-y-3 z-50">
                {toasts.map((t) => {
                    const cfg = toastConfig[t.type];
                    const Icon = cfg.icon;

                    return (

                        <motion.div
                            key={t.id}
                            initial={{ y: -30, opacity: 0, scale: 0.96 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -20, opacity: 0, scale: 0.95 }}
                            transition={{
                                type: "spring",
                                bounce: 0.3,
                                duration: 0.5,
                            }}
                            className={`rounded-md ${cfg.bg} p-4 shadow`}
                        >
                         
                                <div className="flex">
                                    <div className="shrink-0">
                                        <Icon
                                            aria-hidden="true"
                                            className={`size-5 ${cfg.iconColor}`}
                                        />
                                    </div>

                                    <div className="ml-3">
                                        <p className={`text-sm font-medium ${cfg.text}`}>
                                            {t.message}
                                        </p>
                                    </div>

                                    <div className="ml-auto pl-3">
                                        <div className="-mx-1.5 -my-1.5">
                                            <button
                                                onClick={() => dismiss(t.id)}
                                                type="button"
                                                className={`inline-flex rounded-md p-1.5 ${cfg.text}
                        ${cfg.hover}
                        focus-visible:outline-none
                        focus-visible:ring-2
                        ${cfg.ring}
                        focus-visible:ring-offset-2`}
                                            >
                                                <span className="sr-only">Dismiss</span>
                                                <XMarkIcon aria-hidden="true" className="size-5" />
                                            </button>
                                        </div>
                                    </div>
                                
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};
