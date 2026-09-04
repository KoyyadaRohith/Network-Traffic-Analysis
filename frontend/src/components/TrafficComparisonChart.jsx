import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function TrafficComparisonChart({ comparisonData, loading }) {
  if (loading || !comparisonData || comparisonData.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '24px', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px' }}>Normal vs Suspicious Traffic Features</h3>
        <div className="skeleton" style={{ flex: 1, width: '100%', borderRadius: '12px' }} />
      </div>
    );
  }

  // Find normal and suspicious records from comparison API
  const normalRow = comparisonData.find((r) => r.traffic_status === 'NORMAL') || {};
  const suspRow = comparisonData.find((r) => r.traffic_status === 'SUSPICIOUS') || {};

  // Form comparison chart features normalized or directly comparable
  const chartData = [
    {
      feature: 'Packet Length (Avg)',
      Normal: normalRow.average_packet_length || 0,
      Suspicious: suspRow.average_packet_length || 0,
      unit: 'bytes',
    },
    {
      feature: 'Fwd Packets (Avg)',
      Normal: normalRow.average_fwd_packets || 0,
      Suspicious: suspRow.average_fwd_packets || 0,
      unit: 'pkts',
    },
    {
      feature: 'Bwd Packets (Avg)',
      Normal: normalRow.average_backward_packets || 0,
      Suspicious: suspRow.average_backward_packets || 0,
      unit: 'pkts',
    },
    {
      feature: 'Flow Rate (pkts/s)',
      Normal: Math.round((normalRow.average_flow_packets_per_sec || 0) / 100), // Scaled for legible visual comparison
      Suspicious: Math.round((suspRow.average_flow_packets_per_sec || 0) / 100),
      unit: 'x100 pkts/s',
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = chartData.find((c) => c.feature === label);
      return (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ fontWeight: '700', color: '#ffffff', marginBottom: '6px', fontSize: '0.85rem' }}>
            {label}
          </div>
          {payload.map((entry) => (
            <div key={entry.name} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '0.8rem', color: entry.color, margin: '3px 0' }}>
              <span>{entry.name}:</span>
              <strong>
                {Number(entry.value).toLocaleString()} {item?.unit}
              </strong>
            </div>
          ))}
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
            Feature Comparison: Normal vs Suspicious
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Comparing critical flow metrics across traffic classes
          </p>
        </div>
        <span className="badge badge-purple">Feature Metrics</span>
      </div>

      <div style={{ width: '100%', height: '280px', marginTop: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis
              dataKey="feature"
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '0.8rem' }}
            />
            <Bar
              dataKey="Normal"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={45}
            />
            <Bar
              dataKey="Suspicious"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Normal Flows: 95,096 flows</span>
        <span>Suspicious Flows: 128,016 flows</span>
      </div>
    </div>
  );
}
