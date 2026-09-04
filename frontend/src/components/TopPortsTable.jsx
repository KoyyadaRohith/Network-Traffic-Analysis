import React from 'react';
import { Network, ArrowUpRight } from 'lucide-react';

const COMMON_PORTS = {
  80: 'HTTP',
  443: 'HTTPS',
  53: 'DNS',
  8080: 'HTTP-Alt',
  22: 'SSH',
  123: 'NTP',
  389: 'LDAP',
  88: 'Kerberos',
  21: 'FTP',
};

export default function TopPortsTable({ portsData, totalRecords, loading }) {
  if (loading || !portsData || portsData.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px' }}>Top 10 Destination Ports</h3>
        <div className="skeleton" style={{ height: '240px', width: '100%', borderRadius: '8px' }} />
      </div>
    );
  }

  const total = totalRecords || 223112;

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-blue)',
            }}
          >
            <Network size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Top 10 Destination Ports
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Identified destination ports ranked by total flow volume
            </p>
          </div>
        </div>
        <span className="badge badge-info">dim_network</span>
      </div>

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '540px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '10px 12px' }}>#</th>
              <th style={{ padding: '10px 12px' }}>Port</th>
              <th style={{ padding: '10px 12px' }}>Service</th>
              <th style={{ padding: '10px 12px' }}>Traffic Status</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Records</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Share</th>
            </tr>
          </thead>
          <tbody>
            {portsData.map((port, idx) => {
              const isSuspicious = port.traffic_status === 'SUSPICIOUS';
              const share = ((port.total_records / total) * 100).toFixed(2);
              const serviceName = COMMON_PORTS[port.destination_port] || 'Standard';

              return (
                <tr
                  key={`${port.destination_port}-${port.traffic_status}-${idx}`}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '12px', fontWeight: '700', color: '#ffffff', fontSize: '0.9rem', fontFamily: 'JetBrains Mono, monospace' }}>
                    Port {port.destination_port}
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {serviceName}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${isSuspicious ? 'badge-suspicious' : 'badge-normal'}`}>
                      {port.traffic_status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    {Number(port.total_records).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '600', color: isSuspicious ? 'var(--color-red)' : 'var(--color-blue)' }}>
                      {share}%
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
