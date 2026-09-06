import React from 'react';
import { Database, Server, Calendar, Sliders, Cpu, Layers } from 'lucide-react';

export default function SystemInformationCard() {
  const specs = [
    { label: 'Dataset', value: 'CICIDS2017', icon: Layers },
    { label: 'Database', value: 'network_traffic_dw', icon: Database },
    { label: 'Database Engine', value: 'MySQL 8.0', icon: Server },
    { label: 'Features', value: '62', icon: Sliders },
    { label: 'Modules', value: '5', icon: Cpu },
    { label: 'Capture Date', value: 'Jul 07, 2017', icon: Calendar },
  ];

  return (
    <div className="analytical-card system-info-card">
      <div>
        <h3 className="analytical-title">
          System Information
        </h3>
        <p className="analytical-subtitle">
          Project and dataset details
        </p>

        {/* Technical Specs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '14px' }}>
          {specs.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  backgroundColor: '#051119',
                  border: '1px solid #102430',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={13} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {item.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: '600',
                    color: item.label === 'Database' ? 'var(--color-cyan)' : '#F5F7FA',
                  }}
                >
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Quote Card */}
      <div
        style={{
          marginTop: '14px',
          padding: '12px 14px',
          background: 'linear-gradient(180deg, #05131C 0%, #030B10 100%)',
          border: '1px solid rgba(0, 217, 255, 0.2)',
          borderRadius: 'var(--radius-sm)',
          position: 'relative',
        }}
      >
        <p
          style={{
            fontSize: '0.74rem',
            fontStyle: 'italic',
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          "From raw network traffic to structured analytical insights."
        </p>
        <div
          style={{
            fontSize: '0.62rem',
            fontWeight: '700',
            letterSpacing: '0.08em',
            color: 'var(--color-cyan)',
            textTransform: 'uppercase',
            marginTop: '6px',
          }}
        >
          DATA WAREHOUSING • OLAP • DATA MINING
        </div>
      </div>
    </div>
  );
}
