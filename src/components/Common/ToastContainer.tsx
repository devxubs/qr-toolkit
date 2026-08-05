import React from "react";
import { useQRStore } from "../../store/useQRStore";
import {
   CheckCircle2,
   AlertCircle,
   Info,
   AlertTriangle,
   X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const ToastContainer: React.FC = () => {
   const { toasts, removeToast } = useQRStore();

   return (
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
         <AnimatePresence>
            {toasts.map((toast) => {
               const iconMap = {
                  success: (
                     <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ),
                  error: (
                     <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  ),
                  warning: (
                     <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  ),
                  info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
               };

               const borderMap = {
                  success: "border-emerald-500/30 bg-emerald-950/80",
                  error: "border-red-500/30 bg-red-950/80",
                  warning: "border-amber-500/30 bg-amber-950/80",
                  info: "border-sky-500/30 bg-sky-950/80",
               };

               return (
                  <motion.div
                     key={toast.id}
                     initial={{ opacity: 0, y: 15, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
                     className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md text-slate-100 shadow-xl shadow-black/40 ${borderMap[toast.type]}`}
                  >
                     {iconMap[toast.type]}
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-snug">
                           {toast.title}
                        </p>
                        {toast.description && (
                           <p className="text-xs text-slate-300 mt-0.5 leading-relaxed truncate">
                              {toast.description}
                           </p>
                        )}
                     </div>
                     <button
                        onClick={() => removeToast(toast.id)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                     >
                        <X className="w-4 h-4" />
                     </button>
                  </motion.div>
               );
            })}
         </AnimatePresence>
      </div>
   );
};
