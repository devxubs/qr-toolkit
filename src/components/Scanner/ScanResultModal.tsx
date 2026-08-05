import React from 'react';
import { useQRStore } from '../../store/useQRStore';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  AlertTriangle,
  X,
  ExternalLink,
  Copy,
  Sparkles,
  QrCode,
  Check,
  RefreshCw,
} from 'lucide-react';

export const ScanResultModal: React.FC = () => {
  const {
    activeScan,
    activeSafetyReport,
    isAnalyzingSafety,
    setActiveScan,
    fetchAISafetyReport,
    addToast,
    setFormValue,
    setQRType,
    setActiveTab,
  } = useQRStore();

  const [copied, setCopied] = React.useState(false);

  if (!activeScan) return null;

  const rawText = activeScan.rawText;
  const report = activeSafetyReport;
  const isUrl = /^https?:\/\//i.test(rawText) || /^www\./i.test(rawText);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast({
      type: 'success',
      title: 'Copied Payload',
      description: 'Text copied to clipboard.',
    });
  };

  const handleOpenUrl = () => {
    let url = rawText;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleReGenerate = () => {
    setQRType('text');
    setFormValue('text', { text: rawText });
    if (isUrl) {
      setQRType('url');
      setFormValue('url', { url: rawText });
    }
    setActiveScan(null);
    setActiveTab('generator');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Scanned QR Result</h3>
                <p className="text-[11px] text-slate-400">Decoded & Security Analyzed</p>
              </div>
            </div>

            <button
              onClick={() => setActiveScan(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Decoded Content Text Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Decoded Payload</label>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-100 text-sm font-mono break-all leading-relaxed relative group select-all">
                {rawText}
              </div>
            </div>

            {/* Security Threat Score & AI Analysis */}
            {report && (
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  report.threatLevel === 'safe'
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                    : report.threatLevel === 'caution'
                    ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                    : 'bg-red-950/30 border-red-500/30 text-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {report.threatLevel === 'safe' ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    )}
                    <span className="font-bold text-sm capitalize">
                      {report.threatLevel} ({report.score}/100 Safety Score)
                    </span>
                  </div>

                  <button
                    onClick={() => fetchAISafetyReport(rawText)}
                    disabled={isAnalyzingSafety}
                    className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingSafety ? 'animate-spin' : ''}`} />
                    {isAnalyzingSafety ? 'Analyzing...' : 'Deep AI Security Scan'}
                  </button>
                </div>

                <p className="text-xs leading-relaxed opacity-90">{report.summary}</p>

                {report.details && report.details.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider opacity-75">Analysis Points:</span>
                    <ul className="list-disc list-inside text-xs space-y-0.5 opacity-90">
                      {report.details.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {isUrl && (
                <button
                  onClick={handleOpenUrl}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  Safe Open URL
                </button>
              )}

              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs transition-colors cursor-pointer border border-slate-700"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
                {copied ? 'Copied' : 'Copy Payload'}
              </button>

              <button
                onClick={handleReGenerate}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <RefreshCw className="w-4 h-4" />
                Customize in Generator
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
