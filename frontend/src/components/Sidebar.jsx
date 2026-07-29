import React from 'react';
import { Home, TrendingUp, Shield, Zap, Terminal, DollarSign, Activity } from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab, isConnected }) {
  const navItems = [
    { id: 'overview', label: 'System Overview', icon: Home },
    { id: 'health', label: 'Predictive Health', icon: TrendingUp },
    { id: 'agents', label: 'Agent Orchestration', icon: Shield },
    { id: 'financials', label: 'Financial Impact', icon: DollarSign },
    { id: 'history', label: 'Incident History', icon: Terminal },
  ];

  return (
    <aside className="w-64 bg-slate-950/90 backdrop-blur-2xl border-r border-slate-800 h-screen flex flex-col justify-between p-5 sticky top-0 z-30 shrink-0 shadow-2xl shadow-slate-950/80">
      <div className="space-y-8">
        {/* Logo Header */}
        <div className="flex items-center gap-3.5 px-2 pt-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-base tracking-tight text-slate-100">ORION-FACTORY</h1>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400 block">DIGITAL TWIN v2.0</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold font-mono transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-950/40 text-purple-300 border border-purple-800 shadow-sm shadow-purple-500/10 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-purple-400' : 'text-slate-500'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Connection Status Badge */}
      <div className="pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
          <span className="text-slate-500 text-[11px] font-bold">System WS:</span>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse' : 'bg-rose-500'}`} />
            <span className={isConnected ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
