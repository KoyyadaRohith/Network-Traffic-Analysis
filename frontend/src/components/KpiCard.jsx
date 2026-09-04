import React from 'react';
import { Activity, ShieldCheck, AlertTriangle, Cpu } from 'lucide-react';

export default function KpiCard({ summary, loading }) {
  const cards = [
    {
      title: 'Total Network Traffic',
      value: summary ? Number(summary.total_records).toLocaleString() : '---',
      subtext: 'Flow Records In Warehouse',
      badge: 'Fact Table',
      badgeType: 'info',
      icon: Activity,
      color: 'var(--color-blue)',
      glow: 'var(--shadow-glow-blue)',
    },
    {
      title: 'Normal Traffic',
      value: summary ? Number(summary.normal_records).toLocaleString() : '---',
      subtext: summary ? `${summary.normal_percentage}% of total flows` : '---',
      badge: 'BENIGN',
      badgeType: 'normal',
      icon: ShieldCheck,
      color: 'var(--color-green)',
      glow: 'rgba(16, 185, 129, 0.2)',
    },
    {
      title: 'Suspicious Traffic',
      value: summary ? Number(summary.suspicious_records).toLocaleString() : '---',
      subtext: summary ? `${summary.suspicious_percentage}% DDoS anomalies` : '---',
      badge: 'DDoS ALERT',
      badgeType: 'suspicious',
      icon: AlertTriangle,
      color: 'var(--color-red)',
      glow: 'rgba(239, 68, 68, 0.2)',
    },
    {
      title: 'Detection Model',
      value: 'Random Forest',
      subtext: '62 Numerical Traffic Features',
      badge: 'READY',
      badgeType: 'purple',
      icon: Cpu,
      color: 'var(--color-purple)',
      glow: 'var(--shadow-glow-purple)',
    },
  ];

  return (
    <div className="grid-kpi">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="glass-card"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top Row: Title + Icon Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {card.title}
                </span>
              </div>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: `rgba(255, 255, 255, 0.04)`,
                  border: `1px solid ${card.color}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                  boxShadow: card.glow,
                }}
              >
                <Icon size={20} />
              </div>
            </div>

            {/* Middle: Big Value */}
            <div style={{ marginBottom: '12px' }}>
              {loading ? (
                <div className="skeleton" style={{ height: '38px', width: '70%', marginBottom: '8px' }} />
              ) : (
                <div
                  style={{
                    fontSize: '1.95rem',
                    fontWeight: '800',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                >
                  {card.value}
                </div>
              )}
            </div>

            {/* Bottom: Subtitle + Tag */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {card.subtext}
              </span>
              <span className={`badge badge-${card.badgeType}`}>
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
