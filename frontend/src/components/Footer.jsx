import React from 'react';

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: '32px',
        padding: '16px 0',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        fontSize: '0.74rem',
        color: 'var(--text-muted)',
      }}
    >
      <div>
        <strong style={{ color: 'var(--text-primary)' }}>
          Network Traffic Analysis
        </strong>{' '}
        — Data Warehousing and Data Mining
      </div>

      <div style={{ color: 'var(--text-muted)' }}>
        CICIDS2017 Dataset | MySQL Data Warehouse | OLAP | Random Forest
      </div>
    </footer>
  );
}
