import React from 'react';
import { Database, Layers, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function DatasetCard({ summary }) {
  const total = summary ? Number(summary.total_records).toLocaleString() : '223,112';

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 69, 0.4) 100%)',
      }}
    >
      {/* Decorative Network Grid Accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '180px',
          height: '100%',
          opacity: 0.1,
          backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
          backgroundSize: '12px 12px',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-blue)',
          }}
        >
          <Database size={18} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            CICIDS2017 Dataset
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Benchmark Intrusion Detection System Repository
          </p>
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '18px' }}>
        DDoS / BENIGN traffic analysis synthesized from Canadian Institute for Cybersecurity (CIC) packet traces, preprocessed and loaded into a normalized Star Schema Data Warehouse.
      </p>

      {/* Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <span className="badge badge-info">
          <Layers size={13} />
          Historical Dataset
        </span>
        <span className="badge badge-purple">
          <Database size={13} />
          {total} Records
        </span>
        <span className="badge badge-normal">
          <CheckCircle2 size={13} />
          2 Classes (DDoS & BENIGN)
        </span>
        <span className="badge badge-suspicious">
          <ShieldAlert size={13} />
          62 Traffic Dimensions
        </span>
      </div>
    </div>
  );
}
