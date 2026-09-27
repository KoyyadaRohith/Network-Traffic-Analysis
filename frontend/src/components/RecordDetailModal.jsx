import React, { useState, useEffect } from 'react';
import {
  FileText,
  Activity,
  BarChart2,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Modal, Button, StatusBadge, LoadingState } from './ui';
import { fetchTrafficRecord } from '../api/trafficAnalyticsApi';

export default function RecordDetailModal({ record, isOpen, onClose }) {
  const [fullRecord, setFullRecord] = useState(null);
  const [loadingFull, setLoadingFull] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [featureSearch, setFeatureSearch] = useState('');

  // Fetch complete 62-feature record on open or record change
  useEffect(() => {
    if (!isOpen || !record?.traffic_id) {
      setFullRecord(null);
      setShowAllFeatures(false);
      setFeatureSearch('');
      return;
    }

    // Set initial data from row
    setFullRecord(record);

    let isMounted = true;
    setLoadingFull(true);

    fetchTrafficRecord(record.traffic_id)
      .then((data) => {
        if (isMounted && data) {
          setFullRecord(data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch full record features:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingFull(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  const activeData = fullRecord || record;

  // Filter features for "View All Features"
  const allFeatures = activeData.all_features || {};
  const featureEntries = Object.entries(allFeatures).filter(([name]) =>
    name.toLowerCase().includes(featureSearch.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="TRAFFIC RECORD"
      description={`Record #${activeData.traffic_id} • fact_network_traffic • Captured: ${activeData.capture_date || '2017-07-07'}`}
      size="lg"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            CICIDS2017 Warehouse Fact Record
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* GROUP 1: IDENTIFICATION */}
        <div
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-cyan)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FileText size={13} />
            IDENTIFICATION
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Record ID</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
                #{activeData.traffic_id}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Destination Port</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--color-cyan)' }}>
                Port {activeData.destination_port}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Traffic Status</div>
              <div>
                <StatusBadge status={activeData.traffic_status} size="sm" />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Capture Date</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>
                {activeData.capture_date || '2017-07-07'}
              </div>
            </div>
          </div>
        </div>

        {/* GROUP 2: FLOW */}
        <div
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-cyan)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Clock size={13} />
            FLOW METRICS
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Flow Duration</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                {Number(activeData.flow_duration || 0).toLocaleString()} µs
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Total Fwd Packets</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                {Number(activeData.total_fwd_packets || 0).toLocaleString()}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Total Bwd Packets</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                {Number(activeData.total_backward_packets || 0).toLocaleString()}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Total Length Fwd</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                {Number(activeData.total_length_of_fwd_packets || 0).toLocaleString()}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Total Length Bwd</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                {Number(activeData.total_length_of_bwd_packets || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* GROUP 3: PACKET STATISTICS */}
        <div
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-cyan)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BarChart2 size={13} />
            PACKET STATISTICS
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Min Packet Length</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
                {Number(activeData.min_packet_length || 0).toFixed(1)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Max Packet Length</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
                {Number(activeData.max_packet_length || 0).toFixed(1)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Packet Length Mean</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--color-cyan)' }}>
                {Number(activeData.packet_length_mean || 0).toFixed(2)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Packet Length Std</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>
                {Number(activeData.packet_length_std || 0).toFixed(2)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Packet Length Variance</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>
                {Number(activeData.packet_length_variance || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* GROUP 4: RATE */}
        <div
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-cyan)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Activity size={13} />
            FLOW RATE
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Flow Bytes/sec</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                {Number(activeData.flow_bytes_per_sec || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} B/s
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Flow Packets/sec</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                {Number(activeData.flow_packets_per_sec || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} pkts/s
              </div>
            </div>
          </div>
        </div>

        {/* SECONDARY ACTION: VIEW ALL FEATURES */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <Button
              variant="outline"
              size="sm"
              icon={showAllFeatures ? ChevronUp : ChevronDown}
              onClick={() => setShowAllFeatures((prev) => !prev)}
            >
              {showAllFeatures ? 'Hide All Features' : 'View All Features (62 Flow Attributes)'}
            </Button>

            {showAllFeatures && (
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {featureEntries.length} of {Object.keys(allFeatures).length} features
              </span>
            )}
          </div>

          {showAllFeatures && (
            <div
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Feature search */}
              <div style={{ position: 'relative' }}>
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  value={featureSearch}
                  onChange={(e) => setFeatureSearch(e.target.value)}
                  placeholder="Filter 62 features by name..."
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 32px',
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.78rem',
                    outline: 'none',
                  }}
                />
              </div>

              {loadingFull ? (
                <LoadingState compact message="Loading complete feature vectors from Data Warehouse..." />
              ) : featureEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No features match "{featureSearch}"
                </div>
              ) : (
                <div
                  style={{
                    maxHeight: '280px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '0.78rem',
                    }}
                  >
                    <thead>
                      <tr style={{ background: 'var(--surface-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ padding: '6px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>
                          Feature
                        </th>
                        <th style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)' }}>
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {featureEntries.map(([featName, featVal], idx) => (
                        <tr
                          key={featName}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                          }}
                        >
                          <td style={{ padding: '6px 12px', color: 'var(--text-primary)' }}>
                            {featName}
                          </td>
                          <td
                            style={{
                              padding: '6px 12px',
                              textAlign: 'right',
                              fontFamily: 'JetBrains Mono, monospace',
                              color: typeof featVal === 'number' && featVal !== 0 ? 'var(--color-cyan)' : 'var(--text-secondary)',
                            }}
                          >
                            {typeof featVal === 'number'
                              ? Number.isInteger(featVal)
                                ? featVal.toLocaleString()
                                : Number(featVal).toFixed(4)
                              : String(featVal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
