import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Filter,
  RotateCcw,
  Search,
  Database,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { fetchTrafficAnalytics } from '../api/trafficAnalyticsApi';
import {
  PageHeader,
  FilterBar,
  MetricCard,
  EmptyState,
  ErrorState,
  LoadingState,
  Button,
  StatusBadge,
} from '../components/ui';
import KpiCard from '../components/KpiCard';
import NetworkTrafficDistribution from '../components/NetworkTrafficDistribution';
import TrafficClassificationChart from '../components/TrafficClassificationChart';
import SystemInformationCard from '../components/SystemInformationCard';
import DWDMPipeline from '../components/DWDMPipeline';
import DatasetOverviewCard from '../components/DatasetOverviewCard';
import TopPortsChart from '../components/TopPortsChart';
import ProjectImpactCard from '../components/ProjectImpactCard';

export default function Dashboard() {
  const {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    setActiveTab,
  } = useAppContext();

  // Local draft filters for the filter bar
  const [draftStatus, setDraftStatus] = useState(filters.status || 'ALL');
  const [draftPort, setDraftPort] = useState(filters.port || 'ALL');
  const [draftDate, setDraftDate] = useState(filters.date || 'ALL');

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected interactive element from charts
  const [interactiveSelectedPort, setInteractiveSelectedPort] = useState(null);
  const [interactiveSelectedStatus, setInteractiveSelectedStatus] = useState(null);

  // Keep draft in sync if global filters change externally
  useEffect(() => {
    setDraftStatus(filters.status || 'ALL');
    setDraftPort(filters.port || 'ALL');
    setDraftDate(filters.date || 'ALL');
  }, [filters]);

  // Fetch real analytics from backend based on active filters
  const loadDashboardAnalytics = useCallback(async (activeFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrafficAnalytics({
        status: activeFilters.status,
        destination_port: activeFilters.port,
        date: activeFilters.date,
      });
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error loading dashboard analytics:', err);
      setError(err.message || 'Unable to load traffic analysis from Data Warehouse.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDashboardAnalytics(filters);
  }, [filters, loadDashboardAnalytics]);

  // Apply filters handler
  const handleApplyFilters = () => {
    const nextFilters = {
      status: draftStatus,
      port: draftPort,
      date: draftDate,
    };
    setFilters(nextFilters);
    loadDashboardAnalytics(nextFilters);
  };

  // Reset filters handler
  const handleResetFilters = () => {
    const defaultFilters = { status: 'ALL', port: 'ALL', date: 'ALL' };
    setDraftStatus('ALL');
    setDraftPort('ALL');
    setDraftDate('ALL');
    resetFilters();
    setInteractiveSelectedPort(null);
    setInteractiveSelectedStatus(null);
    loadDashboardAnalytics(defaultFilters);
  };

  // Quick action navigation
  const handleQuickAction = (quickFilters, targetTab = 'Traffic Explorer') => {
    setFilters(quickFilters);
    setActiveTab(targetTab);
  };

  const hasActiveFilters =
    filters.status !== 'ALL' || filters.port !== 'ALL' || filters.date !== 'ALL';

  const summary = analyticsData?.summary;
  const statistics = analyticsData?.statistics;
  const isNoRecords = !loading && summary && summary.total_records === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header */}
      <div className="dashboard-header" style={{ marginBottom: '4px' }}>
        <h1 className="dashboard-title">NETWORK TRAFFIC ANALYSIS</h1>
        <div className="dashboard-subtitle">
          Overview of the CICIDS2017 network traffic dataset.
        </div>
      </div>

      {/* 2. Global Analysis Filter Bar */}
      <FilterBar
        status={draftStatus}
        port={draftPort}
        date={draftDate}
        onStatusChange={setDraftStatus}
        onPortChange={setDraftPort}
        onDateChange={setDraftDate}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        loading={loading}
      />

      {/* 3. Filter Visual Feedback */}
      {hasActiveFilters && (
        <div
          className="active-filter-feedback"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            padding: '10px 16px',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
          }}
        >
          <span style={{ fontWeight: 700, color: 'var(--color-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} /> Active filters:
          </span>

          {filters.status !== 'ALL' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--surface-elevated)',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              Status: <strong style={{ color: filters.status === 'SUSPICIOUS' ? 'var(--color-red)' : 'var(--color-green)' }}>{filters.status}</strong>
              <button
                type="button"
                onClick={() => {
                  const updated = { ...filters, status: 'ALL' };
                  setDraftStatus('ALL');
                  setFilters(updated);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                title="Remove status filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.port !== 'ALL' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--surface-elevated)',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              Port: <strong style={{ color: 'var(--color-cyan)' }}>Port {filters.port}</strong>
              <button
                type="button"
                onClick={() => {
                  const updated = { ...filters, port: 'ALL' };
                  setDraftPort('ALL');
                  setFilters(updated);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                title="Remove port filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.date !== 'ALL' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--surface-elevated)',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              Date: <strong style={{ color: 'var(--text-primary)' }}>{filters.date}</strong>
              <button
                type="button"
                onClick={() => {
                  const updated = { ...filters, date: 'ALL' };
                  setDraftDate('ALL');
                  setFilters(updated);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                title="Remove date filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            style={{ marginLeft: 'auto', padding: '2px 8px', height: '26px', fontSize: '0.74rem' }}
          >
            Clear All
          </Button>
        </div>
      )}

      {/* 4. Quick Analysis Actions */}
      <div
        className="quick-analysis-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '12px 16px',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginRight: '4px',
          }}
        >
          QUICK ANALYSIS
        </span>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={AlertTriangle}
          onClick={() => handleQuickAction({ status: 'SUSPICIOUS', port: 'ALL', date: 'ALL' })}
        >
          View Suspicious Traffic
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={Database}
          onClick={() => handleQuickAction({ status: 'ALL', port: '80', date: 'ALL' })}
        >
          View Port 80
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={Search}
          onClick={() => handleQuickAction({ status: 'ALL', port: 'ALL', date: 'ALL' })}
        >
          Explore All Traffic
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={Layers}
          onClick={() => setActiveTab('OLAP Analysis')}
          style={{ marginLeft: 'auto' }}
        >
          OLAP Multidimensional Analysis <ArrowRight size={13} />
        </Button>
      </div>

      {/* Interactive Selection Alert (when user clicks a chart element) */}
      {(interactiveSelectedPort || interactiveSelectedStatus) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            padding: '10px 16px',
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-cyan)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
            <Sparkles size={16} color="var(--color-cyan)" />
            <span>
              Selected Chart Element:{' '}
              {interactiveSelectedPort && (
                <strong style={{ color: 'var(--color-cyan)' }}>Port {interactiveSelectedPort}</strong>
              )}
              {interactiveSelectedStatus && (
                <strong style={{ color: interactiveSelectedStatus === 'SUSPICIOUS' ? 'var(--color-red)' : 'var(--color-green)' }}>
                  {interactiveSelectedStatus}
                </strong>
              )}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {interactiveSelectedPort && (
              <>
                <Button
                  type="button"
                  variant="cyan"
                  size="sm"
                  onClick={() => {
                    setDraftPort(String(interactiveSelectedPort));
                    setFilters({ ...filters, port: String(interactiveSelectedPort) });
                    setInteractiveSelectedPort(null);
                  }}
                >
                  Filter Dashboard by Port {interactiveSelectedPort}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    handleQuickAction({ ...filters, port: String(interactiveSelectedPort) }, 'Traffic Explorer');
                  }}
                >
                  Explore in Explorer
                </Button>
              </>
            )}

            {interactiveSelectedStatus && (
              <>
                <Button
                  type="button"
                  variant="cyan"
                  size="sm"
                  onClick={() => {
                    setDraftStatus(interactiveSelectedStatus);
                    setFilters({ ...filters, status: interactiveSelectedStatus });
                    setInteractiveSelectedStatus(null);
                  }}
                >
                  Filter Dashboard by {interactiveSelectedStatus}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    handleQuickAction({ ...filters, status: interactiveSelectedStatus }, 'Traffic Explorer');
                  }}
                >
                  Explore in Explorer
                </Button>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                setInteractiveSelectedPort(null);
                setInteractiveSelectedStatus(null);
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              title="Dismiss"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 5. Error State */}
      {error && (
        <ErrorState
          title="Unable to load traffic analysis"
          message={error}
          onRetry={() => loadDashboardAnalytics(filters)}
        />
      )}

      {/* 6. Empty State */}
      {isNoRecords && (
        <EmptyState
          title="NO TRAFFIC RECORDS FOUND"
          description="Try changing or clearing the current filters to inspect network traffic records."
          actionLabel="Reset Filters"
          onAction={handleResetFilters}
          icon={Search}
        />
      )}

      {/* 7. Active Dashboard Content */}
      {!error && !isNoRecords && (
        <div className="section-gap" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Exactly Four Primary KPI Cards */}
          <KpiCard
            summary={summary}
            statistics={statistics}
            loading={loading}
          />

          {/* Main Analytical Visualization Area */}
          <div className="dashboard-analytical-grid">
            <NetworkTrafficDistribution
              portsData={analyticsData?.ports}
              loading={loading}
              onSelectPort={(port) => setInteractiveSelectedPort(port)}
            />
            <TrafficClassificationChart
              summary={summary}
              loading={loading}
              onSelectStatus={(st) => setInteractiveSelectedStatus(st)}
            />
            <SystemInformationCard />
          </div>

          {/* DWDM Analysis Pipeline (Full-Width Card) */}
          <DWDMPipeline />

          {/* Bottom Grid */}
          <div className="dashboard-bottom-grid">
            <DatasetOverviewCard summary={summary} />
            <TopPortsChart
              portsData={analyticsData?.ports}
              loading={loading}
              onViewDetails={() => handleQuickAction({ ...filters, port: '80' }, 'OLAP Analysis')}
              onSelectPort={(port) => setInteractiveSelectedPort(port)}
            />
            <ProjectImpactCard />
          </div>
        </div>
      )}
    </div>
  );
}
