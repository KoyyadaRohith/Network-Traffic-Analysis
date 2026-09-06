import React from 'react';
import {
  Database,
  Filter,
  ArrowRightLeft,
  Server,
  BarChart3,
  BrainCircuit,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';

export default function DWDMPipeline() {
  const steps = [
    {
      num: '01',
      title: 'CICIDS2017',
      desc: 'Network traffic source',
      icon: Database,
      accent: 'var(--color-cyan)',
      borderAccent: 'rgba(0, 217, 255, 0.25)',
      badgeBg: 'rgba(0, 217, 255, 0.08)',
    },
    {
      num: '02',
      title: 'Preprocessing',
      desc: 'Clean and transform data',
      icon: Filter,
      accent: '#22D3EE',
      borderAccent: 'rgba(34, 211, 238, 0.25)',
      badgeBg: 'rgba(34, 211, 238, 0.08)',
    },
    {
      num: '03',
      title: 'ETL',
      desc: 'Load processed records',
      icon: ArrowRightLeft,
      accent: '#A855F7',
      borderAccent: 'rgba(168, 85, 247, 0.25)',
      badgeBg: 'rgba(168, 85, 247, 0.08)',
    },
    {
      num: '04',
      title: 'Data Warehouse',
      desc: 'MySQL Star Schema',
      icon: Server,
      accent: '#A855F7',
      borderAccent: 'rgba(168, 85, 247, 0.25)',
      badgeBg: 'rgba(168, 85, 247, 0.08)',
    },
    {
      num: '05',
      title: 'OLAP Analysis',
      desc: 'Multidimensional analysis',
      icon: BarChart3,
      accent: '#F59E0B',
      borderAccent: 'rgba(245, 158, 11, 0.25)',
      badgeBg: 'rgba(245, 158, 11, 0.08)',
    },
    {
      num: '06',
      title: 'Data Mining',
      desc: 'Random Forest classification',
      icon: BrainCircuit,
      accent: 'var(--color-cyan)',
      borderAccent: 'rgba(0, 217, 255, 0.25)',
      badgeBg: 'rgba(0, 217, 255, 0.08)',
    },
    {
      num: '07',
      title: 'Report Analysis',
      desc: 'Analytical evaluation report',
      icon: FileSpreadsheet,
      accent: '#00C8E8',
      borderAccent: 'rgba(0, 200, 232, 0.25)',
      badgeBg: 'rgba(0, 200, 232, 0.08)',
    },
  ];

  return (
    <div className="pipeline-card">
      {/* Header */}
      <div style={{ marginBottom: '18px' }}>
        <h3 className="analytical-title">
          DWDM Analysis Pipeline
        </h3>
        <p className="analytical-subtitle">
          End-to-end analytical flow from raw traffic to decision support
        </p>
      </div>

      {/* Horizontal Stages Flow */}
      <div className="pipeline-flow-wrap">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.num}>
              <div
                className="pipeline-stage-item"
                style={{
                  borderLeft: `2px solid ${step.accent}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: '800',
                      fontFamily: 'JetBrains Mono, monospace',
                      color: step.accent,
                      background: step.badgeBg,
                      border: `1px solid ${step.borderAccent}`,
                      padding: '1px 5px',
                      borderRadius: '3px',
                    }}
                  >
                    {step.num}
                  </span>

                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      background: step.badgeBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: step.accent,
                    }}
                  >
                    <Icon size={13} />
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.3 }}>
                  {step.desc}
                </div>
              </div>

              {/* Connecting Arrow */}
              {idx < steps.length - 1 && (
                <div className="pipeline-arrow-separator">
                  <ArrowRight size={13} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
