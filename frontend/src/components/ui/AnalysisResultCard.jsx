import React from 'react';
import { Sparkles, CheckCircle2, Info } from 'lucide-react';

export default function AnalysisResultCard({
  title = 'Analytical Finding',
  category = 'DWDM Insight',
  icon: Icon = Sparkles,
  accent = 'var(--color-cyan)',
  children,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`glass-card analysis-result-card ${className}`}
      style={{
        padding: '16px 18px',
        borderLeft: `3px solid ${accent}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Icon size={14} color={accent} />
          <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: accent }}>
            {category}
          </span>
        </div>
      </div>

      <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
        {title}
      </h4>

      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
        {children}
      </div>
    </div>
  );
}
