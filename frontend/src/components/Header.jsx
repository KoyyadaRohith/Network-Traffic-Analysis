import React from 'react';
import {
  Menu,
  ChevronRight,
  Sliders,
  Database,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function Header({
  onToggleSidebar,
  onToggleRightRail,
  isRightRailOpen = false,
  activeTab = 'Dashboard',
}) {
  return (
    <header className="top-header">
      {/* Left: Mobile Toggle & Prominent Academic Application Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleSidebar}
          className="mobile-menu-btn"
          aria-label="Open sidebar navigation"
        >
          <Menu size={18} />
        </button>

        <div className="header-identity-block" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              className="header-identity-title"
              style={{
                fontSize: '0.98rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                color: 'var(--color-heading)',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              NETWORK TRAFFIC ANALYSIS
            </span>
            <span
              style={{
                fontSize: '0.64rem',
                fontWeight: 700,
                color: 'var(--color-cyan)',
                background: 'var(--color-cyan-subtle)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                padding: '1px 6px',
                borderRadius: '3px',
                letterSpacing: '0.03em',
              }}
            >
              DWDM
            </span>
          </div>

          <div className="header-identity-sub" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--color-cyan)' }}>
              Data Warehousing & Data Mining
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              CICIDS2017 • MySQL • Random Forest
            </span>
          </div>
        </div>
      </div>

      {/* Right Tools: Current Location Breadcrumb & Context Rail Toggle */}
      <div className="header-right-tools" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Active Page Breadcrumb Pill */}
        <div
          className="header-breadcrumb-pill"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-subtle)',
            padding: '5px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.74rem',
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>App</span>
          <ChevronRight size={12} color="var(--text-muted)" />
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            {activeTab}
          </span>
        </div>

        {/* Dataset Reference Pill */}
        <div className="header-context-pill">
          <Calendar size={13} color="var(--color-cyan)" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Jul 07, 2017
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
              CICIDS2017 Benchmark
            </span>
          </div>
        </div>

        {/* Toggle Context Rail Button */}
        {onToggleRightRail && (
          <button
            onClick={onToggleRightRail}
            className="btn btn-secondary"
            aria-label="Toggle DWDM specifications context rail"
            title="Toggle DWDM Project Specifications Panel"
            style={{
              padding: '6px 10px',
              fontSize: '0.76rem',
              gap: '6px',
              border: isRightRailOpen ? '1px solid var(--color-cyan)' : '1px solid var(--border-subtle)',
              background: isRightRailOpen ? 'var(--color-cyan-subtle)' : 'var(--surface-card)',
              color: isRightRailOpen ? 'var(--color-cyan)' : 'var(--text-secondary)',
            }}
          >
            <Sliders size={13} />
            <span className="hide-mobile">DWDM Specs</span>
          </button>
        )}
      </div>
    </header>
  );
}
