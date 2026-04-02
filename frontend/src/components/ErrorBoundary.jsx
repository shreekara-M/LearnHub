import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
          <div className="card max-w-lg p-8 text-center">
            <h1 className="font-display text-2xl font-bold text-ink-900">Something went wrong.</h1>
            <p className="mt-3 text-sm text-ink-500">
              {this.state.error?.message || 'An unexpected error interrupted the page.'}
            </p>
            <button type="button" className="btn-primary mt-6" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;