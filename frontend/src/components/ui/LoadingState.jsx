import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({
  message = 'Loading analytical records...',
  subtext = 'Querying MySQL Data Warehouse...',
  compact = false,
  rows = 3,
  className = '',
  style = {},
}) {
  if (compact) {
    return (
      <div
        className={`loading-state-compact ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          color: 'var(--text-muted)',
          fontSize: '0.82rem',
          ...style,
        }}
      >
        <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--color-cyan)' }} />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div
      className={`loading-state-card ${className}`}
      style={{
        padding: '36px 24px',
        textAlign: 'center',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        ...style,
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'var(--color-cyan-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-cyan)',
        }}
      >
        <Loader2 size={22} style={{ animation: 'spin 1.2s linear infinite' }} />
      </div>

      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
        {message}
      </div>

      {subtext && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '420px' }}>
          {subtext}
        </div>
      )}

      {/* Skeletons preview */}
      <div style={{ width: '100%', maxWidth: '360px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              height: '14px',
              width: i === 0 ? '100%' : i === 1 ? '75%' : '50%',
              margin: '0 auto',
            }}
          />
        ))}
      </div>
    </div>
  );
}
