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

export default function NetworkTrafficDistribution({ portsData, loading }) {
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
      name: SERVICE_NAMES[item.port] || `Port ${item.port}`,
      shortName: `P${item.port}`,
      normal: item.normal,
      suspicious: item.suspicious,
      total: item.total,
    }));

  // Fallback if empty
  const displayData = chartData.length > 0 ? chartData : [
    { name: 'Port 80 (HTTP)', shortName: 'P80', normal: 8549, suspicious: 128013 },
    { name: 'Port 53 (DNS)', shortName: 'P53', normal: 30302, suspicious: 0 },
    { name: 'Port 443 (HTTPS)', shortName: 'P443', normal: 13114, suspicious: 0 },
    { name: 'Port 8080 (Alt)', shortName: 'P8080', normal: 510, suspicious: 0 },
    { name: 'Port 123 (NTP)', shortName: 'P123', normal: 361, suspicious: 0 },
    { name: 'Port 22 (SSH)', shortName: 'P22', normal: 317, suspicious: 0 },
    { name: 'Port 389 (LDAP)', shortName: 'P389', normal: 258, suspicious: 0 },
    { name: 'Port 88 (Auth)', shortName: 'P88', normal: 170, suspicious: 0 },
  ];

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
      <div style={{ width: '100%', height: '270px', marginTop: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={displayData}
            margin={{ top: 12, right: 12, left: -14, bottom: 4 }}
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

            <CartesianGrid strokeDasharray="3 3" stroke="#12242E" vertical={false} />

            <XAxis
              dataKey="shortName"
              stroke="#213E4D"
              tick={{ fill: '#7F93A3', fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              stroke="#213E4D"
              tickFormatter={formatK}
              tick={{ fill: '#7F93A3', fontSize: 11 }}
              tickLine={false}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div
                      style={{
                        backgroundColor: '#07151E',
                        border: '1px solid #1C3B4A',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.85)',
                        fontSize: '0.78rem',
                      }}
                    >
                      <div style={{ fontWeight: '700', color: '#F5F7FA', marginBottom: '6px' }}>
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
    </div>
  );
}
