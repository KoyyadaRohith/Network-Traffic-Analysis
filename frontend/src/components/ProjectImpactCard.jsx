import React from 'react';
import { Database, BarChart3, BrainCircuit, FileSpreadsheet } from 'lucide-react';

export default function ProjectImpactCard() {
  const impacts = [
    {
      title: 'Data Warehousing',
      desc: 'Star Schema and relational storage',
      icon: Database,
      accent: '#A855F7',
      badgeBg: 'rgba(168, 85, 247, 0.08)',
    },
    {
      title: 'OLAP Analysis',
      desc: 'Slice, Dice, Roll-Up and Drill-Down',
      icon: BarChart3,
      accent: '#F59E0B',
      badgeBg: 'rgba(245, 158, 11, 0.08)',
    },
    {
      title: 'Data Mining',
      desc: 'Random Forest classification',
      icon: BrainCircuit,
      accent: 'var(--color-cyan)',
      badgeBg: 'rgba(0, 217, 255, 0.08)',
    },
    {
      title: 'Analytical Reporting',
      desc: 'Summary of warehouse and model results',
      icon: FileSpreadsheet,
      accent: '#00C8E8',
      badgeBg: 'rgba(0, 200, 232, 0.08)',
    },
  ];

  return (
    <div className="analytical-card bottom-grid-card">
      <div style={{ marginBottom: '14px' }}>
        <h3 className="analytical-title">
          DWDM Components
        </h3>
        <p className="analytical-subtitle">
          Core academic project modules
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {impacts.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '9px 12px',
                transition: 'border-color 0.16s ease, transform 0.16s ease',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '5px',
                  background: item.badgeBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.accent,
                  flexShrink: 0,
                }}
              >
                <Icon size={14} />
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {item.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
