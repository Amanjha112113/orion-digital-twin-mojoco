import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { TrendingUp } from 'lucide-react';

export function HealthChart({ healthScore = 100, telemetry = {} }) {
  const [dataPoints, setDataPoints] = useState([]);

  useEffect(() => {
    setDataPoints(prev => {
      const newPoint = {
        time: new Date().toLocaleTimeString(),
        score: healthScore,
        vibration: telemetry?.vibration || 0.15,
      };
      return [...prev, newPoint].slice(-30);
    });
  }, [healthScore, telemetry]);

  const scores = dataPoints.map(d => d.score);
  const times  = dataPoints.map((_, i) => i);
  const lineColor = healthScore < 70 ? '#ef4444' : '#6c5ce7';
  const fillColor = healthScore < 70 ? 'rgba(239,68,68,0.10)' : 'rgba(108,92,231,0.12)';

  const badge =
    healthScore > 80
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : healthScore > 50
      ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
      : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-purple-500" size={22} /> Predictive Health Score
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time degradation telemetry (0–100)</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${badge}`}>
          {healthScore}% HEALTH
        </span>
      </div>

      {/* Plotly chart on light background */}
      <div className="w-full h-64 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden p-2">
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
            height: 230,
            margin: { l: 35, r: 15, t: 10, b: 30 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            xaxis: {
              showgrid: false,
              zeroline: false,
              tickfont: { color: '#94a3b8', size: 10 },
            },
            yaxis: {
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
  );
}

export default HealthChart;
