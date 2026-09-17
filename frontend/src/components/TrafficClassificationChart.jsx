import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function TrafficClassificationChart({ summary, loading }) {
  if (loading) {
    return (
      <div className="analytical-card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
        <div className="skeleton" style={{ height: '20px', width: '50%', marginBottom: '6px' }} />
        <div className="skeleton" style={{ height: '14px', width: '70%', marginBottom: '20px' }} />
        <div className="skeleton" style={{ flex: 1, width: '100%', borderRadius: '50%' }} />
      </div>
    );
  }

  const normalCount = summary?.normal_records ?? 95096;
  const suspCount = summary?.suspicious_records ?? 128016;
  const normalPct = summary?.normal_percentage ?? 42.62;
  const suspPct = summary?.suspicious_percentage ?? 57.38;
  const totalRecords = summary?.total_records ?? 223112;

  const chartData = [
    {
      name: 'NORMAL',
      value: Number(normalCount),
      percentage: normalPct,
      color: '#22C55E',
    },
    {
      name: 'SUSPICIOUS',
      value: Number(suspCount),
      percentage: suspPct,
      color: '#EF4444',
    },
  ];

  return (
    <div className="analytical-card traffic-comp-card">
      <div>
        <h3 className="analytical-title">
          Traffic Composition
        </h3>
        <p className="analytical-subtitle">
          Overall distribution of network traffic
        </p>
      </div>

      {/* Donut Chart with Center Absolute Text */}
      <div style={{ position: 'relative', width: '100%', height: '200px', margin: '4px 0' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div
                      style={{
                        backgroundColor: 'var(--surface-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '0.78rem',
                        boxShadow: 'var(--shadow-elevated)',
                      }}
                    >
                      <div style={{ fontWeight: '700', color: d.color }}>
                        {d.name}
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                        {d.value.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {d.percentage}% of dataset
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={78}
              paddingAngle={4}
              dataKey="value"
              stroke="var(--surface-card)"
              strokeWidth={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Metric Label */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F5F7FA', lineHeight: 1.1 }}>
            {Number(totalRecords).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '2px' }}>
            Total Records
          </div>
        </div>
      </div>

      {/* Bottom Segment Legend Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
        <div
          style={{
            background: 'rgba(34, 197, 94, 0.05)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#22C55E' }}>NORMAL</span>
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#F5F7FA', marginTop: '3px' }}>
            {Number(normalCount).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.66rem', color: '#86EFAC' }}>
            {normalPct}%
          </div>
        </div>

        <div
          style={{
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#EF4444' }}>SUSPICIOUS</span>
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#F5F7FA', marginTop: '3px' }}>
            {Number(suspCount).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.66rem', color: '#FCA5A5' }}>
            {suspPct}%
          </div>
        </div>
      </div>
    </div>
  );
}
