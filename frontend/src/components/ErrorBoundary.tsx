import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CyberShield Uncaught UI Error:', error, errorInfo);
  }

  public handleReset = () => {
    localStorage.removeItem('cybershield_token');
    localStorage.removeItem('cybershield_user');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-6 text-center space-y-4 shadow-2xl backdrop-blur-md">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">CyberShield Session Recovery</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              A temporary display anomaly was contained by zero-trust boundaries. You can resume session immediately.
            </p>
            <div className="p-3 bg-black/40 rounded-xl text-left font-mono text-[11px] text-rose-300 max-h-24 overflow-auto border border-rose-900/30">
              {this.state.error?.message || 'Component runtime error'}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-all border border-slate-600"
              >
                Reset Session
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
