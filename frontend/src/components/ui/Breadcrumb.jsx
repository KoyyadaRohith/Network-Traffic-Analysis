import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumb({
  items = [],
  separator = ChevronRight,
  className = '',
  style = {},
}) {
  const SeparatorIcon = separator;

  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`academic-breadcrumb ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '6px',
        fontSize: '0.74rem',
        fontFamily: 'Inter, sans-serif',
        ...style,
      }}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const isClickable = Boolean(item.onClick || item.href);

        return (
          <React.Fragment key={item.key || item.label || idx}>
            {idx > 0 && (
              <SeparatorIcon
                size={12}
                style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                aria-hidden="true"
              />
            )}

            {isClickable && !isLast ? (
              <button
                type="button"
                onClick={item.onClick}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px 4px',
                  margin: 0,
                  font: 'inherit',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {item.icon && <item.icon size={13} style={{ flexShrink: 0 }} />}
                <span>{item.label}</span>
              </button>
            ) : (
              <span
                style={{
                  padding: '2px 4px',
                  color: isLast ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: isLast ? 600 : 400,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.icon && (
                  <item.icon
                    size={13}
                    style={{
                      flexShrink: 0,
                      color: isLast ? 'var(--color-cyan)' : 'var(--text-muted)',
                    }}
                  />
                )}
                <span>{item.label}</span>
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
