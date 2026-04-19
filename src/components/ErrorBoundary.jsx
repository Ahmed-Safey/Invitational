import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('App crashed:', error, info)
  }

  handleReload = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem', background: '#0a0a0a', color: '#C6BA8E', fontFamily: 'Oswald, Arial, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '480px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠</div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#999', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
              The page encountered an unexpected error. Please try reloading. If the problem persists, contact the site administrator.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                background: '#A41E22', color: '#fff', border: 'none', padding: '0.75rem 2rem',
                fontFamily: 'inherit', fontSize: '0.85rem', letterSpacing: '0.15em',
                textTransform: 'uppercase', cursor: 'pointer', fontWeight: 600
              }}
            >
              Reload Page
            </button>
            {import.meta.env.DEV && (
              <pre style={{
                marginTop: '2rem', padding: '1rem', background: '#1a0405', borderRadius: '4px',
                fontSize: '0.75rem', textAlign: 'left', overflow: 'auto', color: '#ff9090',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word'
              }}>
                {this.state.error?.stack || String(this.state.error)}
              </pre>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
