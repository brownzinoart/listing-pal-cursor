import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class PortfolioErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error, 
      errorInfo: null 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console for debugging
    console.error('🚨 Portfolio Analytics Error Boundary caught an error:', error);
    console.error('📍 Error info:', errorInfo);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-background p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
              <h1 className="text-2xl font-bold mb-4">🚨 Portfolio Analytics Error</h1>
              
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Error Details:</h2>
                <p className="bg-red-50 p-3 rounded border font-mono text-sm">
                  {this.state.error?.message || 'Unknown error occurred'}
                </p>
              </div>

              {this.state.error?.stack && (
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2">Stack Trace:</h2>
                  <pre className="bg-red-50 p-3 rounded border text-xs overflow-x-auto">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}

              {this.state.errorInfo?.componentStack && (
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2">Component Stack:</h2>
                  <pre className="bg-red-50 p-3 rounded border text-xs overflow-x-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">🔧 Troubleshooting Steps:</h2>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Check the browser console for additional error details</li>
                  <li>Verify all required dependencies are installed</li>
                  <li>Check if chart data formats match expected structure</li>
                  <li>Try refreshing the page</li>
                  <li>Clear browser cache if issues persist</li>
                </ol>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  🔄 Reload Page
                </button>
                <a
                  href="/dashboard"
                  className="ml-3 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors inline-block"
                >
                  🏠 Back to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PortfolioErrorBoundary;