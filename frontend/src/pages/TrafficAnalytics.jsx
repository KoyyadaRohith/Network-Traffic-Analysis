import React, { useState, useEffect } from 'react';
import {
  Filter,
  RotateCcw,
  Network,
  Activity,
  Layers,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Info,
  Server,
  Calendar,
  X,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { fetchTrafficAnalytics, fetchPortDrillDown } from '../api/trafficAnalyticsApi';
import KpiCard from '../components/KpiCard';

const COMMON_PORTS = {
  80: 'HTTP (Web)',
  443: 'HTTPS (SSL/TLS)',
  53: 'DNS (Domain)',
  8080: 'HTTP-Alt (Proxy)',
  22: 'SSH (Secure Shell)',
  123: 'NTP (Time Sync)',
  389: 'LDAP (Directory)',
  88: 'Kerberos (Auth)',
  21: 'FTP (File Transfer)',
  137: 'NetBIOS-NS',
  465: 'SMTPS (Mail)',
  139: 'NetBIOS-SSN',
  3268: 'MS Global Catalog',
  0: 'Reserved / Control',
  445: 'SMB (File Sharing)',
};

export default function TrafficAnalytics() {
  // Filter state
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [portFilter, setPortFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  // Query results
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Drill-down panel state
  const [selectedPort, setSelectedPort] = useState(null);
  const [drillDownData, setDrillDownData] = useState(null);
  const [drillDownLoading, setDrillDownLoading] = useState(false);
  const [drillDownError, setDrillDownError] = useState(null);

  // Load analytics with current active filters
  const loadAnalytics = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrafficAnalytics(filters);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to load traffic analytics:', err);
      setError(err.message || 'Unable to fetch warehouse traffic analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Handle filter submission
  const handleApplyFilters = (e) => {
    e?.preventDefault();
    loadAnalytics({
      status: statusFilter,
      destination_port: portFilter,
      date: dateFilter,
    });
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setPortFilter('ALL');
    setDateFilter('ALL');
    loadAnalytics({
      status: 'ALL',
      destination_port: 'ALL',
      date: 'ALL',
    });
  };

  // Handle port drill-down click
  const handlePortClick = async (port) => {
    setSelectedPort(port);
    setDrillDownLoading(true);
    setDrillDownError(null);
    try {
      const detail = await fetchPortDrillDown(port);
      setDrillDownData(detail);
    } catch (err) {
      console.error(`Failed to load drill-down for port ${port}:`, err);
      setDrillDownError(err.message || 'Drill-down query failed');
    } finally {
      setDrillDownLoading(false);
    }
  };

  const summary = analyticsData?.summary;
  const stats = analyticsData?.statistics;
  const classification = analyticsData?.classification || [];
  const ports = analyticsData?.ports || [];
  const availablePorts = analyticsData?.available_ports || [80, 53, 443, 8080, 22, 123, 389, 88, 21];
  const availableDates = analyticsData?.available_dates || ['2017-07-07'];

  // Data for Classification Donut Chart
  const pieData = classification.map((c) => ({
    name: c.traffic_status,
    value: c.total_records,
    percentage: c.percentage,
    label: c.original_label,
  }));

  // Data for Top Ports Bar Chart
  const portBarData = ports.slice(0, 8).map((p) => ({
    port: `Port ${p.destination_port}`,
    records: p.total_records,
    status: p.traffic_status,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="welcome-section" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-purple">DWDM OLAP ENGINE</span>
            <span className="badge badge-info">Star Schema Aggregation</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            TRAFFIC ANALYTICS
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Explore network traffic using data warehouse aggregation and OLAP analysis.
          </p>
        </div>

        {/* DWDM Dimension Breadcrumb / Pill */}
        <div className="date-time-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--color-blue)" />
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                Star Schema
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                fact_network_traffic
              </div>
            </div>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--color-purple)" />
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                Date Dimension
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                2017-07-07
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Single Date Academic Notice if applicable */}
      {analyticsData?.single_date_notice && (
        <div
          style={{
            background: 'rgba(56, 189, 248, 0.05)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
          }}
        >
          <Info size={18} color="var(--color-blue)" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#ffffff' }}>DWDM Warehouse Note: </strong>
            Single capture date in current dataset. Dimensional queries aggregate historical flows from the CICIDS2017 DDoS evaluation window.
          </div>
        </div>
      )}

      {/* FILTER BAR (PART 4) */}
      <form
        onSubmit={handleApplyFilters}
        className="glass-card"
        style={{
          padding: '18px 22px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-blue)', fontWeight: '700', fontSize: '0.88rem' }}>
          <Filter size={18} />
          <span>OLAP Slicing Filters</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
          {/* Traffic Status Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Traffic Status (dim_classification)
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                outline: 'none',
                minWidth: '140px',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Traffic</option>
              <option value="NORMAL">NORMAL</option>
              <option value="SUSPICIOUS">SUSPICIOUS</option>
            </select>
          </div>

          {/* Destination Port Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Destination Port (dim_network)
            </label>
            <select
              value={portFilter}
              onChange={(e) => setPortFilter(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                outline: 'none',
                minWidth: '150px',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Ports</option>
              {availablePorts.map((p) => (
                <option key={p} value={p}>
                  Port {p} {COMMON_PORTS[p] ? `(${COMMON_PORTS[p]})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Date (dim_date)
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                outline: 'none',
                minWidth: '140px',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Dates</option>
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ fontSize: '0.84rem', padding: '9px 18px' }}
            disabled={loading}
          >
            {loading ? <RefreshCw size={14} className="spin-icon" /> : <Filter size={14} />}
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn btn-secondary"
            style={{ fontSize: '0.84rem', padding: '9px 14px' }}
            disabled={loading}
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </form>

      {/* ERROR STATE */}
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            color: 'var(--color-red)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem' }}>
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
          <button onClick={() => loadAnalytics()} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
            <RefreshCw size={14} /> Retry Query
          </button>
        </div>
      )}

      {/* KPI ROW (PART 4) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <KpiCard
          title="Total Records"
          value={summary ? Number(summary.total_records).toLocaleString() : '--'}
          subtitle={loading ? 'Aggregating fact records...' : 'fact_network_traffic COUNT'}
          icon={Layers}
          iconColor="var(--color-blue)"
          loading={loading}
        />
        <KpiCard
          title="Normal Records"
          value={summary ? Number(summary.normal_records).toLocaleString() : '--'}
          subtitle={summary ? `${summary.normal_percentage}% of filtered sample` : '--'}
          icon={ShieldCheck}
          iconColor="var(--color-green)"
          badgeText="BENIGN"
          badgeClass="badge-normal"
          loading={loading}
        />
        <KpiCard
          title="Suspicious Records"
          value={summary ? Number(summary.suspicious_records).toLocaleString() : '--'}
          subtitle={summary ? `${summary.suspicious_percentage}% of filtered sample` : '--'}
          icon={ShieldAlert}
          iconColor="var(--color-red)"
          badgeText="ANOMALOUS"
          badgeClass="badge-suspicious"
          loading={loading}
        />
        <KpiCard
          title="Suspicious %"
          value={summary ? `${summary.suspicious_percentage}%` : '--'}
          subtitle="DWDM Anomaly Concentration"
          icon={TrendingUp}
          iconColor="var(--color-purple)"
          badgeText={summary?.suspicious_percentage > 30 ? 'ELEVATED' : 'BASELINE'}
          badgeClass={summary?.suspicious_percentage > 30 ? 'badge-suspicious' : 'badge-normal'}
          loading={loading}
        />
      </div>

      {/* VISUAL ANALYTICS ROW: Classification & Top Ports Chart */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Classification Donut Chart */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Classification Distribution
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                OLAP measure: NORMAL vs SUSPICIOUS record counts
              </p>
            </div>
            <span className="badge badge-info">dim_classification</span>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: '260px', width: '100%', borderRadius: '8px' }} />
          ) : pieData.length === 0 ? (
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No classification data for active filter criteria.
            </div>
          ) : (
            <div style={{ height: '260px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={entry.name === 'SUSPICIOUS' ? 'var(--color-red)' : 'var(--color-green)'}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div
                            style={{
                              background: 'rgba(15, 23, 42, 0.95)',
                              border: `1px solid ${d.name === 'SUSPICIOUS' ? 'var(--color-red)' : 'var(--color-green)'}`,
                              borderRadius: '8px',
                              padding: '10px 14px',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                            }}
                          >
                            <div style={{ fontWeight: '700', color: d.name === 'SUSPICIOUS' ? 'var(--color-red)' : 'var(--color-green)' }}>
                              {d.name} ({d.label})
                            </div>
                            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>
                              {Number(d.value).toLocaleString()} flows
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              Share: {d.percentage}%
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Donut Center Label */}
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
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Filtered</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                  {summary ? Number(summary.total_records).toLocaleString() : '0'}
                </div>
              </div>
            </div>
          )}

          {/* Classification Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-green)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>
                NORMAL: <strong style={{ color: '#ffffff' }}>{summary?.normal_percentage || 0}%</strong>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-red)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>
                SUSPICIOUS: <strong style={{ color: '#ffffff' }}>{summary?.suspicious_percentage || 0}%</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Top Destination Ports Bar Chart */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Top Ports Distribution
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                OLAP measure: Flow volume by destination port
              </p>
            </div>
            <span className="badge badge-purple">dim_network</span>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: '260px', width: '100%', borderRadius: '8px' }} />
          ) : portBarData.length === 0 ? (
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No port records found for active filter criteria.
            </div>
          ) : (
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={portBarData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="port"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div
                            style={{
                              background: 'rgba(15, 23, 42, 0.95)',
                              border: '1px solid var(--border-accent)',
                              borderRadius: '8px',
                              padding: '10px 14px',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                            }}
                          >
                            <div style={{ fontWeight: '700', color: 'var(--color-blue)' }}>{d.port}</div>
                            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>
                              {Number(d.records).toLocaleString()} flows
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              Status: <span style={{ color: d.status === 'SUSPICIOUS' ? 'var(--color-red)' : 'var(--color-green)' }}>{d.status}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="records" fill="var(--color-blue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
            Click on any port row below to perform dimensional OLAP drill-down.
          </div>
        </div>
      </div>

      {/* DESTINATION PORT ANALYSIS TABLE & DRILL-DOWN PANEL (PART 5) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: selectedPort ? '1.4fr 1fr' : '1fr',
          gap: '20px',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Ports Table */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Destination Port Analysis (Click to Drill Down)
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Port volume aggregated with traffic classification status
              </p>
            </div>
            <span className="badge badge-info">Interactive Drill-Down</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                  <th style={{ padding: '10px 12px' }}>Port</th>
                  <th style={{ padding: '10px 12px' }}>Service</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Records</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Share</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {ports.map((p, idx) => {
                  const isSuspicious = p.traffic_status === 'SUSPICIOUS';
                  const isSelected = selectedPort === p.destination_port;

                  return (
                    <tr
                      key={`${p.destination_port}-${p.traffic_status}-${idx}`}
                      onClick={() => handlePortClick(p.destination_port)}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: '700', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
                        Port {p.destination_port}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                        {COMMON_PORTS[p.destination_port] || 'Standard Service'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className={`badge ${isSuspicious ? 'badge-suspicious' : 'badge-normal'}`}>
                          {p.traffic_status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {Number(p.total_records).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>
                        {p.percentage}%
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePortClick(p.destination_port);
                          }}
                        >
                          Inspect <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drill-Down Detail Panel (Appears when port is clicked) */}
        {selectedPort && (
          <div
            className="glass-card"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1px solid var(--color-blue)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Server size={18} color="var(--color-blue)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
                    PORT {selectedPort} DRILL-DOWN
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPort(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Service: <strong style={{ color: '#ffffff' }}>{COMMON_PORTS[selectedPort] || 'Unassigned / Custom'}</strong>
                <br />
                Real-time dimensional query executed against MySQL fact and dimension tables.
              </p>

              {drillDownLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="skeleton" style={{ height: '60px', borderRadius: '6px' }} />
                  <div className="skeleton" style={{ height: '140px', borderRadius: '6px' }} />
                </div>
              ) : drillDownError ? (
                <div style={{ color: 'var(--color-red)', fontSize: '0.8rem' }}>{drillDownError}</div>
              ) : drillDownData ? (
                <div>
                  {/* Summary row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total Port Records</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
                        {Number(drillDownData.total_records).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Suspicious Ratio</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: drillDownData.suspicious_percentage > 30 ? 'var(--color-red)' : 'var(--color-green)' }}>
                        {drillDownData.suspicious_percentage}%
                      </div>
                    </div>
                  </div>

                  {/* Split bar */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--color-green)' }}>Normal: {drillDownData.normal_records.toLocaleString()}</span>
                      <span style={{ color: 'var(--color-red)' }}>Suspicious: {drillDownData.suspicious_records.toLocaleString()}</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${drillDownData.normal_percentage}%`, background: 'var(--color-green)', height: '100%' }} />
                      <div style={{ width: `${drillDownData.suspicious_percentage}%`, background: 'var(--color-red)', height: '100%' }} />
                    </div>
                  </div>

                  {/* Port specific flow metrics */}
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Port Specific Flow Metrics
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.76rem' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Avg Duration: </span>
                      <strong style={{ color: '#ffffff' }}>{drillDownData.average_flow_duration.toLocaleString()} μs</strong>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Avg Packet Len: </span>
                      <strong style={{ color: '#ffffff' }}>{drillDownData.average_packet_length.toLocaleString()} B</strong>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Avg Fwd Pkts: </span>
                      <strong style={{ color: '#ffffff' }}>{drillDownData.average_fwd_packets}</strong>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Avg Bwd Pkts: </span>
                      <strong style={{ color: '#ffffff' }}>{drillDownData.average_backward_packets}</strong>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.78rem' }}
                onClick={() => {
                  setPortFilter(String(selectedPort));
                  loadAnalytics({
                    status: statusFilter,
                    destination_port: selectedPort,
                    date: dateFilter,
                  });
                }}
              >
                Filter Entire Page by Port {selectedPort}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TRAFFIC STATISTICS GRID (PART 4) */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Filtered Traffic Statistics (SQL AVG Aggregation)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Real-time statistical averages computed over active dimensional slices
            </p>
          </div>
          <span className="badge badge-purple">Warehouse Measures</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Average Flow Duration
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>
              {stats ? Number(stats.average_flow_duration).toLocaleString() : '--'} <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--text-muted)' }}>μs</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>AVG(flow_duration)</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Average Forward Packets
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>
              {stats ? Number(stats.average_fwd_packets).toLocaleString() : '--'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>AVG(total_fwd_packets)</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Average Backward Packets
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>
              {stats ? Number(stats.average_backward_packets).toLocaleString() : '--'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>AVG(total_backward_packets)</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Average Packet Length
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>
              {stats ? Number(stats.average_packet_length).toLocaleString() : '--'} <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--text-muted)' }}>Bytes</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>AVG(packet_length_mean)</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Flow Bytes / Sec
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>
              {stats ? Number(stats.average_flow_bytes_per_sec).toLocaleString() : '--'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>AVG(flow_bytes_per_sec)</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Flow Packets / Sec
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>
              {stats ? Number(stats.average_flow_packets_per_sec).toLocaleString() : '--'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>AVG(flow_packets_per_sec)</div>
          </div>
        </div>
      </div>

      {/* OLAP SUMMARY: ACADEMIC DWDM PRESENTATION (PART 4 & 10) */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.4) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Layers size={20} color="var(--color-blue)" />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
              Warehouse Analysis (OLAP Dimension & Measure Schema)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Star Schema mapping for Academic DWDM presentation
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-blue)', textTransform: 'uppercase', marginBottom: '8px' }}>
              OLAP Dimensions
            </div>
            <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li>
                <strong style={{ color: '#ffffff' }}>Date Dimension (`dim_date`):</strong> full_date, year, month, day, day_of_week
              </li>
              <li>
                <strong style={{ color: '#ffffff' }}>Network Dimension (`dim_network`):</strong> destination_port, protocol_type, ip_range
              </li>
              <li>
                <strong style={{ color: '#ffffff' }}>Classification Dimension (`dim_classification`):</strong> traffic_status (NORMAL/SUSPICIOUS), original_label (BENIGN/DDoS)
              </li>
            </ul>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-purple)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Fact Table & Measures
            </div>
            <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li>
                <strong style={{ color: '#ffffff' }}>Fact Table (`fact_network_traffic`):</strong> 223,112 grain rows with foreign keys to 3 dimensions
              </li>
              <li>
                <strong style={{ color: '#ffffff' }}>Additive Measures:</strong> COUNT(*) for flow record volumes
              </li>
              <li>
                <strong style={{ color: '#ffffff' }}>Non-Additive / Semi-Additive Measures:</strong> AVG(flow_duration), AVG(fwd_packets), AVG(packet_length), AVG(flow_bytes_per_sec)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
