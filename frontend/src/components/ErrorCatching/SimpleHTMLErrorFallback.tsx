import { ErrorInfo } from 'react';

interface SimpleHTMLErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

const SimpleHTMLErrorFallback = ({ error, errorInfo, onReset }: SimpleHTMLErrorFallbackProps) => {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1
          style={{
            color: '#d32f2f',
            marginTop: 0,
            marginBottom: '16px',
            fontSize: '28px',
            fontWeight: 600,
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            color: '#495057',
            marginBottom: '24px',
            fontSize: '16px',
            lineHeight: '1.5',
          }}
        >
          We apologize for the inconvenience. An error occurred while loading the application.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={onReset}
            style={{
              backgroundColor: '#228be6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1c7ed6')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#228be6')}
          >
            Try Again
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            style={{
              backgroundColor: 'white',
              color: '#228be6',
              border: '1px solid #228be6',
              padding: '10px 20px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f3f5')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'white')}
          >
            Go to Home
          </button>
        </div>

        {isDevelopment && error && (
          <div>
            <p
              style={{
                fontWeight: 700,
                fontSize: '14px',
                marginBottom: '8px',
                color: '#495057',
              }}
            >
              Error Details (Development Only):
            </p>
            <div
              style={{
                backgroundColor: '#f1f3f5',
                padding: '12px',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '300px',
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#d32f2f',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {error.toString()}
              </pre>
              {errorInfo && (
                <pre
                  style={{
                    margin: 0,
                    marginTop: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#495057',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {errorInfo.componentStack}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleHTMLErrorFallback;
