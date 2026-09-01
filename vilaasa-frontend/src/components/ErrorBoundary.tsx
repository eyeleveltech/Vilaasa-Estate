import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
          <div className="max-w-md space-y-4 rounded-xl border border-border bg-card p-6 shadow-lg">
            <h2 className="text-xl font-bold text-destructive">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred in the application. Please try refreshing the page.
            </p>
            {this.state.error && (
              <pre className="mt-4 max-h-[200px] overflow-auto rounded bg-secondary p-4 text-left text-xs text-secondary-foreground">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
