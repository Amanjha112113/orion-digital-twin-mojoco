import React, { useState } from 'react';
import { 
  Shield, Eye, TrendingUp, AlertTriangle, Zap, CheckCircle, BarChart, 
  Cpu, Flame, RotateCcw, CheckCircle2 
} from 'lucide-react';

export function AnimatedLangGraph({ state }) {
  const [selectedAgent, setSelectedAgent] = useState('root_cause');
  const [loadingFault, setLoadingFault] = useState(false);

  const graphStatus = state?.graph_status || 'HEALTHY';
  const repairStatus = state?.repair_status || 'IDLE';
  const healthScore = state?.health_score ?? 95;
  const rootCauses = state?.root_causes || [];
  const repairActions = state?.repair_actions || [];

  const handleInjectFault = async (type) => {
    setLoadingFault(true);
    try {
      await fetch(`http://localhost:8000/api/fault/${type}`, { method: 'POST' });
    } catch (e) {
      console.error('Fault error:', e);
    } finally {
      setTimeout(() => setLoadingFault(false), 450);
    }
  };

  const handleHeal = async () => {
    setLoadingFault(true);
    try {
      await fetch('http://localhost:8000/api/heal', { method: 'POST' });
    } catch (e) {
      console.error('Heal error:', e);
    } finally {
      setTimeout(() => setLoadingFault(false), 450);
    }
  };

  // Node specifications with Big-Tech DAG metrics
  const agents = [
    {
      id: 'digital_twin',
      name: 'Digital Twin Perception',
      role: 'Sensor Telemetry Engine',
      engine: 'MuJoCo C++ 3D',
      latency: '1.2ms',
      icon: Eye,
      x: 90, y: 140,
      input: '100ms Joint Velocities (qpos, qvel)',
      output: `Vibration: ${state?.sensor_data?.vibration?.toFixed(2) || '0.15'}G | Temp: ${state?.sensor_data?.temp?.toFixed(1) || '65.0'}°C`,
    },
    {
      id: 'predictive_health',
      name: 'Predictive Health Agent',
      role: '3-Sigma Anomaly Score',
      engine: 'Nixtla TimeGPT / Statistical',
      latency: '18.4ms',
      icon: TrendingUp,
      x: 320, y: 70,
      input: 'Sensor Time Series Telemetry',
      output: `Health Score: ${healthScore}% | RUL: ${state?.predicted_rul || 3600}s`,
    },
    {
      id: 'root_cause',
      name: 'Root Cause LLM',
      role: 'Causal Physical Fault Diagnosis',
      engine: 'xAI Grok / Local Llama 3.2',
      latency: '142ms',
      icon: AlertTriangle,
      x: 550, y: 70,
      input: 'Degraded Physical Telemetry',
      output: rootCauses.length > 0 ? rootCauses.join('; ') : 'All physical joint parameters within nominal bounds',
    },
    {
      id: 'scheduler',
      name: 'Self-Healing Scheduler',
      role: 'Parallel Send() Dispatcher',
      engine: 'LangGraph Send API',
      latency: '8.1ms',
      icon: Zap,
      x: 770, y: 140,
      input: 'Root Cause Physical Directives',
      output: repairActions.length > 0 ? `${repairActions.length} Parallel Repairs Dispatched` : 'Standby Mode',
    },
    {
      id: 'quality_assurance',
      name: 'Quality Assurance Agent',
      role: 'SciPy Statistical T-Test',
      engine: 'SciPy Stats Package',
      latency: '12.6ms',
      icon: CheckCircle,
      x: 550, y: 210,
      input: 'Post-Repair Velocity Sample Array',
      output: repairStatus === 'SUCCESS' ? 'T-Test PASSED (p < 0.001)' : 'Baseline Verification Idle',
    },
    {
      id: 'dashboard',
      name: 'Dashboard Sync Node',
      role: 'State Synchronization',
      engine: 'FastAPI / WebSocket',
      latency: '0.8ms',
      icon: BarChart,
      x: 320, y: 210,
      input: 'Validated Orchestration Payload',
      output: 'Broadcasted to Frontend Dashboard',
    },
  ];

  // Logic: When healthy, root_cause, scheduler, and QA validation are IDLE (no glow, no signal).
  // When system degrades, they wake up, execute, and glow bright neon green/emerald!
  const getAgentStatus = (id) => {
    const isIdleNode = ['root_cause', 'scheduler', 'quality_assurance'].includes(id);
    if (graphStatus === 'HEALTHY') {
      return isIdleNode ? 'IDLE' : 'OPTIMAL';
    }
    // During active fault and healing, idle nodes wake up and glow bright green/emerald!
    return 'WOKEN_UP';
  };

  const selectedData = agents.find(a => a.id === selectedAgent) || agents[0];

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* ── Top Command Control & Fault Injection Toolbar ── */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Shield className="text-purple-400" size={22} />
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Agent DAG Pipeline &amp; Orchestration Workstation
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            LangGraph Multi-Agent Stateful Flow • 6 Nodes • Parallel Send() Execution
          </p>
        </div>

        {/* Live Hardware Fault Trigger Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleInjectFault('vibration')}
            disabled={loadingFault}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <Zap size={14} className="text-amber-400" /> Trigger Vibration Spike
          </button>

          <button
            onClick={() => handleInjectFault('overheat')}
            disabled={loadingFault}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <Flame size={14} className="text-rose-400" /> Trigger Overheat (&gt;88°C)
          </button>

          <button
            onClick={handleHeal}
            disabled={loadingFault}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <RotateCcw size={14} className="text-emerald-400" /> Heal &amp; Reset
          </button>
        </div>
      </div>

      {/* ── Main Interactive Agent Graph Canvas ── */}
      <div className="bg-[#090d16] p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Subtle Grid Background */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#8b5cf6 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* Canvas Header */}
        <div className="flex items-center justify-between mb-4 relative z-10 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="text-slate-300 font-bold uppercase tracking-wider">LIVE DAG WORKFLOW CANVAS</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">Graph State:</span>
            <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
              graphStatus === 'HEALTHY'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
            }`}>
              {graphStatus}
            </span>
          </div>
        </div>

        {/* SVG Curved Bezier Laser Paths */}
        <div className="relative w-full h-[300px] overflow-hidden rounded-xl bg-slate-950/60 border border-slate-800/80">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 880 280"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="gradient-glow-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="gradient-glow-purple" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
              </linearGradient>
              <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Link 1: Digital Twin -> Predictive Health (Always active) */}
            <path d="M 90 140 C 180 140, 230 70, 320 70" 
              fill="none" stroke="url(#gradient-glow-cyan)" strokeWidth="2.5" strokeDasharray="6 4" />
            
            {/* Link 2: Predictive Health -> Root Cause (Only active when degraded/diagnosing/healing) */}
            <path d="M 320 70 L 550 70" 
              fill="none" 
              stroke={graphStatus !== 'HEALTHY' ? '#10b981' : '#1e293b'} 
              strokeWidth={graphStatus !== 'HEALTHY' ? "3" : "1.5"} 
              strokeOpacity={graphStatus !== 'HEALTHY' ? "1.0" : "0.2"}
              filter={graphStatus !== 'HEALTHY' ? "url(#laser-glow)" : ""} 
            />

            {/* Link 3: Root Cause -> Scheduler (Only active when degraded/diagnosing/healing) */}
            <path d="M 550 70 C 640 70, 690 140, 770 140" 
              fill="none" 
              stroke={graphStatus !== 'HEALTHY' ? 'url(#gradient-glow-purple)' : '#1e293b'} 
              strokeWidth={graphStatus !== 'HEALTHY' ? "3" : "1.5"} 
              strokeOpacity={graphStatus !== 'HEALTHY' ? "1.0" : "0.2"}
              filter={graphStatus !== 'HEALTHY' ? "url(#laser-glow)" : ""} 
            />

            {/* Link 4: Scheduler -> QA (Only active when healing/success) */}
            <path d="M 770 140 C 690 140, 640 210, 550 210" 
              fill="none" 
              stroke={graphStatus !== 'HEALTHY' ? '#10b981' : '#1e293b'} 
              strokeWidth={graphStatus !== 'HEALTHY' ? "2.5" : "1.5"} 
              strokeOpacity={graphStatus !== 'HEALTHY' ? "1.0" : "0.2"}
            />

            {/* Link 5: QA -> Dashboard (Only active when healing/success) */}
            <path d="M 550 210 L 320 210" 
              fill="none" 
              stroke={graphStatus !== 'HEALTHY' ? '#10b981' : '#1e293b'} 
              strokeWidth={graphStatus !== 'HEALTHY' ? "2.5" : "1.5"} 
              strokeOpacity={graphStatus !== 'HEALTHY' ? "1.0" : "0.2"}
            />

            {/* Link 6: Dashboard -> Digital Twin (Feedback loop, always active) */}
            <path d="M 320 210 C 230 210, 180 140, 90 140" 
              fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />

            {/* Data flow particles - Only animate through active branches */}
            <circle r="5.5" fill="#06b6d4" filter="url(#laser-glow)">
              <animateMotion path="M 90 140 C 180 140, 230 70, 320 70" dur="1.5s" repeatCount="indefinite" />
            </circle>

            {graphStatus !== 'HEALTHY' && (
              <>
                <circle r="5.5" fill="#10b981" filter="url(#laser-glow)">
                  <animateMotion path="M 320 70 L 550 70" dur="1.1s" repeatCount="indefinite" />
                </circle>
                <circle r="5.5" fill="#34d399" filter="url(#laser-glow)">
                  <animateMotion path="M 550 70 C 640 70, 690 140, 770 140" dur="1.3s" repeatCount="indefinite" />
                </circle>
                <circle r="5.5" fill="#10b981" filter="url(#laser-glow)">
                  <animateMotion path="M 770 140 C 690 140, 640 210, 550 210" dur="1.4s" repeatCount="indefinite" />
                </circle>
                <circle r="5.5" fill="#10b981" filter="url(#laser-glow)">
                  <animateMotion path="M 550 210 L 320 210" dur="1.2s" repeatCount="indefinite" />
                </circle>
              </>
            )}

            <circle r="5" fill="#10b981" filter="url(#laser-glow)">
              <animateMotion path="M 320 210 C 230 210, 180 140, 90 140" dur="1.6s" repeatCount="indefinite" />
            </circle>
          </svg>

          {/* Interactive Agent Node Cards */}
          <div className="relative w-full h-full max-w-[880px]">
            {agents.map((agent) => {
              const Icon = agent.icon;
              const status = getAgentStatus(agent.id);
              const isSelected = selectedAgent === agent.id;

              let cardBg = 'bg-slate-900/60 border-slate-800/80 text-slate-500 opacity-60';
              let badgeBg = 'bg-slate-950 text-slate-600';

              if (status === 'OPTIMAL') {
                cardBg = 'bg-emerald-950/80 border-emerald-600/60 text-emerald-100 shadow-lg shadow-emerald-950/40 opacity-100';
                badgeBg = 'bg-emerald-900/90 text-emerald-300 border-emerald-700';
              } else if (status === 'WOKEN_UP') {
                // Glow bright amber/orange when woken up to repair physical failure
                cardBg = 'bg-amber-900/90 border-amber-500 text-amber-50 shadow-xl shadow-amber-500/50 animate-pulse scale-102 opacity-100';
                badgeBg = 'bg-amber-950 text-amber-300 border-amber-600';
              }

              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  style={{ left: `${(agent.x / 880) * 100}%`, top: `${(agent.y / 280) * 100}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer w-44 ${cardBg} ${
                    isSelected ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-950 scale-105 z-20' : 'hover:scale-102'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="p-1.5 rounded-lg bg-slate-950/60 text-purple-400">
                      <Icon size={16} />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${badgeBg}`}>
                      {status}
                    </span>
                  </div>

                  <h3 className="text-[11px] font-bold tracking-tight text-slate-100 truncate">{agent.name}</h3>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-1 pt-1 border-t border-slate-800/80">
                    <span>{agent.engine}</span>
                    <span className="text-purple-300">{agent.latency}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom Detailed Node Telemetry Inspector ── */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-2xl space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
            <Cpu size={16} />
            <span>Agent Telemetry Inspector: {selectedData.name}</span>
          </div>
          <span className="text-[10px] text-slate-500">Engine: {selectedData.engine}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-bold">Input Payload Context</span>
            <p className="text-slate-300 font-mono">{selectedData.input}</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-purple-400 text-[10px] uppercase tracking-wider block font-bold">Agent Output &amp; State Mutation</span>
            <p className="text-slate-200 font-mono">{selectedData.output}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimatedLangGraph;
