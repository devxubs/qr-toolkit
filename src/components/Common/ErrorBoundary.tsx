import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
   children: ReactNode;
}

interface State {
   hasError: boolean;
   error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
   state: State = {
      hasError: false,
   };

   static getDerivedStateFromError(error: Error): State {
      return { hasError: true, error };
   }

   componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      console.error(
         "Uncaught error in QR Toolkit component:",
         error,
         errorInfo,
      );
   }

   handleReset = () => {
      this.setState({ hasError: false, error: undefined });
   };

   render() {
      if (this.state.hasError) {
         return (
            <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-slate-900/50 rounded-2xl border border-red-500/20 backdrop-blur-md my-4">
               <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-500/5">
                  <AlertTriangle className="w-7 h-7" />
               </div>
               <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  Something unexpected happened
               </h3>
               <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
                  QR Toolkit caught an internal error. Your data and custom
                  history remain safe in local storage.
               </p>
               <div className="bg-slate-950 p-3 rounded-lg text-xs font-mono text-red-300 max-w-lg overflow-x-auto mb-6 text-left border border-slate-800">
                  {this.state.error?.message || "Unknown render error"}
               </div>
               <button
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
               >
                  <RefreshCw className="w-4 h-4" />
                  Recover Application State
               </button>
            </div>
         );
      }

      return this.props.children;
   }
}
