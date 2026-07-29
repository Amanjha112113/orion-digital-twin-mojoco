import React, { useState, useEffect } from 'react';

const HALF_CIRC = Math.PI * 65; // semicircle circumference (r=65)

export function HealthGauge({ score = 95 }) {
  const [displayed, setDisplayed] = useState(score);

  // Smoothly animate the score value
  useEffect(() => {
    const id = setInterval(() => {
      setDisplayed(prev => {
        if (prev === score) return prev;
        const diff = score - prev;
        const step = diff > 0 ? Math.ceil(diff / 6) : Math.floor(diff / 6);
        return prev + step;
      });
    }, 80);
    return () => clearInterval(id);
  }, [score]);

  const pct     = Math.max(0, Math.min(100, displayed));
  const offset  = HALF_CIRC - (pct / 100) * HALF_CIRC;
  const color   = pct > 80 ? '#10b981' : pct > 50 ? '#f59e0b' : '#ef4444';
  const label   = pct > 80 ? 'NOMINAL'  : pct > 50 ? 'WARNING' : 'FAULT';
  const bgColor = pct > 80 ? '#f0fdf4'  : pct > 50 ? '#fffbeb' : '#fef2f2';
  const borderC = pct > 80 ? '#bbf7d0'  : pct > 50 ? '#fde68a' : '#fecaca';

  return (
    <div
      className="p-6 rounded-2xl border shadow-sm flex flex-col items-center gap-4 transition-colors duration-500"
      style={{ backgroundColor: bgColor, borderColor: borderC }}
    >
      {/* Card Title */}
      <div className="text-center w-full border-b pb-3" style={{ borderColor: borderC }}>
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
          Predictive Health Score
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">3-Sigma Anomaly Model</p>
      </div>

      {/* Semicircular SVG Gauge */}
      {/*
        viewBox: 0 0 160 90  — only the top half of the circle (cx=80 cy=80 r=65)
        The circle is NOT rotated. Instead we set strokeDasharray to only half
        the circumference (semicircle), offsetting to fill from the left end.
      */}
      <div className="relative w-52 h-28 flex items-center justify-center">
        <svg
          viewBox="0 0 160 90"
          className="w-52 h-28"
          style={{ overflow: 'visible' }}
        >
          {/* Background track — half circle only */}
          <path
            d="M 15 80 A 65 65 0 0 1 145 80"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Value arc — dynamic */}
          <path
            d="M 15 80 A 65 65 0 0 1 145 80"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={HALF_CIRC}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.25s ease, stroke 0.4s ease',
              filter: `drop-shadow(0 0 6px ${color}80)`,
            }}
          />
        </svg>

        {/* Score Number centered below arc */}
        <div className="absolute bottom-0 flex flex-col items-center">
          <span
            className="text-4xl font-extrabold tracking-tight leading-none"
            style={{ color }}
          >
            {pct}%
          </span>
          <span
            className="text-[10px] font-mono font-bold uppercase tracking-widest mt-1"
            style={{ color }}
          >
            {label}
          </span>
        </div>
      </div>

      {/* Footer bar */}
      <div className="w-full flex items-center justify-between text-[11px] font-mono pt-2 border-t" style={{ borderColor: borderC }}>
        <span className="text-slate-500 font-bold">HEALTH INDEX</span>
        <span className="font-bold" style={{ color }}>{pct}/100</span>
      </div>
    </div>
  );
}

export function HealingProgressBar({ graphStatus }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer;
    if (graphStatus === 'HEALING' || graphStatus === 'DIAGNOSING') {
      setProgress(0);
      const startTime = Date.now();
      const duration = 8000;
      timer = setInterval(() => {
        const pct = Math.min(100, Math.round(((Date.now() - startTime) / duration) * 100));
        setProgress(pct);
        if (pct >= 100) clearInterval(timer);
      }, 80);
    } else {
      setProgress(graphStatus === 'HEALTHY' ? 100 : 0);
    }
    return () => clearInterval(timer);
  }, [graphStatus]);

  const barColor =
    graphStatus === 'HEALING'    ? 'from-purple-500 via-indigo-500 to-emerald-400' :
    graphStatus === 'DIAGNOSING' ? 'from-amber-400 to-orange-500' :
    'from-emerald-400 to-teal-500';

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
          Self-Healing Loop Progress
        </span>
        <span className="text-xs font-mono font-bold text-purple-600">{progress}%</span>
      </div>

      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-150`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-[11px] text-slate-400 font-mono">
        {graphStatus === 'HEALING'    && '⚡ Repair tasks dispatched — awaiting QA validation...'}
        {graphStatus === 'DIAGNOSING' && '⏳ Root Cause LLM analyzing anomaly...'}
        {graphStatus === 'HEALTHY'    && '✅ System nominal — self-healing loop complete.'}
      </p>
    </div>
  );
}
