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
  FileSpreadsheet,
  Copy,
  Check,
  CheckCircle2,
  ChevronRight,
  Info,
  RefreshCw,
  GitFork,
  HelpCircle,
} from 'lucide-react';
import { fetchDWDMOverview, fetchDWDMClassificationSummary } from '../api/dwdmAnalysisApi';

export default function DataWarehouse() {
  const [overview, setOverview] = useState(null);
  const [classification, setClassification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovRes, classRes] = await Promise.all([
        fetchDWDMOverview().catch(() => null),
        fetchDWDMClassificationSummary().catch(() => null),
      ]);
      setOverview(ovRes);
      setClassification(classRes);
    } catch (err) {
      console.error('Failed to load data warehouse metadata:', err);
      setError('Unable to load warehouse metadata from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const sqlQueryText = `SELECT 
    c.traffic_status, 
    COUNT(*) AS total_records
FROM fact_network_traffic f
JOIN dim_classification c 
  ON f.classification_id = c.classification_id
GROUP BY c.traffic_status;`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlQueryText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Real warehouse metrics from backend with verified defaults
  const factRows = overview?.fact_rows ?? 223112;
  const networkCount = overview?.network_count ?? 23950;
  const dateCount = overview?.date_count ?? 1;
  const classCount = overview?.classification_count ?? 2;
  const normalRows = classification?.data?.find((d) => d.traffic_status === 'NORMAL')?.record_count ?? 95096;
  const suspRows = classification?.data?.find((d) => d.traffic_status === 'SUSPICIOUS')?.record_count ?? 128016;

  return (
    <div className="section-gap" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Page Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: '700',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-cyan)',
              background: 'rgba(0, 217, 255, 0.08)',
              border: '1px solid rgba(0, 217, 255, 0.25)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            DWDM / MYSQL / STAR SCHEMA
          </span>
        </div>
        <h1 className="dashboard-title">Data Warehouse</h1>
        <div className="dashboard-subtitle">
          Centralized storage of cleaned CICIDS2017 network traffic using a MySQL Star Schema.
        </div>
      </div>

      {/* Error Alert if backend unreachable */}
      {error && (
        <div
          style={{
            backgroundColor: 'var(--surface-elevated)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            color: '#EF4444',
            fontSize: '0.84rem',
          }}
        >
          <span>{error}</span>
          <button
            onClick={loadData}
            className="btn btn-secondary"
            style={{ fontSize: '0.76rem', padding: '5px 12px' }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* 2. Top Summary Cards (4 Cards) */}
      <div className="grid-kpi">
        {/* Card 1: FACT RECORDS */}
        <div className="kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">FACT RECORDS</span>
            <div
              className="kpi-icon-wrap"
              style={{
                background: 'rgba(0, 217, 255, 0.08)',
                borderColor: 'rgba(0, 217, 255, 0.25)',
                color: 'var(--color-cyan)',
              }}
            >
              <Server size={15} />
            </div>
          </div>
          <div className="kpi-metric-wrap">
            {loading ? (
              <div className="skeleton" style={{ height: '34px', width: '65%', borderRadius: '4px' }} />
            ) : (
              <div className="kpi-value">{Number(factRows).toLocaleString()}</div>
            )}
          </div>
          <div className="kpi-supporting">Network traffic records</div>
        </div>

        {/* Card 2: DIMENSIONS */}
        <div className="kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">DIMENSIONS</span>
            <div
              className="kpi-icon-wrap"
              style={{
                background: 'rgba(168, 85, 247, 0.08)',
                borderColor: 'rgba(168, 85, 247, 0.25)',
                color: '#A855F7',
              }}
            >
              <Layers size={15} />
            </div>
          </div>
          <div className="kpi-metric-wrap">
            {loading ? (
              <div className="skeleton" style={{ height: '34px', width: '40%', borderRadius: '4px' }} />
            ) : (
              <div className="kpi-value">3</div>
            )}
          </div>
          <div className="kpi-supporting">Date / Network / Classification</div>
        </div>

        {/* Card 3: NETWORK MEMBERS */}
        <div className="kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">NETWORK MEMBERS</span>
            <div
              className="kpi-icon-wrap"
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                borderColor: 'rgba(245, 158, 11, 0.25)',
                color: '#F59E0B',
              }}
            >
              <Network size={15} />
            </div>
          </div>
          <div className="kpi-metric-wrap">
            {loading ? (
              <div className="skeleton" style={{ height: '34px', width: '60%', borderRadius: '4px' }} />
            ) : (
              <div className="kpi-value">{Number(networkCount).toLocaleString()}</div>
            )}
          </div>
          <div className="kpi-supporting">Destination port members</div>
        </div>

        {/* Card 4: CLASSIFICATIONS */}
        <div className="kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">CLASSIFICATIONS</span>
            <div
              className="kpi-icon-wrap"
              style={{
                background: 'rgba(34, 197, 94, 0.08)',
                borderColor: 'rgba(34, 197, 94, 0.25)',
                color: '#22C55E',
              }}
            >
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div className="kpi-metric-wrap">
            {loading ? (
              <div className="skeleton" style={{ height: '34px', width: '40%', borderRadius: '4px' }} />
            ) : (
              <div className="kpi-value">2</div>
            )}
          </div>
          <div className="kpi-supporting">NORMAL / SUSPICIOUS</div>
        </div>
      </div>

      {/* 3. Main Star Schema Architecture Visualization (Centerpiece) */}
      <div className="analytical-card star-schema-container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '0.66rem',
                  fontWeight: '700',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--color-cyan)',
                  background: 'rgba(0, 217, 255, 0.08)',
                  border: '1px solid rgba(0, 217, 255, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                STAR SCHEMA ARCHITECTURE
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Single-hop dimensional joins
              </span>
            </div>
            <h3 className="analytical-title">
              Star Schema Visualization
            </h3>
            <p className="analytical-subtitle">
              Central fact table connected to surrounding dimensions via surrogate keys
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
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

        {/* Visual Architecture Canvas */}
        <div className="star-schema-canvas">
          {/* Left Column: Dimensions (DIM_DATE, DIM_NETWORK, DIM_CLASSIFICATION) */}
          <div className="schema-dim-col">
            {/* DIM_DATE */}
            <div
              className={`schema-table-card ${hoveredNode === 'dim_date' ? 'active-dim' : ''}`}
              onMouseEnter={() => setHoveredNode('dim_date')}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div className="schema-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} color="#A855F7" />
                  <span className="schema-table-name">dim_date</span>
                </div>
                <span className="schema-table-badge">1 ROW</span>
              </div>
              <div className="schema-card-body">
                <span className="schema-pk">date_id (PK)</span> • full_date • year • month • day • day_of_week
              </div>
            </div>

            {/* DIM_NETWORK */}
            <div
              className={`schema-table-card ${hoveredNode === 'dim_network' ? 'active-dim' : ''}`}
              onMouseEnter={() => setHoveredNode('dim_network')}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div className="schema-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Network size={13} color="#A855F7" />
                  <span className="schema-table-name">dim_network</span>
                </div>
                <span className="schema-table-badge">{Number(networkCount).toLocaleString()} ROWS</span>
              </div>
              <div className="schema-card-body">
                <span className="schema-pk">network_id (PK)</span> • destination_port
              </div>
            </div>

            {/* DIM_CLASSIFICATION */}
            <div
              className={`schema-table-card ${hoveredNode === 'dim_classification' ? 'active-dim' : ''}`}
              onMouseEnter={() => setHoveredNode('dim_classification')}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div className="schema-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={13} color="#A855F7" />
                  <span className="schema-table-name">dim_classification</span>
                </div>
                <span className="schema-table-badge">2 ROWS</span>
              </div>
              <div className="schema-card-body">
                <span className="schema-pk">classification_id (PK)</span> • traffic_status • original_label
              </div>
            </div>
          </div>

          {/* Center Column: Clean Connection Lines */}
          <div className="schema-connector-col">
            <div className={`schema-conn-line ${hoveredNode === 'dim_date' ? 'active' : ''}`}>
              <span className="schema-cardinality">1</span>
              <span className="schema-line">────────</span>
              <span className="schema-cardinality">N</span>
            </div>
            <div className={`schema-conn-line ${hoveredNode === 'dim_network' ? 'active' : ''}`}>
              <span className="schema-cardinality">1</span>
              <span className="schema-line">────────</span>
              <span className="schema-cardinality">N</span>
            </div>
            <div className={`schema-conn-line ${hoveredNode === 'dim_classification' ? 'active' : ''}`}>
              <span className="schema-cardinality">1</span>
              <span className="schema-line">────────</span>
              <span className="schema-cardinality">N</span>
            </div>
          </div>

          {/* Right Column: Central FACT_NETWORK_TRAFFIC Node */}
          <div
            className={`schema-fact-card ${hoveredNode === 'fact' ? 'active' : ''}`}
            onMouseEnter={() => setHoveredNode('fact')}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <div className="schema-fact-header">
              <div>
                <span className="schema-fact-tag">CENTRAL FACT TABLE</span>
                <h4 className="schema-fact-title">fact_network_traffic</h4>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Network traffic fact records
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="schema-fact-rows">223,112 ROWS</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Grain: 1 flow
                </div>
              </div>
            </div>

            {/* Fact Attributes & Keys */}
            <div className="schema-fact-attributes">
              {/* Primary Key */}
              <div className="schema-attr-row primary-key">
                <span className="attr-name">traffic_id</span>
                <span className="attr-type pk">PRIMARY KEY (PK)</span>
              </div>

              {/* Foreign Keys */}
              <div className={`schema-attr-row ${hoveredNode === 'dim_date' ? 'highlighted' : ''}`}>
                <span className="attr-name fk">date_id</span>
                <span className="attr-desc">FK → dim_date</span>
              </div>

              <div className={`schema-attr-row ${hoveredNode === 'dim_network' ? 'highlighted' : ''}`}>
                <span className="attr-name fk">network_id</span>
                <span className="attr-desc">FK → dim_network</span>
              </div>

              <div className={`schema-attr-row ${hoveredNode === 'dim_classification' ? 'highlighted' : ''}`}>
                <span className="attr-name fk">classification_id</span>
                <span className="attr-desc">FK → dim_classification</span>
              </div>

              {/* Numerical Measures */}
              <div className="schema-measures-wrap">
                <div className="schema-measures-label">
                  MEASUREMENTS (Numerical Flow Metrics)
                </div>
                <div className="schema-measures-tags">
                  {['flow_duration', 'total_fwd_packets', 'total_backward_packets', 'flow_bytes_per_sec', 'flow_packets_per_sec', 'packet_length_mean'].map((m) => (
                    <span key={m} className="schema-measure-pill">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Principle Note */}
        <div className="schema-principle-bar">
          <Info size={14} color="var(--color-cyan)" style={{ flexShrink: 0 }} />
          <span>
            <strong style={{ color: '#F5F7FA' }}>Architectural Principle:</strong> The fact table stores measurable network traffic information, while dimension tables provide descriptive context for analytical queries.
          </span>
        </div>
      </div>

      {/* 4. Fact + Dimension Table Details (4 Coordinated Cards) */}
      <div className="warehouse-tables-grid">
        {/* FACT TABLE DETAIL */}
        <div className="analytical-card table-detail-card fact-accent">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="table-type-badge cyan">FACT TABLE</span>
              <span className="table-row-count">223,112 RECORDS</span>
            </div>
            <h4 className="table-detail-title">fact_network_traffic</h4>
            <p className="table-detail-desc">
              The fact table stores the measurable network traffic records and links them to the warehouse dimensions.
            </p>
          </div>

          <div className="table-schema-list">
            <div className="table-schema-item">
              <span className="schema-key gold">PK:</span>
              <span className="schema-val">traffic_id</span>
            </div>
            <div className="table-schema-item">
              <span className="schema-key cyan">FKs:</span>
              <span className="schema-val">date_id, network_id, classification_id</span>
            </div>
            <div className="table-schema-item">
              <span className="schema-key purple">Measures:</span>
              <span className="schema-val">flow_duration, fwd/bwd packets, flow bytes/sec, packet length</span>
            </div>
          </div>
        </div>

        {/* DIM_DATE DETAIL */}
        <div className="analytical-card table-detail-card dim-accent">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="table-type-badge purple">DIMENSION TABLE</span>
              <span className="table-row-count">1 ROW</span>
            </div>
            <h4 className="table-detail-title">dim_date</h4>
            <p className="table-detail-desc">
              Provides calendar context and temporal hierarchies for network traffic captures.
            </p>
          </div>

          <div className="table-schema-list">
            <div className="table-schema-item">
              <span className="schema-key cyan">PK:</span>
              <span className="schema-val">date_id</span>
            </div>
            <div className="table-schema-item">
              <span className="schema-key muted">Columns:</span>
              <span className="schema-val">full_date, year, month, day, day_of_week</span>
            </div>
            <div className="table-schema-item">
              <span className="schema-key muted">Context:</span>
              <span className="schema-val">Capture Date: 2017-07-07 (Friday)</span>
            </div>
          </div>
        </div>

        {/* DIM_NETWORK DETAIL */}
        <div className="analytical-card table-detail-card dim-accent">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="table-type-badge purple">DIMENSION TABLE</span>
              <span className="table-row-count">23,950 ROWS</span>
            </div>
            <h4 className="table-detail-title">dim_network</h4>
            <p className="table-detail-desc">
              Provides network port attributes for service mapping and traffic filtering.
            </p>
          </div>

          <div className="table-schema-list">
            <div className="table-schema-item">
              <span className="schema-key cyan">PK:</span>
              <span className="schema-val">network_id</span>
            </div>
            <div className="table-schema-item">
              <span className="schema-key muted">Columns:</span>
              <span className="schema-val">destination_port</span>
            </div>
            <div className="table-schema-item">
              <span className="schema-key muted">Key Ports:</span>
              <span className="schema-val">80 (HTTP), 53 (DNS), 443 (HTTPS), 8080</span>
            </div>
          </div>
        </div>

        {/* DIM_CLASSIFICATION DETAIL */}
        <div className="analytical-card table-detail-card dim-accent">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="table-type-badge purple">DIMENSION TABLE</span>
              <span className="table-row-count">2 ROWS</span>
            </div>
            <h4 className="table-detail-title">dim_classification</h4>
            <p className="table-detail-desc">
              Provides binary traffic status and ground-truth classification labels.
            </p>
          </div>

          <div className="table-schema-list">
            <div className="table-schema-item">
              <span className="schema-key cyan">PK:</span>
              <span className="schema-val">classification_id</span>
            </div>
            <div className="table-schema-item">
              <span className="schema-key muted">Columns:</span>
              <span className="schema-val">traffic_status, original_label</span>
            </div>
            <div className="table-schema-item">
              <span className="schema-key green">Classes:</span>
              <span className="schema-val">NORMAL (95,096), SUSPICIOUS (128,016)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Data Flow / ETL Pipeline Section (4 Sequential Stages) */}
      <div className="pipeline-card">
        <div style={{ marginBottom: '16px' }}>
          <h3 className="analytical-title">
            Data Flow / ETL Pipeline
          </h3>
          <p className="analytical-subtitle">
            Cleaned records are transformed and loaded into the warehouse for multidimensional analysis.
          </p>
        </div>

        <div className="pipeline-flow-wrap" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            {
              num: '01',
              title: 'CICIDS2017',
              desc: 'Raw network captures',
              icon: Database,
              accent: 'var(--color-cyan)',
              borderAccent: 'rgba(0, 217, 255, 0.25)',
              badgeBg: 'rgba(0, 217, 255, 0.08)',
            },
            {
              num: '02',
              title: 'Preprocessing',
              desc: 'Cleaning & transformation',
              icon: Filter,
              accent: '#22D3EE',
              borderAccent: 'rgba(34, 211, 238, 0.25)',
              badgeBg: 'rgba(34, 211, 238, 0.08)',
            },
            {
              num: '03',
              title: 'ETL',
              desc: 'Dimensional record load',
              icon: ArrowRightLeft,
              accent: '#A855F7',
              borderAccent: 'rgba(168, 85, 247, 0.25)',
              badgeBg: 'rgba(168, 85, 247, 0.08)',
            },
            {
              num: '04',
              title: 'MySQL Data Warehouse',
              desc: 'Star schema fact & dimensions',
              icon: Server,
              accent: '#F59E0B',
              borderAccent: 'rgba(245, 158, 11, 0.25)',
              badgeBg: 'rgba(245, 158, 11, 0.08)',
            },
          ].map((step, idx, arr) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.num}>
                <div
                  className="pipeline-stage-item"
                  style={{
                    borderColor: step.borderAccent,
                  }}
                >
                  <div className="pipeline-stage-top">
                    <span className="pipeline-step-badge" style={{ color: step.accent }}>
                      {step.num}
                    </span>
                    <div
                      className="pipeline-step-icon"
                      style={{
                        background: step.badgeBg,
                        color: step.accent,
                      }}
                    >
                      <Icon size={14} />
                    </div>
                  </div>

                  <div className="pipeline-stage-name">{step.title}</div>
                  <div className="pipeline-stage-desc">{step.desc}</div>
                </div>

                {idx < arr.length - 1 && (
                  <div className="pipeline-arrow-divider">
                    <ChevronRight size={14} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 6. Dataset -> Warehouse Mapping */}
      <div className="analytical-card">
        <div style={{ marginBottom: '16px' }}>
          <h3 className="analytical-title">
            Dataset to Warehouse Mapping
          </h3>
          <p className="analytical-subtitle">
            How raw network flow telemetry translates into dimensional warehouse entities
          </p>
        </div>

        {/* 5-Stage Progression */}
        <div className="mapping-progression-bar">
          <span className="mapping-prog-step">CICIDS2017 CSV</span>
          <ChevronRight size={12} color="var(--color-cyan)" />
          <span className="mapping-prog-step">Cleaned network flow records</span>
          <ChevronRight size={12} color="var(--color-cyan)" />
          <span className="mapping-prog-step">Dimension mapping</span>
          <ChevronRight size={12} color="var(--color-cyan)" />
          <span className="mapping-prog-step">Fact table loading</span>
          <ChevronRight size={12} color="var(--color-cyan)" />
          <span className="mapping-prog-step highlight">MySQL Star Schema</span>
        </div>

        {/* Mapping Grid */}
        <div className="mapping-grid">
          <div className="mapping-item-card">
            <div className="mapping-src">Destination Port</div>
            <div className="mapping-arrow">→</div>
            <div className="mapping-dst">dim_network</div>
            <div className="mapping-desc">Port member surrogate mapping</div>
          </div>

          <div className="mapping-item-card">
            <div className="mapping-src">Traffic Status / Label</div>
            <div className="mapping-arrow">→</div>
            <div className="mapping-dst">dim_classification</div>
            <div className="mapping-desc">NORMAL vs. SUSPICIOUS labels</div>
          </div>

          <div className="mapping-item-card">
            <div className="mapping-src">Capture Date</div>
            <div className="mapping-arrow">→</div>
            <div className="mapping-dst">dim_date</div>
            <div className="mapping-desc">Calendar hierarchy surrogate</div>
          </div>

          <div className="mapping-item-card">
            <div className="mapping-src">Network Flow Measures</div>
            <div className="mapping-arrow">→</div>
            <div className="mapping-dst">fact_network_traffic</div>
            <div className="mapping-desc">Numeric additive flow telemetry</div>
          </div>
        </div>
      </div>

      {/* 7. SQL Example + Why a Data Warehouse? (2-Column Grid) */}
      <div className="warehouse-bottom-grid">
        {/* Left: SQL Query Example */}
        <div className="analytical-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '0.66rem',
                  fontWeight: '700',
                  color: 'var(--color-cyan)',
                  background: 'rgba(0, 217, 255, 0.08)',
                  border: '1px solid rgba(0, 217, 255, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                }}
              >
                SQL WAREHOUSE QUERY
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
                  color: copiedSql ? '#22C55E' : 'var(--text-secondary)',
                  fontSize: '0.7rem',
                  padding: '3px 8px',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease',
                }}
              >
                {copiedSql ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
            <h3 className="analytical-title">
              Warehouse Query Example
            </h3>
            <p className="analytical-subtitle" style={{ marginBottom: '14px' }}>
              Dimensional aggregation query executed directly against the star schema
            </p>

            <pre
              style={{
                backgroundColor: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                fontSize: '0.75rem',
                color: 'var(--color-cyan)',
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 1.6,
                overflowX: 'auto',
                margin: 0,
              }}
            >
              <code>{sqlQueryText}</code>
            </pre>
          </div>

          <div
            style={{
              marginTop: '14px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              lineHeight: 1.45,
            }}
          >
            Warehouse queries can aggregate stored traffic records without loading the complete dataset into the frontend.
          </div>
        </div>

        {/* Right: Academic Explanation */}
        <div className="analytical-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '0.66rem',
                  fontWeight: '700',
                  color: '#A855F7',
                  background: 'rgba(168, 85, 247, 0.08)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                }}
              >
                ACADEMIC FOUNDATION
              </span>
            </div>
            <h3 className="analytical-title">
              WHY A DATA WAREHOUSE?
            </h3>
            <p className="analytical-subtitle" style={{ marginBottom: '14px' }}>
              Architectural rationale for dimensional network modeling
            </p>

            <p
              style={{
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                margin: 0,
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
              }}
            >
              "The data warehouse stores the cleaned network traffic in a structured format. The Star Schema separates measurable traffic records from descriptive dimensions. This makes aggregation and multidimensional analysis easier for the OLAP stage."
            </p>
          </div>

          {/* Key Architectural Benefits */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '14px' }}>
            <div
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-cyan)' }}>Fact Separation</div>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: '2px' }}>Isolates raw measures</div>
            </div>
            <div
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#A855F7' }}>Single-Hop Joins</div>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: '2px' }}>Low query complexity</div>
            </div>
            <div
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#F59E0B' }}>OLAP Ready</div>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: '2px' }}>Direct cube feeding</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
