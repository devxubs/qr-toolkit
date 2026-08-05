import React, { useState } from 'react';
import { useQRStore } from '../../store/useQRStore';
import { performLocalSafetyCheck } from '../../utils/securityUtils';
import { SafetyReport } from '../../types';
import { ShieldCheck, AlertTriangle, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';

export const SafetyChecker: React.FC = () => {
  const { safetySandboxInput, setSafetySandboxInput, addToast } = useQRStore();
  const [report, setReport] = useState<SafetyReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleRunAnalysis = async () => {
    if (!safetySandboxInput.trim()) {
      addToast({
        type: 'warning',
        title: 'Empty Input',
        description: 'Please paste a URL or payload string to test.',
      });
      return;
    }

    // 1. Run immediate local heuristic check
    const localCheck = performLocalSafetyCheck(safetySandboxInput.trim());
    setReport(localCheck);

    // 2. Call Gemini AI security API
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/scan-safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: safetySandboxInput.trim(), type: 'url_or_text' }),
      });
      if (res.ok) {
        const aiData = await res.json();
        setReport({
          ...aiData,
          analyzedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('AI analysis fallback:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-100">QR & Link Safety Sandbox</h2>
          <p className="text-xs text-slate-400">Validate unknown links, phishing risks, and suspicious QR payloads before opening</p>
        </div>
      </div>

      {/* Input Sandbox */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md space-y-4">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Paste URL or QR Payload Text
        </label>
        <textarea
          rows={3}
          value={safetySandboxInput}
          onChange={(e) => setSafetySandboxInput(e.target.value)}
          placeholder="e.g. https://login-verify-account.top/auth or any raw QR text..."
          className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono rounded-xl p-3 focus:outline-none"
        />

        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Running Gemini AI Threat Inspection...' : 'Analyze Safety Score'}
        </button>
      </div>

      {/* Safety Analysis Report Result */}
      {report && (
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              {report.threatLevel === 'safe' ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              )}
              <span className="text-base font-bold text-slate-100 capitalize">
                Safety Rating: {report.threatLevel} ({report.score}/100)
              </span>
            </div>

            <span className="text-[11px] text-slate-400">
              Tested at {new Date(report.analyzedAt).toLocaleTimeString()}
            </span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-medium">{report.summary}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Risk details */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Detected Risk Factors
              </span>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                {report.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Security Recommendations
              </span>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                {report.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {/^https?:\/\//i.test(safetySandboxInput.trim()) && (
            <div className="pt-2 flex justify-end">
              <a
                href={safetySandboxInput.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
              >
                <ExternalLink className="w-4 h-4 text-indigo-400" />
                Open External Target Link
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
