import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Unable to load analytical data',
  message = 'Failed to connect to the backend server or MySQL Data Warehouse.',
  onRetry,
  retryLabel = 'Retry Query',
  className = '',
  style = {},
}) {
  return (
    <div
      className={`error-panel ${className}`}
      style={{
        padding: '32px 24px',
        textAlign: 'center',
        background: 'rgba(239, 68, 68, 0.04)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        margin: '16px 0',
        ...style,
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'var(--color-red-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-red)',
        }}
      >
        <AlertTriangle size={22} />
      </div>

      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '2px 0 10px', lineHeight: 1.45 }}>
        {message}
      </p>

      {onRetry && (
        <Button variant="primary" size="sm" icon={RefreshCw} onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
