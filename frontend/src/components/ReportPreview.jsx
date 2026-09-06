import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  Layers,
  Gauge,
  Activity,
  Sparkles,
} from 'lucide-react';

export default function ReportPreview({ report: propReport }) {
  const [report, setReport] = useState(propReport || null);

  // Sync prop changes
  useEffect(() => {
    if (propReport) {
      setReport(propReport);
    }
  }, [propReport]);

  const handlePrint = () => {
    window.print();
  };

  // Demo loader if user wants to inspect report before running custom upload
  const handleLoadDemoReport = async () => {
    try {
      const res = await fetch('/sample_traffic_test.csv');
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('file', new File([blob], 'sample_traffic_test.csv', { type: 'text/csv' }));

      const apiRes = await fetch('/api/predict', { method: 'POST', body: formData });
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.report) {
          setReport(json.report);
        }
      }
    } catch (err) {
      console.error('Failed to load demo report:', err);
    }
  };

  const getRiskBadgeClass = (level) => {
    switch (level) {
      case 'LOW':
        return 'badge-normal';
      case 'MODERATE':
        return 'badge-info';
      case 'HIGH':
        return 'badge-suspicious';
      case 'CRITICAL':
        return 'badge-suspicious';
      default:
        return 'badge-purple';
    }
  };

  return (
    <div
      className="glass-card print-report-card"
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
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-blue)',
              }}
            >
              <FileText size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Traffic Analysis Report
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Model evaluation & traffic classification report
              </p>
            </div>
          </div>
          {report ? (
            <span className={`badge ${getRiskBadgeClass(report.risk_assessment.risk_level)}`}>
              Risk: {report.risk_assessment.risk_level}
            </span>
          ) : (
            <span className="badge badge-info">Evaluation Report</span>
          )}
        </div>

        {/* State 1: Standby View (before evaluation) */}
        {!report && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '18px' }}>
              Generates an evaluation report of traffic classification, observed packet flow metrics, classifier confidence distributions, and traffic indicators based on evaluated traffic records.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <ShieldCheck size={16} color="var(--color-green)" />
                <span>Academic Traffic Classification & Risk Metric calculation</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Activity size={16} color="var(--color-blue)" />
                <span>Comprehensive flow duration & packet rate profiling</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Gauge size={16} color="var(--color-purple)" />
                <span>Class-specific confidence & decision rationale</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.82rem' }}
                onClick={handleLoadDemoReport}
              >
                <Sparkles size={14} color="var(--color-blue)" />
                Preview Sample Evaluation Report
              </button>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Run an evaluation in Traffic Prediction to generate a live report.
              </div>
            </div>
          </div>
        )}

        {/* State 2: Active Professional Report View */}
        {report && (
          <div className="report-content-body">
            {/* Section 1: Overview & Risk Header */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                    Evaluation Overview
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                    {Number(report.overview.total_records).toLocaleString()} Flow Records
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${getRiskBadgeClass(report.risk_assessment.risk_level)}`}>
                    {report.risk_assessment.risk_level} RISK
                  </span>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {report.risk_assessment.framework}
                  </div>
                </div>
              </div>

              {/* Classification Split Bar */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: '600', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-green)' }}>
                    Normal: {report.classification.normal_percentage}% ({Number(report.classification.normal_count).toLocaleString()})
                  </span>
                  <span style={{ color: 'var(--color-red)' }}>
                    Suspicious: {report.classification.suspicious_percentage}% ({Number(report.classification.suspicious_count).toLocaleString()})
                  </span>
                </div>
                <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${report.classification.normal_percentage}%`, background: 'var(--color-green)', height: '100%' }} />
                  <div style={{ width: `${report.classification.suspicious_percentage}%`, background: 'var(--color-red)', height: '100%' }} />
                </div>
              </div>
            </div>

            {/* Section 2: Model Confidence Metrics */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                Model Classification Confidence
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Average</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff' }}>
                    {(report.confidence.average_confidence * 100).toFixed(1)}%
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Minimum</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    {(report.confidence.minimum_confidence * 100).toFixed(1)}%
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Maximum</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-blue)' }}>
                    {(report.confidence.maximum_confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Traffic Profile Analysis */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                Observed Traffic Profile
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', fontSize: '0.76rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Avg Flow Duration</div>
                  <strong style={{ color: '#ffffff' }}>{Number(report.traffic_profile.average_flow_duration).toLocaleString()} μs</strong>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Avg Fwd Packets</div>
                  <strong style={{ color: '#ffffff' }}>{Number(report.traffic_profile.average_fwd_packets).toLocaleString()}</strong>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Avg Backward Packets</div>
                  <strong style={{ color: '#ffffff' }}>{Number(report.traffic_profile.average_backward_packets).toLocaleString()}</strong>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Avg Packet Length</div>
                  <strong style={{ color: '#ffffff' }}>{Number(report.traffic_profile.average_packet_length).toLocaleString()} B</strong>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Avg Flow Bytes/sec</div>
                  <strong style={{ color: '#ffffff' }}>{Number(report.traffic_profile.average_flow_bytes_per_sec).toLocaleString()}</strong>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Avg Flow Pkts/sec</div>
                  <strong style={{ color: '#ffffff' }}>{Number(report.traffic_profile.average_flow_packets_per_sec).toLocaleString()}</strong>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Most Common Destination Port</div>
                  <strong style={{ color: 'var(--color-blue)' }}>
                    {report.traffic_profile.most_common_destination_port ? `Port ${report.traffic_profile.most_common_destination_port}` : 'N/A'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Section 4: Risk Assessment & Framework Thresholds */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Analytical Risk Assessment
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 6px' }}>
                {report.risk_assessment.description}
              </p>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Thresholds: 0–10% LOW • 10–30% MODERATE • 30–60% HIGH • 60–100% CRITICAL
              </div>
            </div>

            {/* Section 5: Classification Observations */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Factual Observations:
              </div>
              <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {report.observations.map((obs, idx) => (
                  <li key={idx} style={{ marginBottom: '3px' }}>{obs}</li>
                ))}
              </ul>
            </div>

            {/* Section 6: Actionable Recommendation */}
            <div
              style={{
                background: 'rgba(56, 189, 248, 0.06)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                marginBottom: '18px',
                fontSize: '0.76rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: 'var(--color-blue)' }}>Recommendation: </strong>
              {report.recommendation}
            </div>

            {/* Export / Print Button */}
            <div className="report-action-row" style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '0.82rem' }}
                onClick={handlePrint}
              >
                <Printer size={15} />
                Export / Print Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
