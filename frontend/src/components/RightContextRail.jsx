import React from 'react';
import {
  Database,
  Layers,
  Cpu,
  Table2,
  Sliders,
  GraduationCap,
  BarChart3,
} from 'lucide-react';

export default function RightContextRail() {
  const metadataItems = [
    {
      label: 'Dataset',
      value: 'CICIDS2017',
      sub: 'Network Traffic Subset',
      icon: Database,
      accent: 'var(--color-cyan)',
      bg: 'rgba(0, 217, 255, 0.08)',
    },
    {
      label: 'Warehouse',
      value: 'MySQL',
      sub: 'Relational Database',
      icon: Database,
      accent: '#A855F7',
      bg: 'rgba(168, 85, 247, 0.08)',
    },
    {
      label: 'Schema',
      value: 'Star Schema',
      sub: '1 Fact • 3 Dimensions',
      icon: Table2,
      accent: '#A855F7',
      bg: 'rgba(168, 85, 247, 0.08)',
    },
    {
      label: 'OLAP',
      value: 'Slice • Dice • Roll-Up • Drill-Down',
      sub: 'Multidimensional Analysis',
      icon: BarChart3,
      accent: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.08)',
    },
    {
      label: 'Data Mining',
      value: 'Random Forest',
      sub: '100 Trees • Supervised',
      icon: Cpu,
      accent: 'var(--color-cyan)',
      bg: 'rgba(0, 217, 255, 0.08)',
    },
    {
      label: 'Features',
      value: '62',
      sub: 'Extracted Flow Attributes',
      icon: Sliders,
      accent: '#22D3EE',
      bg: 'rgba(34, 211, 238, 0.08)',
    },
  ];

  return (
    <aside className="right-context-rail">
      {/* Rail Brand & Context Header */}
      <div className="right-rail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div className="right-rail-dot" />
          <span style={{ fontSize: '0.66rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-cyan)', textTransform: 'uppercase' }}>
            PROJECT CONTEXT
          </span>
        </div>

        <h2 className="right-rail-title" style={{ fontSize: '0.92rem', lineHeight: '1.2' }}>
          NETWORK TRAFFIC<br />ANALYSIS
        </h2>
        <div className="right-rail-subtitle">
          Data Warehousing & Data Mining
        </div>
        <p className="right-rail-caption">
          CICIDS2017 • MySQL • Random Forest
        </p>

        {/* Clean Divider */}
        <div className="right-rail-divider" />
      </div>

      {/* Compact Academic Project Metadata Panel */}
      <div className="right-rail-metadata-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
          DWDM SPECIFICATIONS
        </div>

        {metadataItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                transition: 'border-color 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  background: item.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.accent,
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              >
                <Icon size={13} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.62rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '1px', lineHeight: 1.25, wordBreak: 'break-word' }}>
                  {item.value}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {item.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Academic Curriculum Callout */}
      <div
        style={{
          marginTop: '12px',
          background: 'rgba(168, 85, 247, 0.05)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <GraduationCap size={14} color="#A855F7" />
          <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#A855F7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Academic B.Tech DWDM
          </span>
        </div>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
          Designed for Data Warehousing & Data Mining coursework evaluation.
        </p>
      </div>

      {/* Right Rail Footer */}
      <div className="right-rail-footer" style={{ marginTop: 'auto', paddingTop: '14px' }}>
        <div className="right-rail-divider" style={{ marginBottom: '10px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '0.03em' }}>
              CICIDS2017
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
              BENCHMARK DATASET
            </div>
          </div>
          <span
            style={{
              fontSize: '0.60rem',
              fontWeight: '700',
              color: 'var(--color-cyan)',
              background: 'rgba(0, 217, 255, 0.08)',
              border: '1px solid rgba(0, 217, 255, 0.25)',
              padding: '2px 6px',
              borderRadius: '3px',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            VERIFIED
          </span>
        </div>
      </div>
    </aside>
  );
}
