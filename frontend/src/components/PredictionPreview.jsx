import React, { useState, useRef } from 'react';
import {
  BrainCircuit,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { predictTraffic } from '../api/predictionApi';

export default function PredictionPreview({ onPredictionComplete }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    setError(null);
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith('.csv')) {
      setError('Invalid file format. Please upload a valid CSV file (.csv).');
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setError(null);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;

    if (!dropped.name.toLowerCase().endsWith('.csv')) {
      setError('Invalid file format. Please upload a valid CSV file (.csv).');
      setFile(null);
      return;
    }

    setFile(dropped);
  };

  const handleLoadSample = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/sample_traffic_test.csv');
      if (!res.ok) throw new Error('Sample file unavailable');
      const blob = await res.blob();
      const sampleFile = new File([blob], 'sample_traffic_test.csv', { type: 'text/csv' });
      setFile(sampleFile);
    } catch {
      setError('Unable to load sample test file.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please choose a CSV file first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await predictTraffic(file);
      setResult(data);
      if (onPredictionComplete) {
        onPredictionComplete(data);
      }
    } catch (err) {
      setError(err.message || 'Traffic prediction failed. Please verify the backend service.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setShowTable(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        minHeight: '420px',
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(168, 85, 247, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-purple)',
              }}
            >
              <BrainCircuit size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Traffic Prediction
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Real-time Random Forest inference (62 features)
              </p>
            </div>
          </div>
          <span className={`badge ${result ? (result.analysis.overall_status === 'SUSPICIOUS' ? 'badge-suspicious' : 'badge-normal') : 'badge-purple'}`}>
            {result ? result.analysis.overall_status : 'Model Ready'}
          </span>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.8rem',
              color: 'var(--color-red)',
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1, wordBreak: 'break-word' }}>{error}</div>
            <button
              onClick={() => setError(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-red)', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* State 1: Upload View (when no result yet) */}
        {!result && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <Sparkles size={16} color="var(--color-purple)" />
              <span>Model loaded: <strong style={{ color: 'var(--color-green)' }}>RandomForest (NORMAL vs SUSPICIOUS)</strong></span>
            </div>

            {/* Drag & Drop Upload Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border-accent)',
                borderRadius: 'var(--radius-md)',
                padding: '24px 16px',
                textAlign: 'center',
                background: file ? 'rgba(56, 189, 248, 0.04)' : 'rgba(15, 23, 42, 0.4)',
                marginBottom: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                style={{ display: 'none' }}
              />

              {file ? (
                <div>
                  <FileCheck size={32} color="var(--color-blue)" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff', wordBreak: 'break-all' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-blue)', marginTop: '4px' }}>
                    {formatFileSize(file.size)} • Click or drop to change
                  </div>
                </div>
              ) : (
                <div>
                  <UploadCloud size={32} color="var(--color-blue)" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    Upload Traffic Data
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Drag & drop network flows (.csv) or click to browse
                  </div>
                </div>
              )}
            </div>

            {/* Quick Demo Sample Helper Link */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={handleLoadSample}
                disabled={loading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-blue)',
                  fontSize: '0.76rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  textDecoration: 'underline',
                }}
              >
                <Sparkles size={13} />
                Quick Load Demo Sample (25 flows)
              </button>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={handleAnalyze}
              disabled={loading || !file}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Running Inference...
                </>
              ) : (
                <>
                  <BrainCircuit size={16} />
                  Analyze Traffic
                </>
              )}
            </button>
          </>
        )}

        {/* State 2: Prediction Results Panel */}
        {result && (
          <div>
            {/* Status Banner */}
            <div
              style={{
                background: result.analysis.overall_status === 'SUSPICIOUS' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                border: `1px solid ${result.analysis.overall_status === 'SUSPICIOUS' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
                  Traffic Analysis Result
                </span>
                <span className={`badge ${result.analysis.overall_status === 'SUSPICIOUS' ? 'badge-suspicious' : 'badge-normal'}`}>
                  {result.analysis.overall_status === 'SUSPICIOUS' ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                  {result.analysis.overall_status}
                </span>
              </div>

              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
                {Number(result.total_records).toLocaleString()} records analyzed
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {result.analysis.summary}
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Normal</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-green)' }}>
                  {Number(result.normal_records).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {result.normal_percentage}%
                </div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Suspicious</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-red)' }}>
                  {Number(result.suspicious_records).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {result.suspicious_percentage}%
                </div>
              </div>
            </div>

            {/* Key Observations */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Observations:
              </div>
              <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {result.analysis.observations.map((obs, idx) => (
                  <li key={idx}>{obs}</li>
                ))}
              </ul>
            </div>

            {/* Recommendation */}
            <div
              style={{
                background: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                marginBottom: '16px',
                fontSize: '0.76rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: 'var(--color-blue)' }}>Recommendation: </strong>
              {result.analysis.recommendation}
            </div>

            {/* Toggle Table of First 20 Predictions */}
            <div style={{ marginBottom: '14px' }}>
              <button
                onClick={() => setShowTable((prev) => !prev)}
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.78rem', padding: '8px 12px', justifyContent: 'space-between' }}
              >
                <span>
                  {showTable ? 'Hide Flow Predictions' : `Show Predictions (first ${Math.min(20, result.predictions.length)} rows)`}
                </span>
                {showTable ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showTable && (
                <div style={{ marginTop: '10px', maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ padding: '6px 8px', fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-subtle)' }}>
                    Showing first {Math.min(20, result.predictions.length)} predictions.
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem', textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#0d1322', color: 'var(--text-muted)' }}>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ padding: '6px 8px' }}>#</th>
                        <th style={{ padding: '6px 8px' }}>Prediction</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Confidence</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Normal Probability</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Suspicious Probability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.predictions.slice(0, 20).map((row) => (
                        <tr key={row.row_number} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '6px 8px', color: 'var(--text-muted)' }}>{row.row_number}</td>
                          <td style={{ padding: '6px 8px' }}>
                            <span style={{ color: row.prediction === 'SUSPICIOUS' ? 'var(--color-red)' : 'var(--color-green)', fontWeight: '700' }}>
                              {row.prediction}
                            </span>
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600', color: '#ffffff' }}>
                            {(row.confidence * 100).toFixed(1)}%
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--color-green)' }}>
                            {(row.normal_probability * 100).toFixed(1)}%
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--color-red)' }}>
                            {(row.suspicious_probability * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Reset Button */}
            <button
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.82rem' }}
              onClick={handleReset}
            >
              <RefreshCw size={14} />
              Analyze Another Dataset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
