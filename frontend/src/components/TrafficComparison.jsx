import React from 'react';
import { GitCompare, TrendingUp, TrendingDown } from 'lucide-react';

export default function TrafficComparison({ comparisonData, loading }) {
  if (loading || !comparisonData || comparisonData.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px' }}>Traffic Comparison Table</h3>
        <div className="skeleton" style={{ height: '200px', width: '100%', borderRadius: '8px' }} />
      </div>
    );
  }

  const normal = comparisonData.find((c) => c.traffic_status === 'NORMAL') || {};
  const susp = comparisonData.find((c) => c.traffic_status === 'SUSPICIOUS') || {};

  const rows = [
    {
      name: 'Flow Duration (μs)',
      normal: normal.average_flow_duration || 0,
      suspicious: susp.average_flow_duration || 0,
    },
    {
      name: 'Forward Packets (pkts)',
      normal: normal.average_fwd_packets || 0,
      suspicious: susp.average_fwd_packets || 0,
    },
    {
      name: 'Backward Packets (pkts)',
      normal: normal.average_backward_packets || 0,
      suspicious: susp.average_backward_packets || 0,
    },
    {
      name: 'Packet Length (bytes)',
      normal: normal.average_packet_length || 0,
      suspicious: susp.average_packet_length || 0,
    },
    {
      name: 'Flow Bytes / sec (B/s)',
      normal: normal.average_flow_bytes_per_sec || 0,
      suspicious: susp.average_flow_bytes_per_sec || 0,
    },
    {
      name: 'Flow Packets / sec (pkt/s)',
      normal: normal.average_flow_packets_per_sec || 0,
      suspicious: susp.average_flow_packets_per_sec || 0,
    },
  ];

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(168, 85, 247, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-purple)',
            }}
          >
            <GitCompare size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Traffic Comparison Table
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Side-by-side metric comparison for anomaly identification
            </p>
          </div>
        </div>
        <span className="badge badge-purple">Normal vs Suspicious</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '480px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '10px 12px' }}>Feature</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Normal (Avg)</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Suspicious (Avg)</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>DDoS Impact</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const higherInSusp = row.suspicious > row.normal;
              const ratio = row.normal > 0 ? (row.suspicious / row.normal).toFixed(1) : 'N/A';

              return (
                <tr
                  key={row.name}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {row.name}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: 'var(--color-green)', fontSize: '0.88rem' }}>
                    {Number(row.normal).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: 'var(--color-red)', fontSize: '0.88rem' }}>
                    {Number(row.suspicious).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: higherInSusp ? 'var(--color-red)' : 'var(--color-green)',
                      }}
                    >
                      {higherInSusp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {ratio}x
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
