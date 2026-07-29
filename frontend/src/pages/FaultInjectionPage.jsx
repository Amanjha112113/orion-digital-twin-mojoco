import React, { useState } from 'react';
import { HealingProgressBar } from '../components/HealthGauge';
import { Zap, Flame, RotateCcw, AlertOctagon, CheckCircle2 } from 'lucide-react';

export function FaultInjectionPage({ state }) {
  const [loadingFault, setLoadingFault] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const graphStatus = state?.graph_status || 'HEALTHY';

  const handleInjectFault = async (type) => {
    setLoadingFault(true);
    setLastAction(type);
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
    setLastAction('heal');
    try {
      await fetch('http://localhost:8000/api/heal', { method: 'POST' });
    } catch (e) {
      console.error('Heal endpoint error:', e);
    } finally {
      setTimeout(() => setLoadingFault(false), 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Zap className="text-amber-500" />
            Fault Injection Suite
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Simulate hardware motor seizures &amp; thermal runaway for live demos
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 ${
          graphStatus === 'HEALTHY'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
        }`}>
          {graphStatus === 'HEALTHY'
            ? <CheckCircle2 size={14} className="text-emerald-600" />
            : <AlertOctagon size={14} className="text-amber-600" />}
          {graphStatus}
        </div>
      </div>

      {/* Big Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vibration Spike */}
        <button
          onClick={() => handleInjectFault('vibration')}
          disabled={loadingFault}
          className="bg-white p-8 rounded-2xl border-2 border-amber-300 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-100 transition-all duration-200 flex flex-col items-center justify-center gap-4 group active:scale-95 disabled:opacity-50"
        >
          <div className="p-5 rounded-2xl bg-amber-50 text-amber-500 group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-200 border border-amber-200">
            <AlertOctagon size={48} strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <span className="text-xl font-extrabold text-amber-600 block">⚡ Inject Vibration Spike</span>
            <span className="text-xs text-slate-500 block mt-1.5 max-w-[220px]">
              Quadruples motor control amplitude — triggers 3-sigma anomaly detection
            </span>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-amber-500 text-white text-xs font-bold font-mono tracking-wider">
            FAULT_TYPE: VIBRATION
          </div>
        </button>

        {/* Overheat */}
        <button
          onClick={() => handleInjectFault('overheat')}
          disabled={loadingFault}
          className="bg-white p-8 rounded-2xl border-2 border-rose-300 hover:border-rose-500 hover:shadow-lg hover:shadow-rose-100 transition-all duration-200 flex flex-col items-center justify-center gap-4 group active:scale-95 disabled:opacity-50"
        >
          <div className="p-5 rounded-2xl bg-rose-50 text-rose-500 group-hover:scale-110 group-hover:bg-rose-100 transition-all duration-200 border border-rose-200">
            <Flame size={48} strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <span className="text-xl font-extrabold text-rose-600 block">🔥 Inject Overheat</span>
            <span className="text-xs text-slate-500 block mt-1.5 max-w-[220px]">
              Simulates thermal coil failure — temperature rises past 90°C threshold
            </span>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-rose-500 text-white text-xs font-bold font-mono tracking-wider">
            FAULT_TYPE: OVERHEAT
          </div>
        </button>
      </div>

      {/* Reset / Heal */}
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={handleHeal}
            disabled={loadingFault}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold font-mono border border-emerald-400 transition-all flex items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RotateCcw size={18} /> Reset / Force Heal
          </button>
        </div>

        <HealingProgressBar graphStatus={graphStatus} />
      </div>
    </div>
  );
}

export default FaultInjectionPage;
