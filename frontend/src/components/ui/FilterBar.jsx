import React from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import SelectControl from './SelectControl';
import Button from './Button';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Traffic' },
  { value: 'NORMAL', label: 'NORMAL (BENIGN)' },
  { value: 'SUSPICIOUS', label: 'SUSPICIOUS (DDoS)' },
];

const PORT_OPTIONS = [
  { value: 'ALL', label: 'All Destination Ports' },
  { value: '80', label: 'Port 80 (HTTP)' },
  { value: '443', label: 'Port 443 (HTTPS)' },
  { value: '53', label: 'Port 53 (DNS)' },
  { value: '8080', label: 'Port 8080 (HTTP-Alt)' },
  { value: '22', label: 'Port 22 (SSH)' },
  { value: '21', label: 'Port 21 (FTP)' },
  { value: '123', label: 'Port 123 (NTP)' },
  { value: '445', label: 'Port 445 (SMB)' },
];

const DATE_OPTIONS = [
  { value: 'ALL', label: 'All Capture Dates' },
  { value: '2017-07-07', label: '2017-07-07 (Friday)' },
];

export default function FilterBar({
  status = 'ALL',
  port = 'ALL',
  date = 'ALL',
  search,
  onStatusChange,
  onPortChange,
  onDateChange,
  onSearchChange,
  onApply,
  onReset,
  loading = false,
  showSearch = false,
  applyLabel = 'Apply Filters',
  resetLabel = 'Reset',
  className = '',
  style = {},
}) {
  const handleSubmit = (e) => {
    e?.preventDefault();
    onApply?.({ status, port, date, search });
  };

  const hasActiveFilters =
    status !== 'ALL' ||
    port !== 'ALL' ||
    date !== 'ALL' ||
    Boolean(search && search.trim());

  return (
    <form
      onSubmit={handleSubmit}
      className={`filter-bar-card ${className}`}
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        gap: '12px',
        ...style,
      }}
    >
      <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
        <SelectControl
          label="Traffic Status"
          value={status}
          onChange={onStatusChange}
          options={STATUS_OPTIONS}
          disabled={loading}
        />
      </div>

      <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
        <SelectControl
          label="Destination Port"
          value={port}
          onChange={onPortChange}
          options={PORT_OPTIONS}
          disabled={loading}
        />
      </div>

      <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
        <SelectControl
          label="Capture Date"
          value={date}
          onChange={onDateChange}
          options={DATE_OPTIONS}
          disabled={loading}
        />
      </div>

      {(showSearch || onSearchChange) && (
        <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.74rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            Search
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={search || ''}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search traffic records..."
              disabled={loading}
              style={{
                width: '100%',
                padding: '7px 10px 7px 32px',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
        <Button
          type="submit"
          variant="cyan"
          size="md"
          loading={loading}
          icon={Filter}
        >
          {applyLabel}
        </Button>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            icon={RotateCcw}
            onClick={onReset}
            disabled={loading}
          >
            {resetLabel}
          </Button>
        )}
      </div>
    </form>
  );
}
