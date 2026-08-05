import React from "react";
import { ShieldCheck, Lock, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
   return (
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md py-8 text-slate-400 text-xs">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Client-Side Safe Engine
               </div>
               <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-medium text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  Local Data Isolation
               </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 text-slate-500">
               <span>QR Toolkit v1.0.0</span>
               <span className="hidden sm:inline">•</span>
               <span className="inline-flex items-center gap-1 text-slate-400">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Powered by
                  Devxub
               </span>
            </div>
         </div>
      </footer>
   );
};
