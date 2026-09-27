import React from 'react';
import { Database, FilterX, Search } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  title = 'No records match the selected filters',
  description = 'Try resetting or broadening your filter criteria to view dataset flows.',
  icon: Icon = FilterX,
  actionLabel,
  onAction,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`empty-state-card ${className}`}
      style={{
        padding: '40px 24px',
        textAlign: 'center',
        background: 'var(--surface-card)',
        border: '1px dashed var(--border-main)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        margin: '16px 0',
        ...style,
      }}
    >
      <div
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        <Icon size={22} />
      </div>

      <h3
        style={{
          fontSize: '1rem',
          fontWeight: '700',
          color: 'var(--color-heading)',
          margin: 0,
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            maxWidth: '440px',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <div style={{ marginTop: '6px' }}>
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
