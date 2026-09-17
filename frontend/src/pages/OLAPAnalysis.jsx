import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Filter,
  RotateCcw,
  ChevronRight,
  Database,
  ArrowRight,
  Check,
  Copy,
  Info,
  RefreshCw,
  Table,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { fetchTrafficAnalytics } from '../api/trafficAnalyticsApi';
import {
  fetchDWDMDrilldown,
  fetchDWDMStatusComparison,
  fetchDWDMRollup,
} from '../api/dwdmAnalysisApi';

const PORT_SERVICES = {
  80: 'HTTP (World Wide Web)',
  53: 'DNS (Domain Name System)',
  443: 'HTTPS (Secure Web)',
  8080: 'HTTP-Alt (Proxy)',
  123: 'NTP (Network Time Protocol)',
  22: 'SSH (Secure Shell)',
  389: 'LDAP (Directory Services)',
  88: 'Kerberos (Authentication)',
  21: 'FTP (File Transfer)',
  137: 'NetBIOS-NS (Name Service)',
  465: 'SMTPS (Secure Mail)',
  139: 'NetBIOS-SSN (Session)',
  3268: 'MS-GC (Global Catalog)',
  0: 'Reserved / System Control',
  445: 'SMB (File Sharing)',
  138: 'NetBIOS-DGM (Datagram)',
  135: 'RPC (Endpoint Mapper)',
  49666: 'Ephemeral Port',
  5353: 'mDNS (Multicast DNS)',
  49671: 'Ephemeral Port',
};

