import React from 'react';
import { FileCheck2, Info, AlertOctagon } from 'lucide-react';

export default function AnalysisSummary({ summary }) {
  const isSuspiciousDominant = summary ? summary.suspicious_records > summary.normal_records : true;
  const suspPct = summary ? summary.suspicious_percentage : 57.38;

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
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
              <FileCheck2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Analysis Summary
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Automated DWDM warehouse telemetry findings
              </p>
            </div>
          </div>
          <span className="badge badge-suspicious">High Threat Index</span>
        </div>

        {/* Dynamic Telemetry Narrative */}
        <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '16px' }}>
          {isSuspiciousDominant
            ? `Traffic classification is currently dominated by suspicious DDoS flows in the selected dataset (${suspPct}% volume). Port 80 HTTP traffic forms the principal vector of anomaly density.`
            : `Traffic classification is currently characterized by predominantly normal benign packet transactions.`}
        </p>

        {/* Metadata Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '18px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dataset</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff', marginTop: '2px' }}>CICIDS2017</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Traffic Type</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-blue)', marginTop: '2px' }}>DDoS / BENIGN</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Analysis Mode</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff', marginTop: '2px' }}>Historical DW</div>
          </div>
        </div>
      </div>

      {/* Security Disclaimer Box */}
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.05)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <Info size={16} color="var(--color-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          This analysis is based on a historical dataset and does not represent your live network.
        </span>
      </div>
    </div>
  );
}
