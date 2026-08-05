import React, { useEffect, useRef, useState } from "react";
import { useQRStore } from "../../store/useQRStore";
import { EyeShape, ECCLevel, GradientType, LogoPreset } from "../../types";
import {
   Palette,
   Eye,
   ShieldAlert,
   Image as ImageIcon,
   Layout,
   RotateCcw,
} from "lucide-react";
import { Sketch } from "@uiw/react-color";

export const QRStylingPanel: React.FC = () => {
   const { styling, updateStyling, resetStyling, addToast } = useQRStore();

   const [openColorPicker, setOpenColorPicker] = useState({
      foreground: false,
      background: false,
      secondary: false,
   });

   const colorPresets = [
      "#0F172A",
      "#1E293B",
      "#2563EB",
      "#0284C7",
      "#059669",
      "#D97706",
      "#DC2626",
      "#7C3AED",
   ];
   const bgPresets = [
      "#FFFFFF",
      "#F8FAFC",
      "#F1F5F9",
      "#EFF6FF",
      "#ECFDF5",
      "#FEF3C7",
      "#0F172A",
   ];

   const pickerRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
         if (
            pickerRef.current &&
            !pickerRef.current.contains(event.target as Node)
         ) {
            setOpenColorPicker({
               foreground: false,
               background: false,
               secondary: false,
            });
         }
      }

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, []);

   const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
         addToast({
            type: "error",
            title: "File too large",
            description: "Logo image must be smaller than 2MB.",
         });
         return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
         const result = evt.target?.result as string;
         if (result) {
            updateStyling({
               logoPreset: "custom",
               customLogoUrl: result,
               eccLevel: "H", // Auto switch to high error correction for logos!
            });
            addToast({
               type: "success",
               title: "Custom Logo Loaded",
               description:
                  "Error correction auto-set to High (H 30%) for scannability.",
            });
         }
      };
      reader.readAsDataURL(file);
   };

   return (
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md space-y-5">
         <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
               <Palette className="w-4 h-4 text-indigo-400" />
               3. Custom QR Styling & Branding
            </h2>
            <button
               onClick={resetStyling}
               className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
               <RotateCcw className="w-3.5 h-3.5" />
               Reset
            </button>
         </div>

         {/* Colors & Gradient Section */}
         <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
               Color Palette & Gradients
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Foreground Color */}
               <div>
                  <span className="block text-[11px] text-slate-400 mb-1.5">
                     Foreground Color
                  </span>
                  <div className="flex items-center gap-2">
                     <div className="relative inline-block" ref={pickerRef}>
                        {/* Color Button */}
                        <button
                           onClick={() =>
                              setOpenColorPicker((prev) => ({
                                 ...prev,
                                 foreground: !prev.foreground,
                              }))
                           }
                           className="w-10 h-10 rounded-xl border border-slate-700 shadow-sm transition hover:scale-105"
                           style={{ backgroundColor: styling.fgColor }}
                        />

                        {/* Popup */}
                        <div
                           className={`
                              absolute top-12 left-0 z-50
                              origin-top-left
                              transition-all duration-200 ease-out
                              ${
                                 openColorPicker.foreground
                                    ? "opacity-100 scale-100 translate-y-0"
                                    : "pointer-events-none opacity-0 scale-95 -translate-y-2"
                              }
                            `}
                        >
                           <div className="shadow-2xl">
                              <Sketch
                                 color={styling.fgColor}
                                 onChange={(color) =>
                                    updateStyling({
                                       fgColor: color.hex,
                                    })
                                 }
                              />
                           </div>
                        </div>
                     </div>

                     <input
                        type="text"
                        value={styling.fgColor}
                        onChange={(e) =>
                           updateStyling({ fgColor: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono rounded-xl p-2.5 focus:outline-none uppercase"
                     />
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                     {colorPresets.map((hex) => (
                        <button
                           key={hex}
                           onClick={() => updateStyling({ fgColor: hex })}
                           className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-110 cursor-pointer"
                           style={{ backgroundColor: hex }}
                        />
                     ))}
                  </div>
               </div>

               {/* Background Color */}
               <div>
                  <div className="flex items-center justify-between mb-1.5">
                     <span className="text-[11px] text-slate-400">
                        Background Color
                     </span>
                     <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                        <input
                           type="checkbox"
                           checked={styling.transparentBg}
                           onChange={(e) =>
                              updateStyling({ transparentBg: e.target.checked })
                           }
                           className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-800 text-indigo-600"
                        />
                        Transparent
                     </label>
                  </div>
                  {!styling.transparentBg && (
                     <>
                        <div className="flex items-center gap-2">
                           <div
                              className="relative inline-block"
                              ref={pickerRef}
                           >
                              {/* Color Button */}
                              <button
                                 onClick={() =>
                                    setOpenColorPicker((prev) => ({
                                       ...prev,
                                       background: !prev.background,
                                    }))
                                 }
                                 className="w-10 h-10 rounded-xl border border-slate-700 shadow-sm transition hover:scale-105"
                                 style={{ backgroundColor: styling.bgColor }}
                              />

                              {/* Popup */}
                              <div
                                 className={`
                                    absolute top-12 left-0 z-50
                                    origin-top-left
                                    transition-all duration-200 ease-out
                                    ${
                                       openColorPicker.background
                                          ? "opacity-100 scale-100 translate-y-0"
                                          : "pointer-events-none opacity-0 scale-95 -translate-y-2"
                                    }
                                 `}
                              >
                                 <div className="shadow-2xl">
                                    <Sketch
                                       color={styling.bgColor}
                                       onChange={(color) =>
                                          updateStyling({
                                             bgColor: color.hex,
                                          })
                                       }
                                    />
                                 </div>
                              </div>
                           </div>
                           <input
                              type="text"
                              value={styling.bgColor}
                              onChange={(e) =>
                                 updateStyling({ bgColor: e.target.value })
                              }
                              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono rounded-xl p-2.5 focus:outline-none uppercase"
                           />
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                           {bgPresets.map((hex) => (
                              <button
                                 key={hex}
                                 onClick={() => updateStyling({ bgColor: hex })}
                                 className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-110 cursor-pointer"
                                 style={{ backgroundColor: hex }}
                              />
                           ))}
                        </div>
                     </>
                  )}
               </div>
            </div>

            {/* Gradient Type Selection */}
            <div>
               <span className="block text-[11px] text-slate-400 mb-1.5">
                  Gradient Effect
               </span>
               <div className="grid grid-cols-3 gap-2">
                  {(["none", "linear", "radial"] as GradientType[]).map(
                     (gt) => (
                        <button
                           key={gt}
                           onClick={() => updateStyling({ gradientType: gt })}
                           className={`py-2 px-3 rounded-xl border text-xs font-medium capitalize transition-colors cursor-pointer ${
                              styling.gradientType === gt
                                 ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                                 : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200"
                           }`}
                        >
                           {gt}
                        </button>
                     ),
                  )}
               </div>
               {styling.gradientType !== "none" && (
                  <div className="mt-2.5 flex items-center gap-2">
                     <span className="text-xs text-slate-400">
                        Secondary Color:
                     </span>
                     <div className="relative inline-block" ref={pickerRef}>
                        {/* Color Button */}
                        <button
                           onClick={() =>
                              setOpenColorPicker((prev) => ({
                                 ...prev,
                                 secondary: !prev.secondary,
                              }))
                           }
                           className="w-10 h-10 rounded-xl border border-slate-700 shadow-sm transition hover:scale-105"
                           style={{ backgroundColor: styling.fgColor2 }}
                        />

                        {/* Popup */}
                        <div
                           className={`
                                    absolute top-12 left-0 z-50
                                    origin-top-left
                                    transition-all duration-200 ease-out
                                    ${
                                       openColorPicker.secondary
                                          ? "opacity-100 scale-100 translate-y-0"
                                          : "pointer-events-none opacity-0 scale-95 -translate-y-2"
                                    }
                                 `}
                        >
                           <div className="shadow-2xl">
                              <Sketch
                                 color={styling.fgColor2}
                                 onChange={(color) =>
                                    updateStyling({
                                       fgColor2: color.hex,
                                    })
                                 }
                              />
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Eye Shapes Section */}
         <div className="space-y-2 border-t border-slate-800/80 pt-3">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
               <Eye className="w-3.5 h-3.5 text-indigo-400" /> Custom Corner Eye
               Patterns
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
               {(["square", "rounded", "circle", "leaf"] as EyeShape[]).map(
                  (shape) => (
                     <button
                        key={shape}
                        onClick={() => updateStyling({ eyeShape: shape })}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium capitalize transition-colors cursor-pointer ${
                           styling.eyeShape === shape
                              ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                              : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                     >
                        {shape}
                     </button>
                  ),
               )}
            </div>
         </div>

         {/* Error Correction Level */}
         <div className="space-y-2 border-t border-slate-800/80 pt-3">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
               <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" /> Error
               Correction Level (Scan Durability)
            </label>
            <div className="grid grid-cols-4 gap-2">
               {[
                  { id: "L", name: "Low (7%)" },
                  { id: "M", name: "Med (15%)" },
                  { id: "Q", name: "High (25%)" },
                  { id: "H", name: "Best (30%)" },
               ].map((ecc) => (
                  <button
                     key={ecc.id}
                     onClick={() =>
                        updateStyling({ eccLevel: ecc.id as ECCLevel })
                     }
                     className={`py-2 px-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer text-center ${
                        styling.eccLevel === ecc.id
                           ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                           : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200"
                     }`}
                  >
                     {ecc.name}
                  </button>
               ))}
            </div>
         </div>

         {/* Center Logo Overlay Section */}
         <div className="space-y-2 border-t border-slate-800/80 pt-3">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
               <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Center Logo
               Overlay
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
               {[
                  { id: "none", label: "None" },
                  { id: "wifi", label: "Wi-Fi" },
                  { id: "phone", label: "Phone" },
                  { id: "email", label: "Mail" },
                  { id: "bitcoin", label: "Bitcoin" },
                  { id: "user", label: "User" },
               ].map((p) => (
                  <button
                     key={p.id}
                     onClick={() =>
                        updateStyling({ logoPreset: p.id as LogoPreset })
                     }
                     className={`py-2 px-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer text-center ${
                        styling.logoPreset === p.id
                           ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                           : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200"
                     }`}
                  >
                     {p.label}
                  </button>
               ))}
            </div>

            {/* Upload Custom Logo */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
               <label className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer border border-slate-700 transition-colors text-center">
                  Upload Image Logo
                  <input
                     type="file"
                     accept="image/*"
                     onChange={handleCustomLogoUpload}
                     className="hidden"
                  />
               </label>
               {styling.logoPreset === "custom" && (
                  <span className="text-xs text-emerald-400 font-medium">
                     ✓ Custom Logo Active
                  </span>
               )}
            </div>
         </div>

         {/* Call-To-Action Banner Frame */}
         <div className="space-y-2 border-t border-slate-800/80 pt-3">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
               <Layout className="w-3.5 h-3.5 text-indigo-400" /> Call-To-Action
               Frame Banner
            </label>
            <input
               type="text"
               value={styling.frameText || ""}
               onChange={(e) => updateStyling({ frameText: e.target.value })}
               placeholder="e.g. SCAN ME or JOIN WI-FI"
               className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-3 focus:outline-none"
            />
         </div>
      </div>
   );
};
