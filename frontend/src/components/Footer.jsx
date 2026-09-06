import React from 'react';

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: '32px',
        padding: '16px 0',
        borderTop: '1px solid #1A1A1A',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        fontSize: '0.74rem',
        color: '#666666',
      }}
    >
      <div>
        <strong style={{ color: '#A0A0A0' }}>
          Network Traffic Analysis
        </strong>{' '}
        — Data Warehousing and Data Mining
      </div>

      <div style={{ color: '#666666' }}>
        CICIDS2017 Dataset | MySQL Data Warehouse | OLAP | Random Forest
      </div>
    </footer>
  );
}
