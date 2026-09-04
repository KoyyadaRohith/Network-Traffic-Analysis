import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

const COLORS = {
  SUSPICIOUS: '#ef4444',
  NORMAL: '#10b981',
};

export default function TrafficClassificationChart({ data, summary, loading }) {
  if (loading || !data || data.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '24px', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px' }}>Traffic Classification</h3>
        <div className="skeleton" style={{ flex: 1, width: '100%', borderRadius: '12px' }} />
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.traffic_status,
    value: item.total_records,
    percentage: item.percentage,
    label: item.original_label,
  }));

  const total = summary ? Number(summary.total_records).toLocaleString() : '223,112';

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const isSuspicious = d.name === 'SUSPICIOUS';
      return (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.92)',
            border: `1px solid ${isSuspicious ? 'var(--color-red)' : 'var(--color-green)'}`,
            borderRadius: '8px',
            padding: '10px 14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ fontWeight: '700', color: isSuspicious ? 'var(--color-red)' : 'var(--color-green)', fontSize: '0.85rem' }}>
            {d.name} ({d.label})
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>
            {Number(d.value).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Share: <strong style={{ color: '#ffffff' }}>{d.percentage}%</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Traffic Classification
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Distribution between BENIGN and DDoS anomaly flows
          </p>
        </div>
        <span className="badge badge-info">Donut Analytics</span>
      </div>

      {/* Donut Chart with Centered KPI */}
      <div style={{ position: 'relative', width: '100%', height: '260px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name] || '#38bdf8'}
                  stroke="rgba(0, 0, 0, 0.4)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text inside Donut */}
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
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {total}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.05em' }}>
            Total Records
          </div>
        </div>
      </div>

      {/* Breakdown Legend Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
        {chartData.map((item) => {
          const isSuspicious = item.name === 'SUSPICIOUS';
          const Icon = isSuspicious ? ShieldAlert : ShieldCheck;
          return (
            <div
              key={item.name}
              style={{
                background: isSuspicious ? 'rgba(239, 68, 68, 0.06)' : 'rgba(16, 185, 129, 0.06)',
                border: `1px solid ${isSuspicious ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: isSuspicious ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSuspicious ? 'var(--color-red)' : 'var(--color-green)',
                }}
              >
                <Icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>
                  {Number(item.value).toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: '500', color: isSuspicious ? 'var(--color-red)' : 'var(--color-green)' }}>({item.percentage}%)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
