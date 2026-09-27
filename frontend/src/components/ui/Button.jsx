import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  style = {},
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'cyan':
        return {
          background: 'var(--color-cyan)',
          color: '#FFFFFF',
          border: '1px solid var(--color-cyan)',
          fontWeight: 700,
        };
      case 'secondary':
        return {
          background: 'var(--surface-card)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)',
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-main)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid transparent',
        };
      case 'danger':
        return {
          background: 'var(--color-red-bg)',
          color: 'var(--color-red)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        };
      case 'primary':
      default:
        return {
          background: 'var(--surface-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-main)',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '5px 10px',
          fontSize: '0.78rem',
          gap: '6px',
        };
      case 'lg':
        return {
          padding: '10px 20px',
          fontSize: '0.92rem',
          gap: '10px',
        };
      case 'md':
      default:
        return {
          padding: '8px 14px',
          fontSize: '0.84rem',
          gap: '8px',
        };
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${className}`}
      style={{
        ...getVariantStyles(),
        ...getSizeStyles(),
        opacity: disabled || loading ? 0.5 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        transition: 'all 0.18s ease',
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      ) : (
        Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
    </button>
  );
}
