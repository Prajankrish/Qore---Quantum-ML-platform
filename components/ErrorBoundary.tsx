
import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Activity } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Standard React Error Boundary component to catch rendering errors.
 */
// Fixed: Use React.Component for explicit inheritance recognition in some TypeScript environments.
export class ErrorBoundary extends React.Component<Props, State> {
  // Fix: Explicitly declare state and props to satisfy the compiler in this environment
  public state: State;
  public props: Props;

  // Fixed: Explicit constructor ensures that props and state are properly typed and available on 'this'.
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service.
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    // Fixed: Using direct access to state and props via 'this' to avoid potential destructuring context issues in this environment.
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="w-10 h-10 text-red-500 animate-pulse" />
            </div>
            
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              Quantum Decoherence Detected
            </h1>
            
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              The application state has collapsed due to an unexpected runtime anomaly. Our automated error correction protocols have logged this event.
            </p>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 mb-8 text-left overflow-hidden">
                <p className="font-mono text-xs text-red-600 dark:text-red-400 truncate">
                    Error: {this.state.error?.message || 'Unknown Exception'}
                </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3.5 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg shadow-violet-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Re-initialize System
            </button>
            
            <p className="mt-6 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Qore Safe Mode v2.1
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
