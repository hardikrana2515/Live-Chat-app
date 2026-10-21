import React from 'react';

/**
 * Top-level Error Boundary — catches uncaught React render errors and shows
 * a user-friendly fallback instead of a white screen (Audit Issue §4 UX).
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100dvh',
            background: 'var(--c-canvas, #0d0f12)',
            color: 'var(--c-text, #e5e7eb)',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--c-text-2, #9ca3af)',
              maxWidth: '28rem',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            An unexpected error occurred. Your data is safe — try reloading the
            page. If the problem persists, clear your browser cache and try again.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '0.625rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: 'var(--c-primary, #7c3aed)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
          {this.state.error && (
            <pre
              style={{
                marginTop: '2rem',
                fontSize: '0.75rem',
                color: 'var(--c-danger, #ef4444)',
                maxWidth: '32rem',
                overflow: 'auto',
                padding: '1rem',
                background: 'var(--c-surface, #1a1d23)',
                borderRadius: '0.5rem',
                textAlign: 'left',
              }}
            >
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
