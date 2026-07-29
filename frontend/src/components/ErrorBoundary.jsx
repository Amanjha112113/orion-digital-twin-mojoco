import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("UI Component Error Intercepted:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-lg space-y-4 max-w-3xl mx-auto my-8 font-mono">
          <div className="flex items-center gap-3 text-rose-700">
            <AlertOctagon size={28} className="animate-bounce" />
            <div>
              <h3 className="text-lg font-bold">UI Component Exception Intercepted</h3>
              <p className="text-xs text-rose-600">ORION-FACTORY Self-Healing Error Boundary</p>
            </div>
          </div>

          <div className="bg-slate-900 text-rose-300 p-4 rounded-xl text-xs overflow-x-auto space-y-2 border border-slate-800">
            <p className="font-bold text-rose-400">{this.state.error?.toString()}</p>
            <pre className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap">
              {this.state.errorInfo?.componentStack || "No stack trace available"}
            </pre>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">System architecture prevented white-screen crash.</span>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <RefreshCw size={14} /> Recover &amp; Reload View
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
