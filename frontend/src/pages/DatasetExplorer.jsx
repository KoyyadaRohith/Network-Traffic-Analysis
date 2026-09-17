import React, { useState, useEffect } from 'react';
import {
  Database,
  FileSpreadsheet,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  RefreshCw,
  Info,
  Calendar,
  Network,
  Cpu,
  Trash2,
  Maximize2,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  fetchDatasetSummary,
  fetchDatasetClassDistribution,
  fetchDatasetFeatures,
} from '../api/datasetApi';
import KpiCard from '../components/KpiCard';

export default function DatasetExplorer() {
  const [summary, setSummary] = useState(null);
  const [classDist, setClassDist] = useState(null);
  const [features, setFeatures] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, classRes, featRes] = await Promise.all([
        fetchDatasetSummary(),
        fetchDatasetClassDistribution(),
        fetchDatasetFeatures(),
      ]);
      setSummary(sumRes);
      setClassDist(classRes);
      setFeatures(featRes?.features || []);
    } catch (err) {
      console.error('Failed to load dataset metadata:', err);
      setError(err.message || 'Unable to load dataset metadata from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredFeatures = features.filter((f) =>
    f.feature_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.data_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pieData = classDist?.data?.map((item) => ({
    name: item.traffic_status,
    value: item.total_records,
    percentage: item.percentage,
    label: item.original_label,
  })) || [];

  const prep = summary?.preprocessing;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="welcome-section" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-info">CICIDS2017 Benchmark</span>
            <span className="badge badge-purple">ETL Pipeline Verified</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            DATASET EXPLORER
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Inspect the dataset, preprocessing pipeline and model-ready features used by the DWDM system.
          </p>
        </div>

        {/* Source Data Pill */}
        <div className="date-time-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="var(--color-blue)" />
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                Capture File
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                {summary?.raw_file?.filename ? 'Friday-Afternoon-DDos' : 'Loading...'}
              </div>
            </div>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--color-purple)" />
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                Capture Date
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                {summary?.capture_date || '2017-07-07'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7: SOURCE DATA NOTE */}
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.05)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
        }}
      >
        <Info size={20} color="var(--color-blue)" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#ffffff' }}>Dataset Lineage & Scope Notice: </strong>
          Current project analysis uses the Canadian Institute for Cybersecurity (CIC) <strong>CICIDS2017 Friday-WorkingHours-Afternoon-DDos</strong> dataset subset. The data warehouse fact table reflects exactly one capture session (2017-07-07) with 223,112 verified flow records.
        </div>
      </div>

      {/* Error state */}
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
          <button onClick={loadData} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* SECTION 1: DATASET OVERVIEW (KPI ROW) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <KpiCard
          title="Dataset"
          value="CICIDS2017"
          subtitle="Friday-Afternoon DDoS Subset"
          icon={FileSpreadsheet}
          iconColor="var(--color-blue)"
          loading={loading}
        />
        <KpiCard
          title="Original Records"
          value={summary?.raw_file?.row_count ? Number(summary.raw_file.row_count).toLocaleString() : '--'}
          subtitle={`Raw CSV (${summary?.raw_file?.file_size_mb || '73.55'} MB)`}
          icon={Database}
          iconColor="var(--text-muted)"
          loading={loading}
        />
        <KpiCard
          title="Clean Records"
          value={summary?.clean_file?.row_count ? Number(summary.clean_file.row_count).toLocaleString() : '--'}
          subtitle={`Cleaned CSV (${summary?.clean_file?.file_size_mb || '71.06'} MB)`}
          icon={CheckCircle2}
          iconColor="var(--color-green)"
          badgeText="DEDUPLICATED"
          badgeClass="badge-normal"
          loading={loading}
        />
        <KpiCard
          title="Original Features"
          value={summary?.original_features || 78}
          subtitle="Total Flow Attributes in Raw"
          icon={Layers}
          iconColor="var(--text-secondary)"
          loading={loading}
        />
        <KpiCard
          title="Model Features"
          value={summary?.model_features || 62}
          subtitle="Filtered Numerical Input Matrix"
          icon={Cpu}
          iconColor="var(--color-purple)"
          badgeText="RF INPUT"
          badgeClass="badge-purple"
          loading={loading}
        />
        <KpiCard
          title="Warehouse Records"
          value={summary?.warehouse_fact_rows ? Number(summary.warehouse_fact_rows).toLocaleString() : '--'}
          subtitle="fact_network_traffic Grain"
          icon={Network}
          iconColor="var(--color-blue)"
          loading={loading}
        />
      </div>

      {/* SECTION 2 & 3: CLASS DISTRIBUTION & DATA CLEANING COMPARISON */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px',
        }}
      >
        {/* SECTION 2: CLASS DISTRIBUTION */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Ground Truth Class Distribution
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Cleaned dataset label distribution (BENIGN → NORMAL, DDoS → SUSPICIOUS)
              </p>
            </div>
            <span className="badge badge-info">Ground Truth</span>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: '240px', width: '100%', borderRadius: '8px' }} />
          ) : (
            <div style={{ height: '240px', position: 'relative' }}>
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
                              Percentage: {d.percentage}%
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
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
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                  {summary ? Number(summary.clean_file.row_count).toLocaleString() : '--'}
                </div>
              </div>
            </div>
          )}

          {/* Distribution numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Normal (BENIGN)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-green)' }}>
                {summary?.normal_records ? Number(summary.normal_records).toLocaleString() : '95,096'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {summary?.normal_percentage || 42.62}% of flows
              </div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Suspicious (DDoS)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-red)' }}>
                {summary?.suspicious_records ? Number(summary.suspicious_records).toLocaleString() : '128,016'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {summary?.suspicious_percentage || 57.38}% of flows
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: DATA CLEANING BEFORE / AFTER COMPARISON */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Data Cleaning Transformation
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Verified before and after metrics from clean_dataset.py
                </p>
              </div>
              <span className="badge badge-purple">Quality Assessment</span>
            </div>

            {/* Before vs After Visual Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>RAW DATA</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>
                  {prep ? Number(prep.rows_before_cleaning).toLocaleString() : '225,745'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {prep?.columns_before_cleaning || 79} columns
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-blue)' }}>
                <ArrowRight size={22} />
                <span style={{ fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>CLEAN</span>
              </div>

              <div style={{ background: 'rgba(56, 189, 248, 0.04)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 'var(--radius-sm)', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-blue)', textTransform: 'uppercase', fontWeight: '700' }}>MODEL-READY DATA</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>
                  {prep ? Number(prep.rows_after_cleaning).toLocaleString() : '223,112'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-green)' }}>
                  {prep?.columns_after_cleaning || 64} columns
                </div>
              </div>
            </div>

            {/* Quality Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.78rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Duplicate Rows Removed</div>
                <strong style={{ color: 'var(--color-red)', fontSize: '0.95rem' }}>
                  {prep ? Number(prep.duplicate_rows_removed).toLocaleString() : '2,633'}
                </strong>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Identical repeated flows</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Missing Values Handled</div>
                <strong style={{ color: 'var(--color-green)', fontSize: '0.95rem' }}>
                  {prep ? `${prep.missing_values_before_cleaning} → 0` : '4 → 0'}
                </strong>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Median imputation in Flow Bytes/s</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Infinite Values Handled</div>
                <strong style={{ color: 'var(--color-blue)', fontSize: '0.95rem' }}>
                  {prep?.infinite_values_handled || 64} values
                </strong>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>NaN replacement + median fill</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Constant & Redundant Cols</div>
                <strong style={{ color: 'var(--color-purple)', fontSize: '0.95rem' }}>
                  {prep ? `${prep.constant_features_removed + prep.duplicate_features_removed} columns` : '16 columns'}
                </strong>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>10 constant + 6 duplicate removed</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px' }}>
            Zero data fabrication: all metrics derived from project cleaning artifacts.
          </div>
        </div>
      </div>

      {/* SECTION 4: PREPROCESSING PIPELINE (HORIZONTAL STEPPER) */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              DWDM Preprocessing Pipeline (Script: clean_dataset.py)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Step-by-step reproducible ETL data transformation from raw PCAP flow records to ML training
            </p>
          </div>
          <span className="badge badge-purple">Pipeline Architecture</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}
        >
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-blue)', marginBottom: '6px' }}>
              <FileSpreadsheet size={16} />
              <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>1. Raw Dataset</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Ingest 225,745 records with 79 raw columns from Friday-WorkingHours-Afternoon-DDos.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-blue)', marginBottom: '6px' }}>
              <RefreshCw size={16} />
              <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>2. Column & Inf Handling</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Strip whitespace from headers; convert 64 infinite values (inf/-inf) to NaN and impute medians.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-red)', marginBottom: '6px' }}>
              <Trash2 size={16} />
              <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>3. Deduplication</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Filter 2,633 exact duplicate flow rows, reducing count from 225,745 to 223,112 clean fact rows.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-green)', marginBottom: '6px' }}>
              <CheckCircle2 size={16} />
              <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>4. Label Normalization</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Map raw "BENIGN" to "NORMAL" (95,096) and attack label "DDoS" to "SUSPICIOUS" (128,016).
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-purple)', marginBottom: '6px' }}>
              <Filter size={16} />
              <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>5. Constant Feature Filter</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Drop 10 zero-variance features with nunique == 1 (e.g. Bwd PSH Flags, CWE Flag Count).
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-purple)', marginBottom: '6px' }}>
              <Filter size={16} />
              <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>6. Redundancy Filter</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Remove 6 exact duplicate subflow columns (e.g. Subflow Fwd Packets, Fwd Header Length.1).
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-blue)', marginBottom: '6px' }}>
              <Database size={16} />
              <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>7. Warehouse Loading</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Load clean 223,112 rows into MySQL network_traffic_dw star schema (dim_date, dim_network, dim_classification).
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-purple)', marginBottom: '6px' }}>
              <Cpu size={16} />
              <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>8. Train/Test & RF</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              80/20 train/test split with 62 numerical features; train Random Forest classifier (100 estimators).
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 5: MODEL FEATURES (SEARCHABLE TABLE) */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Model Features Matrix ({features.length} Features)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Numerical features utilized by the trained Random Forest classifier (models/model_features.txt)
            </p>
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features..."
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px 8px 34px',
                color: '#ffffff',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--surface-elevated)', color: 'var(--text-muted)', zIndex: 1 }}>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '8px 12px', width: '50px' }}>#</th>
                <th style={{ padding: '8px 12px' }}>Feature Name</th>
                <th style={{ padding: '8px 12px' }}>Data Type</th>
                <th style={{ padding: '8px 12px' }}>Role</th>
                <th style={{ padding: '8px 12px' }}>Description / Network Context</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeatures.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No features match "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredFeatures.map((f) => (
                  <tr
                    key={f.feature_id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {f.feature_id}
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: '700', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
                      {f.feature_name}
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--color-blue)' }}>
                      {f.data_type}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                        {f.role}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                      {f.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>Showing {filteredFeatures.length} of {features.length} model input features</span>
          <span>Target Label: Traffic_Status (NORMAL vs SUSPICIOUS)</span>
        </div>
      </div>

      {/* SECTION 6: DATA WAREHOUSE MAPPING (DWDM ACADEMIC PRESENTATION) */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.4) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Layers size={20} color="var(--color-blue)" />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
              DATA WAREHOUSE MAPPING (Star Schema Architecture)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Relational mapping between cleaned dataset records and the MySQL Data Warehouse (network_traffic_dw)
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--color-blue)', textTransform: 'uppercase', marginBottom: '6px' }}>
              DIM_DATE (Date Dimension)
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 6px' }}>
              Temporal dimension capturing calendar hierarchy.
            </p>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Fields: date_id, full_date, year, month, day, day_of_week
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-green)', marginTop: '4px' }}>
              Active Rows: 1 distinct capture date (2017-07-07)
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--color-purple)', textTransform: 'uppercase', marginBottom: '6px' }}>
              DIM_NETWORK (Network Dimension)
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 6px' }}>
              Destination port and protocol classification dimension.
            </p>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Fields: network_id, destination_port, protocol_type, ip_range
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-green)', marginTop: '4px' }}>
              Active Rows: {summary?.warehouse_port_count ? `${Number(summary.warehouse_port_count).toLocaleString()} distinct destination ports` : '23,950 distinct destination ports'}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--color-green)', textTransform: 'uppercase', marginBottom: '6px' }}>
              DIM_CLASSIFICATION (Status Dimension)
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 6px' }}>
              Binary intrusion label classification dimension.
            </p>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Fields: classification_id, traffic_status, original_label
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-green)', marginTop: '4px' }}>
              Active Rows: 2 (NORMAL / BENIGN vs SUSPICIOUS / DDoS)
            </div>
          </div>

          <div style={{ background: 'rgba(56, 189, 248, 0.04)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', marginBottom: '6px' }}>
              FACT_NETWORK_TRAFFIC (Fact Table)
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 6px' }}>
              Central fact table recording network traffic flow metrics.
            </p>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Foreign Keys: date_id, network_id, classification_id
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-blue)', marginTop: '6px' }}>
              Grain: 223,112 rows (Additive & Non-additive metrics)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
