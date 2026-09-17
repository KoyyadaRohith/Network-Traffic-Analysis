import React from 'react';
import { Calendar, Clock, Database } from 'lucide-react';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DateSummary({ dateData, loading }) {
  if (loading || !dateData || dateData.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px' }}>Traffic by Date</h3>
        <div className="skeleton" style={{ height: '140px', width: '100%', borderRadius: '8px' }} />
      </div>
    );
  }

  const item = dateData[0] || {};
  const monthName = MONTH_NAMES[item.month] || `Month ${item.month}`;

  return (
    <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
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
            <Calendar size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Traffic by Date
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Temporal dimension breakdown from dim_date
            </p>
          </div>
        </div>
        <span className="badge badge-info">dim_date</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: 'JetBrains Mono, monospace' }}>
            {item.date}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-blue)', fontWeight: '600', marginTop: '2px' }}>
            {Number(item.total_records).toLocaleString()} Total Records Captured
          </div>
        </div>

        {/* Date Breakdown Grid */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Year</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{item.year}</div>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Month</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{monthName}</div>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Day</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{item.day}</div>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weekday</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-blue)' }}>{item.day_of_week}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
