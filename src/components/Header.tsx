import React from "react";
import { useQRStore } from "../store/useQRStore";
import { NavigationTab } from "../types";
import {
   QrCode,
   Camera,
   Upload,
   Layers,
   History,
   ShieldCheck,
   Sparkles,
   ChevronDown,
} from "lucide-react";

export const Header: React.FC = () => {
   const { activeTab, setActiveTab, history } = useQRStore();

   const tabs: {
      id: NavigationTab;
      label: string;
      icon: React.ReactNode;
      badge?: number;
   }[] = [
      {
         id: "generator",
         label: "Generator",
         icon: <QrCode className="w-4 h-4" />,
      },
      {
         id: "camera-scanner",
         label: "Camera Scan",
         icon: <Camera className="w-4 h-4" />,
      },
      {
         id: "upload-scanner",
         label: "Image Scan",
         icon: <Upload className="w-4 h-4" />,
      },
      {
         id: "batch",
         label: "Batch Tools",
         icon: <Layers className="w-4 h-4" />,
      },
      {
         id: "history",
         label: "History",
         icon: <History className="w-4 h-4" />,
         badge: history.length,
      },
      {
         id: "safety",
         label: "Safety Check",
         icon: <ShieldCheck className="w-4 h-4" />,
      },
   ];

   return (
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 gap-4">
               {/* Logo Brand */}
               <div className="flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                     <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                     <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-indigo-200 to-sky-200">
                           QR Toolkit
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                           <Sparkles className="w-2.5 h-2.5" /> PRO
                        </span>
                     </div>
                     <p className="text-[11px] text-slate-400 hidden sm:block">
                        Generate • Scan • Validate • Security
                     </p>
                  </div>
               </div>

               {/* Desktop Navigation Tabs */}
               <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/60">
                  {tabs.map((tab) => {
                     const isActive = activeTab === tab.id;
                     return (
                        <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id)}
                           className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer relative ${
                              isActive
                                 ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/20"
                                 : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                           }`}
                        >
                           {tab.icon}
                           <span>{tab.label}</span>
                           {tab.badge !== undefined && tab.badge > 0 && (
                              <span
                                 className={`ml-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                    isActive
                                       ? "bg-white/20 text-white"
                                       : "bg-slate-800 text-slate-300 border border-slate-700"
                                 }`}
                              >
                                 {tab.badge}
                              </span>
                           )}
                        </button>
                     );
                  })}
               </nav>

               {/* Mobile Select Menu Dropdown */}
               <div className="md:hidden relative w-44">
                  <select
                     value={activeTab}
                     onChange={(e) =>
                        setActiveTab(e.target.value as NavigationTab)
                     }
                     className="w-full appearance-none bg-slate-900 text-slate-200 text-xs font-medium py-2 pl-3 pr-8 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                     {tabs.map((tab) => (
                        <option key={tab.id} value={tab.id}>
                           {tab.label} {tab.badge ? `(${tab.badge})` : ""}
                        </option>
                     ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
               </div>
            </div>
         </div>
      </header>
   );
};
