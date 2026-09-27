import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';
import { ChevronRight } from 'lucide-react';

const COMMON_PORTS = {
  80: 'HTTP',
  53: 'DNS',
  443: 'HTTPS',
  8080: 'HTTP-Alt',
  123: 'NTP',
  22: 'SSH',
  389: 'LDAP',
  88: 'Kerberos',
  21: 'FTP',
  137: 'NetBIOS',
  465: 'SMTPS',
};

export default function TopPortsChart({ portsData, loading, onViewDetails, onSelectPort }) {
  if (loading) {
    return (
      <div className="analytical-card bottom-grid-card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
        <div className="skeleton" style={{ height: '20px', width: '45%', marginBottom: '6px' }} />
        <div className="skeleton" style={{ height: '14px', width: '65%', marginBottom: '20px' }} />
        <div className="skeleton" style={{ flex: 1, width: '100%' }} />
      </div>
    );
  }

  // Aggregate real API data by destination port
  const portMap = {};
  if (Array.isArray(portsData) && portsData.length > 0) {
    portsData.forEach((item) => {
      const p = item.destination_port;
      const count = Number(item.total_records) || 0;
      if (!portMap[p]) {
        portMap[p] = { port: p, total: 0 };
      }
      portMap[p].total += count;
    });
  }

  const chartData = Object.values(portMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((item) => {
      const service = COMMON_PORTS[item.port] || 'Port';
      return {
        port: item.port,
        displayName: `${item.port} (${service})`,
        service,
        total: item.total,
      };
    });

  const formatCount = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val;
  };

  return (
    <div className="analytical-card bottom-grid-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <h3 className="analytical-title">
            Top Destination Ports
          </h3>
          <p className="analytical-subtitle">
            Most frequent destination ports in network traffic
          </p>
        </div>

        {onViewDetails ? (
          <button
            onClick={onViewDetails}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.68rem',
              color: 'var(--color-cyan)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              marginTop: '2px',
              padding: 0,
            }}
          >
            View Details <ChevronRight size={12} />
          </button>
        ) : (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.68rem',
              color: 'var(--color-cyan)',
              cursor: 'pointer',
              fontWeight: '600',
              marginTop: '2px',
            }}
          >
            View Details <ChevronRight size={12} />
          </span>
        )}
      </div>

      {chartData.length === 0 ? (
        <div style={{ height: '230px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
          No destination ports match the current filter selection.
        </div>
      ) : (
        <div style={{ width: '100%', height: '230px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 2, right: 16, left: 18, bottom: 2 }}
            >
              <XAxis
                type="number"
                stroke="var(--border-subtle)"
                tickFormatter={formatCount}
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="displayName"
                width={90}
                stroke="var(--border-subtle)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                tickLine={false}
              />
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
                        <div style={{ fontWeight: '700', color: '#F59E0B' }}>
                          Port {d.port} ({d.service})
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                          {d.total.toLocaleString()} records
                        </div>
                        {onSelectPort && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-cyan)', marginTop: '4px' }}>
                            Click to select Port {d.port}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="total"
                radius={[0, 4, 4, 0]}
                style={{ cursor: onSelectPort ? 'pointer' : 'default' }}
                onClick={(entry) => {
                  if (entry && entry.port) onSelectPort?.(entry.port);
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? '#F59E0B' : index < 3 ? '#FB923C' : '#D97706'}
                    opacity={0.9}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
