import React, { useState, useEffect } from 'react';
import {
  Database,
  Server,
  Layers,
  Network,
  Tag,
  Calendar,
  Filter,
  ArrowRightLeft,
  Copy,
  Check,
  ChevronRight,
  Info,
  RefreshCw,
  ArrowRight,
  Key,
  Table as TableIcon,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import {
  PageHeader,
  SectionHeader,
  DataTable,
  StatusBadge,
  LoadingState,
  ErrorState,
  Button,
} from '../components/ui';
import { useAppContext } from '../context/AppContext';
import {
  fetchDWDMOverview,
  fetchDWDMClassificationSummary,
  fetchDWDMPortAnalysis,
} from '../api/dwdmAnalysisApi';
import { fetchTrafficAnalytics } from '../api/trafficAnalyticsApi';

const PORT_SERVICES = {
  80: 'HTTP (World Wide Web)',
  53: 'DNS (Domain Name System)',
  443: 'HTTPS (SSL/TLS Encrypted)',
  8080: 'HTTP-Alt / Proxy',
  123: 'NTP (Network Time Protocol)',
  22: 'SSH (Secure Shell)',
  389: 'LDAP (Directory Access)',
  88: 'Kerberos Authentication',
  21: 'FTP (File Transfer)',
  137: 'NetBIOS Name Service',
  465: 'SMTPS (Secure Mail)',
  139: 'NetBIOS Session Service',
  3268: 'MS Global Catalog',
  0: 'Reserved / ICMP Control',
  445: 'SMB (Server Message Block)',
};

export default function DataWarehouse() {
  const { setActiveTab, setFilters } = useAppContext();

  // Overview and dimension data
  const [overview, setOverview] = useState(null);
  const [classification, setClassification] = useState(null);
  const [topPorts, setTopPorts] = useState([]);
  const [factPreview, setFactPreview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interactive selected table in schema / tables section
  const [selectedTable, setSelectedTable] = useState('fact_network_traffic');

  // Interactive ETL stage
  const [activeEtlStage, setActiveEtlStage] = useState('extract');

  // Interactive field mapping inspection
  const [selectedMapping, setSelectedMapping] = useState(null);

  // SQL Copy feedback
  const [copiedSql, setCopiedSql] = useState(false);

  // Load live data from MySQL Data Warehouse
  const loadWarehouseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovRes, classRes, portsRes, previewRes] = await Promise.all([
        fetchDWDMOverview(),
        fetchDWDMClassificationSummary(),
        fetchDWDMPortAnalysis(8),
        fetchTrafficAnalytics({ page: 1, page_size: 5 }),
      ]);
      setOverview(ovRes);
      setClassification(classRes);
      setTopPorts(portsRes?.data || []);
      setFactPreview(previewRes?.records || []);
    } catch (err) {
      console.error('Failed to load data warehouse metadata:', err);
      setError('Unable to load warehouse structure from MySQL database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouseData();
  }, []);

  const sqlQueryText = `SELECT 
    dc.traffic_status,
    COUNT(*) AS total_records,
    ROUND(AVG(ft.flow_duration), 2) AS avg_duration,
    ROUND(AVG(ft.packet_length_mean), 2) AS avg_packet_length
FROM fact_network_traffic ft
JOIN dim_classification dc ON ft.classification_id = dc.classification_id
GROUP BY dc.traffic_status;`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlQueryText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Navigate to Traffic Explorer
  const handleExploreRecords = () => {
    setActiveTab('Traffic Explorer');
  };

  const factRows = overview?.fact_rows ?? 223112;
  const networkCount = overview?.network_count ?? 23950;
  const dateCount = overview?.date_count ?? 1;
  const classCount = overview?.classification_count ?? 2;

  // Fact table preview columns
  const factPreviewColumns = [
    {
      key: 'traffic_id',
      header: 'Traffic ID',
      render: (val) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--color-cyan)' }}>
          #{val}
        </span>
      ),
    },
    {
      key: 'destination_port',
      header: 'Dest Port',
      render: (val) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
          Port {val}
        </span>
      ),
    },
    {
      key: 'traffic_status',
      header: 'Status',
      align: 'center',
      render: (val) => <StatusBadge status={val} size="sm" />,
    },
    {
      key: 'flow_duration',
      header: 'Flow Duration',
      align: 'right',
      render: (val) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>
          {Number(val || 0).toLocaleString()} µs
        </span>
      ),
    },
    {
      key: 'total_fwd_packets',
      header: 'Fwd Packets',
      align: 'right',
      render: (val) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {Number(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'total_backward_packets',
      header: 'Bwd Packets',
      align: 'right',
      render: (val) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {Number(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'flow_bytes_per_sec',
      header: 'Flow Bytes/s',
      align: 'right',
      render: (val) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {Number(val || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Page Header */}
      <PageHeader
        title="DATA WAREHOUSE"
        description="Explore the Star Schema and the structure of the network traffic Data Warehouse."
        badge={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-info">MySQL: network_traffic_dw</span>
            <span className="badge badge-neutral">Star Schema</span>
            <span className="badge badge-neutral">Single-Hop Dimensional Model</span>
          </div>
        }
      />

      {/* Error Alert */}
      {error && (
        <ErrorState
          title="Warehouse Metadata Unavailable"
          message={error}
          onRetry={loadWarehouseData}
        />
      )}

      {/* 2. Compact Warehouse Summary Cards */}
      <div className="grid-kpi">
        <div className="card-kpi">
          <div className="kpi-label">FACT TABLE</div>
          <div
            className="kpi-value cyan"
            style={{ fontSize: '1.25rem', fontFamily: 'JetBrains Mono, monospace' }}
          >
            fact_network_traffic
          </div>
          <div className="kpi-subtext">Central measurable flow records</div>
        </div>

        <div className="card-kpi">
          <div className="kpi-label">DIMENSIONS</div>
          <div className="kpi-value purple">
            {loading ? '—' : 3}
          </div>
          <div className="kpi-subtext">Date • Network • Classification</div>
        </div>

        <div className="card-kpi">
          <div className="kpi-label">WAREHOUSE RECORDS</div>
          <div className="kpi-value cyan">
            {loading ? '—' : factRows.toLocaleString()}
          </div>
          <div className="kpi-subtext">Grain: 1 individual flow event</div>
        </div>

        <div className="card-kpi">
          <div className="kpi-label">NETWORK MEMBERS</div>
          <div className="kpi-value amber" style={{ color: '#F59E0B' }}>
            {loading ? '—' : networkCount.toLocaleString()}
          </div>
          <div className="kpi-subtext">Distinct destination port entities</div>
        </div>
      </div>

      {/* 3. Interactive Star Schema Diagram */}
      <div
        className="analytical-card"
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-cyan)',
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                INTERACTIVE STAR SCHEMA
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Click any table to inspect its schema and live records
              </span>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-heading)', margin: 0 }}>
              Dimensional Star Schema Architecture
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
              Surrounding dimension tables join directly to the central fact table via surrogate foreign keys.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--color-cyan)' }} />
              <span>Fact Table (Grain: 1 flow)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#A855F7' }} />
              <span>Dimension (Descriptive)</span>
            </div>
          </div>
        </div>

        {/* Visual Interactive Schema Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 1fr) 60px minmax(320px, 1.3fr)',
            gap: '12px',
            alignItems: 'center',
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            overflowX: 'auto',
          }}
        >
          {/* Left Column: Dimensions (DIM_DATE, DIM_NETWORK, DIM_CLASSIFICATION) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* DIM_DATE */}
            <div
              onClick={() => setSelectedTable('dim_date')}
              style={{
                background: selectedTable === 'dim_date' ? 'rgba(168, 85, 247, 0.14)' : 'var(--surface-card)',
                border: `1px solid ${selectedTable === 'dim_date' ? '#A855F7' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: selectedTable === 'dim_date' ? '0 0 12px rgba(168, 85, 247, 0.25)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Calendar size={14} color="#A855F7" />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    dim_date
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#A855F7', background: 'rgba(168, 85, 247, 0.12)', padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>
                  1 ROW
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                <span style={{ color: '#F59E0B', fontWeight: 600 }}>date_id (PK)</span> • full_date • year • month • day • day_of_week
              </div>
            </div>

            {/* DIM_NETWORK */}
            <div
              onClick={() => setSelectedTable('dim_network')}
              style={{
                background: selectedTable === 'dim_network' ? 'rgba(168, 85, 247, 0.14)' : 'var(--surface-card)',
                border: `1px solid ${selectedTable === 'dim_network' ? '#A855F7' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: selectedTable === 'dim_network' ? '0 0 12px rgba(168, 85, 247, 0.25)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Network size={14} color="#A855F7" />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    dim_network
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#A855F7', background: 'rgba(168, 85, 247, 0.12)', padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>
                  {networkCount.toLocaleString()} ROWS
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                <span style={{ color: '#F59E0B', fontWeight: 600 }}>network_id (PK)</span> • destination_port
              </div>
            </div>

            {/* DIM_CLASSIFICATION */}
            <div
              onClick={() => setSelectedTable('dim_classification')}
              style={{
                background: selectedTable === 'dim_classification' ? 'rgba(168, 85, 247, 0.14)' : 'var(--surface-card)',
                border: `1px solid ${selectedTable === 'dim_classification' ? '#A855F7' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: selectedTable === 'dim_classification' ? '0 0 12px rgba(168, 85, 247, 0.25)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Tag size={14} color="#A855F7" />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    dim_classification
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#A855F7', background: 'rgba(168, 85, 247, 0.12)', padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>
                  2 ROWS
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                <span style={{ color: '#F59E0B', fontWeight: 600 }}>classification_id (PK)</span> • traffic_status • original_label
              </div>
            </div>
          </div>

          {/* Center Connector Lines */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%', alignItems: 'center', gap: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'JetBrains Mono' }}>
              <span>1</span>
              <span style={{ color: selectedTable === 'dim_date' ? '#A855F7' : 'var(--border-subtle)' }}>──</span>
              <span>N</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'JetBrains Mono' }}>
              <span>1</span>
              <span style={{ color: selectedTable === 'dim_network' ? '#A855F7' : 'var(--border-subtle)' }}>──</span>
              <span>N</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'JetBrains Mono' }}>
              <span>1</span>
              <span style={{ color: selectedTable === 'dim_classification' ? '#A855F7' : 'var(--border-subtle)' }}>──</span>
              <span>N</span>
            </div>
          </div>

          {/* Right Column: Central Fact Table */}
          <div
            onClick={() => setSelectedTable('fact_network_traffic')}
            style={{
              background: selectedTable === 'fact_network_traffic' ? 'rgba(6, 182, 212, 0.1)' : 'var(--surface-card)',
              border: `1px solid ${selectedTable === 'fact_network_traffic' ? 'var(--color-cyan)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: selectedTable === 'fact_network_traffic' ? '0 0 16px rgba(6, 182, 212, 0.25)' : 'none',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '0.66rem', color: 'var(--color-cyan)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  CENTRAL FACT TABLE
                </span>
                <h4 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', fontWeight: 800, color: 'var(--color-heading)', margin: '2px 0 0' }}>
                  fact_network_traffic
                </h4>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-cyan)', background: 'rgba(6, 182, 212, 0.12)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                {factRows.toLocaleString()} ROWS
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.76rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: 'var(--surface-elevated)', borderRadius: '3px' }}>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#F59E0B', fontWeight: 600 }}>traffic_id</span>
                <span style={{ fontSize: '0.68rem', color: '#F59E0B' }}>PRIMARY KEY (PK)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 8px', color: 'var(--color-cyan)', fontFamily: 'JetBrains Mono' }}>
                  <span>date_id</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>FK → dim_date</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 8px', color: 'var(--color-cyan)', fontFamily: 'JetBrains Mono' }}>
                  <span>network_id</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>FK → dim_network</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 8px', color: 'var(--color-cyan)', fontFamily: 'JetBrains Mono' }}>
                  <span>classification_id</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>FK → dim_classification</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Core Numerical Measures:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                  {['flow_duration', 'total_fwd_packets', 'total_backward_packets', 'flow_bytes_per_sec', 'flow_packets_per_sec', 'packet_length_mean'].map((m) => (
                    <span
                      key={m}
                      style={{
                        fontSize: '0.66rem',
                        fontFamily: 'JetBrains Mono',
                        background: 'var(--surface-elevated)',
                        color: 'var(--text-secondary)',
                        padding: '2px 6px',
                        borderRadius: '3px',
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: 'var(--text-muted)', paddingTop: '6px' }}>
          <Info size={14} color="var(--color-cyan)" style={{ flexShrink: 0 }} />
          <span>
            <strong style={{ color: 'var(--text-primary)' }}>Architectural Principle:</strong> The fact table stores measurable numeric metrics of network flows; dimension tables provide descriptive attributes for filtering, grouping, and drill-down.
          </span>
        </div>
      </div>

      {/* 4. Table Structure View (Interactive Tabs for All 4 Tables) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <SectionHeader
          title="WAREHOUSE TABLES"
          subtitle="Inspect table purpose, surrogate key structures, columns, and live data"
        />

        {/* Table Selector Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            { id: 'fact_network_traffic', label: 'FACT_NETWORK_TRAFFIC', badge: `${factRows.toLocaleString()} rows`, type: 'fact' },
            { id: 'dim_date', label: 'DIM_DATE', badge: '1 row', type: 'dim' },
            { id: 'dim_network', label: 'DIM_NETWORK', badge: `${networkCount.toLocaleString()} rows`, type: 'dim' },
            { id: 'dim_classification', label: 'DIM_CLASSIFICATION', badge: '2 rows', type: 'dim' },
          ].map((tab) => {
            const isSelected = selectedTable === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTable(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: isSelected
                    ? tab.type === 'fact' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(168, 85, 247, 0.15)'
                    : 'var(--surface-card)',
                  border: `1px solid ${
                    isSelected
                      ? tab.type === 'fact' ? 'var(--color-cyan)' : '#A855F7'
                      : 'var(--border-subtle)'
                  }`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 14px',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: isSelected ? 700 : 500,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    background: 'var(--surface-elevated)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    color: isSelected
                      ? tab.type === 'fact' ? 'var(--color-cyan)' : '#A855F7'
                      : 'var(--text-muted)',
                  }}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Table Detail Card */}
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {selectedTable === 'fact_network_traffic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-info">CENTRAL FACT TABLE</span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                      Row Count: {factRows.toLocaleString()}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-heading)', margin: 0 }}>
                    fact_network_traffic
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                    Stores the measurable network traffic records. Links directly to temporal, network, and classification dimensions.
                  </p>
                </div>

                <Button
                  variant="cyan"
                  size="sm"
                  icon={ArrowRight}
                  onClick={handleExploreRecords}
                >
                  Explore Records in Traffic Explorer
                </Button>
              </div>

              {/* Keys & Measures Breakdown */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#F59E0B', fontWeight: 700, marginBottom: '4px' }}>
                    PRIMARY KEY
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    traffic_id (BIGINT AUTO_INCREMENT)
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-cyan)', fontWeight: 700, marginBottom: '4px' }}>
                    FOREIGN KEYS
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    date_id • network_id • classification_id
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: '#A855F7', fontWeight: 700, marginBottom: '4px' }}>
                    FEATURE MEASURES
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    62 additive numerical flow metrics
                  </div>
                </div>
              </div>

              {/* Small Fact Table Preview (Live 5 Records) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Fact Table Live Data Preview (5 Sample Rows from MySQL)
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Displaying 5 of {factRows.toLocaleString()} rows
                  </span>
                </div>

                <DataTable
                  columns={factPreviewColumns}
                  data={factPreview}
                  keyField="traffic_id"
                  loading={loading}
                  emptyMessage="No fact records loaded."
                />
              </div>
            </div>
          )}

          {selectedTable === 'dim_date' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-neutral" style={{ color: '#A855F7', borderColor: '#A855F7' }}>
                    DIMENSION TABLE
                  </span>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    Row Count: 1
                  </span>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-heading)', margin: 0 }}>
                  dim_date
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Provides the time dimension used for date-based analysis and temporal roll-ups.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                }}
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  COLUMNS & METADATA
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#F59E0B' }}>date_id (PK)</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>1</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>full_date</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>2017-07-07</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>year</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>2017</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>month</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>7 (July)</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>day</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>7</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>day_of_week</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>Friday</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTable === 'dim_network' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-neutral" style={{ color: '#A855F7', borderColor: '#A855F7' }}>
                    DIMENSION TABLE
                  </span>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    Row Count: {networkCount.toLocaleString()}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-heading)', margin: 0 }}>
                  dim_network
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Stores network destination port members for service mapping, grouping, and port drill-down.
                </p>
              </div>

              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  High-Volume Destination Ports (from dim_network & fact joins)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {topPorts.map((p) => (
                    <div
                      key={p.destination_port}
                      style={{
                        background: 'var(--surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--color-cyan)' }}>
                          Port {p.destination_port}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {p.total_records.toLocaleString()} flows
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {PORT_SERVICES[p.destination_port] || 'Network Service'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTable === 'dim_classification' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-neutral" style={{ color: '#A855F7', borderColor: '#A855F7' }}>
                    DIMENSION TABLE
                  </span>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    Row Count: 2
                  </span>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-heading)', margin: 0 }}>
                  dim_classification
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Provides normalized traffic classification status and dataset ground truth labels.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <StatusBadge status="NORMAL" />
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.74rem', color: '#10B981' }}>
                      ID: 1
                    </span>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#10B981' }}>
                    95,096 records
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Original Label: BENIGN (Standard non-anomalous network traffic)
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <StatusBadge status="SUSPICIOUS" />
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.74rem', color: '#EF4444' }}>
                      ID: 2
                    </span>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#EF4444' }}>
                    128,016 records
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Original Label: DDoS (Anomalous denial-of-service traffic)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Dataset -> Warehouse Mapping */}
      <div
        className="analytical-card"
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <SectionHeader
          title="Dataset to Warehouse Mapping"
          subtitle="How raw CICIDS2017 network flow features translate into dimensional warehouse entities"
        />

        {/* 5-Stage Progression Flow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: '0.78rem',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>CICIDS2017 CSV</span>
          <ChevronRight size={13} color="var(--color-cyan)" />
          <span style={{ color: 'var(--text-secondary)' }}>Preprocessing</span>
          <ChevronRight size={13} color="var(--color-cyan)" />
          <span style={{ color: 'var(--text-secondary)' }}>ETL Pipeline</span>
          <ChevronRight size={13} color="var(--color-cyan)" />
          <span style={{ color: 'var(--text-secondary)' }}>Fact + Dimensions</span>
          <ChevronRight size={13} color="var(--color-cyan)" />
          <span style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>MySQL Data Warehouse</span>
        </div>

        {/* Interactive Mapping Inspection Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {[
            {
              id: 'port',
              src: 'Destination Port',
              dst: 'dim_network.destination_port',
              desc: 'Port integer normalized into surrogate key network_id',
            },
            {
              id: 'status',
              src: 'Label / Status',
              dst: 'dim_classification.traffic_status',
              desc: 'BENIGN / DDoS mapped to binary classification_id',
            },
            {
              id: 'date',
              src: 'Capture Date',
              dst: 'dim_date.full_date',
              desc: 'Calendar temporal hierarchy mapped to date_id',
            },
            {
              id: 'measures',
              src: 'Flow & Packet Stats',
              dst: 'fact_network_traffic measures',
              desc: 'Flow duration, packet counts, bytes/s, lengths as additive facts',
            },
          ].map((m) => {
            const isSelected = selectedMapping === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMapping(isSelected ? null : m.id)}
                style={{
                  background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'var(--surface-elevated)',
                  border: `1px solid ${isSelected ? 'var(--color-cyan)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-primary)' }}>{m.src}</span>
                  <ArrowRightLeft size={12} color="var(--color-cyan)" />
                  <span style={{ color: 'var(--color-cyan)', fontFamily: 'JetBrains Mono' }}>{m.dst.split('.')[0]}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {m.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. ETL Pipeline Section */}
      <div
        className="analytical-card"
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <SectionHeader
          title="ETL Pipeline"
          subtitle="Click any stage to inspect its role in loading the warehouse"
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            {
              id: 'extract',
              num: '01',
              title: 'EXTRACT',
              summary: 'Reads the cleaned CICIDS2017 traffic dataset.',
              detail: 'Reads preprocessed network traffic CSV/parquet flow records containing verified features.',
            },
            {
              id: 'transform',
              num: '02',
              title: 'TRANSFORM',
              summary: 'Maps and prepares the dataset for the warehouse structure.',
              detail: 'Extracts distinct dimension members (ports, dates, classes), validates numeric ranges, and generates surrogate keys.',
            },
            {
              id: 'load',
              num: '03',
              title: 'LOAD',
              summary: 'Stores the transformed data into the fact and dimension tables.',
              detail: 'Populates dim_date, dim_network, dim_classification, and executes bulk insert into fact_network_traffic.',
            },
          ].map((stage) => {
            const isActive = activeEtlStage === stage.id;
            return (
              <div
                key={stage.id}
                onClick={() => setActiveEtlStage(stage.id)}
                style={{
                  background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'var(--surface-elevated)',
                  border: `1px solid ${isActive ? 'var(--color-cyan)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: 'var(--color-cyan)', fontWeight: 700 }}>
                    STAGE {stage.num}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {stage.title}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  "{stage.summary}"
                </div>
                {isActive && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                    {stage.detail}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Warehouse SQL Explorer + Architectural Foundation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* SQL Example Card */}
        <div
          className="analytical-card"
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'var(--color-cyan)',
                  background: 'rgba(6, 182, 212, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '3px',
                  fontFamily: 'JetBrains Mono',
                }}
              >
                SQL EXAMPLE
              </span>
              <button
                onClick={copySql}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  color: copiedSql ? '#10B981' : 'var(--text-secondary)',
                  fontSize: '0.74rem',
                  padding: '4px 10px',
                  cursor: 'pointer',
                }}
              >
                {copiedSql ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-heading)', margin: '0 0 6px 0' }}>
              Warehouse Aggregation Query
            </h4>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
              Standard dimensional group-by aggregation executed against fact_network_traffic.
            </p>

            <pre
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                fontSize: '0.76rem',
                color: 'var(--color-cyan)',
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 1.5,
                overflowX: 'auto',
                margin: 0,
              }}
            >
              <code>{sqlQueryText}</code>
            </pre>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            Warehouse queries aggregate traffic records directly in MySQL without loading all 223,112 rows into memory.
          </div>
        </div>

        {/* Academic Rationale Card */}
        <div
          className="analytical-card"
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#A855F7',
                background: 'rgba(168, 85, 247, 0.1)',
                padding: '2px 8px',
                borderRadius: '3px',
                fontFamily: 'JetBrains Mono',
              }}
            >
              ACADEMIC FOUNDATION
            </span>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-heading)', margin: '8px 0 6px 0' }}>
              WHY A DATA WAREHOUSE?
            </h4>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
              Architectural rationale for dimensional network modeling
            </p>

            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                margin: 0,
              }}
            >
              "The data warehouse stores cleaned network traffic in a structured format. The Star Schema separates measurable traffic records from descriptive dimensions. This enables high-performance OLAP slice, dice, roll-up, and drill-down analysis."
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '14px' }}>
            <div style={{ background: 'var(--surface-elevated)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-cyan)' }}>Fact Separation</div>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Isolates raw measures</div>
            </div>
            <div style={{ background: 'var(--surface-elevated)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#A855F7' }}>Single-Hop Joins</div>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Low query complexity</div>
            </div>
            <div style={{ background: 'var(--surface-elevated)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#F59E0B' }}>OLAP Ready</div>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Feeds cubes directly</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
