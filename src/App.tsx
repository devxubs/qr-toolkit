import React from "react";
import { useQRStore } from "./store/useQRStore";
import { ErrorBoundary } from "./components/Common/ErrorBoundary";
import { ToastContainer } from "./components/Common/ToastContainer";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { QRTypeSelector } from "./components/Generator/QRTypeSelector";
import { QRInputs } from "./components/Generator/QRInputs";
import { QRStylingPanel } from "./components/Generator/QRStylingPanel";
import { QRPreview } from "./components/Generator/QRPreview";
import { CameraScanner } from "./components/Scanner/CameraScanner";
import { UploadScanner } from "./components/Scanner/UploadScanner";
import { ScanResultModal } from "./components/Scanner/ScanResultModal";
import { BatchGenerator } from "./components/Batch/BatchGenerator";
import { HistoryView } from "./components/History/HistoryView";
import { SafetyChecker } from "./components/Safety/SafetyChecker";

export default function App() {
   const { activeTab } = useQRStore();

   return (
      <ErrorBoundary>
         <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white flex flex-col">
            {/* Header Navigation */}
            <Header />

            {/* Main Workspace Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
               {/* TAB 1: GENERATOR */}
               {activeTab === "generator" && (
                  <div className="space-y-6">
                     {/* Data Type Pills Grid */}
                     <QRTypeSelector />

                     {/* Form Inputs & Preview Split Layout */}
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-7 space-y-6">
                           {/* Specialized Input Form */}
                           <QRInputs />
                           {/* Custom Styling & Branding */}
                           <QRStylingPanel />
                        </div>

                        {/* Live Preview & Downloads */}
                        <div className="lg:col-span-5">
                           <QRPreview />
                        </div>
                     </div>
                  </div>
               )}

               {/* TAB 2: CAMERA SCANNER */}
               {activeTab === "camera-scanner" && <CameraScanner />}

               {/* TAB 3: IMAGE UPLOAD SCANNER */}
               {activeTab === "upload-scanner" && <UploadScanner />}

               {/* TAB 4: BATCH GENERATOR */}
               {activeTab === "batch" && <BatchGenerator />}

               {/* TAB 5: HISTORY & FAVORITES */}
               {activeTab === "history" && <HistoryView />}

               {/* TAB 6: SAFETY CHECKER */}
               {activeTab === "safety" && <SafetyChecker />}
            </main>

            {/* Scan Result Safety Modal */}
            <ScanResultModal />

            {/* Toast Alert Banner Container */}
            <ToastContainer />

            {/* App Footer */}
            <Footer />
         </div>
      </ErrorBoundary>
   );
}
