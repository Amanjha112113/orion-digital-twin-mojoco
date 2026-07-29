import React from 'react';
import { Shield, Eye, TrendingUp, AlertTriangle, Zap, CheckCircle, BarChart, ArrowRight } from 'lucide-react';

export function LangGraphFlow({ graphStatus }) {
  const agents = [
    { id: 'digital_twin', name: 'Digital Twin', desc: 'Perception Layer', icon: Eye },
    { id: 'predictive_health', name: 'Predictive Health', desc: 'Anomaly Detector', icon: TrendingUp },
    { id: 'root_cause', name: 'Root Cause', desc: 'Ollama / Grok LLM', icon: AlertTriangle },
    { id: 'scheduler', name: 'Scheduler', desc: 'Parallel Repair', icon: Zap },
    { id: 'quality_assurance', name: 'QA Validation', desc: 'SciPy T-Test', icon: CheckCircle },
    { id: 'dashboard', name: 'Reporting', desc: 'Visual Payload', icon: BarChart },
  ];

  const getAgentStyle = (agentId) => {
    if (graphStatus === 'HEALTHY') {
      if (['digital_twin', 'predictive_health', 'dashboard'].includes(agentId)) {
        return 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]';
      }
      return 'border-gray-800 bg-gray-900/40 text-gray-500 opacity-60';
    } else if (graphStatus === 'DIAGNOSING') {
      if (agentId === 'root_cause') {
        return 'border-amber-500 bg-amber-950/50 text-amber-400 animate-pulse shadow-[0_0_25px_-3px_rgba(245,158,11,0.5)] scale-[1.02]';
      }
      if (['digital_twin', 'predictive_health'].includes(agentId)) {
        return 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400';
      }
      return 'border-gray-800 bg-gray-900/40 text-gray-500 opacity-60';
    } else if (graphStatus === 'HEALING') {
      if (['scheduler', 'quality_assurance'].includes(agentId)) {
        return 'border-purple-500 bg-purple-950/50 text-purple-300 animate-pulse shadow-[0_0_25px_-3px_rgba(168,85,247,0.5)] scale-[1.02]';
      }
      if (['root_cause', 'digital_twin', 'predictive_health'].includes(agentId)) {
        return 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400';
      }
      return 'border-gray-800 bg-gray-900/40 text-gray-500 opacity-60';
    }
    return 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400';
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-display font-bold flex items-center gap-2 text-white">
            <Shield className="text-purple-400" size={22} /> Active LangGraph Agent Network
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Real-time stateful multi-agent execution loop</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-gray-400 font-mono">Graph Status:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold font-mono tracking-wide ${
            graphStatus === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-green' :
            graphStatus === 'DIAGNOSING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow-amber animate-pulse' :
            'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-glow-primary animate-pulse'
          }`}>
            {graphStatus}
          </span>
        </div>
      </div>

      {/* Grid of 6 Agents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10 mt-4">
        {agents.map((agent, i) => {
          const Icon = agent.icon;
          const styleClass = getAgentStyle(agent.id);
          return (
            <div 
              key={agent.id} 
              className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all duration-300 backdrop-blur-md ${styleClass}`}
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 shadow-inner">
                  <Icon size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">A{i + 1}</span>
                    <h3 className="font-display font-semibold text-sm tracking-tight text-gray-100">{agent.name}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{agent.desc}</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-gray-600 opacity-40 hidden sm:block" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LangGraphFlow;
