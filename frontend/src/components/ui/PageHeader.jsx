import React from 'react';

export default function PageHeader({
  title,
  description,
  badge,
  actions,
  className = '',
  style = {},
}) {
  return (
    <header
      className={`page-header-standard ${className}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-subtle)',
        ...style,
      }}
    >
      <div style={{ maxWidth: '780px' }}>
        {badge && (
          <div style={{ marginBottom: '8px' }}>
            {badge}
          </div>
        )}

        <h1
          style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--color-heading)',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>

        {description && (
          <p
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              marginTop: '6px',
              marginBottom: 0,
              lineHeight: 1.45,
            }}
          >
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </header>
  );
}
