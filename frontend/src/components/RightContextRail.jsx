import React from 'react';
import {
  Activity,
  Layers,
  Cpu,
  FileSpreadsheet,
  GraduationCap,
  Network,
  Radio,
  Share2,
} from 'lucide-react';

export default function RightContextRail() {
  const capabilities = [
    {
      title: 'Comprehensive Analytics',
      desc: 'Multidimensional warehouse metrics',
      icon: Activity,
    },
    {
      title: 'Multidimensional Analysis',
      desc: 'OLAP roll-up, drill-down & slice',
      icon: Layers,
    },
    {
      title: 'Machine Learning Classification',
      desc: 'Random Forest on 62 flow attributes',
      icon: Cpu,
    },
    {
      title: 'Report Analysis',
      desc: 'Structured analytical summaries',
      icon: FileSpreadsheet,
    },
    {
      title: 'Built for B.Tech Projects',
      desc: 'Academic DWDM curriculum standard',
      icon: GraduationCap,
    },
  ];

  return (
    <aside className="right-context-rail">
      {/* Brand Header */}
      <div className="right-rail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div className="right-rail-dot" />
          <span style={{ fontSize: '0.66rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-cyan)', textTransform: 'uppercase' }}>
            SYSTEM CONTEXT
          </span>
        </div>

        <h2 className="right-rail-title">
          CYBERFLOW<br />INTELLIGENCE
        </h2>
        <div className="right-rail-subtitle">
          Network Traffic Analytics
        </div>
        <p className="right-rail-caption">
          Using Data Warehousing and Data Mining
        </p>

        {/* Subtle Cyan Divider */}
        <div className="right-rail-divider" />
      </div>

      {/* Capabilities List */}
      <div className="right-rail-capabilities">
        <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
          CORE CAPABILITIES
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div key={cap.title} className="capability-card">
                <div className="capability-icon-wrap">
                  <Icon size={14} color="var(--color-cyan)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="capability-title">
                    {cap.title}
                  </div>
                  <div className="capability-desc">
                    {cap.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Abstract Network/Globe Visual (Decorative) */}
      <div className="network-globe-container">
        <div className="globe-overlay" />
        <svg
          viewBox="0 0 200 180"
          className="network-globe-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Radial Gradient for Glow */}
            <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.16" />
              <stop offset="70%" stopColor="#004A6B" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#00070E" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#004A6B" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Background Ambient Glow */}
          <circle cx="100" cy="90" r="72" fill="url(#globeGlow)" />

          {/* Concentric / Spherical Latitudinal Ellipses */}
          <ellipse cx="100" cy="90" rx="66" ry="66" fill="none" stroke="#103040" strokeWidth="1" strokeDasharray="3 3" />
          <ellipse cx="100" cy="90" rx="66" ry="24" fill="none" stroke="url(#orbitGrad)" strokeWidth="1" />
          <ellipse cx="100" cy="90" rx="66" ry="46" fill="none" stroke="#16384C" strokeWidth="0.8" />
          <ellipse cx="100" cy="90" rx="26" ry="66" fill="none" stroke="#16384C" strokeWidth="0.8" />

          {/* Angled Orbital Ring */}
          <ellipse
            cx="100"
            cy="90"
            rx="74"
            ry="28"
            fill="none"
            stroke="var(--color-cyan)"
            strokeWidth="0.9"
            strokeOpacity="0.5"
            transform="rotate(-25 100 90)"
          />

          {/* Network Interconnect Lines */}
          <line x1="70" y1="65" x2="100" y2="90" stroke="#00D9FF" strokeWidth="0.8" strokeOpacity="0.5" />
          <line x1="100" y1="90" x2="135" y2="78" stroke="#00D9FF" strokeWidth="0.8" strokeOpacity="0.5" />
          <line x1="100" y1="90" x2="88" y2="125" stroke="#00D9FF" strokeWidth="0.8" strokeOpacity="0.5" />
          <line x1="135" y1="78" x2="145" y2="108" stroke="#00D9FF" strokeWidth="0.7" strokeOpacity="0.4" />
          <line x1="70" y1="65" x2="52" y2="95" stroke="#00D9FF" strokeWidth="0.7" strokeOpacity="0.4" />
          <line x1="88" y1="125" x2="128" y2="128" stroke="#00D9FF" strokeWidth="0.7" strokeOpacity="0.4" />

          {/* Cyan Network Nodes */}
          <circle cx="100" cy="90" r="3.5" fill="#00D9FF" />
          <circle cx="100" cy="90" r="6" fill="none" stroke="#00D9FF" strokeWidth="0.6" strokeOpacity="0.6" />

          <circle cx="70" cy="65" r="2.5" fill="#00C8E8" />
          <circle cx="135" cy="78" r="2.5" fill="#00C8E8" />
          <circle cx="88" cy="125" r="2.5" fill="#00C8E8" />
          <circle cx="145" cy="108" r="2" fill="#38BDF8" opacity="0.8" />
          <circle cx="52" cy="95" r="2" fill="#38BDF8" opacity="0.8" />
          <circle cx="128" cy="128" r="2" fill="#38BDF8" opacity="0.8" />
          <circle cx="60" cy="115" r="1.5" fill="#00D9FF" opacity="0.6" />
          <circle cx="130" cy="55" r="1.5" fill="#00D9FF" opacity="0.6" />

          {/* Coordinate Marks */}
          <text x="32" y="38" fill="#486577" fontSize="6" fontFamily="JetBrains Mono, monospace">
            LAT 38.89° N
          </text>
          <text x="120" y="152" fill="#486577" fontSize="6" fontFamily="JetBrains Mono, monospace">
            CICIDS2017 • FLOWS
          </text>
        </svg>

        <div className="globe-caption">
          <Share2 size={11} color="var(--color-cyan)" />
          <span>Topological Flow Coordinates</span>
        </div>
      </div>

      {/* Right Rail Footer */}
      <div className="right-rail-footer">
        <div className="right-rail-divider" style={{ marginBottom: '12px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
              CICIDS2017
            </div>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
              NETWORK TRAFFIC DATASET
            </div>
          </div>
          <span className="badge badge-cyan" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
            VERIFIED
          </span>
        </div>
      </div>
    </aside>
  );
}
