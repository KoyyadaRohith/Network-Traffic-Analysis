import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  PageHeader,
  FilterBar,
  DataTable,
  StatusBadge,
  EmptyState,
  ErrorState,
  Button,
} from '../components/ui';
import RecordDetailModal from '../components/RecordDetailModal';
import { useAppContext } from '../context/AppContext';
import { fetchTrafficAnalytics } from '../api/trafficAnalyticsApi';

export default function TrafficExplorer() {
  const {
    filters: globalFilters,
    setFilters: setGlobalFilters,
    resetFilters: resetGlobalFilters,
    selectedRecord: globalSelectedRecord,
    setSelectedRecord: setGlobalSelectedRecord,
  } = useAppContext();

  // URL query parameter parsing on initial mount
  const searchParams = new URLSearchParams(window.location.search);
  const initialStatus = searchParams.get('status') || globalFilters.status || 'ALL';
  const initialPort = searchParams.get('port') || globalFilters.port || 'ALL';
  const initialDate = searchParams.get('date') || globalFilters.date || 'ALL';
  const initialSearch = searchParams.get('search') || '';

  // Local filter controls state
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [portFilter, setPortFilter] = useState(initialPort);
  const [dateFilter, setDateFilter] = useState(initialDate);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Active committed filters state (drives the current query)
  const [activeFilters, setActiveFilters] = useState({
    status: initialStatus,
    port: initialPort,
    date: initialDate,
    search: initialSearch,
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting state
  const [sortBy, setSortBy] = useState('traffic_id');
  const [sortOrder, setSortOrder] = useState('asc');

  // Query results
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Record detail modal
  const [inspectRecord, setInspectRecord] = useState(globalSelectedRecord || null);
  const [isDetailOpen, setIsDetailOpen] = useState(Boolean(globalSelectedRecord));

  // Sync from globalFilters if navigation occurred with new filters
  useEffect(() => {
    if (
      globalFilters.status !== activeFilters.status ||
      globalFilters.port !== activeFilters.port ||
      globalFilters.date !== activeFilters.date
    ) {
      setStatusFilter(globalFilters.status || 'ALL');
      setPortFilter(globalFilters.port || 'ALL');
      setDateFilter(globalFilters.date || 'ALL');
      setActiveFilters((prev) => ({
        ...prev,
        status: globalFilters.status || 'ALL',
        port: globalFilters.port || 'ALL',
        date: globalFilters.date || 'ALL',
      }));
      setPage(1);
    }
  }, [globalFilters]);

  // Main data loader function
  const loadData = useCallback(async (filtersToUse, targetPage, targetPageSize, targetSortBy, targetSortOrder) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchTrafficAnalytics({
        status: filtersToUse.status,
        port: filtersToUse.port,
        date: filtersToUse.date,
        search: filtersToUse.search,
        page: targetPage,
        page_size: targetPageSize,
        sort_by: targetSortBy,
        sort_order: targetSortOrder,
      });

      setRecords(data.records || []);
      setSummary(data.summary || null);

      const total = data.pagination?.total_records ?? data.summary?.total_records ?? 0;
      setTotalRecords(total);
      setTotalPages(data.pagination?.total_pages ?? Math.max(1, Math.ceil(total / targetPageSize)));
    } catch (err) {
      console.error('Failed to query traffic explorer records:', err);
      setError('Unable to load traffic analysis. Please ensure the backend server and MySQL database are active.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when activeFilters, page, pageSize, or sort changes
  useEffect(() => {
    loadData(activeFilters, page, pageSize, sortBy, sortOrder);

    // Sync URL query params without reloading
    const params = new URLSearchParams();
    if (activeFilters.status !== 'ALL') params.set('status', activeFilters.status);
    if (activeFilters.port !== 'ALL') params.set('port', activeFilters.port);
    if (activeFilters.date !== 'ALL') params.set('date', activeFilters.date);
    if (activeFilters.search) params.set('search', activeFilters.search);
    if (page > 1) params.set('page', page);

    const queryString = params.toString();
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [activeFilters, page, pageSize, sortBy, sortOrder, loadData]);

  // Apply filters action
  const handleApplyFilters = (filtersFromBar) => {
    const updated = {
      status: filtersFromBar?.status ?? statusFilter,
      port: filtersFromBar?.port ?? portFilter,
      date: filtersFromBar?.date ?? dateFilter,
      search: filtersFromBar?.search ?? searchQuery,
    };
    setActiveFilters(updated);
    setGlobalFilters({
      status: updated.status,
      port: updated.port,
      date: updated.date,
    });
    setPage(1);
  };

  // Reset filters action
  const handleResetFilters = () => {
    const cleared = {
      status: 'ALL',
      port: 'ALL',
      date: 'ALL',
      search: '',
    };
    setStatusFilter('ALL');
    setPortFilter('ALL');
    setDateFilter('ALL');
    setSearchQuery('');
    setActiveFilters(cleared);
    resetGlobalFilters();
    setPage(1);
  };

  // Clear a single active filter badge
  const handleRemoveFilter = (key) => {
    const updated = { ...activeFilters };
    if (key === 'status') {
      updated.status = 'ALL';
      setStatusFilter('ALL');
      setGlobalFilters({ status: 'ALL' });
    } else if (key === 'port') {
      updated.port = 'ALL';
      setPortFilter('ALL');
      setGlobalFilters({ port: 'ALL' });
    } else if (key === 'date') {
      updated.date = 'ALL';
      setDateFilter('ALL');
      setGlobalFilters({ date: 'ALL' });
    } else if (key === 'search') {
      updated.search = '';
      setSearchQuery('');
    }
    setActiveFilters(updated);
    setPage(1);
  };

  // Sort click handler
  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // Row selection handler
  const handleRowClick = (row) => {
    setInspectRecord(row);
    setGlobalSelectedRecord(row);
    setIsDetailOpen(true);
  };

  // Columns specification
  const columns = [
    {
      key: 'traffic_id',
      header: 'Record ID',
      sortable: true,
      render: (val) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--color-cyan)' }}>
          #{val}
        </span>
      ),
    },
    {
      key: 'destination_port',
      header: 'Dest Port',
      sortable: true,
      render: (val) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
          Port {val}
        </span>
      ),
    },
    {
      key: 'traffic_status',
      header: 'Traffic Status',
      align: 'center',
      render: (val) => <StatusBadge status={val} size="sm" />,
    },
    {
      key: 'flow_duration',
      header: 'Flow Duration',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>
          {Number(val || 0).toLocaleString()} µs
        </span>
      ),
    },
    {
      key: 'total_fwd_packets',
      header: 'Fwd Packets',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {Number(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'total_backward_packets',
      header: 'Bwd Packets',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {Number(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'packet_length_mean',
      header: 'Packet Length Mean',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-cyan)' }}>
          {Number(val || 0).toFixed(1)}
        </span>
      ),
    },
    {
      key: 'flow_bytes_per_sec',
      header: 'Flow Bytes/s',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {Number(val || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}
        </span>
      ),
    },
    {
      key: 'flow_packets_per_sec',
      header: 'Flow Packets/s',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {Number(val || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}
        </span>
      ),
    },
  ];

  const hasActiveFilters =
    activeFilters.status !== 'ALL' ||
    activeFilters.port !== 'ALL' ||
    activeFilters.date !== 'ALL' ||
    Boolean(activeFilters.search);

  const startRecord = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalRecords);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Academic Page Header */}
      <PageHeader
        title="TRAFFIC EXPLORER"
        description="Explore and filter individual network traffic records."
        badge={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-info">CICIDS2017 Dataset</span>
            <span className="badge badge-neutral">fact_network_traffic</span>
            <span className="badge badge-neutral">MySQL DW</span>
          </div>
        }
      />

      {/* 2. Global Filter Bar */}
      <FilterBar
        status={statusFilter}
        port={portFilter}
        date={dateFilter}
        search={searchQuery}
        showSearch={true}
        onStatusChange={setStatusFilter}
        onPortChange={setPortFilter}
        onDateChange={setDateFilter}
        onSearchChange={setSearchQuery}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        applyLabel="APPLY"
        resetLabel="RESET"
        loading={loading}
      />

      {/* 3. Active Filters Visual Feedback */}
      {hasActiveFilters && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '10px 14px',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
          }}
        >
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Active filters:</span>

          {activeFilters.status !== 'ALL' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--color-cyan)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.74rem',
              }}
            >
              Status: {activeFilters.status}
              <X
                size={12}
                style={{ cursor: 'pointer', opacity: 0.7 }}
                onClick={() => handleRemoveFilter('status')}
              />
            </span>
          )}

          {activeFilters.port !== 'ALL' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--color-cyan)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.74rem',
              }}
            >
              Port: {activeFilters.port}
              <X
                size={12}
                style={{ cursor: 'pointer', opacity: 0.7 }}
                onClick={() => handleRemoveFilter('port')}
              />
            </span>
          )}

          {activeFilters.date !== 'ALL' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--color-cyan)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.74rem',
              }}
            >
              Date: {activeFilters.date}
              <X
                size={12}
                style={{ cursor: 'pointer', opacity: 0.7 }}
                onClick={() => handleRemoveFilter('date')}
              />
            </span>
          )}

          {Boolean(activeFilters.search) && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--color-cyan)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.74rem',
              }}
            >
              Search: "{activeFilters.search}"
              <X
                size={12}
                style={{ cursor: 'pointer', opacity: 0.7 }}
                onClick={() => handleRemoveFilter('search')}
              />
            </span>
          )}

          <button
            onClick={handleResetFilters}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-cyan)',
              cursor: 'pointer',
              fontSize: '0.74rem',
              fontWeight: 600,
              textDecoration: 'underline',
              marginLeft: '4px',
            }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* 4. Error State */}
      {error && (
        <ErrorState
          title="Unable to load traffic analysis."
          message={error}
          onRetry={() => loadData(activeFilters, page, pageSize, sortBy, sortOrder)}
        />
      )}

      {/* 5. Summary Info Bar */}
      {!error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Traffic Flow Records
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              ({totalRecords.toLocaleString()} matching records in Data Warehouse)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Page size:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '4px 8px',
                fontSize: '0.78rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}

      {/* 6. Analytical Data Table */}
      {!error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {totalRecords === 0 && !loading ? (
            <EmptyState
              title="NO TRAFFIC RECORDS FOUND"
              description="Try changing or clearing the current filters."
              actionLabel="Reset Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <DataTable
              columns={columns}
              data={records}
              keyField="traffic_id"
              loading={loading}
              selectedRowId={inspectRecord?.traffic_id}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onRowClick={handleRowClick}
              emptyMessage="No traffic records match the active criteria."
            />
          )}

          {/* 7. Pagination Controls */}
          {totalRecords > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '10px 14px',
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Showing {startRecord.toLocaleString()}–{endRecord.toLocaleString()} of {totalRecords.toLocaleString()} records
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  icon={ChevronLeft}
                >
                  Previous
                </Button>

                <span
                  style={{
                    fontSize: '0.78rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    padding: '0 8px',
                  }}
                >
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  icon={ChevronRight}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8. Record Detail Modal */}
      <RecordDetailModal
        record={inspectRecord}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setInspectRecord(null);
          setGlobalSelectedRecord(null);
        }}
      />
    </div>
  );
}
