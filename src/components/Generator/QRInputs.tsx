import React from "react";
import { useQRStore } from "../../store/useQRStore";
import {
   validateUrl,
   validateEmail,
   validatePhone,
   validateCryptoAddress,
} from "../../utils/securityUtils";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

export const QRInputs: React.FC = () => {
   const { qrType, formValues, setFormValue } = useQRStore();
   const [showWifiPass, setShowWifiPass] = React.useState(false);

   return (
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
         <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>2. Input Content & Parameters</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-normal flex items-center gap-1">
               <ShieldCheck className="w-3 h-3" /> Validated
            </span>
         </h2>

         {/* URL Input Form */}
         {qrType === "url" && (
            <div className="space-y-3">
               <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                     Target Website URL
                  </label>
                  <input
                     type="text"
                     value={formValues.url.url}
                     onChange={(e) =>
                        setFormValue("url", { url: e.target.value })
                     }
                     placeholder="https://yourwebsite.com or mycompany.com"
                     className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-sm rounded-xl p-3 focus:outline-none transition-colors"
                  />
                  {(() => {
                     const check = validateUrl(formValues.url.url);
                     if (formValues.url.url && !check.isValid) {
                        return (
                           <p className="text-[11px] text-amber-400 mt-1">
                              {check.error}
                           </p>
                        );
                     }
                     if (
                        formValues.url.url &&
                        check.formatted !== formValues.url.url
                     ) {
                        return (
                           <p className="text-[11px] text-slate-400 mt-1">
                              Auto-formatted link:{" "}
                              <span className="text-indigo-400 font-mono">
                                 {check.formatted}
                              </span>
                           </p>
                        );
                     }
                     return null;
                  })()}
               </div>
            </div>
         )}

         {/* Plain Text Input Form */}
         {qrType === "text" && (
            <div className="space-y-3">
               <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                     Text Content
                  </label>
                  <textarea
                     rows={4}
                     value={formValues.text.text}
                     onChange={(e) =>
                        setFormValue("text", { text: e.target.value })
                     }
                     placeholder="Type or paste any text message, serial number, note, or prompt..."
                     className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-sm rounded-xl p-3 focus:outline-none transition-colors resize-y"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                     <span>{formValues.text.text.length} characters</span>
                     <span>Max ~1200 chars for optimal scan speed</span>
                  </div>
               </div>
            </div>
         )}

         {/* Wi-Fi Input Form */}
         {qrType === "wifi" && (
            <div className="space-y-3">
               <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                     Network Name (SSID)
                  </label>
                  <input
                     type="text"
                     value={formValues.wifi.ssid}
                     onChange={(e) =>
                        setFormValue("wifi", { ssid: e.target.value })
                     }
                     placeholder="e.g. Guest_WiFi_5G"
                     className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-sm rounded-xl p-3 focus:outline-none transition-colors"
                  />
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                     <label className="block text-xs font-medium text-slate-300 mb-1">
                        Network Encryption
                     </label>
                     <select
                        value={formValues.wifi.encryption}
                        onChange={(e) =>
                           setFormValue("wifi", {
                              encryption: e.target.value as any,
                           })
                        }
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none"
                     >
                        <option value="WPA">WPA/WPA2/WPA3 (Recommended)</option>
                        <option value="WEP">WEP (Legacy)</option>
                        <option value="nopass">None (Open Network)</option>
                     </select>
                  </div>

                  {formValues.wifi.encryption !== "nopass" && (
                     <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                           Password
                        </label>
                        <div className="relative">
                           <input
                              type={showWifiPass ? "text" : "password"}
                              value={formValues.wifi.password}
                              onChange={(e) =>
                                 setFormValue("wifi", {
                                    password: e.target.value,
                                 })
                              }
                              placeholder="Enter network password"
                              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-sm rounded-xl p-3 pr-10 focus:outline-none"
                           />
                           <button
                              type="button"
                              onClick={() => setShowWifiPass(!showWifiPass)}
                              className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                           >
                              {showWifiPass ? (
                                 <EyeOff className="w-4 h-4" />
                              ) : (
                                 <Eye className="w-4 h-4" />
                              )}
                           </button>
                        </div>
                     </div>
                  )}
               </div>

               <div className="flex items-center gap-2 pt-1">
                  <input
                     type="checkbox"
                     id="hiddenWifi"
                     checked={formValues.wifi.hidden}
                     onChange={(e) =>
                        setFormValue("wifi", { hidden: e.target.checked })
                     }
                     className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                  />
                  <label
                     htmlFor="hiddenWifi"
                     className="text-xs text-slate-300 cursor-pointer"
                  >
                     Hidden Network SSID
                  </label>
               </div>
            </div>
         )}

         {/* vCard Contact Form */}
         {qrType === "vcard" && (
            <div className="space-y-3">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                     <label className="block text-xs font-medium text-slate-300 mb-1">
                        First Name
                     </label>
                     <input
                        type="text"
                        value={formValues.vcard.firstName}
                        onChange={(e) =>
                           setFormValue("vcard", { firstName: e.target.value })
                        }
                        placeholder="Alex"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-2.5 focus:outline-none"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-slate-300 mb-1">
                        Last Name
                     </label>
                     <input
                        type="text"
                        value={formValues.vcard.lastName}
                        onChange={(e) =>
                           setFormValue("vcard", { lastName: e.target.value })
                        }
                        placeholder="Morgan"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-2.5 focus:outline-none"
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                     <label className="block text-xs font-medium text-slate-300 mb-1">
                        Organization / Company
                     </label>
                     <input
                        type="text"
                        value={formValues.vcard.organization}
                        onChange={(e) =>
                           setFormValue("vcard", {
                              organization: e.target.value,
                           })
                        }
                        placeholder="Tech Corp"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-2.5 focus:outline-none"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-slate-300 mb-1">
                        Job Title
                     </label>
                     <input
                        type="text"
                        value={formValues.vcard.title}
                        onChange={(e) =>
                           setFormValue("vcard", { title: e.target.value })
                        }
                        placeholder="Senior Director"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-2.5 focus:outline-none"
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                     <label className="block text-xs font-medium text-slate-300 mb-1">
                        Mobile Phone
                     </label>
                     <input
                        type="text"
                        value={formValues.vcard.phoneMobile}
                        onChange={(e) =>
                           setFormValue("vcard", {
                              phoneMobile: e.target.value,
                           })
                        }
                        placeholder="+1 555-019-2834"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-2.5 focus:outline-none"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-slate-300 mb-1">
                        Work Email
                     </label>
                     <input
                        type="email"
                        value={formValues.vcard.email}
                        onChange={(e) =>
                           setFormValue("vcard", { email: e.target.value })
                        }
                        placeholder="alex@example.com"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-2.5 focus:outline-none"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                     Website URL
                  </label>
                  <input
                     type="text"
                     value={formValues.vcard.url}
                     onChange={(e) =>
                        setFormValue("vcard", { url: e.target.value })
                     }
                     placeholder="https://example.com"
                     className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-2.5 focus:outline-none"
                  />
               </div>
            </div>
         )}

         {/* Email Input Form */}
         {qrType === "email" && (
            <div className="space-y-3">
               <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                     Recipient Email
                  </label>
                  <input
                     type="email"
                     value={formValues.email.email}
                     onChange={(e) =>
                        setFormValue("email", { email: e.target.value })
                     }
                     placeholder="recipient@domain.com"
                     className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none"
                  />
                  {formValues.email.email &&
                     !validateEmail(formValues.email.email) && (
                        <p className="text-[11px] text-amber-400 mt-1">
                           Please enter a valid email address
                        </p>
                     )}
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                     Subject
                  </label>
                  <input
                     type="text"
                     value={formValues.email.subject}
                     onChange={(e) =>
                        setFormValue("email", { subject: e.target.value })
                     }
                     placeholder="Inquiry about services"
                     className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none"
                  />
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                     Body Text
                  </label>
                  <textarea
                     rows={3}
                     value={formValues.email.body}
                     onChange={(e) =>
                        setFormValue("email", { body: e.target.value })
                     }
                     placeholder="Hello, I am interested in learning more..."
                     className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none resize-y"
                  />
               </div>
            </div>
         )}

         {/* Phone Call Form */}
         {qrType === "phone" && (
            <div className="space-y-3">
               <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                     Phone Number
                  </label>
                  <input
                     type="tel"
                     value={formValues.phone.phoneNumber}
                     onChange={(e) =>
                        setFormValue("phone", { phoneNumber: e.target.value })
                     }
                     placeholder="+15550192834"
                     className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none"
                  />
                  {formValues.phone.phoneNumber &&
                     !validatePhone(formValues.phone.phoneNumber) && (
                        <p className="text-[11px] text-amber-400 mt-1">
                           Check phone format (include country code e.g. +1...)
                        </p>
                     )}
               </div>
            </div>
         )}

         {/* SMS Form */}
         {qrType === "sms" && (
            <div className="space-y-3">
               <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                     Recipient Phone Number
                  </label>
                  <input
                     type="tel"
                     value={formValues.sms.phoneNumber}
                     onChange={(e) =>
                        setFormValue("sms", { phoneNumber: e.target.value })
                     }
                     placeholder="+15550192834"
                     className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none"
                  />
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                     Message Body
                  </label>
                  <textarea
                     rows={3}
                     value={formValues.sms.message}
                     onChange={(e) =>
                        setFormValue("sms", { message: e.target.value })
                     }
                     placeholder="Hello! Let me know when you receive this."
                     className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none resize-y"
                  />
               </div>
            </div>
         )}

         {/* Location Map Form */}
         {qrType === "location" && (
            <div className="space-y-3">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                     <label className="block text-xs font-medium text-slate-300 mb-1">
                        Latitude
                     </label>
                     <input
                        type="text"
                        value={formValues.location.latitude}
                        onChange={(e) =>
                           setFormValue("location", {
                              latitude: e.target.value,
                           })
                        }
                        placeholder="37.7749"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none font-mono"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-slate-300 mb-1">
                        Longitude
                     </label>
                     <input
                        type="text"
                        value={formValues.location.longitude}
                        onChange={(e) =>
                           setFormValue("location", {
                              longitude: e.target.value,
                           })
                        }
                        placeholder="-122.4194"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none font-mono"
                     />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                     Or Location Search Query
                  </label>
                  <input
                     type="text"
                     value={formValues.location.query}
                     onChange={(e) =>
                        setFormValue("location", { query: e.target.value })
                     }
                     placeholder="Times Square, New York, NY"
                     className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none"
                  />
               </div>
            </div>
         )}

         {/* Calendar Event Form */}
         {qrType === "event" && (
            <div className="space-y-3">
               <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                     Event Title
                  </label>
                  <input
                     type="text"
                     value={formValues.event.title}
                     onChange={(e) =>
                        setFormValue("event", { title: e.target.value })
                     }
                     placeholder="Product Launch Keynote"
                     className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none"
                  />
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                     <label className="block text-xs font-medium text-slate-300 mb-1">
                        Start Date & Time
                     </label>
                     <div className="flex gap-2">
                        <input
                           type="date"
                           value={formValues.event.startDate}
                           onChange={(e) =>
                              setFormValue("event", {
                                 startDate: e.target.value,
                              })
                           }
                           className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-2.5 focus:outline-none"
                        />
                        <input
                           type="time"
                           value={formValues.event.startTime}
                           onChange={(e) =>
                              setFormValue("event", {
                                 startTime: e.target.value,
                              })
                           }
                           className="w-28 bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-2.5 focus:outline-none"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-slate-300 mb-1">
                        End Date & Time
                     </label>
                     <div className="flex gap-2">
                        <input
                           type="date"
                           value={formValues.event.endDate}
                           onChange={(e) =>
                              setFormValue("event", { endDate: e.target.value })
                           }
                           className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-2.5 focus:outline-none"
                        />
                        <input
                           type="time"
                           value={formValues.event.endTime}
                           onChange={(e) =>
                              setFormValue("event", { endTime: e.target.value })
                           }
                           className="w-28 bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-2.5 focus:outline-none"
                        />
                     </div>
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                     Event Location
                  </label>
                  <input
                     type="text"
                     value={formValues.event.location}
                     onChange={(e) =>
                        setFormValue("event", { location: e.target.value })
                     }
                     placeholder="Grand Hall, Tech Plaza"
                     className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none"
                  />
               </div>
            </div>
         )}

         {/* Crypto Form */}
         {qrType === "crypto" && (
            <div className="space-y-3">
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                     <label className="block text-xs font-medium text-slate-300 mb-1">
                        Asset
                     </label>
                     <select
                        value={formValues.crypto.coin}
                        onChange={(e) =>
                           setFormValue("crypto", {
                              coin: e.target.value as any,
                           })
                        }
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none font-semibold"
                     >
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="SOL">Solana (SOL)</option>
                        <option value="USDT">Tether (USDT)</option>
                        <option value="DOGE">Dogecoin (DOGE)</option>
                     </select>
                  </div>
                  <div className="sm:col-span-2">
                     <label className="block text-xs font-medium text-slate-300 mb-1">
                        Wallet Address
                     </label>
                     <input
                        type="text"
                        value={formValues.crypto.address}
                        onChange={(e) =>
                           setFormValue("crypto", { address: e.target.value })
                        }
                        placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa or 0x..."
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none font-mono text-xs"
                     />
                  </div>
               </div>
               {(() => {
                  const check = validateCryptoAddress(
                     formValues.crypto.coin,
                     formValues.crypto.address,
                  );
                  if (!check.isValid && check.warning) {
                     return (
                        <p className="text-[11px] text-amber-400">
                           {check.warning}
                        </p>
                     );
                  }
                  return null;
               })()}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                     <label className="block text-xs font-medium text-slate-300 mb-1">
                        Request Amount (Optional)
                     </label>
                     <input
                        type="text"
                        value={formValues.crypto.amount}
                        onChange={(e) =>
                           setFormValue("crypto", { amount: e.target.value })
                        }
                        placeholder="0.005"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none font-mono"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-slate-300 mb-1">
                        Payment Label
                     </label>
                     <input
                        type="text"
                        value={formValues.crypto.label}
                        onChange={(e) =>
                           setFormValue("crypto", { label: e.target.value })
                        }
                        placeholder="Invoice #1042"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none"
                     />
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
