// components/explorer/ExplorerErrorBoundary.tsx
// Sprint 5D — Production Error Boundary wrapper for Knowledge Explorer UI
// Class-based error boundaries rely on React lifecycle/state and must be Client Components.

'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ExplorerErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('[ExplorerErrorBoundary] Unhandled error captured:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center space-y-4 max-w-lg mx-auto mt-12 font-sans">
          <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-100">Explorer UI Render Failure</h3>
          <p className="text-xs text-gray-400">
            An unexpected error occurred while rendering the Knowledge Explorer. The system logs have been updated.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); }}
            className="bg-red-650 hover:bg-red-600 text-gray-100 text-xs px-4 py-2 rounded-lg font-bold border border-red-500/50 transition-colors"
          >
            Attempt Recover
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
