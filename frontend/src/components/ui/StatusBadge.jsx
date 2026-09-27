import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export default function StatusBadge({
  status = 'NORMAL',
  label,
  size = 'md',
  showIcon = true,
  className = '',
  style = {},
}) {
  const norm = String(status || '').toUpperCase();

  let config = {
    bg: 'var(--color-cyan-subtle)',
    color: 'var(--color-cyan)',
    border: 'rgba(6, 182, 212, 0.3)',
    text: label || status,
    icon: Activity,
  };

  if (norm.includes('NORMAL') || norm.includes('BENIGN') || norm.includes('SUCCESS') || norm.includes('ONLINE')) {
    config = {
      bg: 'var(--color-green-bg)',
      color: 'var(--color-green)',
      border: 'rgba(16, 185, 129, 0.3)',
      text: label || 'NORMAL',
      icon: CheckCircle2,
    };
  } else if (norm.includes('SUSPICIOUS') || norm.includes('ATTACK') || norm.includes('DDOS') || norm.includes('ERROR')) {
    config = {
      bg: 'var(--color-red-bg)',
      color: 'var(--color-red)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: label || 'SUSPICIOUS',
      icon: AlertTriangle,
    };
  } else if (norm.includes('VERIFIED') || norm.includes('ACCURATE')) {
    config = {
      bg: 'rgba(168, 85, 247, 0.12)',
      color: 'var(--color-purple)',
      border: 'rgba(168, 85, 247, 0.3)',
      text: label || 'VERIFIED',
      icon: ShieldCheck,
    };
  } else if (norm.includes('PENDING') || norm.includes('WARNING')) {
    config = {
      bg: 'var(--color-orange-bg)',
      color: 'var(--color-orange)',
      border: 'rgba(245, 158, 11, 0.3)',
      text: label || 'WARNING',
      icon: AlertTriangle,
    };
  }

  const Icon = config.icon;
  const isSmall = size === 'sm';

  return (
    <span
      className={`badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '4px' : '6px',
        padding: isSmall ? '2px 6px' : '3px 8px',
        borderRadius: '4px',
        fontSize: isSmall ? '0.65rem' : '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        lineHeight: 1.2,
        ...style,
      }}
    >
      {showIcon && <Icon size={isSmall ? 10 : 12} />}
      <span>{config.text}</span>
    </span>
  );
}
