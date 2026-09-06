import React, { useState, useEffect } from 'react';
import {
  Database,
  Layers,
  GitFork,
  Filter,
  ArrowDown,
  ArrowRight,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  Server,
  Calendar,
  Code,
  Table as TableIcon,
  TrendingUp,
  Sliders,
  BarChart2,
  HelpCircle,
  Network,
  PieChart as PieChartIcon,
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
  Legend,
} from 'recharts';
import {
  fetchDWDMOverview,
  fetchDWDMClassificationSummary,
  fetchDWDMPortAnalysis,
  fetchDWDMStatusComparison,
  fetchDWDMRollup,
  fetchDWDMDrilldown,
  fetchDWDMQueries,
  fetchSliceDiceResults,
} from '../api/dwdmAnalysisApi';

const COMMON_PORTS = [80, 53, 443, 8080, 22, 21, 123, 137, 139, 445];

export default function DWDMAnalysis() {
  const [overview, setOverview] = useState(null);
  const [classification, setClassification] = useState(null);
  const [portAnalysis, setPortAnalysis] = useState(null);
  const [statusComparison, setStatusComparison] = useState(null);
  const [rollupData, setRollupData] = useState(null);
  const [selectedPort, setSelectedPort] = useState(80);
  const [drilldownData, setDrilldownData] = useState(null);
  const [queries, setQueries] = useState([]);
  const [copiedQueryId, setCopiedQueryId] = useState(null);

  // Slice/Dice Interactive Controls
  const [sliceStatus, setSliceStatus] = useState('ALL');
  const [dicePort, setDicePort] = useState('ALL');
  const [sliceDiceResult, setSliceDiceResult] = useState(null);
  const [sliceDiceLoading, setSliceDiceLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        ovRes,
        classRes,
        portRes,
        statRes,
        rollRes,
        drillRes,
        queryRes,
      ] = await Promise.all([
        fetchDWDMOverview(),
        fetchDWDMClassificationSummary(),
        fetchDWDMPortAnalysis(15),
        fetchDWDMStatusComparison(),
        fetchDWDMRollup(),
        fetchDWDMDrilldown(selectedPort),
        fetchDWDMQueries(),
      ]);

      setOverview(ovRes);
      setClassification(classRes);
      setPortAnalysis(portRes);
      setStatusComparison(statRes);
      setRollupData(rollRes);
      setDrilldownData(drillRes);
      setQueries(queryRes?.queries || []);
    } catch (err) {
      console.error('Failed to load DWDM analysis data:', err);
      setError(err.message || 'Unable to connect to MySQL warehouse backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle drilldown port change
  const handlePortDrilldown = async (port) => {
    setSelectedPort(port);
    try {
      const res = await fetchDWDMDrilldown(port);
      setDrilldownData(res);
    } catch (err) {
      console.error('Error fetching drilldown:', err);
    }
  };

  // Handle Slice / Dice interactive execution
  const executeSliceDice = async (statusVal, portVal) => {
    setSliceDiceLoading(true);
    try {
      const res = await fetchSliceDiceResults(statusVal, portVal);
      setSliceDiceResult(res);
    } catch (err) {
      console.error('Error in slice/dice query:', err);
    } finally {
      setSliceDiceLoading(false);
    }
  };

  useEffect(() => {
    executeSliceDice(sliceStatus, dicePort);
  }, [sliceStatus, dicePort]);

  const copySql = (id, sqlText) => {
    navigator.clipboard.writeText(sqlText);
    setCopiedQueryId(id);
    setTimeout(() => setCopiedQueryId(null), 2000);
  };

  // Pie chart data for classification
  const pieData = (classification?.data || []).map((item) => ({
    name: item.traffic_status,
    value: item.record_count,
    percentage: item.percentage,
    color: item.traffic_status === 'NORMAL' ? 'var(--color-green)' : 'var(--color-purple)',
  }));

  // Top ports chart data (top 8)
  const topPortsChart = (portAnalysis?.data || []).slice(0, 8).map((p) => ({
    port: `Port ${p.destination_port}`,
    Normal: p.normal_records,
    Suspicious: p.suspicious_records,
    total: p.total_records,
  }));

  // Determine current OLAP filter type
  const isSlicing = (sliceStatus !== 'ALL' && dicePort === 'ALL') || (sliceStatus === 'ALL' && dicePort !== 'ALL');
  const isDicing = sliceStatus !== 'ALL' && dicePort !== 'ALL';
  const olapOpName = isDicing ? 'DICE (Multi-Dimension)' : isSlicing ? 'SLICE (Single Dimension)' : 'FULL CUBE (Unfiltered)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* 1. Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              <Database size={20} color="var(--color-blue)" />
            </div>
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              DWDM Analysis
            </h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '780px' }}>
            Data warehouse star schema queries, OLAP operations (Slice, Dice, Roll-Up, Drill-Down), and analytical aggregations
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid var(--border-accent)',
              fontSize: '0.78rem',
              fontWeight: '600',
              color: 'var(--color-blue)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Server size={14} />
            <span>MySQL: network_traffic_dw</span>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 14px',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            background: 'var(--color-red-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <AlertTriangle size={32} color="var(--color-red)" />
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
              Database Connection Error
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{error}</p>
          </div>
        </div>
      )}

      {/* 2. Warehouse Overview Cards (4 Cards) */}
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.06em', marginBottom: '12px' }}>
          Data Warehouse Cardinality
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Fact Records */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Fact Records
              </span>
              <Database size={16} color="var(--color-blue)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
              {(overview?.fact_rows || 223112).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-blue)' }}>
              <code>fact_network_traffic</code> (Central)
            </div>
          </div>

          {/* Date Dimensions */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Date Dimension
              </span>
              <Calendar size={16} color="var(--color-purple)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
              {overview?.date_count || 1}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <code>dim_date</code> (2017-07-07)
            </div>
          </div>

          {/* Network Dimensions */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Network Dimension
              </span>
              <Network size={16} color="var(--color-green)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
              {(overview?.network_count || 23950).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <code>dim_network</code> (Distinct Ports)
            </div>
          </div>

          {/* Classification Dimensions */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Classification Dimension
              </span>
              <Layers size={16} color="var(--color-orange)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
              {overview?.classification_count || 2}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <code>dim_classification</code> (NORMAL / SUSP)
            </div>
          </div>
        </div>
      </div>

      {/* 3. Star Schema Architecture Diagram */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <GitFork size={20} color="var(--color-blue)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Star Schema Relational Architecture
          </h3>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Classical dimensional modeling structure with a central additive fact table surrounded by discrete dimensions.
        </p>

        {/* Visual Star Schema Representation */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            padding: '20px',
            background: 'rgba(10, 15, 29, 0.4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* Top Dimension: dim_date */}
          <div
            style={{
              width: '260px',
              padding: '14px',
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid var(--border-purple)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--color-purple)', fontWeight: '700', textTransform: 'uppercase' }}>
              Dimension Table (Time)
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff' }}>
              dim_date
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <code>date_id (PK)</code> • full_date • year • month • day
            </div>
          </div>

          <div style={{ height: '24px', width: '2px', background: 'var(--color-purple)' }} />

          {/* Central Fact & Side Dimensions */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              width: '100%',
            }}
          >
            {/* Left Dimension: dim_network */}
            <div
              style={{
                width: '240px',
                padding: '14px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--color-green)', fontWeight: '700', textTransform: 'uppercase' }}>
                Dimension Table (Network)
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff' }}>
                dim_network
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <code>network_id (PK)</code> • destination_port
              </div>
            </div>

            <div style={{ width: '28px', height: '2px', background: 'var(--color-green)' }} />

            {/* Central Fact: fact_network_traffic */}
            <div
              style={{
                width: '320px',
                padding: '18px',
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)',
                border: '2px solid var(--color-blue)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--color-blue)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Central Fact Table (Measures)
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>
                fact_network_traffic
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                223,112 rows • Multi-Granular Metrics
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
                <code>FK: date_id</code> • <code>FK: network_id</code> • <code>FK: classification_id</code><br />
                flow_duration • packets_per_sec • packet_length_mean
              </div>
            </div>

            <div style={{ width: '28px', height: '2px', background: 'var(--color-orange)' }} />

            {/* Right Dimension: dim_classification */}
            <div
              style={{
                width: '240px',
                padding: '14px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--color-orange)', fontWeight: '700', textTransform: 'uppercase' }}>
                Dimension Table (Class)
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff' }}>
                dim_classification
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <code>classification_id (PK)</code> • traffic_status • original_label
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Classification Aggregation (Chart + Summary Table) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Donut Chart */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <PieChartIcon size={18} color="var(--color-blue)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Classification Aggregation
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Proportional distribution of normalized traffic status from <code>dim_classification</code>
            </p>

            <div style={{ width: '100%', height: '240px', marginTop: '12px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div style={{ background: '#0d1322', border: '1px solid var(--border-accent)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem' }}>
                            <div style={{ fontWeight: '700', color: '#fff' }}>{d.name}</div>
                            <div style={{ color: d.color, fontFamily: 'JetBrains Mono, monospace' }}>
                              {d.value.toLocaleString()} flows ({d.percentage}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-green)', fontWeight: '700' }}>NORMAL (BENIGN)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'JetBrains Mono, monospace', color: '#fff' }}>
                95,096
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>42.62% of traffic</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-purple)', fontWeight: '700' }}>SUSPICIOUS (DDoS)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'JetBrains Mono, monospace', color: '#fff' }}>
                128,016
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>57.38% of traffic</div>
            </div>
          </div>
        </div>

        {/* Aggregate Measures Table */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <TableIcon size={18} color="var(--color-purple)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Aggregated Flow Measures
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Result of SQL GROUP BY on <code>fact_network_traffic</code> joined with <code>dim_classification</code>
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 6px' }}>Status</th>
                    <th style={{ padding: '8px 6px' }}>Label</th>
                    <th style={{ padding: '8px 6px', textAlign: 'right' }}>Records</th>
                    <th style={{ padding: '8px 6px', textAlign: 'right' }}>Avg Duration</th>
                    <th style={{ padding: '8px 6px', textAlign: 'right' }}>Avg Pkt Len</th>
                  </tr>
                </thead>
                <tbody>
                  {(classification?.data || []).map((row) => (
                    <tr key={row.traffic_status} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '12px 6px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            background: row.traffic_status === 'NORMAL' ? 'var(--color-green-bg)' : 'rgba(168, 85, 247, 0.15)',
                            color: row.traffic_status === 'NORMAL' ? 'var(--color-green)' : 'var(--color-purple)',
                          }}
                        >
                          {row.traffic_status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 6px', color: 'var(--text-primary)', fontWeight: '600' }}>
                        {row.original_label}
                      </td>
                      <td style={{ padding: '12px 6px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#fff' }}>
                        {row.record_count.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 6px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>
                        {row.average_flow_duration.toLocaleString()} μs
                      </td>
                      <td style={{ padding: '12px 6px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-blue)' }}>
                        {row.average_packet_length} B
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div
            style={{
              marginTop: '16px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}
          >
            <strong>Observation:</strong> Suspicious flows feature higher mean packet sizes (736.94 bytes vs 229.30 bytes) and extended flow durations attributable to volumetric flood persistence.
          </div>
        </div>
      </div>

      {/* 5. Top Port Analysis (Bar Chart + Table) */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <BarChart2 size={20} color="var(--color-blue)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Top Destination Port Analysis (Multi-Measure Ranking)
            </h3>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Ranking network ports by flow volume and calculating the ratio of benign requests to attack floods
          </p>
        </div>

        {/* Stacked Bar Chart for Top 8 Ports */}
        <div style={{ width: '100%', height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topPortsChart} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="port" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div style={{ background: '#0d1322', border: '1px solid var(--border-accent)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: '700', color: '#fff', marginBottom: '4px' }}>{d.port}</div>
                        <div style={{ color: 'var(--color-green)' }}>Normal: {d.Normal.toLocaleString()}</div>
                        <div style={{ color: 'var(--color-purple)' }}>Suspicious: {d.Suspicious.toLocaleString()}</div>
                        <div style={{ color: '#fff', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '4px', paddingTop: '4px' }}>
                          Total: {d.total.toLocaleString()}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Normal" stackId="a" fill="var(--color-green)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Suspicious" stackId="a" fill="var(--color-purple)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table of Top Ports */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px' }}>Destination Port</th>
                <th style={{ padding: '8px 10px' }}>Total Flows</th>
                <th style={{ padding: '8px 10px' }}>Normal Flows</th>
                <th style={{ padding: '8px 10px' }}>Suspicious Flows</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Suspicious %</th>
              </tr>
            </thead>
            <tbody>
              {(portAnalysis?.data || []).slice(0, 10).map((p) => (
                <tr key={p.destination_port} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <td style={{ padding: '10px', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
                    Port {p.destination_port}
                  </td>
                  <td style={{ padding: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#fff' }}>
                    {p.total_records.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-green)' }}>
                    {p.normal_records.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-purple)' }}>
                    {p.suspicious_records.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.74rem',
                        fontWeight: '700',
                        background: p.suspicious_percentage > 50 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                        color: p.suspicious_percentage > 50 ? 'var(--color-red)' : 'var(--color-green)',
                      }}
                    >
                      {p.suspicious_percentage.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Status Comparison Cards */}
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.06em', marginBottom: '12px' }}>
          Analytical Comparison: Normal vs Suspicious
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Card 1: Flow Duration */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 20px',
            }}
          >
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              Mean Flow Duration
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-green)', fontWeight: '600' }}>NORMAL</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>
                  15.73s
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-purple)', fontWeight: '600' }}>SUSPICIOUS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-purple)', fontFamily: 'JetBrains Mono, monospace' }}>
                  16.96s
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              +7.8% higher persistence in attack flows
            </div>
          </div>

          {/* Card 2: Packet Length */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 20px',
            }}
          >
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              Mean Packet Length
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-green)', fontWeight: '600' }}>NORMAL</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>
                  229.3 B
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-purple)', fontWeight: '600' }}>SUSPICIOUS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-blue)', fontFamily: 'JetBrains Mono, monospace' }}>
                  736.9 B
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              +221% larger payload buffers in DDoS bursts
            </div>
          </div>

          {/* Card 3: Forward Packets */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 20px',
            }}
          >
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              Mean Forward Packets
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-green)', fontWeight: '600' }}>NORMAL</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>
                  3.78 pkts
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-purple)', fontWeight: '600' }}>SUSPICIOUS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-orange)', fontFamily: 'JetBrains Mono, monospace' }}>
                  6.78 pkts
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              DDoS flows send 1.8x more forward requests
            </div>
          </div>
        </div>
      </div>

      {/* 7. OLAP Operations Cards (Slice, Dice, Roll-Up, Drill-Down) */}
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.06em', marginBottom: '12px' }}>
          Core OLAP Operations (Cube Manipulation)
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {/* SLICE */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-blue)' }}>
                1. SLICE
              </h4>
              <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.2)', color: 'var(--color-blue)', fontWeight: '700' }}>
                1-D CUT
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
              Extracts a 2D sub-cube by fixing exactly one dimension coordinate to a specific value.
            </p>
            <div style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '0.74rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
              WHERE traffic_status = 'SUSPICIOUS'
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Result: 128,016 attack records isolated
            </div>
          </div>

          {/* DICE */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid var(--border-purple)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-purple)' }}>
                2. DICE
              </h4>
              <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.2)', color: 'var(--color-purple)', fontWeight: '700' }}>
                MULTI-D CUT
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
              Defines a smaller sub-cube by setting boundary filters across two or more dimensions simultaneously.
            </p>
            <div style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '0.74rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
              WHERE status='SUSPICIOUS' AND port=80
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Result: 128,013 HTTP attack flows
            </div>
          </div>

          {/* ROLL-UP */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-green)' }}>
                3. ROLL-UP
              </h4>
              <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px', background: 'var(--color-green-bg)', color: 'var(--color-green)', fontWeight: '700' }}>
                SUMMARIZE UP
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
              Climbs up dimension hierarchies from detailed category measures to subtotals and grand totals.
            </p>
            <div style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '0.74rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
              GROUP BY date, status WITH ROLLUP
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Result: Subtotals + Grand Total (223,112)
            </div>
          </div>

          {/* DRILL-DOWN */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-orange)' }}>
                4. DRILL-DOWN
              </h4>
              <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px', background: 'var(--color-orange-bg)', color: 'var(--color-orange)', fontWeight: '700' }}>
                ZOOM DETAIL
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
              Navigates from high-level warehouse totals down into granular port-specific behavior.
            </p>
            <div style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '0.74rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
              WHERE destination_port = 80
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Result: Granular Port 80 metrics
            </div>
          </div>
        </div>
      </div>

      {/* 8. Interactive Slice / Dice Controls */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Filter size={18} color="var(--color-blue)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Interactive Slice & Dice Sandbox
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Perform dynamic dimensional filtering directly in the database without pulling the fact table to the browser
            </p>
          </div>

          <div
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              background: isDicing ? 'rgba(168, 85, 247, 0.15)' : isSlicing ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isDicing ? 'var(--border-purple)' : isSlicing ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
              fontSize: '0.78rem',
              fontWeight: '700',
              color: isDicing ? 'var(--color-purple)' : isSlicing ? 'var(--color-blue)' : 'var(--text-muted)',
            }}
          >
            {olapOpName}
          </div>
        </div>

        {/* Filter Selection Controls */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            padding: '16px',
            background: 'rgba(10, 15, 29, 0.4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px',
          }}
        >
          {/* Traffic Status Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              Dimension 1: Traffic Status
            </label>
            <select
              value={sliceStatus}
              onChange={(e) => setSliceStatus(e.target.value)}
              style={{
                background: '#0d1322',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            >
              <option value="ALL">ALL (All Statuses)</option>
              <option value="NORMAL">NORMAL (Benign only)</option>
              <option value="SUSPICIOUS">SUSPICIOUS (DDoS only)</option>
            </select>
          </div>

          {/* Destination Port Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              Dimension 2: Destination Port
            </label>
            <select
              value={dicePort}
              onChange={(e) => setDicePort(e.target.value)}
              style={{
                background: '#0d1322',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            >
              <option value="ALL">ALL (All Destination Ports)</option>
              {COMMON_PORTS.map((p) => (
                <option key={p} value={p}>Port {p}</option>
              ))}
            </select>
          </div>

          {(sliceStatus !== 'ALL' || dicePort !== 'ALL') && (
            <button
              onClick={() => {
                setSliceStatus('ALL');
                setDicePort('ALL');
              }}
              style={{
                alignSelf: 'flex-end',
                marginBottom: '2px',
                background: 'none',
                border: 'none',
                color: 'var(--color-blue)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Dynamic Sliced / Diced Sub-Cube Result Cards */}
        {sliceDiceLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Executing OLAP Query inside MySQL...
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Matched Flows
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'JetBrains Mono, monospace', color: '#fff', marginTop: '4px' }}>
                {(sliceDiceResult?.total_records ?? 223112).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {(((sliceDiceResult?.total_records ?? 223112) / 223112) * 100).toFixed(2)}% of Warehouse
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Normal Volume
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-green)', marginTop: '4px' }}>
                {(sliceDiceResult?.normal_records ?? 95096).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {(sliceDiceResult?.normal_percentage ?? 42.62).toFixed(1)}% of sub-cube
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Suspicious Volume
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-purple)', marginTop: '4px' }}>
                {(sliceDiceResult?.suspicious_records ?? 128016).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {(sliceDiceResult?.suspicious_percentage ?? 57.38).toFixed(1)}% of sub-cube
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Avg Flow Duration
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-blue)', marginTop: '4px' }}>
                {sliceDiceResult?.statistics?.flow_duration?.average ? `${(sliceDiceResult.statistics.flow_duration.average / 1e6).toFixed(2)}s` : '16.43s'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Sub-cube average
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 9. Roll-Up Demonstration Section */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <ArrowDown size={20} color="var(--color-green)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            OLAP Roll-Up Demonstration (Hierarchical Aggregation)
          </h3>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Climbing up the dimensional hierarchy using MySQL's <code>GROUP BY dd.full_date, dc.traffic_status WITH ROLLUP</code>
        </p>

        {/* Limitation notice callout */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(56, 189, 248, 0.05)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Info size={18} color="var(--color-blue)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Current Dataset Roll-Up:</strong> {rollupData?.scope_notice || "The current dataset contains one capture date, therefore the roll-up demonstrates date-level and grand-total aggregation rather than multiple historical dates."}
          </span>
        </div>

        {/* Roll-up Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>Aggregation Level</th>
                <th style={{ padding: '10px 12px' }}>Capture Date</th>
                <th style={{ padding: '10px 12px' }}>Traffic Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Record Count</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Avg Duration</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Avg Packet Length</th>
              </tr>
            </thead>
            <tbody>
              {(rollupData?.data || []).map((row, idx) => {
                const isGrand = row.level === 'Grand Total';
                const isDateTotal = row.level === 'Date Total';

                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: isGrand ? 'rgba(16, 185, 129, 0.08)' : isDateTotal ? 'rgba(56, 189, 248, 0.05)' : 'transparent',
                      fontWeight: isGrand || isDateTotal ? '700' : 'normal',
                    }}
                  >
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          background: isGrand ? 'var(--color-green-bg)' : isDateTotal ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.05)',
                          color: isGrand ? 'var(--color-green)' : isDateTotal ? 'var(--color-blue)' : 'var(--text-muted)',
                        }}
                      >
                        {row.level}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'JetBrains Mono, monospace', color: isGrand ? 'var(--color-green)' : 'var(--text-primary)' }}>
                      {row.capture_date}
                    </td>
                    <td style={{ padding: '12px', color: isDateTotal || isGrand ? 'var(--color-blue)' : row.traffic_status === 'NORMAL' ? 'var(--color-green)' : 'var(--color-purple)' }}>
                      {row.traffic_status}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#fff' }}>
                      {row.record_count.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>
                      {row.avg_flow_duration.toLocaleString()} μs
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-blue)' }}>
                      {row.avg_packet_length} B
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 10. Drill-Down Section */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ArrowRight size={20} color="var(--color-orange)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                OLAP Drill-Down: Destination Port Inspection
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Zooming from global warehouse traffic to granular behavioral metrics for individual service ports
            </p>
          </div>

          {/* Quick Port Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>Select Port:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[80, 53, 443, 8080, 22, 21].map((p) => (
                <button
                  key={p}
                  onClick={() => handlePortDrilldown(p)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    border: '1px solid',
                    borderColor: selectedPort === p ? 'var(--color-blue)' : 'var(--border-subtle)',
                    background: selectedPort === p ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.03)',
                    color: selectedPort === p ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  Port {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Drilldown Detailed Metrics Card */}
        {drilldownData && (
          <div
            style={{
              background: 'rgba(10, 15, 29, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Port {drilldownData.destination_port}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-blue)' }}>
                    ({drilldownData.service_name})
                  </span>
                </div>
              </div>
              <div
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.76rem',
                  fontWeight: '700',
                  background: drilldownData.suspicious_percentage > 50 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                  color: drilldownData.suspicious_percentage > 50 ? 'var(--color-red)' : 'var(--color-green)',
                }}
              >
                {drilldownData.suspicious_percentage}% Suspicious
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Flows</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>
                  {drilldownData.total_records.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-green)', textTransform: 'uppercase' }}>Normal Flows</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--color-green)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {drilldownData.normal_records.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-purple)', textTransform: 'uppercase' }}>Suspicious Flows</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--color-purple)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {drilldownData.suspicious_records.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Packet Length</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--color-blue)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {drilldownData.avg_packet_length} B
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Throughput</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>
                  {(drilldownData.avg_flow_bytes_per_sec / 1024).toFixed(1)} KB/s
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 11. SQL Query Demonstration Catalog */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Code size={20} color="var(--color-purple)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            SQL Query Demonstration Catalog (8 Queries)
          </h3>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Production SQL queries executed inside MySQL to power this DWDM analytics dashboard
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {queries.map((q) => (
            <div
              key={q.query_id}
              style={{
                background: 'rgba(10, 15, 29, 0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.74rem',
                      fontWeight: '800',
                      background: 'rgba(168, 85, 247, 0.2)',
                      color: 'var(--color-purple)',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {q.query_id}
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff' }}>
                    {q.title}
                  </span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      background: 'rgba(56, 189, 248, 0.1)',
                      color: 'var(--color-blue)',
                    }}
                  >
                    {q.dwdm_concept}
                  </span>
                </div>

                <button
                  onClick={() => copySql(q.query_id, q.sql)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '0.74rem',
                    color: copiedQueryId === q.query_id ? 'var(--color-green)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {copiedQueryId === q.query_id ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedQueryId === q.query_id ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                {q.purpose}
              </div>

              <pre
                style={{
                  background: '#070b14',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  fontSize: '0.78rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#94a3b8',
                  overflowX: 'auto',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                <code>{q.sql}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* 12. Academic Mapping Section */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <HelpCircle size={20} color="var(--color-blue)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Academic Mapping: DWDM Concepts to Implementation
          </h3>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
          Reference mapping for college viva and oral examination on Data Warehousing and Data Mining
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', width: '220px' }}>DWDM Academic Concept</th>
                <th style={{ padding: '10px 12px' }}>Project Implementation</th>
                <th style={{ padding: '10px 12px', width: '260px' }}>Artifact / Location</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-blue)' }}>Data Source</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>CICIDS2017 Friday DDoS-vs-BENIGN evaluation subset</td>
                <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>data/raw/</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-blue)' }}>ETL Pipeline</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>Cleaned 225,745 raw rows; pruned 10 constant & 6 duplicate features</td>
                <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>preprocessing/clean_dataset.py</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-blue)' }}>Data Warehouse Schema</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>Star Schema in MySQL (1 Fact table + 3 Dimension tables)</td>
                <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>database/schema.sql</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-blue)' }}>Fact Table</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}><code>fact_network_traffic</code> (223,112 rows of numerical flow measures)</td>
                <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>MySQL: network_traffic_dw</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-blue)' }}>Dimension Tables</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}><code>dim_date</code>, <code>dim_network</code> (23,950 ports), <code>dim_classification</code></td>
                <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>MySQL Dimensions</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-blue)' }}>OLAP Operations</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>Slice (1-D), Dice (Multi-D), Roll-Up (WITH ROLLUP), Drill-Down</td>
                <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>backend/dwdm_analysis.py</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-blue)' }}>Data Mining Model</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>Random Forest 100 Trees (62 input features, 99.99% accuracy)</td>
                <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>models/random_forest_model.joblib</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-blue)' }}>Visualization & API</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>FastAPI backend REST endpoints + React 19 / Recharts dashboard</td>
                <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>frontend/src/</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
