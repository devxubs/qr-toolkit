import React from "react";
import { useQRStore } from "../../store/useQRStore";
import { QRType } from "../../types";
import {
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

export const QRTypeSelector: React.FC = () => {
   const { qrType, setQRType } = useQRStore();

   const types: {
      id: QRType;
      label: string;
      icon: React.ReactNode;
      desc: string;
   }[] = [
      {
         id: "url",
         label: "Website URL",
         icon: <Globe className="w-4 h-4" />,
         desc: "Links, profiles, landing pages",
      },
      {
         id: "wifi",
         label: "Wi-Fi Network",
         icon: <Wifi className="w-4 h-4" />,
         desc: "Instant auto-connect QR",
      },
      {
         id: "vcard",
         label: "Contact Card",
         icon: <UserCheck className="w-4 h-4" />,
         desc: "vCard 3.0 address book",
      },
      {
         id: "text",
         label: "Plain Text",
         icon: <FileText className="w-4 h-4" />,
         desc: "Notes, serials, codes",
      },
      {
         id: "email",
         label: "Email",
         icon: <Mail className="w-4 h-4" />,
         desc: "Pre-filled email message",
      },
      {
         id: "phone",
         label: "Phone Call",
         icon: <Phone className="w-4 h-4" />,
         desc: "One-tap dial number",
      },
      {
         id: "sms",
         label: "SMS Text",
         icon: <MessageSquare className="w-4 h-4" />,
         desc: "Pre-written text msg",
      },
      {
         id: "location",
         label: "Location Map",
         icon: <MapPin className="w-4 h-4" />,
         desc: "GPS geo coordinates",
      },
      {
         id: "event",
         label: "Calendar Event",
         icon: <Calendar className="w-4 h-4" />,
         desc: "iCal event reminder",
      },
      {
         id: "crypto",
         label: "Crypto Payment",
         icon: <Coins className="w-4 h-4" />,
         desc: "BTC, ETH, SOL wallet",
      },
   ];

   return (
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
         <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            1. Select QR Data Type
         </h2>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {types.map((type) => {
               const isSelected = qrType === type.id;
               return (
                  <button
                     key={type.id}
                     onClick={() => setQRType(type.id)}
                     className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                           ? "bg-indigo-600/15 border-indigo-500 text-white shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/50"
                           : "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50"
                     }`}
                  >
                     <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                           isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-800/80 text-slate-400"
                        }`}
                     >
                        {type.icon}
                     </div>
                     <span className="text-xs font-semibold leading-tight">
                        {type.label}
                     </span>
                     <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {type.desc}
                     </span>
                  </button>
               );
            })}
         </div>
      </div>
   );
};
