import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Filter,
  RotateCcw,
  ChevronRight,
  ArrowRight,
  Check,
  Copy,
  Sliders,
  History,
  Play,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  PageHeader,
  ErrorState,
  Button,
} from '../components/ui';
import { useAppContext } from '../context/AppContext';
import { fetchTrafficAnalytics } from '../api/trafficAnalyticsApi';
import {
  fetchDWDMDrilldown,
  fetchDWDMRollup,
} from '../api/dwdmAnalysisApi';

const PORT_SERVICES = {
  80: 'HTTP (World Wide Web)',
  53: 'DNS (Domain Name System)',
  443: 'HTTPS (SSL/TLS Encrypted)',
  8080: 'HTTP-Alt / Proxy',
  123: 'NTP (Network Time Protocol)',
  22: 'SSH (Secure Shell)',
  389: 'LDAP (Directory Access)',
  88: 'Kerberos Authentication',
  21: 'FTP (File Transfer)',
  137: 'NetBIOS Name Service',
  465: 'SMTPS (Secure Mail)',
  139: 'NetBIOS Session Service',
  3268: 'MS Global Catalog',
  0: 'Reserved / ICMP Control',
  445: 'SMB (Server Message Block)',
  138: 'NetBIOS Datagram Service',
  135: 'RPC Endpoint Mapper',
};

const COMMON_PORTS = [80, 53, 443, 8080, 123, 22, 389, 88, 21, 137, 465, 139, 3268, 445];

