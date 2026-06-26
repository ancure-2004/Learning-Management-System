import React from 'react';

/**
 * App-level error boundary. Catches render/runtime errors in any child
 * route so a single broken component shows a recoverable fallback instead
 * of a blank white screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Hook for an error-tracking service (Sentry, etc.) later.
    console.error('Uncaught error in component tree:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#eef0f5',
          fontFamily:
            "'Plus Jakarta Sans','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 440,
            width: '100%',
            background: '#ffffff',
            border: '1px solid rgba(15,23,42,0.08)',
            borderRadius: 16,
            padding: '32px 28px',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(15,23,42,0.10)',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
            An unexpected error occurred while rendering this page. You can return to the
            dashboard and try again.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              background: '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '11px 22px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
