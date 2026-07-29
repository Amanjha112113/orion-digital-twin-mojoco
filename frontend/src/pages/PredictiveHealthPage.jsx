import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { HealthGauge } from '../components/HealthGauge';
import { TrendingUp, Clock } from 'lucide-react';

export function PredictiveHealthPage({ healthScore = 95, telemetry = {}, state = {} }) {
  const [history, setHistory] = useState([]);
  const rul = state?.predicted_rul || 3600;

  useEffect(() => {
    setHistory(prev => {
      const newPoint = {
        time: new Date().toLocaleTimeString(),
        score: healthScore,
        vibration: telemetry?.vibration || 0.15,
      };
      return [...prev, newPoint].slice(-30);
    });
  }, [healthScore, telemetry]);

  const scores = history.map(d => d.score);
  const times  = history.map((_, i) => i);

  const lineColor = healthScore < 70 ? '#ef4444' : '#10b981';
  const fillColor = healthScore < 70 ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <TrendingUp className="text-emerald-500" /> Predictive Health Analytics
          </h2>
          <p className="text-sm text-slate-500 mt-1">Real-time 30-second rolling degradation &amp; recovery curve</p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          3-SIGMA ANOMALY MODEL ACTIVE
        </span>
      </div>

      {/* Gauge + RUL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <HealthGauge score={healthScore} />
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock size={13} className="text-blue-500" /> Remaining Useful Life (RUL)
            </span>
            <span className="text-3xl font-extrabold text-blue-600">
              {rul > 60 ? `${Math.round(rul / 60)} min` : `${rul} sec`}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-4 leading-relaxed">
            Dynamic RUL is updated every 100ms based on vibration variance, temperature slope, and motor torque degradation rate.
          </p>
          {/* Inline mini telemetry bar */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Vibration', value: (telemetry?.vibration || 0.15).toFixed(2) + 'G', color: 'text-amber-600' },
              { label: 'Temperature', value: (telemetry?.temp || 65).toFixed(1) + '°C', color: 'text-rose-600' },
              { label: 'RPM', value: Math.round(telemetry?.rpm || 1500), color: 'text-blue-600' },
            ].map(m => (
              <div key={m.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                <div className={`text-lg font-extrabold ${m.color}`}>{m.value}</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 30-second Rolling Line Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <TrendingUp size={14} className="text-emerald-500" />
          30-Second Degradation &amp; Self-Healing Trend (V-Shape Recovery)
        </h3>

        <div className="w-full h-72 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden p-2">
          <Plot
            data={[{
              x: times,
              y: scores,
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: lineColor, size: 6 },
              line: { color: lineColor, shape: 'spline', width: 3 },
              fill: 'tozeroy',
              fillcolor: fillColor,
            }]}
            layout={{
              autosize: true,
              height: 260,
              margin: { l: 45, r: 20, t: 10, b: 40 },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              xaxis: {
                title: { text: 'Time Step', font: { color: '#94a3b8', size: 11 } },
                showgrid: false,
                zeroline: false,
                tickfont: { color: '#94a3b8', size: 10 },
              },
              yaxis: {
                title: { text: 'Health Score', font: { color: '#94a3b8', size: 11 } },
                range: [0, 105],
                gridcolor: 'rgba(0,0,0,0.05)',
                tickfont: { color: '#94a3b8', size: 10 },
              },
            }}
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
            config={{ displayModeBar: false, responsive: true }}
          />
        </div>
      </div>
    </div>
  );
}

export default PredictiveHealthPage;
