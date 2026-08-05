import React, { useEffect, useRef, useState } from "react";
import { useQRStore } from "../../store/useQRStore";
import {
   formatQRContent,
   generateQRToCanvas,
   generateQRSvg,
} from "../../utils/qrUtils";
import { calculateContrastRatio } from "../../utils/securityUtils";
import {
   Download,
   Copy,
   Printer,
   ShieldCheck,
   Check,
   AlertTriangle,
   BookmarkPlus,
   Maximize2,
} from "lucide-react";

export const QRPreview: React.FC = () => {
   const {
      qrType,
      formValues,
      styling,
      updateStyling,
      addHistoryItem,
      addToast,
      setActiveTab,
      setSafetySandboxInput,
   } = useQRStore();

   const canvasRef = useRef<HTMLCanvasElement | null>(null);
   const [downloadSize, setDownloadSize] = useState<number>(1024);
   const [isCopied, setIsCopied] = useState(false);
   const [renderedContent, setRenderedContent] = useState<string>("");

   // Contrast check
   const contrastInfo = calculateContrastRatio(
      styling.fgColor,
      styling.transparentBg ? "#FFFFFF" : styling.bgColor,
   );

   useEffect(() => {
      const rawText = formatQRContent(qrType, formValues);
      setRenderedContent(rawText);

      if (canvasRef.current && rawText) {
         generateQRToCanvas(canvasRef.current, rawText, styling).catch(
            (err) => {
               console.error("Failed canvas render:", err);
            },
         );
      }
   }, [qrType, formValues, styling]);

   // Download PNG file
   const handleDownloadPNG = async () => {
      if (!canvasRef.current || !renderedContent) return;

      // Render temporary high-res canvas
      const tempCanvas = document.createElement("canvas");
      await generateQRToCanvas(tempCanvas, renderedContent, {
         ...styling,
         size: downloadSize,
      });

      const dataUrl = tempCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `qr_${qrType}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      // Auto save to history
      addHistoryItem({
         type: "generate",
         qrType,
         title: `${qrType.toUpperCase()} QR Code`,
         content: renderedContent,
         rawText: renderedContent,
         styling,
      });

      addToast({
         type: "success",
         title: "QR Code Downloaded",
         description: `Saved as high-res ${downloadSize}x${downloadSize} PNG.`,
      });
   };

   // Download SVG file
   const handleDownloadSVG = async () => {
      if (!renderedContent) return;
      try {
         const svgString = await generateQRSvg(renderedContent, styling);
         const blob = new Blob([svgString], { type: "image/svg+xml" });
         const url = URL.createObjectURL(blob);
         const link = document.createElement("a");
         link.download = `qr_${qrType}_${Date.now()}.svg`;
         link.href = url;
         link.click();
         URL.revokeObjectURL(url);

         addToast({
            type: "success",
            title: "SVG Downloaded",
            description: "Vector SVG saved.",
         });
      } catch (e) {
         addToast({
            type: "error",
            title: "SVG Export Failed",
         });
      }
   };

   // Copy PNG image to clipboard
   const handleCopyImage = async () => {
      if (!canvasRef.current) return;
      try {
         canvasRef.current.toBlob(async (blob) => {
            if (!blob) return;
            await navigator.clipboard.write([
               new ClipboardItem({ "image/png": blob }),
            ]);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
            addToast({
               type: "success",
               title: "Copied to Clipboard",
               description: "Image ready to paste into chat or documents.",
            });
         });
      } catch (e) {
         // Fallback text copy
         await navigator.clipboard.writeText(renderedContent);
         addToast({
            type: "info",
            title: "Content Copied",
            description: "Raw payload text copied to clipboard.",
         });
      }
   };

   // Print View
   const handlePrint = () => {
      if (!canvasRef.current) return;
      const dataUrl = canvasRef.current.toDataURL();
      const win = window.open("", "_blank");
      if (win) {
         win.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${qrType.toUpperCase()}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; }
              img { max-width: 400px; height: auto; border: 1px solid #ccc; padding: 20px; border-radius: 12px; }
              p { margin-top: 16px; color: #555; font-size: 14px; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" />
            <p>${renderedContent}</p>
            <script>window.onload = () => { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
         win.document.close();
      }
   };

   // Quick Safety Check
   const handleTestSafety = () => {
      setSafetySandboxInput(renderedContent);
      setActiveTab("safety");
   };

   return (
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col items-center text-center space-y-5 sticky top-20">
         {/* Header title */}
         <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-3 text-left">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
               4. Live QR Preview
            </h2>
            {/* Contrast indicator */}
            <div className="flex items-center gap-1.5">
               <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                     contrastInfo.isLegible
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
               >
                  {contrastInfo.isLegible
                     ? "✓ High Contrast"
                     : "⚠ Low Contrast"}{" "}
                  ({contrastInfo.ratio}:1)
               </span>
            </div>
         </div>

         {/* Main Canvas Container */}
         <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800/80 shadow-2xl flex items-center justify-center min-h-[280px] w-full max-w-[340px] relative group overflow-hidden">
            <canvas
               ref={canvasRef}
               className="max-w-full h-auto rounded-lg shadow-md"
            />
         </div>

         {/* Warning if low contrast */}
         {!contrastInfo.isLegible && (
            <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-left flex items-start gap-2">
               <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
               <span>
                  Low color contrast detected between foreground and background.
                  Cameras may have difficulty scanning.
               </span>
            </div>
         )}

         {/* Resolution selection */}
         <div className="w-full space-y-1.5 text-left">
            <label className="text-xs text-slate-400 font-medium">
               Export Resolution (PNG):
            </label>
            <div className="grid grid-cols-3 gap-2">
               {[512, 1024, 2048].map((size) => (
                  <button
                     key={size}
                     onClick={() => setDownloadSize(size)}
                     className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                        downloadSize === size
                           ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                           : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                     }`}
                  >
                     {size}px
                  </button>
               ))}
            </div>
         </div>

         {/* Primary Action Buttons */}
         <div className="w-full space-y-2">
            <button
               onClick={handleDownloadPNG}
               className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
               <Download className="w-4 h-4" />
               Download PNG ({downloadSize}px)
            </button>

            <div className="grid grid-cols-2 gap-2">
               <button
                  onClick={handleDownloadSVG}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
               >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  SVG Vector
               </button>

               <button
                  onClick={handleCopyImage}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
               >
                  {isCopied ? (
                     <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                     <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                  {isCopied ? "Copied!" : "Copy Image"}
               </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
               <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-950/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
               >
                  <Printer className="w-3.5 h-3.5" />
                  Print Layout
               </button>

               <button
                  onClick={handleTestSafety}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-950/50 hover:bg-slate-800 text-emerald-400 border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
               >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Test Security
               </button>
            </div>
         </div>
      </div>
   );
};
