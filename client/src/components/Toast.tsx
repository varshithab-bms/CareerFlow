import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onDismiss: () => void;
}

export function Toast({ message, type, isVisible, onDismiss }: ToastProps) {
  const getColors = () => {
    switch (type) {
      case "success":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "error":
        return "bg-red-50 text-red-800 border-red-200";
      case "info":
      default:
        return "bg-blue-50 text-blue-800 border-blue-200";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${getColors()}`}
        >
          <span className="text-sm font-medium">{message}</span>
          <button
            onClick={onDismiss}
            className="ml-auto inline-flex rounded-md p-1 hover:bg-black/5"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
