import React from 'react';
import { Database, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';

export default function KpiCard({ summary, loading }) {
  const total = summary ? Number(summary.total_records).toLocaleString() : '223,112';
  const normal = summary ? Number(summary.normal_records).toLocaleString() : '95,096';
  const suspicious = summary ? Number(summary.suspicious_records).toLocaleString() : '128,016';
  const normalPct = summary ? `${summary.normal_percentage}% of total` : '42.62% of total';
  const suspPct = summary ? `${summary.suspicious_percentage}% of total` : '57.38% of total';

  const cards = [
    {
      title: 'TOTAL RECORDS',
      value: total,
      supporting: 'Flow records in warehouse',
      icon: Database,
      accent: 'var(--color-cyan)',
      badgeBg: 'rgba(0, 217, 255, 0.08)',
      badgeBorder: 'rgba(0, 217, 255, 0.25)',
      sparklineColor: '#00D9FF',
      sparklinePoints: '0,22 15,19 30,21 45,14 60,16 75,10 90,13 105,7 120,9 135,4 150,6',
    },
    {
      title: 'NORMAL TRAFFIC',
      value: normal,
      supporting: normalPct,
      icon: CheckCircle2,
      accent: '#22C55E',
      badgeBg: 'rgba(34, 197, 94, 0.08)',
      badgeBorder: 'rgba(34, 197, 94, 0.25)',
      sparklineColor: '#22C55E',
      sparklinePoints: '0,20 15,17 30,19 45,15 60,18 75,12 90,14 105,10 120,11 135,8 150,9',
    },
    {
      title: 'SUSPICIOUS TRAFFIC',
      value: suspicious,
      supporting: suspPct,
      icon: AlertTriangle,
      accent: '#EF4444',
      badgeBg: 'rgba(239, 68, 68, 0.08)',
      badgeBorder: 'rgba(239, 68, 68, 0.25)',
      sparklineColor: '#EF4444',
      sparklinePoints: '0,18 15,22 30,16 45,20 60,14 75,17 90,11 105,15 120,8 135,12 150,5',
    },
    {
      title: 'MODEL FEATURES',
      value: '62',
      supporting: '62 network flow features',
      icon: Cpu,
      accent: '#A855F7',
      badgeBg: 'rgba(168, 85, 247, 0.08)',
      badgeBorder: 'rgba(168, 85, 247, 0.25)',
      sparklineColor: '#A855F7',
      sparklinePoints: '0,14 15,14 30,14 45,14 60,14 75,14 90,14 105,14 120,14 135,14 150,14',
    },
  ];

  return (
    <div className="grid-kpi">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const gradId = `sparkGrad-${idx}`;

        return (
          <div
            key={card.title}
            className="kpi-card"
          >
            {/* Top Row: Label & Small Icon */}
            <div className="kpi-top-row">
              <span className="kpi-label">
                {card.title}
              </span>
              <div
                className="kpi-icon-wrap"
                style={{
                  background: card.badgeBg,
                  borderColor: card.badgeBorder,
                  color: card.accent,
                }}
              >
                <Icon size={15} />
              </div>
            </div>

            {/* Metric Value */}
            <div className="kpi-metric-wrap">
              {loading ? (
                <div className="skeleton" style={{ height: '34px', width: '65%', borderRadius: '4px' }} />
              ) : (
                <div className="kpi-value">
                  {card.value}
                </div>
              )}
            </div>

            {/* Supporting Text */}
            <div className="kpi-supporting">
              {card.supporting}
            </div>

            {/* Integrated Small Bottom Sparkline */}
            <div className="kpi-sparkline-wrap">
              <svg
                viewBox="0 0 150 26"
                preserveAspectRatio="none"
                className="kpi-sparkline-svg"
              >
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={card.sparklineColor} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={card.sparklineColor} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area Fill */}
                <polygon
                  points={`0,26 ${card.sparklinePoints} 150,26`}
                  fill={`url(#${gradId})`}
                />

                {/* Trend Stroke Line */}
                <polyline
                  points={card.sparklinePoints}
                  fill="none"
                  stroke={card.sparklineColor}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
