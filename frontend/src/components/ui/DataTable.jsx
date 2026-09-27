import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  loading = false,
  emptyMessage = 'No records found in database.',
  onRowClick,
  selectedRowId = null,
  sortBy = null,
  sortOrder = 'desc',
  onSort = null,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`data-table-container ${className}`}
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        width: '100%',
        ...style,
      }}
    >
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.82rem',
          }}
        >
          <thead>
            <tr
              style={{
                background: 'var(--surface-elevated)',
                borderBottom: '1px solid var(--border-main)',
              }}
            >
              {columns.map((col, idx) => {
                const isSorted = sortBy === col.key;
                const canSort = Boolean(col.sortable && onSort);

                return (
                  <th
                    key={col.key || idx}
                    onClick={canSort ? () => onSort(col.key) : undefined}
                    style={{
                      padding: '10px 14px',
                      fontWeight: 700,
                      fontSize: '0.74rem',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: isSorted ? 'var(--color-cyan)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      textAlign: col.align || 'left',
                      cursor: canSort ? 'pointer' : 'default',
                      userSelect: canSort ? 'none' : 'auto',
                      ...col.headerStyle,
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start',
                        width: '100%',
                      }}
                    >
                      <span>{col.header}</span>
                      {canSort && (
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          {isSorted ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp size={13} color="var(--color-cyan)" />
                            ) : (
                              <ArrowDown size={13} color="var(--color-cyan)" />
                            )
                          ) : (
                            <ArrowUpDown size={12} style={{ opacity: 0.35 }} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '30px 14px', textAlign: 'center' }}>
                  <LoadingState compact message="Fetching table records..." />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '24px 14px' }}>
                  <EmptyState title={emptyMessage} description="" />
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => {
                const isSelected = selectedRowId !== null && selectedRowId !== undefined && row[keyField] === selectedRowId;

                return (
                  <tr
                    key={row[keyField] || rowIdx}
                    onClick={() => onRowClick?.(row)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background-color 0.15s ease',
                      backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--color-cyan)' : '3px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (onRowClick && !isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (onRowClick && !isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={col.key || colIdx}
                        style={{
                          padding: '9px 14px',
                          color: 'var(--text-primary)',
                          textAlign: col.align || 'left',
                          whiteSpace: col.wrap ? 'normal' : 'nowrap',
                          ...col.cellStyle,
                        }}
                      >
                        {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
