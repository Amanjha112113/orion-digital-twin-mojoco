import React, { useState } from 'react';
import { HealthGauge } from '../components/HealthGauge';
import { MetricsBoard } from '../components/MetricsBoard';
import { CheckCircle2, AlertTriangle, Activity, Bot } from 'lucide-react';

export function OverviewPage({ state, telemetry }) {
  const [loadingAuto, setLoadingAuto] = useState(false);
  const healthScore = state?.health_score ?? 95;
  const graphStatus = state?.graph_status || 'HEALTHY';
  const autoPhase = telemetry?.auto_phase || 'AUTOMATIC MODE';
  const cycleCount = telemetry?.cycle_count ?? 0;
  const maxCycles = telemetry?.max_cycles ?? 30;
  const rul = state?.predicted_rul || 3600;

  const isFault = healthScore < 70 || graphStatus !== 'HEALTHY';

  const handleStartAutoPickPlace = async () => {
    setLoadingAuto(true);
    try {
      await fetch('http://localhost:8000/api/auto_pick_place', { method: 'POST' });
    } catch (e) {
      console.error("Auto Pick Place endpoint error:", e);
    } finally {
      setTimeout(() => setLoadingAuto(false), 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            <Activity className="text-purple-400" /> System Overview & Smart Factory
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Autonomous Fetch Robotics 7-DOF Mobile Manipulator Cell</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStartAutoPickPlace}
            disabled={loadingAuto}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold font-mono border border-purple-500 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-50"
          >
            <Bot size={18} className="text-white animate-pulse" /> Start Pick & Place Sequence
          </button>

          <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-2.5 font-mono text-xs font-bold ${
            isFault
              ? 'bg-amber-950/40 text-amber-300 border-amber-800/80 shadow-sm animate-pulse'
              : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80 shadow-sm'
          }`}>
            {isFault ? <AlertTriangle size={16} className="text-amber-400" /> : <CheckCircle2 size={16} className="text-emerald-400" />}
            <span>{isFault ? 'FAULT DETECTED' : 'SYSTEM STABLE'}</span>
          </div>
        </div>
      </div>

      {/* Autonomous Mode Phase Banner */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border border-slate-800 shadow-2xl flex items-center justify-between font-mono text-xs text-slate-300">
        <span className="text-slate-400 flex items-center gap-2 font-bold">
          <Bot size={14} className="text-purple-400" /> Autonomous Mode Phase:
        </span>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800 font-bold">
            Cycle {cycleCount} / {maxCycles}
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-950/40 text-purple-300 border border-purple-800/80 font-bold">
            {autoPhase.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Financial & Operational KPI Board */}
      <MetricsBoard state={state} />

      {/* Grid: Health Score Dial & RUL Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HealthGauge score={healthScore} />

        <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">Predictive Horizon (RUL)</span>
            <span className="text-4xl font-display font-extrabold text-blue-400 block">
              {rul > 60 ? `${Math.round(rul / 60)} min` : `${rul} sec`}
            </span>
            <p className="text-xs text-slate-400 pt-2 leading-relaxed">
              Time-series RUL forecast based on 3-sigma anomaly scoring and telemetry degradation velocity.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold">Joint Max Velocity:</span>
            <span className="text-purple-400 font-bold">{(telemetry?.max_velocity || 0.0).toFixed(2)} rad/s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewPage;
