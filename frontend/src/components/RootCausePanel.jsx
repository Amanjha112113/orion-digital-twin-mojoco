import React from 'react';
import { AlertCircle, Brain, CheckCircle2, ShieldAlert } from 'lucide-react';

export function RootCausePanel({ state }) {
  const rootCauses  = state?.root_causes || [];
  const confidence  = state?.diagnosis_confidence || 0.0;
  const repairStatus = state?.repair_status || 'IDLE';

  const statusBadge =
    repairStatus === 'SUCCESS'   ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    repairStatus === 'EXECUTING' ? 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse' :
                                   'bg-slate-100 text-slate-500 border-slate-200';

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="text-amber-500" size={22} /> Root Cause Analysis
          </h2>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
            {Math.round(confidence * 100)}% CONFIDENCE
          </span>
        </div>

        {/* Cause list */}
        <div className="space-y-3">
          {rootCauses.length > 0 ? (
            rootCauses.map((cause, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3"
              >
                <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">{cause}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Diagnosed via xAI Grok / Local Llama 3.2
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span>All physical subsystems nominal. No fault anomalies detected.</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 flex items-center gap-1.5">
          <ShieldAlert size={14} className="text-purple-500" /> Self-Healing Loop:
        </span>
        <span className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border ${statusBadge}`}>
          {repairStatus}
        </span>
      </div>
    </div>
  );
}

export default RootCausePanel;
