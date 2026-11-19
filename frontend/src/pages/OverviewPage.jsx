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
  const hardwareFault = state?.dashboard_metrics?.hardware_fault || null;

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

      {/* Hardware Fault Alert (Agent 6) - Persistent and Unsolvable */}
      {hardwareFault && (
        <div className="bg-gradient-to-br from-rose-950/95 to-red-950/95 backdrop-blur-xl p-6 rounded-2xl border-2 border-rose-500/70 shadow-2xl shadow-rose-900/50 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-rose-500 text-white shadow-lg animate-pulse">
              <AlertTriangle size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-rose-200 flex items-center gap-2">
                🔧 Agent 6: CRITICAL HARDWARE FAULT DETECTED
              </h3>
              <p className="text-sm text-slate-300 mt-1 font-medium">
                {hardwareFault.description}
              </p>
              
              {/* Repair Attempts Status */}
              <div className="mt-3 bg-slate-950/80 p-3 rounded-lg border border-rose-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-rose-300 font-mono font-bold">SELF-HEALING ACTIVE</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  System attempting automated repair protocols... <span className="text-rose-400 font-bold">FAILING CONTINUOUSLY</span>
                  <br />
                  ⚠️ Hardware damage cannot be resolved through software healing
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 font-mono block">RPM</span>
                  <span className="text-lg font-bold text-rose-400 font-mono">{hardwareFault.rpm?.toFixed(0)}</span>
                  <span className="text-[10px] text-rose-400 font-mono block">CRITICAL LOW</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 font-mono block">Vibration</span>
                  <span className="text-lg font-bold text-amber-400 font-mono">{hardwareFault.vibration?.toFixed(2)}</span>
                  <span className="text-[10px] text-amber-400 font-mono block">ERRATIC</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 font-mono block">Temp (°C)</span>
                  <span className="text-lg font-bold text-orange-400 font-mono">{hardwareFault.temperature?.toFixed(0)}</span>
                  <span className="text-[10px] text-orange-400 font-mono block">ELEVATED</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1.5 rounded-full bg-rose-500 text-white text-xs font-bold font-mono animate-pulse">
                  {hardwareFault.status}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold font-mono">
                  {hardwareFault.type}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-slate-800 text-rose-300 text-xs font-bold font-mono border border-rose-700">
                  SYSTEM STOPPED
                </span>
                <span className="px-3 py-1.5 rounded-full bg-amber-900 text-amber-200 text-xs font-bold font-mono border border-amber-700">
                  REPAIR: {hardwareFault.repair_attempts}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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
