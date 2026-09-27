import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function NetworkTrafficDistribution({ portsData, loading, onSelectPort }) {
  const [activeSeries, setActiveSeries] = useState(null);

  if (loading) {
    return (
      <div className="analytical-card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
        <div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: '6px' }} />
        <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '20px' }} />
        <div className="skeleton" style={{ flex: 1, width: '100%' }} />
      </div>
    );
  }

  // Construct real port-based distribution data from API
  const portAgg = {};
  if (Array.isArray(portsData) && portsData.length > 0) {
    portsData.forEach((row) => {
      const p = row.destination_port;
      if (!portAgg[p]) {
        portAgg[p] = { port: p, normal: 0, suspicious: 0, total: 0 };
      }
      const count = Number(row.total_records) || 0;
      if (row.traffic_status === 'NORMAL') {
        portAgg[p].normal += count;
      } else if (row.traffic_status === 'SUSPICIOUS') {
        portAgg[p].suspicious += count;
      }
      portAgg[p].total += count;
    });
  }

  const SERVICE_NAMES = {
    80: 'Port 80 (HTTP)',
    53: 'Port 53 (DNS)',
    443: 'Port 443 (HTTPS)',
    8080: 'Port 8080 (Alt)',
    123: 'Port 123 (NTP)',
    22: 'Port 22 (SSH)',
    389: 'Port 389 (LDAP)',
    88: 'Port 88 (Auth)',
    21: 'Port 21 (FTP)',
    137: 'Port 137 (NetB)',
  };

  const chartData = Object.values(portAgg)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map((item) => ({
      port: item.port,
      name: SERVICE_NAMES[item.port] || `Port ${item.port}`,
      shortName: `P${item.port}`,
      normal: item.normal,
      suspicious: item.suspicious,
      total: item.total,
    }));

  const formatK = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val;
  };

  return (
    <div className="analytical-card traffic-dist-card">
      {/* Header & Legend */}
      <div className="analytical-header-row">
        <div>
          <h3 className="analytical-title">
            Network Traffic Distribution
          </h3>
          <p className="analytical-subtitle">
            Normal vs Suspicious Traffic
          </p>
        </div>

        {/* Compact Legend */}
        <div className="chart-legend-compact">
          <div
            className="legend-item"
            onMouseEnter={() => setActiveSeries('normal')}
            onMouseLeave={() => setActiveSeries(null)}
          >
            <span className="legend-dot" style={{ backgroundColor: '#22C55E' }} />
            <span style={{ color: activeSeries === 'suspicious' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
              NORMAL
            </span>
          </div>

          <div
            className="legend-item"
            onMouseEnter={() => setActiveSeries('suspicious')}
            onMouseLeave={() => setActiveSeries(null)}
          >
            <span className="legend-dot" style={{ backgroundColor: '#EF4444' }} />
            <span style={{ color: activeSeries === 'normal' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
              SUSPICIOUS
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      {chartData.length === 0 ? (
        <div style={{ height: '270px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
          No traffic distribution records match the current filter selection.
        </div>
      ) : (
        <div style={{ width: '100%', height: '270px', marginTop: '10px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 12, right: 12, left: -14, bottom: 4 }}
              style={{ cursor: onSelectPort ? 'pointer' : 'default' }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0] && e.activePayload[0].payload.port) {
                  onSelectPort?.(e.activePayload[0].payload.port);
                }
              }}
            >
            <defs>
              <linearGradient id="normalAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={activeSeries === 'suspicious' ? 0.05 : 0.22} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="suspiciousAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={activeSeries === 'normal' ? 0.05 : 0.22} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />

            <XAxis
              dataKey="shortName"
              stroke="var(--border-subtle)"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              stroke="var(--border-subtle)"
              tickFormatter={formatK}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
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
                        padding: '10px 14px',
                        boxShadow: 'var(--shadow-elevated)',
                        fontSize: '0.78rem',
                      }}
                    >
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                        {d.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22C55E' }}>
                        <span>● Normal:</span>
                        <strong>{d.normal.toLocaleString()}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', marginTop: '2px' }}>
                        <span>● Suspicious:</span>
                        <strong>{d.suspicious.toLocaleString()}</strong>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="suspicious"
              name="SUSPICIOUS"
              stroke="#EF4444"
              strokeWidth={activeSeries === 'suspicious' ? 2.5 : 1.8}
              fillOpacity={1}
              fill="url(#suspiciousAreaGrad)"
              opacity={activeSeries === 'normal' ? 0.3 : 1}
            />

            <Area
              type="monotone"
              dataKey="normal"
              name="NORMAL"
              stroke="#22C55E"
              strokeWidth={activeSeries === 'normal' ? 2.5 : 1.8}
              fillOpacity={1}
              fill="url(#normalAreaGrad)"
              opacity={activeSeries === 'suspicious' ? 0.3 : 1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}
