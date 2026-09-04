import React from 'react';
import { Timer, Send, CornerDownLeft, Maximize2, Zap, Gauge } from 'lucide-react';

export default function TrafficStatistics({ stats, loading }) {
  if (loading || !stats) {
    return (
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px' }}>Key Traffic Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '110px', borderRadius: '12px' }} />
          ))}
        </div>
      </div>
    );
  }

  const statItems = [
    {
      title: 'Flow Duration',
      icon: Timer,
      unit: 'μs',
      data: stats.flow_duration,
      format: (v) => Number(v).toLocaleString(),
    },
    {
      title: 'Total Fwd Packets',
      icon: Send,
      unit: 'pkts',
      data: stats.total_fwd_packets,
      format: (v) => Number(v).toLocaleString(),
    },
    {
      title: 'Total Backward Packets',
      icon: CornerDownLeft,
      unit: 'pkts',
      data: stats.total_backward_packets,
      format: (v) => Number(v).toLocaleString(),
    },
    {
      title: 'Packet Length Mean',
      icon: Maximize2,
      unit: 'bytes',
      data: stats.packet_length_mean,
      format: (v) => Number(v).toLocaleString(),
    },
    {
      title: 'Flow Bytes / sec',
      icon: Zap,
      unit: 'B/s',
      data: stats.flow_bytes_per_sec,
      format: (v) => Number(v).toLocaleString(),
    },
    {
      title: 'Flow Packets / sec',
      icon: Gauge,
      unit: 'pkt/s',
      data: stats.flow_packets_per_sec,
      format: (v) => Number(v).toLocaleString(),
    },
  ];

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Key Traffic Statistics
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            SQL server-side aggregations (MIN, MAX, AVG) across all 223,112 records
          </p>
        </div>
        <span className="badge badge-info">fact_network_traffic</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {statItems.map((item) => {
          const Icon = item.icon;
          const avg = item.data ? item.format(item.data.average) : '0';
          const min = item.data ? item.format(item.data.minimum) : '0';
          const max = item.data ? item.format(item.data.maximum) : '0';

          return (
            <div
              key={item.title}
              style={{
                background: 'rgba(15, 23, 42, 0.55)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {item.title}
                </span>
                <Icon size={16} color="var(--color-blue)" />
              </div>

              <div style={{ margin: '6px 0' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
                  {avg} <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)' }}>{item.unit}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-blue)', fontWeight: '600', textTransform: 'uppercase' }}>
                  Average Value
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Min: <strong style={{ color: 'var(--text-secondary)' }}>{min}</strong></span>
                <span>Max: <strong style={{ color: 'var(--text-secondary)' }}>{max}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
