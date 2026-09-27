import React from 'react';
import {
  Database,
  Layers,
  Cpu,
  Table2,
  Sliders,
  GraduationCap,
  BarChart3,
  X,
} from 'lucide-react';

export default function RightContextRail({ isOpen = false, onClose }) {
  const metadataItems = [
    {
      label: 'Dataset',
      value: 'CICIDS2017',
      sub: 'Network Traffic Subset',
      icon: Database,
      accent: 'var(--color-cyan)',
      bg: 'rgba(6, 182, 212, 0.1)',
    },
    {
      label: 'Warehouse',
      value: 'MySQL',
      sub: 'Relational Database',
      icon: Database,
      accent: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.1)',
    },
    {
      label: 'Schema',
      value: 'Star Schema',
      sub: '1 Fact • 3 Dimensions',
      icon: Table2,
      accent: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.1)',
    },
    {
      label: 'OLAP',
      value: 'Slice • Dice • Roll-Up • Drill-Down',
      sub: 'Multidimensional Analysis',
      icon: BarChart3,
      accent: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    {
      label: 'Data Mining',
      value: 'Random Forest',
      sub: '100 Trees • Supervised',
      icon: Cpu,
      accent: 'var(--color-cyan)',
      bg: 'rgba(6, 182, 212, 0.1)',
    },
    {
      label: 'Features',
      value: '62',
      sub: 'Extracted Flow Attributes',
      icon: Sliders,
      accent: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.1)',
    },
  ];

  return (
    <>
      {/* Backdrop when open */}
      {isOpen && (
        <div
          onClick={onClose}
          className="right-rail-backdrop"
          aria-hidden="true"
        />
      )}

      <aside className={`right-context-rail ${isOpen ? 'open' : ''}`}>
        <div>
          {/* Rail Brand & Context Header */}
          <div className="right-rail-header" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="right-rail-dot" />
                <span style={{ fontSize: '0.66rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-cyan)', textTransform: 'uppercase' }}>
                  PROJECT SPECIFICATIONS
                </span>
              </div>

              {onClose && (
                <button
                  onClick={onClose}
                  aria-label="Close specifications panel"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <h2 className="right-rail-title" style={{ fontSize: '0.92rem', lineHeight: '1.2', marginTop: '8px' }}>
              NETWORK TRAFFIC<br />ANALYSIS
            </h2>
            <div className="right-rail-subtitle">
              Data Warehousing & Data Mining
            </div>
            <p className="right-rail-caption">
              CICIDS2017 • MySQL • Random Forest
            </p>

            {/* Clean Divider */}
            <div className="right-rail-divider" style={{ margin: '12px 0' }} />
          </div>

          {/* Compact Academic Project Metadata Panel */}
          <div className="right-rail-metadata-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.64rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>
              DWDM ARCHITECTURE
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
              background: 'rgba(168, 85, 247, 0.06)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <GraduationCap size={14} color="#a855f7" />
              <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Academic DWDM Project
              </span>
            </div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
              Data Warehousing and Data Mining analytical platform evaluated on CICIDS2017.
            </p>
          </div>
        </div>

        {/* Right Rail Footer */}
        <div className="right-rail-footer" style={{ marginTop: 'auto', paddingTop: '14px' }}>
          <div className="right-rail-divider" style={{ marginBottom: '10px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '0.03em' }}>
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
                background: 'var(--color-cyan-subtle)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
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
    </>
  );
}
