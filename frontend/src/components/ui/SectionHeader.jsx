import React from 'react';

export default function SectionHeader({
  title,
  subtitle,
  badge,
  action,
  icon: Icon,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`section-header-standard ${className}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '14px',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {Icon && (
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              background: 'var(--color-cyan-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-cyan)',
              flexShrink: 0,
            }}
          >
            <Icon size={14} />
          </div>
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--color-heading)',
                margin: 0,
              }}
            >
              {title}
            </h2>
            {badge && <span>{badge}</span>}
          </div>

          {subtitle && (
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                margin: '2px 0 0',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {action}
        </div>
      )}
    </div>
  );
}
