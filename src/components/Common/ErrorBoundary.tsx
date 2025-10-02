import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-center">
          <div className="bg-white dark:bg-gray-800 p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Oops! Something went wrong.</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6">We're sorry for the inconvenience. Please try again.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
              <a
                href="https://github.com/hariharen9/spendwiser/issues/new" // GitHub issue link
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 text-white bg-gray-500 rounded hover:bg-gray-600 transition-colors"
              >
                Create GitHub Issue
              </a>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-gray-500 dark:text-gray-400">Error Details</summary>
                <pre className="mt-2 p-4 bg-gray-200 dark:bg-gray-700 rounded text-sm text-red-500 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
