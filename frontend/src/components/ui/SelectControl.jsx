import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function SelectControl({
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  id,
  className = '',
  style = {},
}) {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div
      className={`select-control-wrap ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        ...style,
      }}
    >
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          style={{
            width: '100%',
            appearance: 'none',
            background: 'var(--surface-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-main)',
            borderRadius: 'var(--radius-sm)',
            padding: '7px 28px 7px 10px',
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            outline: 'none',
            transition: 'border-color 0.15s ease',
          }}
        >
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option
                key={val}
                value={val}
                style={{
                  background: 'var(--surface-card)',
                  color: 'var(--text-primary)',
                }}
              >
                {lbl}
              </option>
            );
          })}
        </select>

        <ChevronDown
          size={14}
          color="var(--text-muted)"
          style={{
            position: 'absolute',
            right: '9px',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}
