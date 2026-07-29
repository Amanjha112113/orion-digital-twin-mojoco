import React from 'react';
import { DollarSign, Clock, Cpu, TrendingUp } from 'lucide-react';

export function MetricsBoard({ state }) {
  const metrics = state?.dashboard_metrics || {};
  const rul = state?.predicted_rul || 3600;
  const report = metrics.financial_report || {
    cost_averted: 0,
    mttr_reduced: 0
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Financial Cost Averted */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-between relative overflow-hidden group">
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
            Financial Cost Averted
          </span>
          <span className="text-3xl font-display font-extrabold text-emerald-400 block tracking-tight">
            ${(report.cost_averted).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block">Unplanned downtime averted</span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 flex items-center justify-center shadow-sm">
          <DollarSign size={24} />
        </div>
      </div>

      {/* Remaining Useful Life */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-between relative overflow-hidden group">
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
            Remaining Useful Life
          </span>
          <span className="text-3xl font-display font-extrabold text-blue-400 block tracking-tight">
            {rul > 60 ? `${Math.round(rul / 60)} min` : `${rul} sec`}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block">Predictive RUL horizon</span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-950 text-blue-400 border border-slate-800 flex items-center justify-center shadow-sm">
          <Clock size={24} />
        </div>
      </div>

      {/* Active LLM Evaluation */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-between relative overflow-hidden group">
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
            Active LLM Model
          </span>
          <span className="text-lg font-display font-bold text-purple-400 block tracking-tight pt-1">
            xAI Grok / Llama 3.2
          </span>
          <span className="text-[10px] text-slate-500 font-mono block">Zero-Shot Causal Evaluation</span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-950 text-purple-400 border border-slate-800 flex items-center justify-center shadow-sm">
          <Cpu size={24} />
        </div>
      </div>

      {/* MTTR Reduction Target */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-between relative overflow-hidden group">
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
            MTTR Reduction
          </span>
          <span className="text-3xl font-display font-extrabold text-purple-400 block tracking-tight">
            {report.mttr_reduced}%
          </span>
          <span className="text-[10px] text-slate-500 font-mono block">8s self-healing loop</span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-950 text-purple-400 border border-slate-800 flex items-center justify-center shadow-sm">
          <TrendingUp size={24} />
        </div>
      </div>
    </div>
  );
}

export default MetricsBoard;
