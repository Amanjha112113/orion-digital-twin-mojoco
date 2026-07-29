import React, { useState } from 'react';
import { AnimatedLangGraph } from '../components/AnimatedLangGraph';
import { TerminalLog } from '../components/TerminalLog';
import { HealingProgressBar } from '../components/HealthGauge';
import { Shield, Zap, Flame, RotateCcw, AlertOctagon, CheckCircle2 } from 'lucide-react';

export function AgentOrchestrationPage({ state }) {
  const [loadingFault, setLoadingFault] = useState(false);
  const graphStatus = state?.graph_status || 'HEALTHY';
  const repairStatus = state?.repair_status || 'IDLE';

  const handleInjectFault = async (type) => {
    setLoadingFault(true);
    try {
      await fetch(`http://localhost:8000/api/fault/${type}`, { method: 'POST' });
    } catch (e) {
      console.error('Fault endpoint error:', e);
    } finally {
      setTimeout(() => setLoadingFault(false), 500);
    }
  };

  const handleHeal = async () => {
    setLoadingFault(true);
    try {
      await fetch('http://localhost:8000/api/heal', { method: 'POST' });
    } catch (e) {
      console.error('Heal endpoint error:', e);
    } finally {
      setTimeout(() => setLoadingFault(false), 500);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header with Status Indicator */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Shield className="text-purple-600" />
            Agent Orchestration Workstation &amp; Live Execution Console
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Stateful LangGraph multi-agent execution with live particle routing &amp; streaming logs
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-slate-500 font-semibold">Repair Status:</span>
          <span className={`px-3 py-1.5 rounded-full font-bold border text-xs flex items-center gap-1.5 ${
            repairStatus === 'SUCCESS'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : repairStatus === 'IDLE'
              ? 'bg-slate-100 text-slate-600 border-slate-200'
              : 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse'
          }`}>
            {repairStatus === 'SUCCESS' && <CheckCircle2 size={13} className="text-emerald-600" />}
            {repairStatus}
          </span>
        </div>
      </div>

      {/* Embedded Fault Injection Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Zap className="text-amber-500" size={16} /> Live Hardware Fault Injection Triggers
          </h3>
          <span className="text-xs font-mono text-slate-500">Trigger simulated anomalies to test live agent network</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Vibration Spike Button */}
          <button
            onClick={() => handleInjectFault('vibration')}
            disabled={loadingFault}
            className="p-4 rounded-xl border-2 border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 transition-all flex items-center gap-3 group active:scale-95 disabled:opacity-50 text-left"
          >
            <div className="p-3 rounded-lg bg-amber-500 text-white shadow-sm group-hover:scale-105 transition-transform">
              <AlertOctagon size={24} />
            </div>
            <div>
              <span className="text-sm font-extrabold text-amber-700 block">⚡ Inject Vibration Spike</span>
              <span className="text-[11px] text-slate-500 block">Mechanical joint stress</span>
            </div>
          </button>

          {/* Overheat Button */}
          <button
            onClick={() => handleInjectFault('overheat')}
            disabled={loadingFault}
            className="p-4 rounded-xl border-2 border-rose-300 hover:border-rose-500 bg-rose-50/50 hover:bg-rose-50 transition-all flex items-center gap-3 group active:scale-95 disabled:opacity-50 text-left"
          >
            <div className="p-3 rounded-lg bg-rose-500 text-white shadow-sm group-hover:scale-105 transition-transform">
              <Flame size={24} />
            </div>
            <div>
              <span className="text-sm font-extrabold text-rose-700 block">🔥 Inject Thermal Overheat</span>
              <span className="text-[11px] text-slate-500 block">Motor coil surge (&gt;88°C)</span>
            </div>
          </button>

          {/* Reset / Heal Button */}
          <button
            onClick={handleHeal}
            disabled={loadingFault}
            className="p-4 rounded-xl border-2 border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 transition-all flex items-center gap-3 group active:scale-95 disabled:opacity-50 text-left"
          >
            <div className="p-3 rounded-lg bg-emerald-500 text-white shadow-sm group-hover:scale-105 transition-transform">
              <RotateCcw size={24} />
            </div>
            <div>
              <span className="text-sm font-extrabold text-emerald-700 block">✅ Reset / Force Heal</span>
              <span className="text-[11px] text-slate-500 block">Restore baseline physics</span>
            </div>
          </button>
        </div>

        {/* Healing Progress Bar */}
        <HealingProgressBar graphStatus={graphStatus} />
      </div>

      {/* Full-width Animated LangGraph */}
      <AnimatedLangGraph state={state} />

      {/* Live Agent Terminal Log Stream */}
      <TerminalLog state={state} />
    </div>
  );
}

export default AgentOrchestrationPage;
