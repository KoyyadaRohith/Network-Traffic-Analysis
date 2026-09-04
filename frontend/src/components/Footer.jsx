import React from 'react';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: '48px',
        padding: '24px 0',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Shield size={16} color="var(--color-blue)" />
        <span>
          <strong style={{ color: 'var(--text-primary)' }}>NetGuard</strong> — Network Traffic Analysis Using Data Warehousing and Data Mining
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <a href="#about" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>
          About
        </a>
        <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" style={{ color: 'var(--color-blue)', textDecoration: 'none' }}>
          API Docs (Swagger)
        </a>
        <a href="#help" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          Help & Architecture
        </a>
      </div>
    </footer>
  );
}
