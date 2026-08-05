import React, { useState } from "react";
import JSZip from "jszip";
import { useQRStore } from "../../store/useQRStore";
import { generateQRToCanvas } from "../../utils/qrUtils";
import { BatchItem } from "../../types";
import {
   Layers,
   Download,
   FileSpreadsheet,
   Trash2,
   CheckCircle2,
   RefreshCw,
} from "lucide-react";

export const BatchGenerator: React.FC = () => {
   const { styling, addToast } = useQRStore();
   const [rawLines, setRawLines] = useState<string>(
      "https://example.com/item1, Product 1\nhttps://example.com/item2, Product 2\nhttps://example.com/item3, Product 3",
   );
   const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
   const [isProcessing, setIsProcessing] = useState<boolean>(false);

   // Parse lines into batch items
   const parseLines = () => {
      const lines = rawLines.split("\n").filter((l) => l.trim().length > 0);
      const parsed: BatchItem[] = lines.map((line, idx) => {
         const parts = line.split(",");
         const content = parts[0].trim();
         const title = parts[1] ? parts[1].trim() : `Item #${idx + 1}`;
         return {
            id: "batch_" + idx + "_" + Date.now(),
            title,
            content,
            status: "pending",
         };
      });

      setBatchItems(parsed);
      addToast({
         type: "info",
         title: "Batch List Loaded",
         description: `Loaded ${parsed.length} items for batch generation.`,
      });
   };

   // Generate batch QR canvases
   const handleGenerateAll = async () => {
      if (batchItems.length === 0) {
         parseLines();
      }

      setIsProcessing(true);
      const updated = [...batchItems];

      for (let i = 0; i < updated.length; i++) {
         updated[i].status = "generating";
         setBatchItems([...updated]);

         try {
            const canvas = document.createElement("canvas");
            await generateQRToCanvas(canvas, updated[i].content, {
               ...styling,
               size: 512,
            });
            updated[i].dataUrl = canvas.toDataURL("image/png");
            updated[i].status = "ready";
         } catch (err: any) {
            updated[i].status = "error";
            updated[i].error = err.message || "Generation failed";
         }
         setBatchItems([...updated]);
      }

      setIsProcessing(false);
      addToast({
         type: "success",
         title: "Batch Generation Complete",
         description: `Generated ${updated.filter((i) => i.status === "ready").length} QR codes.`,
      });
   };

   // Download ZIP archive
   const handleDownloadZIP = async () => {
      const readyItems = batchItems.filter(
         (item) => item.status === "ready" && item.dataUrl,
      );
      if (readyItems.length === 0) {
         addToast({
            type: "warning",
            title: "No Ready QR Codes",
            description: "Please generate batch QR codes first.",
         });
         return;
      }

      const zip = new JSZip();
      const folder = zip.folder("qr_codes");

      readyItems.forEach((item, idx) => {
         if (item.dataUrl) {
            const base64Data = item.dataUrl.replace(
               /^data:image\/png;base64,/,
               "",
            );
            const filename = `${item.title.replace(/[^a-z0-9]/gi, "_")}_${idx + 1}.png`;
            folder?.file(filename, base64Data, { base64: true });
         }
      });

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `batch_qr_codes_${Date.now()}.zip`;
      link.click();

      addToast({
         type: "success",
         title: "ZIP Downloaded",
         description: `Archived ${readyItems.length} QR PNGs into zip.`,
      });
   };

   return (
      <div className="space-y-6 max-w-5xl mx-auto">
         {/* Title Header */}
         <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
               </div>
               <div>
                  <h2 className="text-base font-bold text-slate-100">
                     Batch & Bulk QR Generator
                  </h2>
                  <p className="text-xs text-slate-400">
                     Generate dozens of custom QR codes simultaneously and
                     export as ZIP
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-2">
               <button
                  onClick={handleDownloadZIP}
                  disabled={!batchItems.some((i) => i.status === "ready")}
                  className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-indigo-600/20"
               >
                  <Download className="w-4 h-4" />
                  Download ZIP
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md space-y-4">
               <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                     <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                     Batch Data Input (CSV / Lines)
                  </label>
                  <span className="text-[11px] text-slate-400">
                     Format: Content, Label
                  </span>
               </div>

               <textarea
                  rows={8}
                  value={rawLines}
                  onChange={(e) => setRawLines(e.target.value)}
                  placeholder="Paste multiple lines or CSV:&#10;https://example.com/1, Product One&#10;https://example.com/2, Product Two"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono rounded-xl p-3 focus:outline-none leading-relaxed"
               />

               <div className="flex items-center gap-2">
                  <button
                     onClick={parseLines}
                     className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                     Parse Lines (
                     {rawLines.split("\n").filter((l) => l.trim()).length})
                  </button>

                  <button
                     onClick={handleGenerateAll}
                     disabled={isProcessing}
                     className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                     <RefreshCw
                        className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`}
                     />
                     {isProcessing ? "Generating..." : "Generate Batch"}
                  </button>
               </div>
            </div>

            {/* Live Batch Grid Preview */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md space-y-4">
               <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                     Batch Grid Preview ({batchItems.length})
                  </h3>
                  {batchItems.length > 0 && (
                     <button
                        onClick={() => setBatchItems([])}
                        className="text-slate-400 hover:text-red-400 text-xs flex items-center gap-1 cursor-pointer"
                     >
                        <Trash2 className="w-3.5 h-3.5" /> Clear
                     </button>
                  )}
               </div>

               {batchItems.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                     Parse lines above and click "Generate Batch" to preview QR
                     codes here.
                  </div>
               ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                     {batchItems.map((item) => (
                        <div
                           key={item.id}
                           className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col items-center text-center space-y-2 relative"
                        >
                           {item.dataUrl ? (
                              <img
                                 src={item.dataUrl}
                                 alt={item.title}
                                 className="w-24 h-24 rounded-lg bg-white p-1"
                              />
                           ) : (
                              <div className="w-24 h-24 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 text-[10px]">
                                 {item.status === "generating"
                                    ? "Rendering..."
                                    : "Pending"}
                              </div>
                           )}
                           <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                              {item.title}
                           </span>
                           <span className="text-[10px] text-slate-400 line-clamp-1 font-mono">
                              {item.content}
                           </span>
                           {item.status === "ready" && (
                              <span className="absolute top-1.5 right-1.5 text-emerald-400">
                                 <CheckCircle2 className="w-4 h-4" />
                              </span>
                           )}
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};
