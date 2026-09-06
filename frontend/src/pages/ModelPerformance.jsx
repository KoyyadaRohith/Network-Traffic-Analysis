import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldAlert,
  Info,
  ArrowRight,
  TrendingUp,
  Sliders,
  BarChart2,
  FileCheck2,
  Lock,
  GitFork,
  HelpCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { fetchModelEvaluation, fetchFeatureImportance } from '../api/modelEvaluationApi';

export default function ModelPerformance() {
  const [evaluation, setEvaluation] = useState(null);
  const [featureData, setFeatureData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [evalRes, featRes] = await Promise.all([
        fetchModelEvaluation(),
        fetchFeatureImportance(),
      ]);
      setEvaluation(evalRes);
      setFeatureData(featRes);
    } catch (err) {
      console.error('Failed to load model performance data:', err);
      setError(err.message || 'Unable to retrieve model evaluation metrics from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter 62 features for the searchable table
  const allFeatures = featureData?.features || [];
  const filteredFeatures = allFeatures.filter((f) =>
    f.feature_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(f.rank).includes(searchQuery)
  );

  // Top 10 features for chart
  const top10Features = (featureData?.top_10 || []).map((f) => ({
    name: f.feature_name,
    shortName: f.feature_name.length > 22 ? f.feature_name.slice(0, 20) + '...' : f.feature_name,
    importance: f.importance,
    percentage: f.percentage,
    rank: f.rank,
  }));

  // Confusion matrix counts
  const cm = evaluation?.confusion_matrix || {
    tn: 19019,
    fp: 0,
    fn: 6,
    tp: 25598,
    total: 44623,
  };

  const normalTotal = cm.tn + cm.fp;
  const suspiciousTotal = cm.fn + cm.tp;

  const tnRate = normalTotal > 0 ? ((cm.tn / normalTotal) * 100).toFixed(2) : '100.00';
  const fpRate = normalTotal > 0 ? ((cm.fp / normalTotal) * 100).toFixed(2) : '0.00';
  const fnRate = suspiciousTotal > 0 ? ((cm.fn / suspiciousTotal) * 100).toFixed(2) : '0.02';
  const tpRate = suspiciousTotal > 0 ? ((cm.tp / suspiciousTotal) * 100).toFixed(2) : '99.98';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* 1. Header Section */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              <BrainCircuit size={20} color="var(--color-blue)" />
            </div>
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              Data Mining — Random Forest Performance
            </h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '780px' }}>
            Random Forest classification performance on the CICIDS2017 DDoS evaluation subset
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid var(--border-accent)',
              fontSize: '0.78rem',
              fontWeight: '600',
              color: 'var(--color-blue)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Cpu size={14} />
            <span>Random Forest (100 Trees)</span>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 14px',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            background: 'var(--color-red-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <AlertTriangle size={32} color="var(--color-red)" />
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
              Failed to load evaluation metrics
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{error}</p>
          </div>
        </div>
      )}

      {/* 2. Model Overview Cards (5 Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            Algorithm
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Random Forest
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-blue)' }}>
            Ensemble Decision Trees
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            Estimators (Trees)
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
            {evaluation?.n_estimators || 100}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            random_state = {evaluation?.random_state || 42}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            Input Features
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--color-purple)', fontFamily: 'JetBrains Mono, monospace' }}>
            {evaluation?.feature_count || 62}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Numerical network flow metrics
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            Training Records
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
            {(evaluation?.training_records || 178489).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            80% Stratified Training Partition
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            Testing Records
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--color-blue)', fontFamily: 'JetBrains Mono, monospace' }}>
            {(evaluation?.testing_records || 44623).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            20% Held-Out Test Partition
          </div>
        </div>
      </div>

      {/* 3. KPI Cards (Accuracy, Precision, Recall, F1 Score) */}
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.06em', marginBottom: '12px' }}>
          Held-Out Evaluation Metrics
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Accuracy */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Model Accuracy</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--color-green-bg)', color: 'var(--color-green)', fontWeight: '700' }}>
                  OVERALL
                </span>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em' }}>
                {evaluation ? `${(evaluation.accuracy * 100).toFixed(2)}%` : '99.99%'}
              </div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              44,617 of 44,623 test samples correctly classified
            </div>
          </div>

          {/* Precision */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Precision (Positive)</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--color-blue)', fontWeight: '700' }}>
                  TP / (TP + FP)
                </span>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em' }}>
                {evaluation ? `${(evaluation.precision * 100).toFixed(2)}%` : '100.00%'}
              </div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Zero false alarms: 0 NORMAL flows flagged as SUSPICIOUS
            </div>
          </div>

          {/* Recall */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid var(--border-purple)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Recall (Sensitivity)</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', color: 'var(--color-purple)', fontWeight: '700' }}>
                  TP / (TP + FN)
                </span>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em' }}>
                {evaluation ? `${(evaluation.recall * 100).toFixed(2)}%` : '99.98%'}
              </div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              25,598 of 25,604 attack flows detected (6 missed)
            </div>
          </div>

          {/* F1 Score */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>F1-Score (Harmonic Mean)</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--color-orange-bg)', color: 'var(--color-orange)', fontWeight: '700' }}>
                  BALANCED
                </span>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em' }}>
                {evaluation ? `${(evaluation.f1_score * 100).toFixed(2)}%` : '99.99%'}
              </div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Harmonic balance between precision and recall
            </div>
          </div>
        </div>
      </div>

      {/* 4 & 5. Confusion Matrix (2x2) and Classification Metrics Table */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
        }}
      >
        {/* 4. Confusion Matrix */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck2 size={18} color="var(--color-blue)" />
                Confusion Matrix (2×2)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                N = {cm.total.toLocaleString()} Test Records
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Observed versus predicted classifications on the held-out test split
            </p>

            {/* Matrix Visual Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Predicted Axis Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', textAlign: 'center', gap: '8px' }}>
                <div />
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pred: NORMAL
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-purple)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pred: SUSPICIOUS
                </div>
              </div>

              {/* Row 1: Actual NORMAL */}
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--color-blue)',
                    textTransform: 'uppercase',
                  }}
                >
                  Act: NORMAL
                </div>

                {/* TN Cell */}
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-green)', fontWeight: '700', marginBottom: '4px' }}>
                    TRUE NEGATIVE (TN)
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
                    {cm.tn.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-green)', marginTop: '4px' }}>
                    {tnRate}% of Normal
                  </div>
                </div>

                {/* FP Cell */}
                <div
                  style={{
                    background: cm.fp === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(239, 68, 68, 0.12)',
                    border: cm.fp === 0 ? '1px solid var(--border-subtle)' : '1px solid rgba(239, 68, 68, 0.35)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: cm.fp === 0 ? 'var(--text-muted)' : 'var(--color-red)', fontWeight: '700', marginBottom: '4px' }}>
                    FALSE POSITIVE (FP)
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: cm.fp === 0 ? 'var(--text-muted)' : 'var(--color-red)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {cm.fp.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {fpRate}% (0 False Alarms)
                  </div>
                </div>
              </div>

              {/* Row 2: Actual SUSPICIOUS */}
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--color-purple)',
                    textTransform: 'uppercase',
                  }}
                >
                  Act: SUSP
                </div>

                {/* FN Cell */}
                <div
                  style={{
                    background: cm.fn > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: cm.fn > 0 ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-orange)', fontWeight: '700', marginBottom: '4px' }}>
                    FALSE NEGATIVE (FN)
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-orange)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {cm.fn.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {fnRate}% (Missed Attacks)
                  </div>
                </div>

                {/* TP Cell */}
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-green)', fontWeight: '700', marginBottom: '4px' }}>
                    TRUE POSITIVE (TP)
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
                    {cm.tp.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-green)', marginTop: '4px' }}>
                    {tpRate}% of Attacks
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '18px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.76rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            <strong>Matrix Diagnosis:</strong> The model produced <strong>0 false alarms</strong> across all 19,019 normal flows, and correctly identified <strong>25,598 out of 25,604</strong> malicious DDoS flows with only 6 false negatives.
          </div>
        </div>

        {/* 5. Classification Metrics Table */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="var(--color-purple)" />
                Classification Metrics by Class
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Per-Class Detailed Support
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Precision, Recall, and F1 score computed per traffic category with support weights
            </p>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 8px', fontWeight: '600' }}>Class</th>
                    <th style={{ padding: '10px 8px', fontWeight: '600' }}>Precision</th>
                    <th style={{ padding: '10px 8px', fontWeight: '600' }}>Recall</th>
                    <th style={{ padding: '10px 8px', fontWeight: '600' }}>F1-Score</th>
                    <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'right' }}>Support</th>
                  </tr>
                </thead>
                <tbody>
                  {/* NORMAL */}
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: 'var(--color-green-bg)',
                          color: 'var(--color-green)',
                        }}
                      >
                        NORMAL
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
                      0.9997 (99.97%)
                    </td>
                    <td style={{ padding: '12px 8px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
                      1.0000 (100.0%)
                    </td>
                    <td style={{ padding: '12px 8px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
                      0.9998 (99.98%)
                    </td>
                    <td style={{ padding: '12px 8px', fontFamily: 'JetBrains Mono, monospace', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {cm.tn.toLocaleString()}
                    </td>
                  </tr>

                  {/* SUSPICIOUS */}
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: 'rgba(168, 85, 247, 0.15)',
                          color: 'var(--color-purple)',
                        }}
                      >
                        SUSPICIOUS
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
                      1.0000 (100.0%)
                    </td>
                    <td style={{ padding: '12px 8px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
                      0.9998 (99.98%)
                    </td>
                    <td style={{ padding: '12px 8px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
                      0.9999 (99.99%)
                    </td>
                    <td style={{ padding: '12px 8px', fontFamily: 'JetBrains Mono, monospace', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {(cm.fn + cm.tp).toLocaleString()}
                    </td>
                  </tr>

                  {/* Macro Avg */}
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: 'var(--text-muted)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: '600' }}>Macro Avg</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'JetBrains Mono, monospace' }}>0.9998 (99.98%)</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'JetBrains Mono, monospace' }}>0.9999 (99.99%)</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'JetBrains Mono, monospace' }}>0.9999 (99.99%)</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'JetBrains Mono, monospace', textAlign: 'right' }}>
                      {cm.total.toLocaleString()}
                    </td>
                  </tr>

                  {/* Weighted Avg */}
                  <tr style={{ color: 'var(--text-muted)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: '600' }}>Weighted Avg</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'JetBrains Mono, monospace' }}>0.9999 (99.99%)</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'JetBrains Mono, monospace' }}>0.9999 (99.99%)</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'JetBrains Mono, monospace' }}>0.9999 (99.99%)</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'JetBrains Mono, monospace', textAlign: 'right' }}>
                      {cm.total.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            style={{
              marginTop: '16px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.76rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            <strong>Support Balance:</strong> Held-out test set comprises <strong>42.6% NORMAL</strong> (19,019) and <strong>57.4% SUSPICIOUS</strong> (25,604) flows, matching the original cleaned CICIDS2017 distribution via stratification.
          </div>
        </div>
      </div>

      {/* 6. Feature Importance (Horizontal Bar Chart + 62-Feature Table) */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sliders size={20} color="var(--color-blue)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Model Feature Importance (Top 10 & 62 Features)
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '750px' }}>
              Calculated directly from the Random Forest model's Mean Decrease in Impurity (MDI / Gini importance). The model assigned higher importance to features that produced the highest informational gain.
            </p>
          </div>

          {/* Search box for 62 features table */}
          <div
            style={{
              position: 'relative',
              width: '280px',
            }}
          >
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search all 62 features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '9px 12px 9px 36px',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Top 10 Chart */}
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-blue)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Top 10 Most Influential Features (MDI Impurity Reduction)
          </div>
          <div style={{ width: '100%', height: '340px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top10Features}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 140, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  tickFormatter={(v) => `${(v * 100).toFixed(1)}%`}
                  domain={[0, 0.16]}
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  width={130}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div
                          style={{
                            background: '#0d1322',
                            border: '1px solid var(--border-accent)',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
                          }}
                        >
                          <div style={{ fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                            #{data.rank} {data.name}
                          </div>
                          <div style={{ color: 'var(--color-blue)', fontFamily: 'JetBrains Mono, monospace' }}>
                            Importance: {data.importance} ({data.percentage}%)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {top10Features.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === 0
                          ? 'var(--color-blue)'
                          : index < 3
                          ? 'var(--color-purple)'
                          : 'rgba(56, 189, 248, 0.65)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Importance Interpretation Note */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(56, 189, 248, 0.04)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Info size={18} color="var(--color-blue)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Academic Note:</strong> High feature importance indicates that the model assigned greater splitting weight to that variable during decision tree partitioning. It does <em>not</em> imply that a packet length or port number causally triggers attacks, but rather that DDoS traffic systematically diverges along these behavioral metrics.
          </span>
        </div>

        {/* Searchable Table for all 62 Features */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
              Full 62-Feature Ranked Register ({filteredFeatures.length} matching)
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-blue)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Clear filter
              </button>
            )}
          </div>

          <div
            style={{
              maxHeight: '340px',
              overflowY: 'auto',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(10, 15, 29, 0.4)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#0a0f1d', zIndex: 2 }}>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px', width: '70px' }}>Rank</th>
                  <th style={{ padding: '10px 14px' }}>Feature Name</th>
                  <th style={{ padding: '10px 14px', width: '120px' }}>Importance</th>
                  <th style={{ padding: '10px 14px', width: '220px' }}>Relative Contribution</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeatures.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No features matching "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                  filteredFeatures.map((f) => (
                    <tr
                      key={f.feature_name}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '9px 14px', fontFamily: 'JetBrains Mono, monospace', color: f.rank <= 10 ? 'var(--color-blue)' : 'var(--text-muted)', fontWeight: f.rank <= 10 ? '700' : '500' }}>
                        #{f.rank}
                      </td>
                      <td style={{ padding: '9px 14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {f.feature_name}
                      </td>
                      <td style={{ padding: '9px 14px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>
                        {f.importance.toFixed(6)}
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              flex: 1,
                              height: '6px',
                              borderRadius: '3px',
                              background: 'rgba(255, 255, 255, 0.06)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(100, f.percentage * 7)}%`,
                                height: '100%',
                                background: f.rank <= 3 ? 'var(--color-purple)' : 'var(--color-blue)',
                                borderRadius: '3px',
                              }}
                            />
                          </div>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', width: '54px', textAlign: 'right', color: 'var(--text-muted)' }}>
                            {f.percentage.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 7. Evaluation Methodology Pipeline */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <GitFork size={20} color="var(--color-purple)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Evaluation Methodology Pipeline
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Reproducible machine learning experimental pipeline from raw feature extraction to held-out validation
        </p>

        {/* Visual Pipeline Steps */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          {/* Step 1 */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--color-blue)', fontWeight: '700', marginBottom: '4px' }}>
              STAGE 01
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
              Clean Dataset
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              223,112 Verified Rows
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={18} color="var(--text-muted)" />
          </div>

          {/* Step 2 */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--color-purple)', fontWeight: '700', marginBottom: '4px' }}>
              STAGE 02
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
              62 Model Features
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              10 Const & 6 Dups Pruned
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={18} color="var(--text-muted)" />
          </div>

          {/* Step 3 */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--color-blue)', fontWeight: '700', marginBottom: '4px' }}>
              STAGE 03
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
              80/20 Stratified Split
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              seed=42 • Preserve Ratios
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={18} color="var(--text-muted)" />
          </div>

          {/* Step 4 */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--color-purple)', fontWeight: '700', marginBottom: '4px' }}>
              STAGE 04
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
              Random Forest
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              100 Trees • n_jobs=-1
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={18} color="var(--text-muted)" />
          </div>

          {/* Step 5 */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--color-blue)', fontWeight: '700', marginBottom: '4px' }}>
              STAGE 05
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
              Held-Out Test Set
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              44,623 Unseen Flows
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={18} color="var(--text-muted)" />
          </div>

          {/* Step 6 */}
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--color-green)', fontWeight: '700', marginBottom: '4px' }}>
              STAGE 06
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
              Classification Metrics
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-green)', marginTop: '4px' }}>
              99.99% F1 / 0.00% FP
            </div>
          </div>
        </div>
      </div>

      {/* 8. Evaluation Scope Notice */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
        }}
      >
        <ShieldAlert size={26} color="var(--color-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
            Evaluation Scope Notice
          </h4>
          <blockquote
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              fontStyle: 'italic',
              borderLeft: '3px solid var(--color-blue)',
              paddingLeft: '14px',
              margin: 0,
            }}
          >
            "This evaluation measures performance on the CICIDS2017 Friday-WorkingHours-Afternoon-DDos subset used in this project. The model distinguishes NORMAL (BENIGN) traffic from SUSPICIOUS (DDoS) traffic within this evaluation dataset. These results should not be interpreted as universal detection performance for all cyberattack types or unseen network environments."
          </blockquote>
        </div>
      </div>

      {/* 9 & 10. Model Limitations & Academic Explanation ("Why Random Forest?") */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
        }}
      >
        {/* 9. Model Limitations Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <AlertTriangle size={20} color="var(--color-orange)" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Model Limitations & Considerations
            </h4>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-orange)', marginTop: '7px', flexShrink: 0 }} />
              <span><strong>Binary classification in current version:</strong> Traffic flows are categorized strictly into <code>NORMAL</code> or <code>SUSPICIOUS</code> without sub-class attack labeling (e.g., distinguishing LOIC vs Slowloris).</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-orange)', marginTop: '7px', flexShrink: 0 }} />
              <span><strong>Focused on DDoS vs BENIGN:</strong> Trained specifically on the Friday afternoon CICIDS2017 subset. Other vectors like PortScan, Infiltration, or Web Attacks were not part of this training corpus.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-orange)', marginTop: '7px', flexShrink: 0 }} />
              <span><strong>Real-world network divergence:</strong> Real production traffic contains diverse benign protocols, streaming artifacts, and latency jitter not fully captured in controlled benchmark datasets.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-orange)', marginTop: '7px', flexShrink: 0 }} />
              <span><strong>High accuracy does not guarantee generalization:</strong> 99.99% accuracy on held-out test data does not guarantee immunity against zero-day exploits or adaptive adversarial evasion attacks.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-orange)', marginTop: '7px', flexShrink: 0 }} />
              <span><strong>Offline Tabular Scope:</strong> PCAP live packet capture parsing and hardware line-rate feature extraction are external pre-processing steps and not evaluated directly in this model page.</span>
            </li>
          </ul>
        </div>

        {/* 10. Academic Explanation ("Why Random Forest?") */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <HelpCircle size={20} color="var(--color-purple)" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Academic Explanation: Why Random Forest?
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>1. Ensemble Variance Reduction:</strong> By training 100 decorrelated decision trees on bootstrap subsamples (bagging) and aggregating predictions, Random Forest significantly mitigates individual tree variance and resists overfitting.
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>2. Non-linear Flow Boundaries:</strong> Network traffic boundaries between normal volumetric bursts and malicious DDoS floods are inherently non-linear; orthogonal tree partitions capture these without requiring kernel transformations.
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>3. Robust Tabular Performance:</strong> Excels on high-dimensional tabular flow features (durations, packet lengths, inter-arrival times) without being sensitive to monotonic feature scaling.
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>4. Native Interpretability:</strong> Mean Decrease in Impurity (Gini importance) provides transparent feature rankings, meeting academic evaluation criteria.
            </div>
            <div style={{ padding: '10px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <em>Note: While Random Forest demonstrated 99.99% accuracy on this tabular benchmark, it is not universally optimal for all security tasks—such as payload deep packet inspection (DPI) where recurrent or transformer architectures are preferred.</em>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
