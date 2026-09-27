import React from 'react';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

export default function ChartCard({
  title,
  subtitle,
  badge,
  action,
  loading = false,
  empty = false,
  emptyMessage,
  minHeight = '300px',
  children,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`glass-card chart-card-container ${className}`}
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {(title || subtitle || badge || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {title && (
                <h3
                  style={{
                    fontSize: '0.96rem',
                    fontWeight: 700,
                    color: 'var(--color-heading)',
                    margin: 0,
                  }}
                >
                  {title}
                </h3>
              )}
              {badge && <span>{badge}</span>}
            </div>

            {subtitle && (
              <p
                style={{
                  fontSize: '0.76rem',
                  color: 'var(--text-muted)',
                  margin: '3px 0 0',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {action && (
            <div style={{ flexShrink: 0 }}>
              {action}
            </div>
          )}
        </div>
      )}

      <div style={{ flex: 1, minHeight, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ margin: 'auto', width: '100%' }}>
            <LoadingState compact message="Generating analytical visualization..." />
          </div>
        ) : empty ? (
          <div style={{ margin: 'auto', width: '100%' }}>
            <EmptyState title="No chart data available" description={emptyMessage} />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
