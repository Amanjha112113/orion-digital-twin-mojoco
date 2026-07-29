import React, { useState } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { Sidebar } from './components/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { PredictiveHealthPage } from './pages/PredictiveHealthPage';
import { AgentOrchestrationPage } from './pages/AgentOrchestrationPage';
import { FaultInjectionPage } from './pages/FaultInjectionPage';
import { FinancialImpactPage } from './pages/FinancialImpactPage';
import { IncidentHistoryPage } from './pages/IncidentHistoryPage';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const { data, isConnected } = useWebSocket('ws://localhost:8000/ws');
  const [activeTab, setActiveTab] = useState('overview');

  const telemetry = data?.telemetry || {};
  const state = data?.state || {};
  const healthScore = state?.health_score ?? 95;

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage state={state} telemetry={telemetry} />;
      case 'health':
        return <PredictiveHealthPage healthScore={healthScore} telemetry={telemetry} state={state} />;
      case 'agents':
        return <AgentOrchestrationPage state={state} />;
      case 'financials':
        return <FinancialImpactPage state={state} />;
      case 'history':
        return <IncidentHistoryPage />;
      default:
        return <OverviewPage state={state} telemetry={telemetry} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070709] text-slate-100 font-sans selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      {/* Subtle Dark Grid Overlay Line Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b50_1px,transparent_1px),linear-gradient(to_bottom,#1e293b50_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Ambient Soft Lighting Spotlights */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-950/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-950/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Left Sidebar (240px Fixed) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isConnected={isConnected} />

      {/* Main Content Area (Spans Remaining Width) */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto relative z-10 space-y-6 overflow-y-auto">
        <ErrorBoundary>
          {renderActivePage()}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