export default function OLAPAnalysis() {
  // Dimension Filter State
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [portFilter, setPortFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  // Main Analytics Data from server
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Drill-down State
  const [drilldownPort, setDrilldownPort] = useState(80);
  const [drilldownData, setDrilldownData] = useState(null);
  const [drilldownLoading, setDrilldownLoading] = useState(false);
  const [drilldownError, setDrilldownError] = useState(null);

  // Status Comparison State
  const [statusComparison, setStatusComparison] = useState(null);
  const [statusCompLoading, setStatusCompLoading] = useState(true);

  // Roll-up State
  const [rollupData, setRollupData] = useState(null);
  const [rollupLoading, setRollupLoading] = useState(true);

  // SQL Copy State
  const [copiedSql, setCopiedSql] = useState(false);

  // Load Main Filtered Analytics Data
  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (statusFilter !== 'ALL') filters.status = statusFilter;
      if (portFilter !== 'ALL') filters.destination_port = portFilter;
      if (dateFilter !== 'ALL') filters.date = dateFilter;

      const result = await fetchTrafficAnalytics(filters);
      setAnalyticsData(result);
    } catch (err) {
      console.error('Error loading OLAP traffic analytics:', err);
      setError(err.message || 'Failed to query OLAP analytics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [statusFilter, portFilter, dateFilter]);

  // Load Drill-down data for selected port
  const loadDrilldown = async (port) => {
    if (!port) return;
    setDrilldownLoading(true);
    setDrilldownError(null);
    try {
      const res = await fetchDWDMDrilldown(port);
      setDrilldownData(res);
    } catch (err) {
      console.error(`Error loading drilldown for port ${port}:`, err);
      setDrilldownError(`Unable to load drill-down metrics for Port ${port}`);
    } finally {
      setDrilldownLoading(false);
    }
  };

  useEffect(() => {
    loadDrilldown(drilldownPort);
  }, [drilldownPort]);

  // Load Status Comparison Data
  useEffect(() => {
    async function loadStatusComp() {
      setStatusCompLoading(true);
      try {
        const res = await fetchDWDMStatusComparison();
        setStatusComparison(res?.data || []);
      } catch (err) {
        console.error('Error loading status comparison:', err);
      } finally {
        setStatusCompLoading(false);
      }
    }
    loadStatusComp();
  }, []);

  // Load Roll-up Data
  useEffect(() => {
    async function loadRollup() {
      setRollupLoading(true);
      try {
        const res = await fetchDWDMRollup();
        setRollupData(res);
      } catch (err) {
        console.error('Error loading roll-up hierarchy:', err);
      } finally {
        setRollupLoading(false);
      }
    }
    loadRollup();
  }, []);

  // Reset all filters to base warehouse view
  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setPortFilter('ALL');
    setDateFilter('ALL');
  };

  // Interactive One-Click Slice Application
  const handleApplySlice = () => {
    setStatusFilter('SUSPICIOUS');
    setPortFilter('ALL');
    setDateFilter('ALL');
  };

  // Interactive One-Click Dice Application
  const handleApplyDice = () => {
    setStatusFilter('SUSPICIOUS');
    setPortFilter('80');
    setDateFilter('2017-07-07');
  };

  // Interactive One-Click Drill-down Application
  const handleSelectDrilldown = (port) => {
    setDrilldownPort(port);
    const element = document.getElementById('drilldown-panel');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Interactive Roll-up Focus
  const handleFocusRollup = () => {
    const element = document.getElementById('rollup-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Copy SQL Query
  const sampleSqlQuery = `SELECT
    destination_port,
    COUNT(*) AS total_records
FROM fact_network_traffic
GROUP BY destination_port;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sampleSqlQuery);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Compute Active Operation Status Badge
  const currentOperationStatus = useMemo(() => {
    const activeCount =
      (statusFilter !== 'ALL' ? 1 : 0) +
      (portFilter !== 'ALL' ? 1 : 0) +
      (dateFilter !== 'ALL' ? 1 : 0);

    if (activeCount >= 2) {
      return {
        label: `DICE ACTIVE (${activeCount} Dimensions Filtered)`,
        color: '#818CF8',
        bg: 'rgba(129, 140, 248, 0.12)',
        border: 'rgba(129, 140, 248, 0.3)',
      };
    }
    if (activeCount === 1) {
      const dimDesc =
        statusFilter !== 'ALL'
          ? `Status = ${statusFilter}`
          : portFilter !== 'ALL'
          ? `Port = ${portFilter}`
          : `Date = ${dateFilter}`;
      return {
        label: `SLICE ACTIVE (${dimDesc})`,
        color: 'var(--color-cyan)',
        bg: 'rgba(0, 217, 255, 0.12)',
        border: 'rgba(0, 217, 255, 0.3)',
      };
    }
    return {
      label: 'ACTIVE VIEW: BASE WAREHOUSE (Full Cube)',
      color: 'var(--text-muted)',
      bg: 'rgba(255, 255, 255, 0.04)',
      border: 'var(--border-subtle)',
    };
  }, [statusFilter, portFilter, dateFilter]);

  // Aggregate Port Distribution Data for Main Chart (Top 10)
  // Backend returns multiple rows per port (one per status)
  const aggregatedPortsData = useMemo(() => {
    if (!analyticsData?.ports) return [];

    const map = new Map();
    analyticsData.ports.forEach((p) => {
      const portNum = p.destination_port;
      const count = Number(p.total_records) || 0;
      const status = p.traffic_status;

      if (!map.has(portNum)) {
        map.set(portNum, {
          port: portNum,
          name: `Port ${portNum}`,
          serviceName: PORT_SERVICES[portNum] || `Port ${portNum}`,
          records: 0,
          normalRecords: 0,
          suspiciousRecords: 0,
        });
      }
      const item = map.get(portNum);
      item.records += count;
      if (status === 'NORMAL') {
        item.normalRecords += count;
      } else if (status === 'SUSPICIOUS') {
        item.suspiciousRecords += count;
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.records - a.records)
      .slice(0, 10);
  }, [analyticsData]);

  // Classification Donut Data
  const classificationDonutData = useMemo(() => {
    if (!analyticsData?.summary) return [];
    return [
      {
        name: 'NORMAL',
        value: analyticsData.summary.normal_records || 0,
        color: '#10B981',
      },
      {
        name: 'SUSPICIOUS',
        value: analyticsData.summary.suspicious_records || 0,
        color: '#EF4444',
      },
    ];
  }, [analyticsData]);

  // Available Ports List for Select Dropdown
  const availablePortsList =
    analyticsData?.available_ports || [80, 53, 443, 8080, 123, 22, 389, 88, 21];

  return (
    <div className="olap-container">
      {/* ====================================================================
          1. PAGE HEADER
          ==================================================================== */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          {/* Breadcrumb / Pipeline Context */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              CICIDS2017
            </span>
            <ChevronRight size={12} color="var(--text-muted)" />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Preprocessing
            </span>
            <ChevronRight size={12} color="var(--text-muted)" />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              ETL
            </span>
            <ChevronRight size={12} color="var(--text-muted)" />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Data Warehouse
            </span>
            <ChevronRight size={12} color="var(--color-cyan)" />
            <span style={{ fontSize: '0.74rem', color: 'var(--color-cyan)', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace' }}>
              OLAP Analysis
            </span>
          </div>

          <h1 className="page-title" style={{ margin: '0 0 6px 0' }}>
            OLAP Analysis
          </h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Multidimensional analysis of warehouse traffic using slice, dice, roll-up and drill-down operations.
          </p>
        </div>

        {/* Technical Metadata Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '4px',
              background: 'rgba(0, 217, 255, 0.08)',
              border: '1px solid rgba(0, 217, 255, 0.25)',
              color: 'var(--color-cyan)',
              fontSize: '0.68rem',
              fontWeight: '700',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.04em',
            }}
          >
            <Database size={11} />
            <span>OLAP / MYSQL / MULTIDIMENSIONAL ANALYSIS</span>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            SCHEMA: network_traffic_dw
          </span>
        </div>
      </div>

      {/* ====================================================================
          2. OLAP CONCEPT STRIP (4 COMPACT CARDS)
          ==================================================================== */}
      <div className="olap-concept-strip">
        {/* SLICE */}
        <div
          className={`olap-concept-card cyan ${statusFilter === 'SUSPICIOUS' && portFilter === 'ALL' ? 'active' : ''}`}
          onClick={handleApplySlice}
          style={{ cursor: 'pointer' }}
          title="Click to apply Slice: Status = SUSPICIOUS"
        >
          <div>
            <div className="olap-concept-header">
              <span className="olap-concept-name" style={{ color: 'var(--color-cyan)' }}>
                SLICE
              </span>
              <span
                className="olap-concept-badge"
                style={{
                  background: 'rgba(0, 217, 255, 0.12)',
                  color: 'var(--color-cyan)',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                }}
              >
                1 DIMENSION
              </span>
            </div>
            <p className="olap-concept-desc">
              Filter one dimension
            </p>
          </div>
          <div className="olap-concept-footer">
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Status = SUSPICIOUS
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-cyan)', fontWeight: '700' }}>
              Apply →
            </span>
          </div>
        </div>

        {/* DICE */}
        <div
          className={`olap-concept-card purple ${statusFilter === 'SUSPICIOUS' && portFilter === '80' ? 'active' : ''}`}
          onClick={handleApplyDice}
          style={{ cursor: 'pointer' }}
          title="Click to apply Dice: Status = SUSPICIOUS & Port = 80"
        >
          <div>
            <div className="olap-concept-header">
              <span className="olap-concept-name" style={{ color: '#818CF8' }}>
                DICE
              </span>
              <span
                className="olap-concept-badge"
                style={{
                  background: 'rgba(129, 140, 248, 0.12)',
                  color: '#818CF8',
                  border: '1px solid rgba(129, 140, 248, 0.3)',
                }}
              >
                MULTI-DIM
              </span>
            </div>
            <p className="olap-concept-desc">
              Filter multiple dimensions
            </p>
          </div>
          <div className="olap-concept-footer">
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Status + Port + Date
            </span>
            <span style={{ fontSize: '0.68rem', color: '#818CF8', fontWeight: '700' }}>
              Apply →
            </span>
          </div>
        </div>

        {/* ROLL-UP */}
        <div
          className="olap-concept-card amber"
          onClick={handleFocusRollup}
          style={{ cursor: 'pointer' }}
          title="Click to view Roll-Up Hierarchy"
        >
          <div>
            <div className="olap-concept-header">
              <span className="olap-concept-name" style={{ color: '#F59E0B' }}>
                ROLL-UP
              </span>
              <span
                className="olap-concept-badge"
                style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  color: '#F59E0B',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                AGGREGATION
              </span>
            </div>
            <p className="olap-concept-desc">
              Aggregate to a higher level
            </p>
          </div>
          <div className="olap-concept-footer">
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Detail → Date → Total
            </span>
            <span style={{ fontSize: '0.68rem', color: '#F59E0B', fontWeight: '700' }}>
              View →
            </span>
          </div>
        </div>

        {/* DRILL-DOWN */}
        <div
          className="olap-concept-card green"
          onClick={() => handleSelectDrilldown(80)}
          style={{ cursor: 'pointer' }}
          title="Click to drill down on Port 80"
        >
          <div>
            <div className="olap-concept-header">
              <span className="olap-concept-name" style={{ color: '#10B981' }}>
                DRILL-DOWN
              </span>
              <span
                className="olap-concept-badge"
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10B981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                GRANULARITY
              </span>
            </div>
            <p className="olap-concept-desc">
              Explore greater detail
            </p>
          </div>
          <div className="olap-concept-footer">
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Port 80 Breakdown
            </span>
            <span style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: '700' }}>
              Inspect →
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. DIMENSION FILTER BAR
          ==================================================================== */}
      <div className="olap-filter-panel">
        <div className="olap-filter-header">
          <div className="olap-filter-title">
            <Filter size={15} color="var(--color-cyan)" />
            <span>ANALYSIS DIMENSIONS</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Active View / Filters Applied Badge */}
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: '700',
                fontFamily: 'JetBrains Mono, monospace',
                color: currentOperationStatus.color,
                background: currentOperationStatus.bg,
                border: `1px solid ${currentOperationStatus.border}`,
                padding: '3px 10px',
                borderRadius: '4px',
              }}
            >
              {currentOperationStatus.label}
            </span>

            {/* Reset Filters */}
            {(statusFilter !== 'ALL' || portFilter !== 'ALL' || dateFilter !== 'ALL') && (
              <button
                onClick={handleResetFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'var(--surface-elevated)',
                  border: '1px solid #102430',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 10px',
                  fontSize: '0.74rem',
                  color: 'var(--text-secondary)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#F5F7FA';
                  e.currentTarget.style.borderColor = 'var(--color-cyan)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Working Dimension Dropdowns */}
        <div className="olap-filters-grid">
          {/* Dimension 1: Traffic Status */}
          <div className="olap-filter-field">
            <label className="olap-filter-label">Traffic Status</label>
            <select
              className={`olap-select ${statusFilter !== 'ALL' ? 'active' : ''}`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="NORMAL">NORMAL (Benign Traffic)</option>
              <option value="SUSPICIOUS">SUSPICIOUS (Anomalous / DDoS)</option>
            </select>
          </div>

          {/* Dimension 2: Destination Port */}
          <div className="olap-filter-field">
            <label className="olap-filter-label">Destination Port</label>
            <select
              className={`olap-select ${portFilter !== 'ALL' ? 'active' : ''}`}
              value={portFilter}
              onChange={(e) => setPortFilter(e.target.value)}
            >
              <option value="ALL">All Ports</option>
              {availablePortsList.map((p) => (
                <option key={p} value={p}>
                  Port {p} {PORT_SERVICES[p] ? `(${PORT_SERVICES[p].split(' ')[0]})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Dimension 3: Date */}
          <div className="olap-filter-field">
            <label className="olap-filter-label">Date</label>
            <select
              className={`olap-select ${dateFilter !== 'ALL' ? 'active' : ''}`}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="ALL">All Dates</option>
              {(analyticsData?.available_dates || ['2017-07-07']).map((d) => (
                <option key={d} value={d}>
                  {d} (CICIDS2017 Capture)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ====================================================================
          4. EXACT KPI SUMMARY (EXACTLY 4 CARDS)
          ==================================================================== */}
      <div className="grid-kpi">
        {/* KPI 1: TOTAL RECORDS */}
        <div className="card-kpi">
          <div className="kpi-label">TOTAL RECORDS</div>
          <div className="kpi-value cyan">
            {loading ? '—' : Number(analyticsData?.summary?.total_records || 0).toLocaleString()}
          </div>
          <div className="kpi-subtext">
            Current analytical slice count
          </div>
        </div>

        {/* KPI 2: NORMAL */}
        <div className="card-kpi">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="kpi-label">NORMAL</div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#10B981',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '2px 6px',
                borderRadius: '3px',
              }}
            >
              {loading ? '—' : `${analyticsData?.summary?.normal_percentage || 0}%`}
            </span>
          </div>
          <div className="kpi-value green">
            {loading ? '—' : Number(analyticsData?.summary?.normal_records || 0).toLocaleString()}
          </div>
          <div className="kpi-subtext">
            Benign warehouse traffic
          </div>
        </div>

        {/* KPI 3: SUSPICIOUS */}
        <div className="card-kpi">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="kpi-label">SUSPICIOUS</div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#EF4444',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                padding: '2px 6px',
                borderRadius: '3px',
              }}
            >
              {loading ? '—' : `${analyticsData?.summary?.suspicious_percentage || 0}%`}
            </span>
          </div>
          <div className="kpi-value red">
            {loading ? '—' : Number(analyticsData?.summary?.suspicious_records || 0).toLocaleString()}
          </div>
          <div className="kpi-subtext">
            Anomalous / attack traffic
          </div>
        </div>

        {/* KPI 4: AVG PACKET LENGTH */}
        <div className="card-kpi">
          <div className="kpi-label">AVG PACKET LENGTH</div>
          <div className="kpi-value amber" style={{ color: '#F59E0B' }}>
            {loading ? '—' : `${analyticsData?.statistics?.average_packet_length || 0} B`}
          </div>
          <div className="kpi-subtext">
            Filtered mean payload size
          </div>
        </div>
      </div>

      {/* ====================================================================
          5 & 6. MAIN ANALYTICAL VISUALIZATION + SECONDARY CLASSIFICATION
          ==================================================================== */}
      <div className="olap-analytical-grid">
        {/* Main Card: TRAFFIC DISTRIBUTION BY DESTINATION PORT */}
        <div className="olap-chart-card">
          <div className="olap-chart-header">
            <div>
              <h3 className="olap-chart-title">
                TRAFFIC DISTRIBUTION BY DESTINATION PORT
              </h3>
              <p className="olap-chart-desc">
                Warehouse volume aggregated by destination port dimension (Top 10)
              </p>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                fontFamily: 'JetBrains Mono, monospace',
                color: 'var(--color-cyan)',
                background: 'rgba(0, 217, 255, 0.08)',
                border: '1px solid rgba(0, 217, 255, 0.25)',
                padding: '3px 8px',
                borderRadius: '4px',
              }}
            >
              Click bar to drill down
            </span>
          </div>

          {loading ? (
            <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={18} className="animate-spin" style={{ marginRight: '8px' }} />
              Querying destination port aggregations...
            </div>
          ) : aggregatedPortsData.length === 0 ? (
            <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              No port records match current dimension filters.
            </div>
          ) : (
            <div style={{ width: '100%', height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={aggregatedPortsData}
                  margin={{ top: 10, right: 30, left: 60, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    stroke="var(--border-subtle)"
                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="var(--border-subtle)"
                    tick={{ fill: '#E2E8F0', fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono' }}
                    width={70}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const item = payload[0].payload;
                      return (
                        <div
                          style={{
                            background: 'var(--surface-elevated)',
                            border: '1px solid var(--color-cyan)',
                            borderRadius: '6px',
                            padding: '10px 14px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.85)',
                          }}
                        >
                          <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#F5F7FA', marginBottom: '2px' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-cyan)', marginBottom: '8px', fontFamily: 'JetBrains Mono' }}>
                            {item.serviceName}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.76rem', fontFamily: 'JetBrains Mono' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', color: '#10B981' }}>
                              <span>Normal Records:</span>
                              <strong>{Number(item.normalRecords || 0).toLocaleString()}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', color: '#EF4444' }}>
                              <span>Suspicious Records:</span>
                              <strong>{Number(item.suspiciousRecords || 0).toLocaleString()}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', color: '#F5F7FA', borderTop: '1px solid #102430', paddingTop: '4px', marginTop: '2px' }}>
                              <span>Total Records:</span>
                              <strong>{Number(item.records).toLocaleString()}</strong>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="records"
                    radius={[0, 4, 4, 0]}
                    cursor="pointer"
                    onClick={(entry) => {
                      if (entry?.port) handleSelectDrilldown(entry.port);
                    }}
                  >
                    {aggregatedPortsData.map((entry) => (
                      <Cell
                        key={`cell-${entry.port}`}
                        fill={drilldownPort === entry.port ? 'var(--color-cyan)' : '#0284C7'}
                        stroke={drilldownPort === entry.port ? '#7DD3FC' : 'none'}
                        strokeWidth={1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Secondary Card: NORMAL VS SUSPICIOUS TRAFFIC */}
        <div className="olap-chart-card">
          <div className="olap-chart-header">
            <div>
              <h3 className="olap-chart-title">
                NORMAL VS SUSPICIOUS TRAFFIC
              </h3>
              <p className="olap-chart-desc">
                Classification proportions of current slice
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={18} className="animate-spin" style={{ marginRight: '8px' }} />
              Querying traffic classification...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '320px' }}>
              <div style={{ width: '100%', height: '220px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classificationDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {classificationDonutData.map((entry, index) => (
                        <Cell key={`donut-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const d = payload[0];
                        const total = analyticsData?.summary?.total_records || 1;
                        const pct = ((d.value / total) * 100).toFixed(2);
                        return (
                          <div
                            style={{
                              background: 'var(--surface-elevated)',
                              border: '1px solid #102430',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              color: '#F5F7FA',
                              fontSize: '0.78rem',
                              fontFamily: 'JetBrains Mono',
                            }}
                          >
                            <span style={{ color: d.payload.color, fontWeight: '700' }}>
                              {d.name}:
                            </span>{' '}
                            {Number(d.value).toLocaleString()} ({pct}%)
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Centered Total in Donut */}
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
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#F5F7FA', fontFamily: 'JetBrains Mono' }}>
                    {analyticsData?.summary?.total_records
                      ? Number(analyticsData.summary.total_records).toLocaleString()
                      : '0'}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    RECORDS
                  </div>
                </div>
              </div>

              {/* Legend with exact backend figures */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', width: '100%', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#10B981' }} />
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    NORMAL:{' '}
                    <strong style={{ color: '#F5F7FA', fontFamily: 'JetBrains Mono' }}>
                      {analyticsData?.summary?.normal_percentage || 0}%
                    </strong>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#EF4444' }} />
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    SUSPICIOUS:{' '}
                    <strong style={{ color: '#F5F7FA', fontFamily: 'JetBrains Mono' }}>
                      {analyticsData?.summary?.suspicious_percentage || 0}%
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          7. OLAP OPERATION WORKSPACE (4 OPERATION CARDS)
          ==================================================================== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#F5F7FA', margin: '0 0 2px 0' }}>
            OLAP OPERATIONS
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
            Four primary operators implemented on the MySQL Star Schema warehouse.
          </p>
        </div>

        <div className="olap-operations-grid">
          {/* 1. SLICE */}
          <div className={`olap-operation-card ${statusFilter === 'SUSPICIOUS' && portFilter === 'ALL' ? 'active' : ''}`}>
            <div className="olap-op-top">
              <div className="olap-op-num">OP 01 — SLICE</div>
              <h4 className="olap-op-title">Single Dimension Slice</h4>
              <p className="olap-op-desc">
                Selects one value from a dimension to create a focused analytical view.
              </p>
              <div className="olap-op-flow">
                <div>All Traffic</div>
                <div style={{ color: 'var(--color-cyan)', margin: '1px 0' }}>↓</div>
                <div style={{ color: '#EF4444', fontWeight: '700' }}>Status = SUSPICIOUS</div>
              </div>
            </div>
            <button
              className={`olap-op-btn ${statusFilter === 'SUSPICIOUS' && portFilter === 'ALL' ? 'active' : ''}`}
              onClick={handleApplySlice}
            >
              {statusFilter === 'SUSPICIOUS' && portFilter === 'ALL' ? 'Slice Applied ✓' : 'Execute Slice (Suspicious)'}
            </button>
          </div>

          {/* 2. DICE */}
          <div className={`olap-operation-card ${statusFilter === 'SUSPICIOUS' && portFilter === '80' ? 'active' : ''}`}>
            <div className="olap-op-top">
              <div className="olap-op-num" style={{ color: '#818CF8' }}>OP 02 — DICE</div>
              <h4 className="olap-op-title">Multi-Dimension Dice</h4>
              <p className="olap-op-desc">
                Selects values across multiple dimensions to create a smaller analytical subset.
              </p>
              <div className="olap-op-flow">
                <div>Status = SUSPICIOUS</div>
                <div style={{ color: '#818CF8', margin: '1px 0' }}>+</div>
                <div>Port = 80</div>
                <div style={{ color: '#818CF8', margin: '1px 0' }}>+</div>
                <div>Date = 2017-07-07</div>
              </div>
            </div>
            <button
              className={`olap-op-btn ${statusFilter === 'SUSPICIOUS' && portFilter === '80' ? 'active' : ''}`}
              onClick={handleApplyDice}
              style={{
                borderColor: statusFilter === 'SUSPICIOUS' && portFilter === '80' ? '#818CF8' : undefined,
                color: statusFilter === 'SUSPICIOUS' && portFilter === '80' ? '#818CF8' : undefined,
              }}
            >
              {statusFilter === 'SUSPICIOUS' && portFilter === '80' ? 'Dice Applied ✓' : 'Execute Dice (Suspicious + 80)'}
            </button>
          </div>

          {/* 3. ROLL-UP */}
          <div className="olap-operation-card">
            <div className="olap-op-top">
              <div className="olap-op-num" style={{ color: '#F59E0B' }}>OP 03 — ROLL-UP</div>
              <h4 className="olap-op-title">Dimension Roll-Up</h4>
              <p className="olap-op-desc">
                Combines detailed records into higher-level summaries.
              </p>
              <div className="olap-op-flow">
                <div>Traffic</div>
                <div style={{ color: '#F59E0B', margin: '1px 0' }}>↓</div>
                <div>Destination Port</div>
                <div style={{ color: '#F59E0B', margin: '1px 0' }}>↓</div>
                <div style={{ color: '#F59E0B', fontWeight: '700' }}>Aggregated Record Count</div>
              </div>
            </div>
            <button
              className="olap-op-btn"
              onClick={handleFocusRollup}
              style={{
                borderColor: '#F59E0B',
                color: '#F59E0B',
              }}
            >
              Inspect Date Roll-Up ↓
            </button>
          </div>

          {/* 4. DRILL-DOWN */}
          <div className="olap-operation-card">
            <div className="olap-op-top">
              <div className="olap-op-num" style={{ color: '#10B981' }}>OP 04 — DRILL-DOWN</div>
              <h4 className="olap-op-title">Granular Drill-Down</h4>
              <p className="olap-op-desc">
                Moves from an aggregated view to more detailed data.
              </p>
              <div className="olap-op-flow">
                <div>Destination Port</div>
                <div style={{ color: '#10B981', margin: '1px 0' }}>↓</div>
                <div>Traffic Status</div>
                <div style={{ color: '#10B981', margin: '1px 0' }}>↓</div>
                <div style={{ color: '#10B981', fontWeight: '700' }}>Detailed Records</div>
              </div>
            </div>
            <button
              className="olap-op-btn"
              onClick={() => handleSelectDrilldown(80)}
              style={{
                borderColor: '#10B981',
                color: '#10B981',
              }}
            >
              Drill Down (Port 80) ↓
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================================
          8. DRILL-DOWN DETAIL PANEL + STATUS COMPARISON (SPLIT GRID)
          ==================================================================== */}
      <div id="drilldown-panel" className="olap-detail-split-grid">
        {/* Left: DRILL-DOWN ANALYSIS */}
        <div className="olap-chart-card">
          <div className="olap-chart-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    color: 'var(--color-cyan)',
                    background: 'rgba(0, 217, 255, 0.1)',
                    border: '1px solid rgba(0, 217, 255, 0.25)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontFamily: 'JetBrains Mono',
                  }}
                >
                  TARGET
                </span>
                <h3 className="olap-chart-title">
                  DRILL-DOWN ANALYSIS
                </h3>
              </div>
              <p className="olap-chart-desc">
                Detailed flow measures for Destination Port {drilldownPort}{' '}
                {drilldownData?.service_name ? `(${drilldownData.service_name})` : ''}
              </p>
            </div>

            {/* Quick Port Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {[80, 53, 443, 8080, 22].map((p) => (
                <button
                  key={p}
                  onClick={() => handleSelectDrilldown(p)}
                  style={{
                    background: drilldownPort === p ? 'var(--color-cyan)' : 'var(--surface-elevated)',
                    color: drilldownPort === p ? '#000000' : 'var(--text-secondary)',
                    border: '1px solid #102430',
                    borderRadius: '3px',
                    padding: '3px 7px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    fontFamily: 'JetBrains Mono',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {drilldownLoading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={16} className="animate-spin" style={{ marginRight: '8px' }} />
              Querying drill-down details for Port {drilldownPort}...
            </div>
          ) : drilldownError ? (
            <div style={{ color: '#EF4444', fontSize: '0.82rem', padding: '16px' }}>
              {drilldownError}
            </div>
          ) : drilldownData ? (
            <div>
              {/* Primary Counts Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--surface-elevated)',
                  border: '1px solid #102430',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                    DESTINATION PORT
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-cyan)', fontFamily: 'JetBrains Mono' }}>
                    {drilldownData.destination_port}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.65rem', color: '#10B981', textTransform: 'uppercase', fontWeight: '700' }}>
                    NORMAL
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10B981', fontFamily: 'JetBrains Mono' }}>
                    {Number(drilldownData.normal_records || 0).toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.65rem', color: '#EF4444', textTransform: 'uppercase', fontWeight: '700' }}>
                    SUSPICIOUS
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#EF4444', fontFamily: 'JetBrains Mono' }}>
                    {Number(drilldownData.suspicious_records || 0).toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                    TOTAL RECORDS
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F5F7FA', fontFamily: 'JetBrains Mono' }}>
                    {Number(drilldownData.total_records || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Granular Flow Measures Grid */}
              <div className="olap-metrics-pill-grid">
                <div className="olap-metric-pill">
                  <span className="olap-metric-pill-label">AVG DURATION</span>
                  <span className="olap-metric-pill-val">
                    {drilldownData.avg_flow_duration >= 1000000
                      ? `${(drilldownData.avg_flow_duration / 1000000).toFixed(2)} s`
                      : `${Number(drilldownData.avg_flow_duration).toLocaleString()} μs`}
                  </span>
                  <span className="olap-metric-pill-sub">Flow duration</span>
                </div>

                <div className="olap-metric-pill">
                  <span className="olap-metric-pill-label">AVG PACKET LEN</span>
                  <span className="olap-metric-pill-val" style={{ color: '#F59E0B' }}>
                    {drilldownData.avg_packet_length} B
                  </span>
                  <span className="olap-metric-pill-sub">Mean payload length</span>
                </div>

                <div className="olap-metric-pill">
                  <span className="olap-metric-pill-label">FLOW THROUGHPUT</span>
                  <span className="olap-metric-pill-val">
                    {Number(drilldownData.avg_flow_bytes_per_sec).toLocaleString()}
                  </span>
                  <span className="olap-metric-pill-sub">Bytes / sec</span>
                </div>

                <div className="olap-metric-pill">
                  <span className="olap-metric-pill-label">PACKET RATE</span>
                  <span className="olap-metric-pill-val">
                    {Number(drilldownData.avg_flow_packets_per_sec).toLocaleString()}
                  </span>
                  <span className="olap-metric-pill-sub">Packets / sec</span>
                </div>

                <div className="olap-metric-pill">
                  <span className="olap-metric-pill-label">SUSPICIOUS RATIO</span>
                  <span className="olap-metric-pill-val" style={{ color: '#EF4444' }}>
                    {drilldownData.suspicious_percentage}%
                  </span>
                  <span className="olap-metric-pill-sub">Classification ratio</span>
                </div>

                <div className="olap-metric-pill">
                  <span className="olap-metric-pill-label">SERVICE APPLICATION</span>
                  <span className="olap-metric-pill-val" style={{ fontSize: '0.9rem', color: 'var(--color-cyan)' }}>
                    {drilldownData.service_name?.split(' ')[0] || 'Unknown'}
                  </span>
                  <span className="olap-metric-pill-sub">Assigned service</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              Select a destination port to view detailed traffic classification.
            </div>
          )}
        </div>

        {/* Right: STATUS COMPARISON TABLE */}
        <div className="olap-chart-card">
          <div className="olap-chart-header">
            <div>
              <h3 className="olap-chart-title">
                STATUS COMPARISON
              </h3>
              <p className="olap-chart-desc">
                Warehouse averages: NORMAL vs SUSPICIOUS
              </p>
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                fontFamily: 'JetBrains Mono',
              }}
            >
              dim_status
            </span>
          </div>

          {statusCompLoading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={16} className="animate-spin" style={{ marginRight: '8px' }} />
              Querying warehouse status averages...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="olap-status-table">
                <thead>
                  <tr>
                    <th>MEASURE</th>
                    <th style={{ color: '#10B981', textAlign: 'right' }}>NORMAL</th>
                    <th style={{ color: '#EF4444', textAlign: 'right' }}>SUSPICIOUS</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const normal = statusComparison?.find((s) => s.traffic_status === 'NORMAL') || {};
                    const susp = statusComparison?.find((s) => s.traffic_status === 'SUSPICIOUS') || {};

                    const measures = [
                      {
                        name: 'Record Count',
                        norm: Number(normal.record_count || 95096).toLocaleString(),
                        susp: Number(susp.record_count || 128016).toLocaleString(),
                      },
                      {
                        name: 'Percentage',
                        norm: `${normal.percentage || 42.62}%`,
                        susp: `${susp.percentage || 57.38}%`,
                      },
                      {
                        name: 'Flow Duration',
                        norm: `${Number(normal.avg_flow_duration || 0).toLocaleString()} μs`,
                        susp: `${Number(susp.avg_flow_duration || 0).toLocaleString()} μs`,
                      },
                      {
                        name: 'Fwd Packets',
                        norm: `${normal.avg_fwd_packets || 5.49}`,
                        susp: `${susp.avg_fwd_packets || 4.47}`,
                      },
                      {
                        name: 'Bwd Packets',
                        norm: `${normal.avg_bwd_packets || 6.44}`,
                        susp: `${susp.avg_bwd_packets || 3.26}`,
                      },
                      {
                        name: 'Packet Length',
                        norm: `${normal.avg_packet_length || 229.3} B`,
                        susp: `${susp.avg_packet_length || 736.94} B`,
                      },
                      {
                        name: 'Flow Bytes/sec',
                        norm: `${Number(normal.avg_flow_bytes_per_sec || 0).toLocaleString()} B/s`,
                        susp: `${Number(susp.avg_flow_bytes_per_sec || 0).toLocaleString()} B/s`,
                      },
                      {
                        name: 'Flow Packets/sec',
                        norm: `${Number(normal.avg_flow_packets_per_sec || 0).toLocaleString()} pkt/s`,
                        susp: `${Number(susp.avg_flow_packets_per_sec || 0).toLocaleString()} pkt/s`,
                      },
                    ];

                    return measures.map((m, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                          {m.name}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', color: '#10B981' }}>
                          {m.norm}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', color: '#EF4444' }}>
                          {m.susp}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          9. DATE ANALYSIS / ROLL-UP
          ==================================================================== */}
      <div id="rollup-section" className="olap-rollup-card">
        <div className="olap-chart-header">
          <div>
            <h3 className="olap-chart-title">
              DATE ANALYSIS & ROLL-UP HIERARCHY
            </h3>
            <p className="olap-chart-desc">
              Demonstrating dimensional roll-up from detailed traffic classification to Date Total and Grand Total.
            </p>
          </div>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: '700',
              fontFamily: 'JetBrains Mono',
              color: '#F59E0B',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              padding: '3px 8px',
              borderRadius: '4px',
            }}
          >
            SQL WITH ROLLUP
          </span>
        </div>

        {/* Academic Date Hierarchy Strip */}
        <div className="olap-hierarchy-flow">
          <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            DATE HIERARCHY:
          </span>
          <div className="olap-hierarchy-step">
            <span style={{ color: '#F59E0B' }}>YEAR</span>
            <span style={{ fontFamily: 'JetBrains Mono', color: '#F5F7FA' }}>2017</span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <div className="olap-hierarchy-step">
            <span style={{ color: '#F59E0B' }}>MONTH</span>
            <span style={{ fontFamily: 'JetBrains Mono', color: '#F5F7FA' }}>July</span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <div className="olap-hierarchy-step">
            <span style={{ color: '#F59E0B' }}>DAY</span>
            <span style={{ fontFamily: 'JetBrains Mono', color: '#F5F7FA' }}>7</span>
          </div>
          <span style={{ color: 'var(--text-muted)', marginLeft: '12px', fontSize: '0.72rem' }}>
            (Capture Date: 2017-07-07 — Single capture date in CICIDS2017 DWDM subset)
          </span>
        </div>

        {/* Roll-up Table */}
        {rollupLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={16} className="animate-spin" style={{ marginRight: '8px' }} />
            Loading roll-up data from MySQL warehouse...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="olap-rollup-table">
              <thead>
                <tr>
                  <th>LEVEL</th>
                  <th>CAPTURE DATE</th>
                  <th>TRAFFIC STATUS</th>
                  <th style={{ textAlign: 'right' }}>RECORD COUNT</th>
                  <th style={{ textAlign: 'right' }}>AVG FLOW DURATION</th>
                  <th style={{ textAlign: 'right' }}>AVG PACKET LENGTH</th>
                </tr>
              </thead>
              <tbody>
                {(rollupData?.data || []).map((row, idx) => {
                  const isGrandTotal = row.level === 'Grand Total';
                  const isDateTotal = row.level === 'Date Total';
                  return (
                    <tr
                      key={idx}
                      style={{
                        background: isGrandTotal
                          ? 'rgba(245, 158, 11, 0.08)'
                          : isDateTotal
                          ? 'rgba(0, 217, 255, 0.04)'
                          : 'transparent',
                        fontWeight: isGrandTotal || isDateTotal ? '700' : '500',
                      }}
                    >
                      <td>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontFamily: 'JetBrains Mono',
                            background: isGrandTotal
                              ? 'rgba(245, 158, 11, 0.2)'
                              : isDateTotal
                              ? 'rgba(0, 217, 255, 0.15)'
                              : 'var(--surface-elevated)',
                            color: isGrandTotal
                              ? '#F59E0B'
                              : isDateTotal
                              ? 'var(--color-cyan)'
                              : 'var(--text-secondary)',
                          }}
                        >
                          {row.level}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono', color: '#F5F7FA' }}>
                        {row.capture_date}
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: 'JetBrains Mono',
                            color:
                              row.traffic_status === 'NORMAL'
                                ? '#10B981'
                                : row.traffic_status === 'SUSPICIOUS'
                                ? '#EF4444'
                                : '#F59E0B',
                          }}
                        >
                          {row.traffic_status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', color: '#F5F7FA' }}>
                        {Number(row.record_count).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>
                        {Number(row.avg_flow_duration).toLocaleString()} μs
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', color: '#F59E0B' }}>
                        {row.avg_packet_length} B
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ====================================================================
          10. OLAP QUERY / SQL CARD + ACADEMIC EXPLANATION (SPLIT GRID)
          ==================================================================== */}
      <div className="olap-bottom-grid">
        {/* Left: OLAP QUERY */}
        <div className="olap-chart-card">
          <div className="olap-chart-header">
            <div>
              <h3 className="olap-chart-title">
                OLAP QUERY
              </h3>
              <p className="olap-chart-desc">
                Aggregation groups warehouse records by a selected dimension for analytical comparison.
              </p>
            </div>
            <button
              onClick={handleCopySql}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'var(--surface-elevated)',
                border: '1px solid #102430',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 10px',
                fontSize: '0.72rem',
                color: copiedSql ? '#10B981' : 'var(--text-secondary)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {copiedSql ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>

          <div
            style={{
              background: 'var(--surface-elevated)',
              border: '1px solid #102430',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.78rem',
              color: '#F5F7FA',
              lineHeight: 1.5,
              overflowX: 'auto',
            }}
          >
            <pre style={{ margin: 0 }}>{sampleSqlQuery}</pre>
          </div>
        </div>

        {/* Right: WHY OLAP ANALYSIS? */}
        <div className="olap-chart-card" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="olap-chart-header" style={{ marginBottom: '8px' }}>
              <h3 className="olap-chart-title">
                WHY OLAP ANALYSIS?
              </h3>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  color: 'var(--color-cyan)',
                  background: 'rgba(0, 217, 255, 0.08)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontFamily: 'JetBrains Mono',
                }}
              >
                DWDM CURRICULUM
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 14px 0' }}>
              OLAP helps analyze warehouse data from different dimensions. In this project, traffic records can be filtered by status, destination port and date. Operations such as slice, dice, roll-up and drill-down help convert stored records into useful summaries for analysis.
            </p>
          </div>

          {/* Academic Progression Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--surface-elevated)',
              border: '1px solid #102430',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: '0.72rem',
              fontFamily: 'JetBrains Mono',
              overflowX: 'auto',
              gap: '8px',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Warehouse</span>
            <span style={{ color: 'var(--color-cyan)' }}>→</span>
            <span style={{ color: 'var(--color-cyan)', fontWeight: '700' }}>OLAP Cube</span>
            <span style={{ color: 'var(--color-cyan)' }}>→</span>
            <span style={{ color: 'var(--text-muted)' }}>Aggregations</span>
            <span style={{ color: 'var(--color-cyan)' }}>→</span>
            <span style={{ color: '#10B981', fontWeight: '700' }}>Data Mining</span>
          </div>
        </div>
      </div>
    </div>
  );
}
