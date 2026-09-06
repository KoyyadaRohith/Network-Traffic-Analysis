import React from 'react';
import { Database, CheckCircle2, AlertTriangle, Sliders, Tag, Calendar } from 'lucide-react';

export default function DatasetOverviewCard({ summary }) {
  const total = summary ? Number(summary.total_records).toLocaleString() : '223,112';
  const normal = summary ? Number(summary.normal_records).toLocaleString() : '95,096';
  const suspicious = summary ? Number(summary.suspicious_records).toLocaleString() : '128,016';

  const tiles = [
    { label: 'Total Records', value: total, icon: Database, color: 'var(--color-cyan)' },
    { label: 'Normal Records', value: normal, icon: CheckCircle2, color: '#22C55E' },
    { label: 'Suspicious Records', value: suspicious, icon: AlertTriangle, color: '#EF4444' },
    { label: 'Features', value: '62', icon: Sliders, color: '#A855F7' },
    { label: 'Classes', value: '2', icon: Tag, color: '#00C8E8' },
    { label: 'Capture Date', value: 'Jul 07, 2017', icon: Calendar, color: '#F59E0B' },
  ];

  return (
    <div className="analytical-card bottom-grid-card">
      <div style={{ marginBottom: '14px' }}>
        <h3 className="analytical-title">
          Dataset Overview
        </h3>
        <p className="analytical-subtitle">
          CICIDS2017 Network Traffic Dataset
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
        }}
      >
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.label}
              style={{
                background: '#051119',
                border: '1px solid #102430',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {tile.label}
                </span>
                <Icon size={12} color={tile.color} />
              </div>
              <div
                style={{
                  fontSize: tile.value.length > 8 ? '0.95rem' : '1.05rem',
                  fontWeight: '800',
                  color: '#F5F7FA',
                  marginTop: '4px',
                  fontFamily: tile.label.includes('Records') || tile.label === 'Features' || tile.label === 'Classes' ? 'JetBrains Mono, monospace' : 'inherit',
                }}
              >
                {tile.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
