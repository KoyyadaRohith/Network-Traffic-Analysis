import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  subtitle,
  change,
  isPositive,
  icon: Icon,
  accent = 'var(--color-cyan)',
  loading = false,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`glass-card metric-card ${className}`}
      style={{
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-muted)',
            }}
          >
            {title}
          </span>
          <div
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: '4px',
              lineHeight: 1.15,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {loading ? (
              <div className="skeleton" style={{ width: '80px', height: '22px', marginTop: '4px' }} />
            ) : (
              value ?? '—'
            )}
          </div>
        </div>

        {Icon && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'var(--surface-elevated)',
              border: `1px solid ${accent}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accent,
              flexShrink: 0,
            }}
          >
            <Icon size={16} />
          </div>
        )}
      </div>

      {(subtitle || change !== undefined) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.72rem' }}>
          {change !== undefined && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                fontWeight: 700,
                color: isPositive ? 'var(--color-green)' : 'var(--color-red)',
              }}
            >
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {change}
            </span>
          )}
          {subtitle && (
            <span style={{ color: 'var(--text-secondary)' }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
