import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function AgentStatusCard({ state }) {
  const causes = state?.root_causes || [];
  const repairs = state?.repair_actions || [];

  return (
    <div className="bg-surface p-6 rounded-xl border border-gray-800 space-y-6">
      <h2 className="text-xl font-bold">Agent Diagnostic Logs</h2>
      
      <div className="space-y-4">
        {/* Diagnosis log */}
        <div className="p-4 rounded-lg bg-black/30 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold flex items-center gap-1.5">
              <AlertCircle size={16} className="text-yellow-500" /> Root Cause Diagnosis
            </span>
            {state?.diagnosis_confidence ? (
              <span className="text-xs text-gray-400">Conf: {Math.round(state.diagnosis_confidence * 100)}%</span>
            ) : null}
          </div>
          {causes.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
              {causes.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          ) : (
            <span className="text-xs text-gray-500">All systems operating within acceptable bounds. No active faults.</span>
          )}
        </div>

        {/* Repair log */}
        <div className="p-4 rounded-lg bg-black/30 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-green-500" /> Active Repair Strategies
            </span>
            <span className="text-xs text-gray-400">Status: {state?.repair_status || 'IDLE'}</span>
          </div>
          {repairs.length > 0 ? (
            <div className="space-y-2">
              {repairs.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-black/20 p-2 rounded">
                  <span className="font-mono text-xs">{r.action}</span>
                  <span className="text-primary font-bold text-xs">{String(r.value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-gray-500">No scheduled repairs. Scheduler Idle.</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default AgentStatusCard;
