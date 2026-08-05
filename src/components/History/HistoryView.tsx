import React, { useState } from "react";
import { useQRStore } from "../../store/useQRStore";
import {
   History,
   Search,
   Star,
   Trash2,
   Copy,
   Download,
   Upload,
   RefreshCw,
   Check,
   Globe,
   FileText,
   Wifi,
   UserCheck,
   Mail,
   Phone,
   MessageSquare,
   MapPin,
   Calendar,
   Coins,
} from "lucide-react";

export const HistoryView: React.FC = () => {
   const {
      history,
      deleteHistoryItem,
      clearHistory,
      toggleFavorite,
      importHistoryJSON,
      addToast,
      setQRType,
      setFormValue,
      setActiveTab,
   } = useQRStore();

   const [filter, setFilter] = useState<
      "all" | "generate" | "scan" | "favorites"
   >("all");
   const [searchQuery, setSearchQuery] = useState<string>("");
   const [copiedId, setCopiedId] = useState<string | null>(null);

   // Icon selector based on QR payload type
   const getTypeIcon = (qrType: string) => {
      switch (qrType) {
         case "url":
            return <Globe className="w-4 h-4 text-sky-400" />;
         case "wifi":
            return <Wifi className="w-4 h-4 text-emerald-400" />;
         case "vcard":
            return <UserCheck className="w-4 h-4 text-purple-400" />;
         case "email":
            return <Mail className="w-4 h-4 text-amber-400" />;
         case "phone":
            return <Phone className="w-4 h-4 text-blue-400" />;
         case "sms":
            return <MessageSquare className="w-4 h-4 text-teal-400" />;
         case "location":
            return <MapPin className="w-4 h-4 text-red-400" />;
         case "event":
            return <Calendar className="w-4 h-4 text-pink-400" />;
         case "crypto":
            return <Coins className="w-4 h-4 text-orange-400" />;
         default:
            return <FileText className="w-4 h-4 text-slate-400" />;
      }
   };

   // Filtered items list
   const filteredHistory = history.filter((item) => {
      if (filter === "generate" && item.type !== "generate") return false;
      if (filter === "scan" && item.type !== "scan") return false;
      if (filter === "favorites" && !item.isFavorite) return false;

      if (searchQuery.trim()) {
         const q = searchQuery.toLowerCase();
         return (
            item.title.toLowerCase().includes(q) ||
            item.content.toLowerCase().includes(q) ||
            item.rawText.toLowerCase().includes(q)
         );
      }
      return true;
   });

   const handleCopy = async (id: string, text: string) => {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      addToast({
         type: "success",
         title: "Copied Payload",
      });
   };

   const handleReLoadInGenerator = (item: any) => {
      if (item.qrType && item.qrType !== "raw") {
         setQRType(item.qrType);
         if (item.qrType === "url") setFormValue("url", { url: item.rawText });
         if (item.qrType === "text")
            setFormValue("text", { text: item.rawText });
      } else {
         setQRType("text");
         setFormValue("text", { text: item.rawText });
      }
      setActiveTab("generator");
   };

   // Export JSON Backup
   const handleExportJSON = () => {
      const jsonStr = JSON.stringify(history, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr_toolkit_backup_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      addToast({
         type: "success",
         title: "History Backup Exported",
         description: "JSON file created.",
      });
   };

   // Import JSON Backup
   const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
         const str = evt.target?.result as string;
         if (str && importHistoryJSON(str)) {
            addToast({
               type: "success",
               title: "History Restored",
               description: "Successfully imported history items.",
            });
         } else {
            addToast({
               type: "error",
               title: "Invalid Backup File",
               description: "Failed to parse JSON history file.",
            });
         }
      };
      reader.readAsText(file);
   };

   return (
      <div className="space-y-6 max-w-5xl mx-auto">
         {/* Header Bar */}
         <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <History className="w-5 h-5" />
               </div>
               <div>
                  <h2 className="text-base font-bold text-slate-100">
                     QR History & Favorites
                  </h2>
                  <p className="text-xs text-slate-400">
                     Safely saved items in browser storage ({history.length})
                  </p>
               </div>
            </div>

            {/* Export / Import / Clear */}
            <div className="flex items-center gap-2">
               <button
                  onClick={handleExportJSON}
                  disabled={history.length === 0}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors disabled:opacity-40 cursor-pointer"
               >
                  <Download className="w-3.5 h-3.5" /> Export Backup
               </button>

               <label className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Import
                  <input
                     type="file"
                     accept=".json"
                     onChange={handleImportJSON}
                     className="hidden"
                  />
               </label>

               {history.length > 0 && (
                  <button
                     onClick={clearHistory}
                     className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-colors cursor-pointer"
                  >
                     Clear All
                  </button>
               )}
            </div>
         </div>

         {/* Filter & Search Bar */}
         <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
               <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
               <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search history by keyword or URL..."
                  className="w-full bg-slate-900/70 border border-slate-800/80 text-slate-100 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none"
               />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-900/70 p-1 rounded-xl border border-slate-800/80 shrink-0">
               {[
                  { id: "all", label: "All" },
                  { id: "generate", label: "Generated" },
                  { id: "scan", label: "Scanned" },
                  { id: "favorites", label: "Favorites" },
               ].map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setFilter(tab.id as any)}
                     className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        filter === tab.id
                           ? "bg-indigo-600 text-white"
                           : "text-slate-400 hover:text-slate-200"
                     }`}
                  >
                     {tab.label}
                  </button>
               ))}
            </div>
         </div>

         {/* History Items List */}
         {filteredHistory.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-2">
               <History className="w-8 h-8 text-slate-600 mx-auto" />
               <p className="font-semibold text-slate-300">
                  No History Records Found
               </p>
               <p>Generated and scanned QR codes will safely appear here.</p>
            </div>
         ) : (
            <div className="space-y-3">
               {filteredHistory.map((item) => (
                  <div
                     key={item.id}
                     className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                     <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                           {getTypeIcon(item.qrType)}
                        </div>
                        <div className="min-w-0 flex-1">
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-200 truncate">
                                 {item.title}
                              </span>
                              <span
                                 className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                                    item.type === "generate"
                                       ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                       : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                 }`}
                              >
                                 {item.type.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                 {new Date(item.timestamp).toLocaleString()}
                              </span>
                           </div>
                           <p className="text-xs font-mono text-slate-400 truncate mt-1">
                              {item.rawText}
                           </p>
                        </div>
                     </div>

                     {/* Action Buttons */}
                     <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                           onClick={() => toggleFavorite(item.id)}
                           className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                              item.isFavorite
                                 ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                 : "bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300"
                           }`}
                           title="Favorite Item"
                        >
                           <Star className="w-4 h-4 fill-current" />
                        </button>

                        <button
                           onClick={() => handleCopy(item.id, item.rawText)}
                           className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
                           title="Copy Text"
                        >
                           {copiedId === item.id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                           ) : (
                              <Copy className="w-4 h-4" />
                           )}
                        </button>

                        <button
                           onClick={() => handleReLoadInGenerator(item)}
                           className="p-2 rounded-xl bg-slate-950 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                           title="Customize in Generator"
                        >
                           <RefreshCw className="w-4 h-4" />
                        </button>

                        <button
                           onClick={() => deleteHistoryItem(item.id)}
                           className="p-2 rounded-xl bg-slate-950 text-slate-500 hover:text-red-400 border border-slate-800 transition-colors cursor-pointer"
                           title="Delete Item"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};
