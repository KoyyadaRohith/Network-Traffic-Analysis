import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const METRIC_OPTIONS = [
  { label: 'Average Packet Length', key: 'average_packet_length', unit: 'bytes' },
  { label: 'Average Flow Duration', key: 'average_flow_duration', unit: 'μs' },
  { label: 'Average Fwd Packets', key: 'average_fwd_packets', unit: 'pkts' },
  { label: 'Average Bwd Packets', key: 'average_backward_packets', unit: 'pkts' },
  { label: 'Average Flow Bytes/sec', key: 'average_flow_bytes_per_sec', unit: 'B/s' },
  { label: 'Average Flow Packets/sec', key: 'average_flow_packets_per_sec', unit: 'pkts/s' },
];

export default function TrafficComparisonChart({ comparisonData, loading }) {
  const [selectedMetricKey, setSelectedMetricKey] = useState('average_packet_length');

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: '#0D0D0D',
          border: '1px solid #222222',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          minHeight: '340px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="skeleton" style={{ height: '22px', width: '40%', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '24px' }} />
        <div className="skeleton" style={{ flex: 1, width: '100%', borderRadius: '8px' }} />
      </div>
    );
  }

  const normalRow = (comparisonData || []).find((r) => r.traffic_status === 'NORMAL') || {
    average_packet_length: 229.30,
    average_flow_duration: 15728264.68,
    average_fwd_packets: 5.49,
    average_backward_packets: 6.44,
    average_flow_bytes_per_sec: 1215055.77,
    average_flow_packets_per_sec: 30025.37,
  };

  const suspRow = (comparisonData || []).find((r) => r.traffic_status === 'SUSPICIOUS') || {
    average_packet_length: 736.94,
    average_flow_duration: 16956893.03,
    average_fwd_packets: 4.47,
    average_backward_packets: 3.26,
    average_flow_bytes_per_sec: 60508.96,
    average_flow_packets_per_sec: 155.39,
  };

  const currentMetric = METRIC_OPTIONS.find((m) => m.key === selectedMetricKey) || METRIC_OPTIONS[0];

  const normalVal = Number(normalRow[currentMetric.key]) || 0;
  const suspVal = Number(suspRow[currentMetric.key]) || 0;

  const chartData = [
    {
      name: 'NORMAL',
      value: normalVal,
      fill: '#22C55E',
      unit: currentMetric.unit,
    },
    {
      name: 'SUSPICIOUS',
      value: suspVal,
      fill: '#EF4444',
      unit: currentMetric.unit,
    },
  ];

  const formatValue = (val) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(2)}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}k`;
    }
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: '#111111',
            border: '1px solid #222222',
            borderRadius: '6px',
            padding: '10px 14px',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.7)',
          }}
        >
          <div style={{ fontWeight: '700', color: d.fill, fontSize: '0.8rem', letterSpacing: '0.04em' }}>
            {d.name}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#F5F5F5', marginTop: '3px', fontFamily: 'JetBrains Mono, monospace' }}>
            {d.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} {d.unit}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#A0A0A0', marginTop: '2px' }}>
            {currentMetric.label}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        backgroundColor: '#0D0D0D',
        border: '1px solid #222222',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'border-color 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#333333')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#222222')}
    >
      {/* Header with Title and Metric Selector Dropdown */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: '700',
              color: '#F5F5F5',
              letterSpacing: '-0.01em',
            }}
          >
            Normal vs Suspicious Traffic
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#666666', marginTop: '3px' }}>
            Comparison of selected traffic characteristics
          </p>
        </div>

        {/* Metric Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="metric-select" style={{ fontSize: '0.75rem', color: '#A0A0A0', fontWeight: '600' }}>
            Metric:
          </label>
          <select
            id="metric-select"
            value={selectedMetricKey}
            onChange={(e) => setSelectedMetricKey(e.target.value)}
            style={{
              backgroundColor: '#111111',
              color: '#F5F5F5',
              border: '1px solid #222222',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '190px',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#444444')}
            onBlur={(e) => (e.target.style.borderColor = '#222222')}
          >
            {METRIC_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key} style={{ background: '#111111', color: '#F5F5F5' }}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bar Chart comparing ONLY the selected metric */}
      <div style={{ width: '100%', height: '230px', marginTop: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#A0A0A0"
              fontSize={11}
              fontWeight={700}
              tickLine={false}
              axisLine={{ stroke: '#222222' }}
            />
            <YAxis
              stroke="#666666"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#222222' }}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              maxBarSize={56}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Comparison Footer */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #1A1A1A',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.78rem',
          color: '#A0A0A0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
          <span>
            NORMAL: <strong style={{ color: '#F5F5F5', fontFamily: 'JetBrains Mono, monospace' }}>{normalVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong> {currentMetric.unit}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
          <span>
            SUSPICIOUS: <strong style={{ color: '#F5F5F5', fontFamily: 'JetBrains Mono, monospace' }}>{suspVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong> {currentMetric.unit}
          </span>
        </div>

        <div style={{ color: '#666666', fontSize: '0.72rem' }}>
          Selected Feature: <span style={{ color: '#A0A0A0' }}>{currentMetric.label} ({currentMetric.unit})</span>
        </div>
      </div>
    </div>
  );
}