export default function OLAPAnalysis() {
  const { filters: globalFilters, setFilters: setGlobalFilters, setActiveTab } = useAppContext();

  // 1. Operation Selection: 'slice' | 'dice' | 'rollup' | 'drilldown'
  const [selectedOperation, setSelectedOperation] = useState('slice');

  // 2. Slice Workspace State
  const [sliceDimension, setSliceDimension] = useState('status'); // 'status' | 'port'
  const [sliceStatusValue, setSliceStatusValue] = useState(
    globalFilters.status && globalFilters.status !== 'ALL' ? globalFilters.status : 'SUSPICIOUS'
  );
  const [slicePortValue, setSlicePortValue] = useState(
    globalFilters.port && globalFilters.port !== 'ALL' ? globalFilters.port : '80'
  );

  // 3. Dice Workspace State
  const [diceStatus, setDiceStatus] = useState(
    globalFilters.status && globalFilters.status !== 'ALL' ? globalFilters.status : 'SUSPICIOUS'
  );
  const [dicePort, setDicePort] = useState(
    globalFilters.port && globalFilters.port !== 'ALL' ? globalFilters.port : '80'
  );
  const [diceDate, setDiceDate] = useState('2017-07-07');

  // 4. Roll-Up Workspace State
  const [rollupGroupBy, setRollupGroupBy] = useState('port'); // 'port' | 'date_status' | 'status'
  const [rollupMeasure, setRollupMeasure] = useState('record_count'); // 'record_count' | 'avg_duration' | 'avg_packet_length'

  // 5. Drill-Down Workspace State
  const [drilldownPort, setDrilldownPort] = useState(
    globalFilters.port && globalFilters.port !== 'ALL' ? Number(globalFilters.port) : 80
  );

  // 6. Query Execution & Results State
  const [running, setRunning] = useState(false);
  const [executedResult, setExecutedResult] = useState(null);
  const [error, setError] = useState(null);

  // 7. Query History (Frontend Session State)
  const [queryHistory, setQueryHistory] = useState([
    {
      id: 'init-1',
      operation: 'Slice',
      summary: 'Status = SUSPICIOUS',
      records: 128016,
      timestamp: 'Initial Warehouse Cube',
    },
    {
      id: 'init-2',
      operation: 'Drill-Down',
      summary: 'Port 80 (HTTP)',
      records: 136562,
      timestamp: 'Initial Drill-Down',
    },
  ]);

  // SQL Query Text for current operation
  const [copiedSql, setCopiedSql] = useState(false);

  // Sync initial global filters if arriving with port or status
  useEffect(() => {
    if (globalFilters.port && globalFilters.port !== 'ALL') {
      setDicePort(globalFilters.port);
      setSlicePortValue(globalFilters.port);
      setDrilldownPort(Number(globalFilters.port));
    }
    if (globalFilters.status && globalFilters.status !== 'ALL') {
      setDiceStatus(globalFilters.status);
      setSliceStatusValue(globalFilters.status);
    }
  }, [globalFilters]);

  // Run SLICE operation
  const handleRunSlice = async () => {
    setRunning(true);
    setError(null);
    try {
      const filters = {};
      let label = '';
      if (sliceDimension === 'status') {
        filters.status = sliceStatusValue;
        label = `Traffic Status = ${sliceStatusValue}`;
      } else {
        filters.destination_port = slicePortValue;
        label = `Destination Port = ${slicePortValue}`;
      }

      const res = await fetchTrafficAnalytics(filters);
      const totalRecs = res?.summary?.total_records ?? 0;

      const resultPayload = {
        operation: 'Slice',
        dimension: sliceDimension === 'status' ? 'Traffic Status' : 'Destination Port',
        label,
        filterObj: filters,
        summary: res.summary,
        statistics: res.statistics,
        ports: res.ports || [],
        totalRecords: totalRecs,
        timestamp: new Date().toLocaleTimeString(),
      };

      setExecutedResult(resultPayload);

      // Add to session history
      setQueryHistory((prev) => [
        {
          id: `slice-${Date.now()}`,
          operation: 'Slice',
          summary: label,
          records: totalRecs,
          timestamp: new Date().toLocaleTimeString(),
          resultPayload,
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      console.error('Slice execution failed:', err);
      setError('Failed to execute OLAP Slice query.');
    } finally {
      setRunning(false);
    }
  };

  // Run DICE operation
  const handleRunDice = async () => {
    setRunning(true);
    setError(null);
    try {
      const filters = {};
      const appliedTerms = [];
      if (diceStatus !== 'ALL') {
        filters.status = diceStatus;
        appliedTerms.push(`Status = ${diceStatus}`);
      }
      if (dicePort !== 'ALL') {
        filters.destination_port = dicePort;
        appliedTerms.push(`Port = ${dicePort}`);
      }
      if (diceDate !== 'ALL') {
        filters.date = diceDate;
        appliedTerms.push(`Date = ${diceDate}`);
      }

      const label = appliedTerms.join(' AND ') || 'Full Cube (No Constraints)';
      const res = await fetchTrafficAnalytics(filters);
      const totalRecs = res?.summary?.total_records ?? 0;

      const resultPayload = {
        operation: 'Dice',
        label,
        filterObj: filters,
        summary: res.summary,
        statistics: res.statistics,
        ports: res.ports || [],
        totalRecords: totalRecs,
        timestamp: new Date().toLocaleTimeString(),
      };

      setExecutedResult(resultPayload);

      setQueryHistory((prev) => [
        {
          id: `dice-${Date.now()}`,
          operation: 'Dice',
          summary: label,
          records: totalRecs,
          timestamp: new Date().toLocaleTimeString(),
          resultPayload,
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      console.error('Dice execution failed:', err);
      setError('Failed to execute OLAP Dice query.');
    } finally {
      setRunning(false);
    }
  };

  // Run ROLL-UP operation
  const handleRunRollup = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetchDWDMRollup(rollupGroupBy);
      const rows = res?.data || [];
      const totalRecs = rows.find((r) => r.level === 'Grand Total')?.record_count ?? 223112;

      let dimLabel = 'Destination Port';
      if (rollupGroupBy === 'date_status') dimLabel = 'Date & Status Hierarchy';
      if (rollupGroupBy === 'status') dimLabel = 'Traffic Status';

      const resultPayload = {
        operation: 'Roll-Up',
        label: `Group By: ${dimLabel} WITH ROLLUP`,
        groupBy: rollupGroupBy,
        measure: rollupMeasure,
        data: rows,
        totalRecords: totalRecs,
        notice: res?.scope_notice,
        timestamp: new Date().toLocaleTimeString(),
      };

      setExecutedResult(resultPayload);

      setQueryHistory((prev) => [
        {
          id: `rollup-${Date.now()}`,
          operation: 'Roll-Up',
          summary: `Group By ${dimLabel}`,
          records: totalRecs,
          timestamp: new Date().toLocaleTimeString(),
          resultPayload,
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      console.error('Rollup execution failed:', err);
      setError('Failed to execute OLAP Roll-Up query.');
    } finally {
      setRunning(false);
    }
  };

  // Run DRILL-DOWN operation
  const handleRunDrilldown = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetchDWDMDrilldown(drilldownPort);
      const totalRecs = res?.total_records ?? 0;
      const label = `Destination Port ${drilldownPort} (${res?.service_name || 'Port ' + drilldownPort})`;

      const resultPayload = {
        operation: 'Drill-Down',
        port: drilldownPort,
        label,
        detail: res,
        totalRecords: totalRecs,
        timestamp: new Date().toLocaleTimeString(),
      };

      setExecutedResult(resultPayload);

      setQueryHistory((prev) => [
        {
          id: `drill-${Date.now()}`,
          operation: 'Drill-Down',
          summary: `Port ${drilldownPort}`,
          records: totalRecs,
          timestamp: new Date().toLocaleTimeString(),
          resultPayload,
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      console.error('Drilldown execution failed:', err);
      setError(`Failed to drill down into Port ${drilldownPort}.`);
    } finally {
      setRunning(false);
    }
  };

  // Auto-run default Slice on initial mount
  useEffect(() => {
    handleRunSlice();
  }, []);

  // Reset OLAP to clean base state
  const handleResetAnalysis = () => {
    setSelectedOperation('slice');
    setSliceDimension('status');
    setSliceStatusValue('SUSPICIOUS');
    setSlicePortValue('80');
    setDiceStatus('SUSPICIOUS');
    setDicePort('80');
    setDiceDate('2017-07-07');
    setRollupGroupBy('port');
    setRollupMeasure('record_count');
    setDrilldownPort(80);
    setError(null);
    handleRunSlice();
  };

  // Restore past query from history
  const handleRestoreHistory = (item) => {
    if (item.resultPayload) {
      setSelectedOperation(item.resultPayload.operation.toLowerCase().replace('-', ''));
      setExecutedResult(item.resultPayload);
    } else {
      if (item.operation === 'Slice') {
        setSelectedOperation('slice');
        handleRunSlice();
      } else if (item.operation === 'Dice') {
        setSelectedOperation('dice');
        handleRunDice();
      } else if (item.operation === 'Roll-Up') {
        setSelectedOperation('rollup');
        handleRunRollup();
      } else if (item.operation === 'Drill-Down') {
        setSelectedOperation('drilldown');
        handleRunDrilldown();
      }
    }
  };

  // Navigate to Explorer with active query filters
  const handleNavigateToExplorer = () => {
    if (executedResult?.filterObj) {
      setGlobalFilters(executedResult.filterObj);
    } else if (executedResult?.port) {
      setGlobalFilters({ port: String(executedResult.port) });
    }
    setActiveTab('Traffic Explorer');
  };

  // Generated active SQL query string
  const activeSqlString = useMemo(() => {
    if (selectedOperation === 'slice') {
      if (sliceDimension === 'status') {
        return `SELECT \n    dc.traffic_status, \n    COUNT(*) AS record_count,\n    ROUND(AVG(ft.flow_duration), 2) AS avg_duration,\n    ROUND(AVG(ft.packet_length_mean), 2) AS avg_packet_len\nFROM fact_network_traffic ft\nJOIN dim_classification dc ON ft.classification_id = dc.classification_id\nWHERE dc.traffic_status = '${sliceStatusValue}'\nGROUP BY dc.traffic_status;`;
      }
      return `SELECT \n    dn.destination_port,\n    dc.traffic_status,\n    COUNT(*) AS record_count\nFROM fact_network_traffic ft\nJOIN dim_network dn ON ft.network_id = dn.network_id\nJOIN dim_classification dc ON ft.classification_id = dc.classification_id\nWHERE dn.destination_port = ${slicePortValue}\nGROUP BY dn.destination_port, dc.traffic_status;`;
    }
    if (selectedOperation === 'dice') {
      return `SELECT \n    dd.full_date,\n    dn.destination_port,\n    dc.traffic_status,\n    COUNT(*) AS total_flows,\n    ROUND(AVG(ft.flow_duration), 2) AS avg_duration\nFROM fact_network_traffic ft\nJOIN dim_date dd ON ft.date_id = dd.date_id\nJOIN dim_network dn ON ft.network_id = dn.network_id\nJOIN dim_classification dc ON ft.classification_id = dc.classification_id\nWHERE dc.traffic_status = '${diceStatus}'\n  AND dn.destination_port = ${dicePort}\n  AND dd.full_date = '${diceDate}'\nGROUP BY dd.full_date, dn.destination_port, dc.traffic_status;`;
    }
    if (selectedOperation === 'rollup') {
      if (rollupGroupBy === 'port') {
        return `SELECT \n    COALESCE(CAST(dn.destination_port AS CHAR), 'GRAND TOTAL') AS destination_port,\n    COUNT(*) AS record_count,\n    ROUND(AVG(ft.flow_duration), 2) AS avg_duration\nFROM fact_network_traffic ft\nJOIN dim_network dn ON ft.network_id = dn.network_id\nGROUP BY dn.destination_port WITH ROLLUP\nORDER BY GROUPING(dn.destination_port) ASC, record_count DESC\nLIMIT 15;`;
      }
      return `SELECT \n    COALESCE(CAST(dd.full_date AS CHAR), 'GRAND TOTAL') AS capture_date,\n    COALESCE(dc.traffic_status, 'ALL STATUSES') AS traffic_status,\n    COUNT(*) AS record_count,\n    ROUND(AVG(ft.flow_duration), 2) AS avg_flow_duration\nFROM fact_network_traffic ft\nJOIN dim_date dd ON ft.date_id = dd.date_id\nJOIN dim_classification dc ON ft.classification_id = dc.classification_id\nGROUP BY dd.full_date, dc.traffic_status WITH ROLLUP;`;
    }
    return `SELECT \n    dn.destination_port,\n    COUNT(*) AS total_records,\n    SUM(CASE WHEN dc.traffic_status = 'NORMAL' THEN 1 ELSE 0 END) AS normal_records,\n    SUM(CASE WHEN dc.traffic_status = 'SUSPICIOUS' THEN 1 ELSE 0 END) AS suspicious_records,\n    ROUND(AVG(ft.flow_duration), 2) AS avg_duration\nFROM fact_network_traffic ft\nJOIN dim_network dn ON ft.network_id = dn.network_id\nJOIN dim_classification dc ON ft.classification_id = dc.classification_id\nWHERE dn.destination_port = ${drilldownPort}\nGROUP BY dn.destination_port;`;
  }, [selectedOperation, sliceDimension, sliceStatusValue, slicePortValue, diceStatus, dicePort, diceDate, rollupGroupBy, drilldownPort]);

  const copySql = () => {
    navigator.clipboard.writeText(activeSqlString);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 1. Page Header */}
      <PageHeader
        title="OLAP EXPLORER"
        description="Interactively analyze warehouse data using Slice, Dice, Roll-Up and Drill-Down operations."
        badge={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-info">OLAP Operations</span>
            <span className="badge badge-neutral">MySQL Star Schema</span>
            <span className="badge badge-neutral">Multidimensional Cube</span>
          </div>
        }
      />

      {/* Explanation of Dimensions and Measures */}
      <div
        style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '0.78rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--color-cyan)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem' }}>
            Dimensions:
          </span>
          <span className="badge badge-neutral">Traffic Status</span>
          <span className="badge badge-neutral">Destination Port</span>
          <span className="badge badge-neutral">Date (2017-07-07)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ color: '#A855F7', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem' }}>
            Measures:
          </span>
          <span style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono', fontSize: '0.74rem' }}>
            Record Count • Flow Duration • Fwd/Bwd Packets • Packet Length • Flow Bytes/s • Flow Packets/s
          </span>
        </div>
      </div>

      {/* 2. Operation Selector & Explanation */}
      <div
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            CHOOSE OLAP OPERATION
          </span>

          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={handleResetAnalysis}
          >
            RESET ANALYSIS
          </Button>
        </div>

        {/* 4 Operations Selector Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
          {[
            {
              id: 'slice',
              label: 'Slice',
              desc: 'Filter 1 dimension',
              color: 'var(--color-cyan)',
              icon: Filter,
            },
            {
              id: 'dice',
              label: 'Dice',
              desc: 'Multi-dimension sub-cube',
              color: '#818CF8',
              icon: Sliders,
            },
            {
              id: 'rollup',
              label: 'Roll-Up',
              desc: 'Aggregate to higher level',
              color: '#F59E0B',
              icon: Layers,
            },
            {
              id: 'drilldown',
              label: 'Drill-Down',
              desc: 'Granular port detail',
              color: '#10B981',
              icon: ChevronRight,
            },
          ].map((op) => {
            const isSelected = selectedOperation === op.id;
            const Icon = op.icon;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => setSelectedOperation(op.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '4px',
                  padding: '12px 14px',
                  background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'var(--surface-elevated)',
                  border: `1px solid ${isSelected ? op.color : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.16s ease',
                  boxShadow: isSelected ? `0 0 12px ${op.color}33` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isSelected ? 'var(--color-cyan)' : 'var(--text-primary)' }}>
                    {op.label}
                  </span>
                  <Icon size={15} color={isSelected ? op.color : 'var(--text-muted)'} />
                </div>
                <span style={{ fontSize: '0.72rem', color: isSelected ? op.color : 'var(--text-muted)' }}>
                  {op.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Operation Explanation Banner */}
        <div
          style={{
            background: 'var(--surface-elevated)',
            borderLeft: `3px solid ${
              selectedOperation === 'slice'
                ? 'var(--color-cyan)'
                : selectedOperation === 'dice'
                ? '#818CF8'
                : selectedOperation === 'rollup'
                ? '#F59E0B'
                : '#10B981'
            }`,
            padding: '10px 14px',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
          }}
        >
          {selectedOperation === 'slice' && (
            <span>
              <strong style={{ color: 'var(--color-cyan)' }}>SLICE:</strong> "Selects one value from a single dimension coordinate (e.g. Traffic_Status = 'SUSPICIOUS')."
            </span>
          )}
          {selectedOperation === 'dice' && (
            <span>
              <strong style={{ color: '#818CF8' }}>DICE:</strong> "Filters the data using multiple dimension conditions to carve out a granular sub-cube."
            </span>
          )}
          {selectedOperation === 'rollup' && (
            <span>
              <strong style={{ color: '#F59E0B' }}>ROLL-UP:</strong> "Aggregates data to a higher level of a dimension using SQL WITH ROLLUP (e.g. Detailed → Summary → Grand Total)."
            </span>
          )}
          {selectedOperation === 'drilldown' && (
            <span>
              <strong style={{ color: '#10B981' }}>DRILL-DOWN:</strong> "Moves from summarized data to a more detailed level for an individual dimension member."
            </span>
          )}
        </div>

        {/* 3. WORKSPACE CONTROLS (Based on selected operation) */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            gap: '14px',
          }}
        >
          {/* SLICE CONTROLS */}
          {selectedOperation === 'slice' && (
            <>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Dimension
                </label>
                <select
                  value={sliceDimension}
                  onChange={(e) => setSliceDimension(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                >
                  <option value="status">Traffic Status</option>
                  <option value="port">Destination Port</option>
                </select>
              </div>

              <div style={{ flex: '1 1 220px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Value
                </label>
                {sliceDimension === 'status' ? (
                  <select
                    value={sliceStatusValue}
                    onChange={(e) => setSliceStatusValue(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      outline: 'none',
                    }}
                  >
                    <option value="NORMAL">NORMAL (Benign Traffic)</option>
                    <option value="SUSPICIOUS">SUSPICIOUS (Anomalous / DDoS)</option>
                  </select>
                ) : (
                  <select
                    value={slicePortValue}
                    onChange={(e) => setSlicePortValue(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      outline: 'none',
                    }}
                  >
                    {COMMON_PORTS.map((p) => (
                      <option key={p} value={p}>
                        Port {p} {PORT_SERVICES[p] ? `(${PORT_SERVICES[p].split(' ')[0]})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <Button
                variant="cyan"
                size="md"
                icon={Play}
                loading={running}
                onClick={handleRunSlice}
              >
                {running ? 'Running...' : 'RUN SLICE'}
              </Button>
            </>
          )}

          {/* DICE CONTROLS */}
          {selectedOperation === 'dice' && (
            <>
              <div style={{ flex: '1 1 180px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Traffic Status
                </label>
                <select
                  value={diceStatus}
                  onChange={(e) => setDiceStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NORMAL">NORMAL (Benign)</option>
                  <option value="SUSPICIOUS">SUSPICIOUS (DDoS)</option>
                </select>
              </div>

              <div style={{ flex: '1 1 180px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Destination Port
                </label>
                <select
                  value={dicePort}
                  onChange={(e) => setDicePort(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                >
                  <option value="ALL">All Destination Ports</option>
                  {COMMON_PORTS.map((p) => (
                    <option key={p} value={p}>
                      Port {p} {PORT_SERVICES[p] ? `(${PORT_SERVICES[p].split(' ')[0]})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: '1 1 180px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Date
                </label>
                <select
                  value={diceDate}
                  onChange={(e) => setDiceDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                >
                  <option value="ALL">All Dates</option>
                  <option value="2017-07-07">2017-07-07 (Friday)</option>
                </select>
              </div>

              <Button
                variant="cyan"
                size="md"
                icon={Play}
                loading={running}
                onClick={handleRunDice}
              >
                {running ? 'Running...' : 'RUN DICE'}
              </Button>
            </>
          )}

          {/* ROLL-UP CONTROLS */}
          {selectedOperation === 'rollup' && (
            <>
              <div style={{ flex: '1 1 220px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Group By Dimension
                </label>
                <select
                  value={rollupGroupBy}
                  onChange={(e) => setRollupGroupBy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                >
                  <option value="port">Destination Port</option>
                  <option value="date_status">Date & Traffic Status</option>
                  <option value="status">Traffic Status</option>
                </select>
              </div>

              <div style={{ flex: '1 1 220px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Aggregation Measure
                </label>
                <select
                  value={rollupMeasure}
                  onChange={(e) => setRollupMeasure(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                >
                  <option value="record_count">Record Count</option>
                  <option value="avg_duration">Average Flow Duration</option>
                  <option value="avg_packet_length">Average Packet Length</option>
                </select>
              </div>

              <Button
                variant="cyan"
                size="md"
                icon={Play}
                loading={running}
                onClick={handleRunRollup}
              >
                {running ? 'Running...' : 'RUN ROLL-UP'}
              </Button>
            </>
          )}

          {/* DRILL-DOWN CONTROLS */}
          {selectedOperation === 'drilldown' && (
            <>
              <div style={{ flex: '1 1 260px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Select Destination Port
                </label>
                <select
                  value={drilldownPort}
                  onChange={(e) => setDrilldownPort(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                >
                  {COMMON_PORTS.map((p) => (
                    <option key={p} value={p}>
                      Port {p} — {PORT_SERVICES[p] || 'Port ' + p}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="cyan"
                size="md"
                icon={Play}
                loading={running}
                onClick={handleRunDrilldown}
              >
                {running ? 'Running...' : 'DRILL DOWN'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error Feedback */}
      {error && (
        <ErrorState
          title="OLAP Query Execution Failed"
          message={error}
          onRetry={() => {
            if (selectedOperation === 'slice') handleRunSlice();
            else if (selectedOperation === 'dice') handleRunDice();
            else if (selectedOperation === 'rollup') handleRunRollup();
            else handleRunDrilldown();
          }}
        />
      )}

      {/* 4. OLAP RESULT CONTAINER (AnalysisResultCard) */}
      {executedResult && (
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* Result Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color:
                      executedResult.operation === 'Slice'
                        ? 'var(--color-cyan)'
                        : executedResult.operation === 'Dice'
                        ? '#818CF8'
                        : executedResult.operation === 'Roll-Up'
                        ? '#F59E0B'
                        : '#10B981',
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {executedResult.operation.toUpperCase()} RESULT
                </span>

                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Executed at {executedResult.timestamp}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-heading)', margin: 0 }}>
                {executedResult.label}
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant="secondary"
                size="sm"
                icon={ArrowRight}
                onClick={handleNavigateToExplorer}
              >
                Explore Records in Explorer
              </Button>
            </div>
          </div>

          {/* Metric Summary Strip for Slice / Dice / Drill-down */}
          {(executedResult.operation === 'Slice' || executedResult.operation === 'Dice') && (
            <div className="grid-kpi" style={{ marginTop: '4px' }}>
              <div className="card-kpi">
                <div className="kpi-label">TOTAL MATCHED</div>
                <div className="kpi-value cyan">
                  {Number(executedResult.totalRecords || 0).toLocaleString()}
                </div>
                <div className="kpi-subtext">Fact records in sub-cube</div>
              </div>

              <div className="card-kpi">
                <div className="kpi-label">NORMAL RATIO</div>
                <div className="kpi-value green">
                  {executedResult.summary?.normal_percentage ?? 0}%
                </div>
                <div className="kpi-subtext">
                  {Number(executedResult.summary?.normal_records || 0).toLocaleString()} flows
                </div>
              </div>

              <div className="card-kpi">
                <div className="kpi-label">SUSPICIOUS RATIO</div>
                <div className="kpi-value red">
                  {executedResult.summary?.suspicious_percentage ?? 0}%
                </div>
                <div className="kpi-subtext">
                  {Number(executedResult.summary?.suspicious_records || 0).toLocaleString()} flows
                </div>
              </div>

              <div className="card-kpi">
                <div className="kpi-label">AVG FLOW DURATION</div>
                <div className="kpi-value amber" style={{ color: '#F59E0B' }}>
                  {Number(executedResult.statistics?.average_flow_duration || 0).toLocaleString()} µs
                </div>
                <div className="kpi-subtext">Payload avg: {executedResult.statistics?.average_packet_length ?? 0} B</div>
              </div>
            </div>
          )}

          {executedResult.operation === 'Drill-Down' && executedResult.detail && (
            <div className="grid-kpi" style={{ marginTop: '4px' }}>
              <div className="card-kpi">
                <div className="kpi-label">PORT FLOWS</div>
                <div className="kpi-value cyan">
                  {Number(executedResult.detail.total_records || 0).toLocaleString()}
                </div>
                <div className="kpi-subtext">Total port flows</div>
              </div>

              <div className="card-kpi">
                <div className="kpi-label">NORMAL RECORD COUNT</div>
                <div className="kpi-value green">
                  {Number(executedResult.detail.normal_records || 0).toLocaleString()}
                </div>
                <div className="kpi-subtext">
                  {executedResult.detail.total_records > 0
                    ? ((executedResult.detail.normal_records * 100) / executedResult.detail.total_records).toFixed(1)
                    : 0}%
                </div>
              </div>

              <div className="card-kpi">
                <div className="kpi-label">SUSPICIOUS RECORD COUNT</div>
                <div className="kpi-value red">
                  {Number(executedResult.detail.suspicious_records || 0).toLocaleString()}
                </div>
                <div className="kpi-subtext">{executedResult.detail.suspicious_percentage}%</div>
              </div>

              <div className="card-kpi">
                <div className="kpi-label">FLOW THROUGHPUT</div>
                <div className="kpi-value amber" style={{ color: '#F59E0B' }}>
                  {Number(executedResult.detail.avg_flow_bytes_per_sec || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} B/s
                </div>
                <div className="kpi-subtext">Packet rate: {Number(executedResult.detail.avg_flow_packets_per_sec || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} pkt/s</div>
              </div>
            </div>
          )}

          {/* Visual Chart and Analytical Table Area */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Chart Container */}
            <div
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '300px',
              }}
            >
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                {executedResult.operation} Visualization
              </span>

              {/* Chart for Slice / Dice */}
              {(executedResult.operation === 'Slice' || executedResult.operation === 'Dice') && (
                <div style={{ width: '100%', height: '260px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'NORMAL', count: executedResult.summary?.normal_records || 0, fill: '#10B981' },
                        { name: 'SUSPICIOUS', count: executedResult.summary?.suspicious_records || 0, fill: '#EF4444' },
                      ]}
                      margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                    >
                      <XAxis
                        dataKey="name"
                        stroke="var(--border-subtle)"
                        tick={{ fill: 'var(--text-primary)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                      />
                      <YAxis
                        stroke="var(--border-subtle)"
                        tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                        tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontFamily: 'JetBrains Mono',
                          fontSize: '0.78rem',
                          boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        <Cell fill="#10B981" />
                        <Cell fill="#EF4444" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Chart for Roll-Up */}
              {executedResult.operation === 'Roll-Up' && (
                <div style={{ width: '100%', height: '260px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={executedResult.data?.slice(0, 10).map((r) => ({
                        name: r.group_key || r.destination_port || r.traffic_status,
                        count: r[executedResult.measure === 'avg_duration' ? 'avg_flow_duration' : executedResult.measure === 'avg_packet_length' ? 'avg_packet_length' : 'record_count'] || 0,
                        isTotal: r.level === 'Grand Total',
                      }))}
                      margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
                    >
                      <XAxis
                        dataKey="name"
                        stroke="var(--border-subtle)"
                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis
                        stroke="var(--border-subtle)"
                        tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                        tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontFamily: 'JetBrains Mono',
                          fontSize: '0.78rem',
                          boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
                        }}
                      />
                      <Bar dataKey="count" fill="var(--color-cyan)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Chart for Drill-Down */}
              {executedResult.operation === 'Drill-Down' && executedResult.detail && (
                <div style={{ width: '100%', height: '260px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'NORMAL', count: executedResult.detail.normal_records || 0, fill: '#10B981' },
                        { name: 'SUSPICIOUS', count: executedResult.detail.suspicious_records || 0, fill: '#EF4444' },
                      ]}
                      margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                    >
                      <XAxis
                        dataKey="name"
                        stroke="var(--border-subtle)"
                        tick={{ fill: 'var(--text-primary)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                      />
                      <YAxis
                        stroke="var(--border-subtle)"
                        tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                        tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontFamily: 'JetBrains Mono',
                          fontSize: '0.78rem',
                          boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        <Cell fill="#10B981" />
                        <Cell fill="#EF4444" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Analytical Result Data Table */}
            <div
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                overflowX: 'auto',
              }}
            >
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Analytical Result Table
              </span>

              {/* Table for Slice / Dice */}
              {(executedResult.operation === 'Slice' || executedResult.operation === 'Dice') && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px' }}>DIMENSION / STATUS</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px' }}>RECORD COUNT</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px' }}>PERCENTAGE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px', color: '#10B981', fontWeight: 600 }}>NORMAL</td>
                      <td style={{ textAlign: 'right', padding: '8px', fontFamily: 'JetBrains Mono' }}>
                        {Number(executedResult.summary?.normal_records || 0).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px', fontFamily: 'JetBrains Mono', color: '#10B981' }}>
                        {executedResult.summary?.normal_percentage ?? 0}%
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px', color: '#EF4444', fontWeight: 600 }}>SUSPICIOUS</td>
                      <td style={{ textAlign: 'right', padding: '8px', fontFamily: 'JetBrains Mono' }}>
                        {Number(executedResult.summary?.suspicious_records || 0).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px', fontFamily: 'JetBrains Mono', color: '#EF4444' }}>
                        {executedResult.summary?.suspicious_percentage ?? 0}%
                      </td>
                    </tr>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.02)', fontWeight: 700 }}>
                      <td style={{ padding: '8px', color: 'var(--text-primary)' }}>SUB-CUBE TOTAL</td>
                      <td style={{ textAlign: 'right', padding: '8px', fontFamily: 'JetBrains Mono', color: 'var(--color-cyan)' }}>
                        {Number(executedResult.totalRecords || 0).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px', fontFamily: 'JetBrains Mono' }}>
                        100.0%
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* Table for Roll-Up */}
              {executedResult.operation === 'Roll-Up' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px' }}>LEVEL</th>
                      <th style={{ textAlign: 'left', padding: '6px 8px' }}>GROUP KEY</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px' }}>RECORD COUNT</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px' }}>AVG DURATION</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px' }}>AVG PACKET LEN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(executedResult.data || []).map((row, idx) => {
                      const isGrandTotal = row.level === 'Grand Total';
                      return (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            background: isGrandTotal ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                            fontWeight: isGrandTotal ? 700 : 500,
                          }}
                        >
                          <td style={{ padding: '6px 8px' }}>
                            <span
                              style={{
                                fontSize: '0.66rem',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                fontFamily: 'JetBrains Mono',
                                background: isGrandTotal ? 'rgba(245, 158, 11, 0.2)' : 'var(--surface-card)',
                                color: isGrandTotal ? '#F59E0B' : 'var(--text-secondary)',
                              }}
                            >
                              {row.level}
                            </span>
                          </td>
                          <td style={{ padding: '6px 8px', fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
                            {row.group_key || row.destination_port || row.traffic_status}
                          </td>
                          <td style={{ textAlign: 'right', padding: '6px 8px', fontFamily: 'JetBrains Mono', color: isGrandTotal ? '#F59E0B' : 'inherit' }}>
                            {Number(row.record_count).toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'right', padding: '6px 8px', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                            {Number(row.avg_flow_duration).toLocaleString()} µs
                          </td>
                          <td style={{ textAlign: 'right', padding: '6px 8px', fontFamily: 'JetBrains Mono', color: '#10B981' }}>
                            {row.avg_packet_length} B
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* Table for Drill-Down */}
              {executedResult.operation === 'Drill-Down' && executedResult.detail && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px' }}>PORT MEASURE</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px' }}>VALUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>Destination Port</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px', fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--color-cyan)' }}>
                        Port {executedResult.detail.destination_port}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>Service Name</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px', fontFamily: 'JetBrains Mono' }}>
                        {executedResult.detail.service_name}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>Total Flows</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                        {Number(executedResult.detail.total_records).toLocaleString()}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '6px 8px', color: '#10B981' }}>Normal Flows</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px', fontFamily: 'JetBrains Mono', color: '#10B981' }}>
                        {Number(executedResult.detail.normal_records).toLocaleString()}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '6px 8px', color: '#EF4444' }}>Suspicious Flows</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px', fontFamily: 'JetBrains Mono', color: '#EF4444' }}>
                        {Number(executedResult.detail.suspicious_records).toLocaleString()} ({executedResult.detail.suspicious_percentage}%)
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>Avg Flow Duration</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px', fontFamily: 'JetBrains Mono' }}>
                        {Number(executedResult.detail.avg_flow_duration).toLocaleString()} µs
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>Avg Packet Length</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px', fontFamily: 'JetBrains Mono', color: '#F59E0B' }}>
                        {executedResult.detail.avg_packet_length} B
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. SQL EXPLORER & QUERY HISTORY (Side-by-Side Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Real SQL Query Display */}
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'var(--color-cyan)',
                  background: 'rgba(6, 182, 212, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '3px',
                  fontFamily: 'JetBrains Mono',
                }}
              >
                EXECUTED SQL QUERY
              </span>
              <button
                onClick={copySql}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  color: copiedSql ? '#10B981' : 'var(--text-secondary)',
                  fontSize: '0.74rem',
                  padding: '4px 10px',
                  cursor: 'pointer',
                }}
              >
                {copiedSql ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
              Parameterized SQL executed directly against fact_network_traffic and joined dimensions.
            </p>

            <pre
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                fontSize: '0.74rem',
                color: 'var(--color-cyan)',
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 1.5,
                overflowX: 'auto',
                margin: 0,
              }}
            >
              <code>{activeSqlString}</code>
            </pre>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
            OLAP queries compute summaries inside MySQL without loading raw rows into browser memory.
          </div>
        </div>

        {/* Local Session Query History */}
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <History size={15} color="var(--color-cyan)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                RECENT OLAP ANALYSES
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
              Session query history. Click any previous analysis to restore its parameters and view results.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
              {queryHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleRestoreHistory(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-cyan)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        fontFamily: 'JetBrains Mono',
                        color:
                          item.operation === 'Slice'
                            ? 'var(--color-cyan)'
                            : item.operation === 'Dice'
                            ? '#818CF8'
                            : item.operation === 'Roll-Up'
                            ? '#F59E0B'
                            : '#10B981',
                      }}
                    >
                      {item.operation}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-primary)' }}>
                      {item.summary}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                      {Number(item.records).toLocaleString()} flows
                    </span>
                    <ChevronRight size={13} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
            History is maintained in local browser session memory without requiring additional database tables.
          </div>
        </div>
      </div>
    </div>
  );
}
