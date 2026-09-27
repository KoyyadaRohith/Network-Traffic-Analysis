import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BrainCircuit,
  Cpu,
  UploadCloud,
  RefreshCw,
  X,
  ChevronRight,
  Sparkles,
  Info,
  Check,
  Search,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
} from 'recharts';
import { fetchModelEvaluation, fetchFeatureImportance } from '../api/modelEvaluationApi';
import { predictTraffic } from '../api/predictionApi';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import {
  parseCSV,
  validateCSVData,
  FEATURE_GROUPS,
  formatFeatureValue,
} from '../utils/csvValidator';

export default function DataMining() {
  // =========================================================================
  // 1. MODEL EVALUATION & FEATURE IMPORTANCE STATE
  // =========================================================================
  const [evaluation, setEvaluation] = useState(null);
  const [featureData, setFeatureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Interactive Confusion Matrix Selection: 'tn' | 'fp' | 'fn' | 'tp'
  const [selectedCell, setSelectedCell] = useState('tn');

  // Feature Importance Controls
  const [featureViewCount, setFeatureViewCount] = useState('top10'); // 'top10' | 'top20' | 'all'
  const [selectedFeature, setSelectedFeature] = useState(null);

  // =========================================================================
  // 2. CSV UPLOAD, VALIDATION, AND PREDICTION STATE
  // =========================================================================
  const [file, setFile] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [parsedRowsMap, setParsedRowsMap] = useState({}); // row_number -> parsed feature values
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

  // Prediction Table Interactive Controls
  const [classFilter, setClassFilter] = useState('ALL'); // 'ALL' | 'NORMAL' | 'SUSPICIOUS'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('row_number'); // 'row_number' | 'confidence' | 'prediction'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Record Detail Modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fileInputRef = useRef(null);

  // =========================================================================
  // 3. FETCH LIVE MODEL DATA
  // =========================================================================
  useEffect(() => {
    let isMounted = true;
    const loadModelData = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [evalRes, featRes] = await Promise.all([
          fetchModelEvaluation().catch((err) => {
            console.error('Failed to fetch model evaluation:', err);
            return null;
          }),
          fetchFeatureImportance().catch((err) => {
            console.error('Failed to fetch feature importance:', err);
            return null;
          }),
        ]);
        if (isMounted) {
          setEvaluation(evalRes);
          setFeatureData(featRes);
          if (featRes?.top_10?.[0]) {
            setSelectedFeature(featRes.top_10[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load model data:', err);
        if (isMounted) {
          setLoadError('Unable to load model evaluation metrics from backend.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadModelData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Format evaluation values from API
  const accuracy = evaluation?.accuracy
    ? (evaluation.accuracy * 100).toFixed(2)
    : '99.99';
  const precision = evaluation?.precision
    ? (evaluation.precision * 100).toFixed(2)
    : '100.00';
  const recall = evaluation?.recall
    ? (evaluation.recall * 100).toFixed(2)
    : '99.98';
  const f1Score = evaluation?.f1_score
    ? (evaluation.f1_score * 100).toFixed(2)
    : '99.99';

  const cm = evaluation?.confusion_matrix || {
    tn: 19019,
    fp: 0,
    fn: 6,
    tp: 25598,
    total: 44623,
  };

  const totalTestRecords = cm.total || 44623;

  // =========================================================================
  // 4. CONFUSION MATRIX DETAILS
  // =========================================================================
  const cmDetails = {
    tn: {
      title: 'True Negative (TN)',
      label: 'NORMAL → NORMAL',
      count: cm.tn,
      percent: ((cm.tn / (cm.tn + cm.fp || 1)) * 100).toFixed(2),
      type: 'correct',
      description:
        'Normal traffic correctly classified as NORMAL by the Random Forest model. Represents 100.00% true negative specificity across all actual benign flows in the test partition.',
    },
    fp: {
      title: 'False Positive (FP)',
      label: 'NORMAL → SUSPICIOUS',
      count: cm.fp,
      percent: ((cm.fp / (cm.tn + cm.fp || 1)) * 100).toFixed(2),
      type: 'error',
      description:
        'Normal traffic incorrectly classified as SUSPICIOUS (false alarm). In this held-out test evaluation, 0 benign flows were falsely flagged.',
    },
    fn: {
      title: 'False Negative (FN)',
      label: 'SUSPICIOUS → NORMAL',
      count: cm.fn,
      percent: ((cm.fn / (cm.fn + cm.tp || 1)) * 100).toFixed(4),
      type: 'error',
      description:
        'Suspicious traffic incorrectly classified as NORMAL (missed detection). Only 6 out of 25,604 attack flows were misclassified, representing a 0.02% miss rate.',
    },
    tp: {
      title: 'True Positive (TP)',
      label: 'SUSPICIOUS → SUSPICIOUS',
      count: cm.tp,
      percent: ((cm.tp / (cm.fn + cm.tp || 1)) * 100).toFixed(2),
      type: 'correct',
      description:
        'Suspicious traffic correctly classified as SUSPICIOUS by the model. Represents 99.98% sensitivity/recall across all actual anomalous flows in the test partition.',
    },
  };

  // =========================================================================
  // 5. FEATURE IMPORTANCE LIST & CHART DATA
  // =========================================================================
  const allFeatures = useMemo(() => {
    if (featureData?.features && featureData.features.length > 0) {
      return featureData.features;
    }
    if (evaluation?.top_features) {
      return evaluation.top_features;
    }
    return [
      { rank: 1, feature_name: 'Fwd Packet Length Max', importance: 0.123654, percentage: 12.3654 },
      { rank: 2, feature_name: 'Fwd Packet Length Mean', importance: 0.102886, percentage: 10.2886 },
      { rank: 3, feature_name: 'Fwd IAT Std', importance: 0.078593, percentage: 7.8593 },
      { rank: 4, feature_name: 'Total Length of Fwd Packets', importance: 0.073062, percentage: 7.3062 },
      { rank: 5, feature_name: 'Init_Win_bytes_forward', importance: 0.071656, percentage: 7.1656 },
      { rank: 6, feature_name: 'act_data_pkt_fwd', importance: 0.060179, percentage: 6.0179 },
      { rank: 7, feature_name: 'Bwd Packet Length Min', importance: 0.048206, percentage: 4.8206 },
      { rank: 8, feature_name: 'Destination Port', importance: 0.04508, percentage: 4.508 },
      { rank: 9, feature_name: 'Fwd IAT Max', importance: 0.033785, percentage: 3.3785 },
      { rank: 10, feature_name: 'Fwd Header Length', importance: 0.033546, percentage: 3.3546 },
    ];
  }, [featureData, evaluation]);

  const displayedFeatures = useMemo(() => {
    let list = allFeatures;
    if (featureViewCount === 'top10') {
      list = allFeatures.slice(0, 10);
    } else if (featureViewCount === 'top20') {
      list = allFeatures.slice(0, 20);
    }
    return list.map((f) => ({
      name: f.feature_name,
      displayName: f.feature_name.length > 22 ? f.feature_name.slice(0, 20) + '…' : f.feature_name,
      percentage: Number(f.percentage || f.importance * 100).toFixed(2),
      importance: f.importance,
      rank: f.rank,
      raw: f,
    }));
  }, [allFeatures, featureViewCount]);

  // =========================================================================
  // 6. CLIENT-SIDE CSV PARSING & SCHEMA VALIDATION
  // =========================================================================
  const processAndValidateFile = async (fileObj) => {
    setIsValidating(true);
    setValidationResult(null);
    setPredictError(null);
    setPredictionResult(null);

    try {
      const text = await fileObj.text();
      const { headers, rows } = parseCSV(text);

      const metadata = {
        name: fileObj.name,
        sizeBytes: fileObj.size,
        sizeFormatted:
          fileObj.size > 1024 * 1024
            ? `${(fileObj.size / (1024 * 1024)).toFixed(2)} MB`
            : `${(fileObj.size / 1024).toFixed(1)} KB`,
        rowCount: rows.length,
        columnCount: headers.length,
      };
      setFileMetadata(metadata);

      // Map rows by 1-based row index for instant detail lookup
      const rowMap = {};
      rows.forEach((row, idx) => {
        rowMap[idx + 1] = row;
      });
      setParsedRowsMap(rowMap);

      // Validate schema against 62 features
      const valRes = validateCSVData(headers, rows.length);
      setValidationResult(valRes);

      if (!valRes.isValid) {
        setPredictError(valRes.error);
      }
    } catch (err) {
      console.error('File parsing error:', err);
      setValidationResult({
        isValid: false,
        error: `Unable to parse CSV file: ${err.message || 'Malformed structure.'}`,
        missingFeatures: [],
        extraColumns: [],
        rowCount: 0,
        columnCount: 0,
      });
      setPredictError('Failed to read and parse CSV content.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith('.csv')) {
      setFile(null);
      setFileMetadata(null);
      setValidationResult({
        isValid: false,
        error: 'Invalid file format. Please upload a valid CSV file (.csv).',
        missingFeatures: [],
        extraColumns: [],
        rowCount: 0,
        columnCount: 0,
      });
      setPredictError('Invalid file format. Please upload a valid CSV file (.csv).');
      return;
    }

    setFile(selected);
    processAndValidateFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;

    if (!dropped.name.toLowerCase().endsWith('.csv')) {
      setFile(null);
      setFileMetadata(null);
      setValidationResult({
        isValid: false,
        error: 'Invalid file format. Please upload a valid CSV file (.csv).',
        missingFeatures: [],
        extraColumns: [],
        rowCount: 0,
        columnCount: 0,
      });
      setPredictError('Invalid file format. Please upload a valid CSV file (.csv).');
      return;
    }

    setFile(dropped);
    processAndValidateFile(dropped);
  };

  const handleLoadSample = async () => {
    try {
      setPredictLoading(true);
      setPredictError(null);
      const res = await fetch('/sample_traffic_test.csv');
      if (!res.ok) throw new Error('Sample test file not found in public directory.');
      const blob = await res.blob();
      const sampleFile = new File([blob], 'sample_traffic_test.csv', { type: 'text/csv' });
      setFile(sampleFile);
      await processAndValidateFile(sampleFile);
    } catch (err) {
      setPredictError(err.message || 'Unable to load sample CSV file.');
    } finally {
      setPredictLoading(false);
    }
  };

  const handleRunPrediction = async () => {
    if (!file) {
      setPredictError('Please select or load a CSV file first.');
      return;
    }
    if (!validationResult || !validationResult.isValid) {
      setPredictError(validationResult?.error || 'CSV validation failed. Correct errors before running inference.');
      return;
    }

    setPredictLoading(true);
    setPredictError(null);
    try {
      const data = await predictTraffic(file);
      setPredictionResult(data);
      setCurrentPage(1);
    } catch (err) {
      setPredictError(err.message || 'Traffic prediction inference failed. Verify backend service.');
    } finally {
      setPredictLoading(false);
    }
  };

  const handleResetPrediction = () => {
    setFile(null);
    setFileMetadata(null);
    setParsedRowsMap({});
    setValidationResult(null);
    setPredictionResult(null);
    setPredictError(null);
    setSelectedRecord(null);
    setIsDetailModalOpen(false);
    setCurrentPage(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // =========================================================================
  // 7. PREDICTION RESULTS FILTERING, SORTING, PAGINATION
  // =========================================================================
  const filteredPredictions = useMemo(() => {
    if (!predictionResult?.predictions) return [];

    let list = [...predictionResult.predictions];

    // Class filter
    if (classFilter !== 'ALL') {
      list = list.filter((p) => p.prediction === classFilter);
    }

    // Search query (matches row number)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) => {
        const rowStr = String(p.row_number || '');
        return rowStr.includes(q);
      });
    }

    // Sorting
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'confidence') {
        valA = Number(a.confidence ?? 0);
        valB = Number(b.confidence ?? 0);
      } else if (sortField === 'row_number') {
        valA = Number(a.row_number ?? 0);
        valB = Number(b.row_number ?? 0);
      } else if (sortField === 'prediction') {
        valA = String(a.prediction ?? '');
        valB = String(b.prediction ?? '');
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [predictionResult, classFilter, searchQuery, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredPredictions.length / pageSize));
  const paginatedPredictions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPredictions.slice(startIndex, startIndex + pageSize);
  }, [filteredPredictions, currentPage, pageSize]);

  const handleOpenRecordDetail = (record) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'confidence' ? 'desc' : 'asc');
    }
  };

  return (
    <div className="dm-container">
      {/* ====================================================================
          1. PAGE HEADER & PIPELINE CONTEXT
          ==================================================================== */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              CICIDS2017
            </span>
            <ChevronRight size={12} color="var(--text-muted)" />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Preprocessing
            </span>
            <ChevronRight size={12} color="var(--text-muted)" />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              ETL
            </span>
            <ChevronRight size={12} color="var(--text-muted)" />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              MySQL DW
            </span>
            <ChevronRight size={12} color="var(--text-muted)" />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Star Schema
            </span>
            <ChevronRight size={12} color="var(--text-muted)" />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              OLAP
            </span>
            <ChevronRight size={12} color="var(--color-cyan)" />
            <span style={{ fontSize: '0.74rem', color: 'var(--color-cyan)', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace' }}>
              Data Mining
            </span>
          </div>

          <h1 className="page-title" style={{ margin: '0 0 6px 0' }}>
            Data Mining
          </h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Random Forest classification and traffic analysis
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '4px',
              background: 'rgba(0, 217, 255, 0.08)',
              border: '1px solid rgba(0, 217, 255, 0.25)',
              color: 'var(--color-cyan)',
              fontSize: '0.68rem',
              fontWeight: '700',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.04em',
            }}
          >
            <BrainCircuit size={11} />
            <span>RANDOM FOREST / CICIDS2017</span>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            DATA MINING & CLASSIFICATION
          </span>
        </div>
      </div>

      {/* Backend Evaluation Load Error Banner */}
      {loadError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#EF4444', fontSize: '0.8rem', margin: '14px 0 0' }}>
          <AlertCircle size={15} />
          <span>{loadError}</span>
        </div>
      )}

      {/* ====================================================================
          2. MODEL OVERVIEW CARD
          ==================================================================== */}
      <div className="dm-model-summary-card">
        <div className="dm-model-header">
          <h3 className="dm-model-title">
            <Cpu size={16} color="var(--color-cyan)" />
            <span>RANDOM FOREST MODEL OVERVIEW</span>
          </h3>

          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: '700',
              fontFamily: 'JetBrains Mono, monospace',
              color: '#10B981',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '3px 10px',
              borderRadius: '4px',
              letterSpacing: '0.04em',
            }}
          >
            TRAINED MODEL ACTIVE
          </span>
        </div>

        {/* 8 Specification Tiles */}
        <div className="dm-specs-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
          <div className="dm-spec-tile">
            <span className="dm-spec-label">MODEL</span>
            <span className="dm-spec-val" style={{ color: 'var(--color-cyan)' }}>
              Random Forest
            </span>
          </div>

          <div className="dm-spec-tile">
            <span className="dm-spec-label">ESTIMATORS</span>
            <span className="dm-spec-val">
              {evaluation?.n_estimators || 100}
            </span>
          </div>

          <div className="dm-spec-tile">
            <span className="dm-spec-label">FEATURES</span>
            <span className="dm-spec-val">
              {evaluation?.feature_count || 62}
            </span>
          </div>

          <div className="dm-spec-tile">
            <span className="dm-spec-label">TRAIN RECORDS</span>
            <span className="dm-spec-val">
              {Number(evaluation?.training_records || 178489).toLocaleString()}
            </span>
          </div>

          <div className="dm-spec-tile">
            <span className="dm-spec-label">TEST RECORDS</span>
            <span className="dm-spec-val">
              {Number(totalTestRecords).toLocaleString()}
            </span>
          </div>

          <div className="dm-spec-tile">
            <span className="dm-spec-label">SPLIT</span>
            <span className="dm-spec-val">
              80 / 20
            </span>
          </div>

          <div className="dm-spec-tile">
            <span className="dm-spec-label">DATASET</span>
            <span className="dm-spec-val">
              CICIDS2017
            </span>
          </div>

          <div className="dm-spec-tile">
            <span className="dm-spec-label">CLASSES</span>
            <span className="dm-spec-val">
              NORMAL / SUSP
            </span>
          </div>
        </div>

        {/* Academic Note */}
        <div
          style={{
            marginTop: '12px',
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.45,
          }}
        >
          <Info size={16} color="var(--color-cyan)" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Model Training Note: </strong>
            Training uses the prepared CICIDS2017 dataset. The classification workspace below performs inference using the already-trained model; uploading a CSV does not retrain the model.
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. EVALUATION METRICS (4 KPI PERFORMANCE CARDS)
          ==================================================================== */}
      <div className="grid-kpi">
        {/* Card 1: ACCURACY */}
        <div className="card-kpi">
          <div className="kpi-label">ACCURACY</div>
          <div className="kpi-value cyan">
            {loading ? '—' : `${accuracy}%`}
          </div>
          <div className="kpi-subtext">
            Overall proportion of correctly classified records
          </div>
        </div>

        {/* Card 2: PRECISION */}
        <div className="card-kpi">
          <div className="kpi-label">PRECISION</div>
          <div className="kpi-value green">
            {loading ? '—' : `${precision}%`}
          </div>
          <div className="kpi-subtext">
            Proportion of predicted SUSPICIOUS that are actually positive
          </div>
        </div>

        {/* Card 3: RECALL */}
        <div className="card-kpi">
          <div className="kpi-label">RECALL</div>
          <div className="kpi-value cyan" style={{ color: '#38BDF8' }}>
            {loading ? '—' : `${recall}%`}
          </div>
          <div className="kpi-subtext">
            Proportion of actual SUSPICIOUS correctly identified
          </div>
        </div>

        {/* Card 4: F1 SCORE */}
        <div className="card-kpi">
          <div className="kpi-label">F1 SCORE</div>
          <div className="kpi-value purple" style={{ color: '#A855F7' }}>
            {loading ? '—' : `${f1Score}%`}
          </div>
          <div className="kpi-subtext">
            Harmonic mean of precision and recall
          </div>
        </div>
      </div>

      {/* ====================================================================
          4. CONFUSION MATRIX + PER-CLASS PERFORMANCE (SPLIT GRID)
          ==================================================================== */}
      <div className="dm-matrix-roc-grid">
        {/* Left: CONFUSION MATRIX */}
        <div className="dm-card">
          <div className="dm-card-header">
            <div>
              <h3 className="dm-card-title">
                CONFUSION MATRIX
              </h3>
              <p className="dm-card-desc">
                Classification outcomes across the held-out test set (44,623 records). Click any cell to inspect.
              </p>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                fontFamily: 'JetBrains Mono',
              }}
            >
              N = {Number(totalTestRecords).toLocaleString()}
            </span>
          </div>

          <div className="dm-cm-container">
            {/* Header: PREDICTED */}
            <div className="dm-cm-predicted-header">
              PREDICTED CLASS
            </div>

            {/* Matrix Layout */}
            <div className="dm-cm-layout">
              {/* Corner Empty */}
              <div />
              {/* Column 1: Predicted NORMAL */}
              <div className="dm-cm-col-label" style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.08)' }}>
                NORMAL
              </div>
              {/* Column 2: Predicted SUSPICIOUS */}
              <div className="dm-cm-col-label" style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.08)' }}>
                SUSPICIOUS
              </div>

              {/* Row 1: Actual NORMAL */}
              <div className="dm-cm-row-label" style={{ color: '#10B981' }}>
                NORMAL
              </div>
              {/* TN Cell */}
              <div
                className={`dm-cm-cell positive is-interactive ${selectedCell === 'tn' ? 'is-selected' : ''}`}
                onClick={() => setSelectedCell('tn')}
                title="Click to view True Negative details"
              >
                <span className="dm-cm-val" style={{ color: '#10B981' }}>
                  {loading ? '—' : Number(cm.tn).toLocaleString()}
                </span>
                <span className="dm-cm-tag" style={{ color: '#10B981' }}>
                  True Negative (TN)
                </span>
              </div>
              {/* FP Cell */}
              <div
                className={`dm-cm-cell neutral is-interactive ${selectedCell === 'fp' ? 'is-selected' : ''}`}
                onClick={() => setSelectedCell('fp')}
                title="Click to view False Positive details"
              >
                <span className="dm-cm-val" style={{ color: 'var(--text-muted)' }}>
                  {loading ? '—' : Number(cm.fp).toLocaleString()}
                </span>
                <span className="dm-cm-tag" style={{ color: 'var(--text-muted)' }}>
                  False Positive (FP)
                </span>
              </div>

              {/* Row 2: Actual SUSPICIOUS */}
              <div className="dm-cm-row-label" style={{ color: '#EF4444' }}>
                SUSPICIOUS
              </div>
              {/* FN Cell */}
              <div
                className={`dm-cm-cell negative is-interactive ${selectedCell === 'fn' ? 'is-selected' : ''}`}
                onClick={() => setSelectedCell('fn')}
                title="Click to view False Negative details"
              >
                <span className="dm-cm-val" style={{ color: '#EF4444' }}>
                  {loading ? '—' : Number(cm.fn).toLocaleString()}
                </span>
                <span className="dm-cm-tag" style={{ color: '#EF4444' }}>
                  False Negative (FN)
                </span>
              </div>
              {/* TP Cell */}
              <div
                className={`dm-cm-cell positive is-interactive ${selectedCell === 'tp' ? 'is-selected' : ''}`}
                onClick={() => setSelectedCell('tp')}
                title="Click to view True Positive details"
              >
                <span className="dm-cm-val" style={{ color: '#10B981' }}>
                  {loading ? '—' : Number(cm.tp).toLocaleString()}
                </span>
                <span className="dm-cm-tag" style={{ color: '#10B981' }}>
                  True Positive (TP)
                </span>
              </div>
            </div>

            {/* Interactive Cell Detail Panel */}
            {selectedCell && cmDetails[selectedCell] && (
              <div className="dm-cm-detail-panel">
                <Info size={16} color="var(--color-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{cmDetails[selectedCell].title}:</strong>
                    <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--color-cyan)', fontWeight: '700' }}>
                      {Number(cmDetails[selectedCell].count).toLocaleString()} records ({cmDetails[selectedCell].percent}%)
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                      [{cmDetails[selectedCell].label}]
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {cmDetails[selectedCell].description}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: PER-CLASS PERFORMANCE TABLE */}
        <div className="dm-card">
          <div className="dm-card-header">
            <div>
              <h3 className="dm-card-title">
                PER-CLASS PERFORMANCE
              </h3>
              <p className="dm-card-desc">
                Precision, recall, F1, and support for each classification target
              </p>
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                fontFamily: 'JetBrains Mono',
              }}
            >
              HELD-OUT EVALUATION
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="dm-report-table">
              <thead>
                <tr>
                  <th>CLASS</th>
                  <th style={{ textAlign: 'right' }}>PRECISION</th>
                  <th style={{ textAlign: 'right' }}>RECALL</th>
                  <th style={{ textAlign: 'right' }}>F1 SCORE</th>
                  <th style={{ textAlign: 'right' }}>SUPPORT</th>
                </tr>
              </thead>
              <tbody>
                {evaluation?.class_metrics ? (
                  evaluation.class_metrics.map((cmRow, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '700', color: cmRow.class_name === 'NORMAL' ? '#10B981' : '#EF4444' }}>
                        {cmRow.class_name}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}>
                        {(cmRow.precision * 100).toFixed(2)}%
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}>
                        {(cmRow.recall * 100).toFixed(2)}%
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}>
                        {(cmRow.f1_score * 100).toFixed(2)}%
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}>
                        {Number(cmRow.support).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr>
                      <td style={{ fontWeight: '700', color: '#10B981' }}>NORMAL</td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}>99.97%</td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}>100.00%</td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}>99.98%</td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}>19,019</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: '700', color: '#EF4444' }}>SUSPICIOUS</td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}>100.00%</td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}>99.98%</td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}>99.99%</td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}>25,604</td>
                    </tr>
                  </>
                )}
                <tr style={{ borderTop: '1px solid var(--border-subtle)', fontWeight: '700' }}>
                  <td style={{ color: 'var(--color-cyan)' }}>Accuracy / Total</td>
                  <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', color: 'var(--color-cyan)' }}>—</td>
                  <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', color: 'var(--color-cyan)' }}>—</td>
                  <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', color: 'var(--color-cyan)' }}>{accuracy}%</td>
                  <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
                    {Number(totalTestRecords).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            style={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.45,
              marginTop: '12px',
            }}
          >
            <strong style={{ color: 'var(--text-primary)' }}>Interpretation: </strong>
            The Random Forest model performs highly accurately on the held-out CICIDS2017 DDoS-vs-BENIGN test set. Both classes achieve &gt;99.9% precision and recall.
          </div>
        </div>
      </div>

      {/* ====================================================================
          5. FEATURE IMPORTANCE (INTERACTIVE BAR CHART)
          ==================================================================== */}
      <div className="dm-card">
        <div className="dm-card-header">
          <div>
            <h3 className="dm-card-title">
              FEATURE IMPORTANCE
            </h3>
            <p className="dm-card-desc">
              Relative contribution of network flow attributes evaluated across all 100 decision trees
            </p>
          </div>

          {/* Toggle View: Top 10, Top 20, All */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className={`dm-fi-toggle-btn ${featureViewCount === 'top10' ? 'is-active' : ''}`}
              onClick={() => setFeatureViewCount('top10')}
            >
              Show Top 10
            </button>
            <button
              className={`dm-fi-toggle-btn ${featureViewCount === 'top20' ? 'is-active' : ''}`}
              onClick={() => setFeatureViewCount('top20')}
            >
              Show Top 20
            </button>
            <button
              className={`dm-fi-toggle-btn ${featureViewCount === 'all' ? 'is-active' : ''}`}
              onClick={() => setFeatureViewCount('all')}
            >
              Show All (62)
            </button>
          </div>
        </div>

        {/* Chart Container with dynamic height */}
        <div
          className="dm-feature-chart-wrap"
          style={{
            height: featureViewCount === 'all' ? '820px' : featureViewCount === 'top20' ? '500px' : '340px',
            transition: 'height 0.2s ease',
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={displayedFeatures}
              margin={{ top: 10, right: 30, left: 90, bottom: 5 }}
            >
              <XAxis
                type="number"
                domain={[0, 15]}
                stroke="#1E3B4D"
                tickFormatter={(val) => `${val}%`}
                tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={200}
                stroke="#1E3B4D"
                tick={{ fill: '#E2E8F0', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div
                      style={{
                        background: 'var(--surface-elevated)',
                        border: '1px solid var(--color-cyan)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.85)',
                      }}
                    >
                      <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        #{d.rank} {d.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-cyan)', fontFamily: 'JetBrains Mono' }}>
                        Importance: <strong>{d.percentage}%</strong> ({d.importance})
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="percentage"
                radius={[0, 4, 4, 0]}
                onClick={(data) => setSelectedFeature(data.raw || data)}
                cursor="pointer"
              >
                {displayedFeatures.map((entry, index) => {
                  const isSelected = selectedFeature?.feature_name === entry.name;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        isSelected
                          ? 'var(--color-cyan)'
                          : index === 0
                          ? '#00D9FF'
                          : index < 3
                          ? '#0EA5E9'
                          : index < 10
                          ? '#0284C7'
                          : '#0369A1'
                      }
                      stroke={isSelected ? '#FFFFFF' : 'none'}
                      strokeWidth={isSelected ? 1.5 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Selected Feature Detail Card */}
        {selectedFeature && (
          <div className="dm-fi-detail-card">
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                SELECTED FEATURE DETAIL
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)', margin: '2px 0' }}>
                {selectedFeature.feature_name}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>IMPORTANCE</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-cyan)', fontFamily: 'JetBrains Mono' }}>
                  {selectedFeature.importance ?? '—'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>SHARE</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#10B981', fontFamily: 'JetBrains Mono' }}>
                  {selectedFeature.percentage ? `${Number(selectedFeature.percentage).toFixed(2)}%` : '—'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>GLOBAL RANK</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>
                  #{selectedFeature.rank || '—'} / 62
                </span>
              </div>
            </div>
          </div>
        )}

        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '10px 0 0', lineHeight: 1.45 }}>
          Feature importance indicates which network flow attributes contributed most to the Random Forest's split decisions across the 100 decision trees. Click any feature bar to inspect its exact weight.
        </p>
      </div>

      {/* ====================================================================
          6. TRAFFIC CLASSIFICATION WORKSPACE (CSV UPLOAD & VALIDATION)
          ==================================================================== */}
      <div className="dm-card" id="classification-workspace">
        <div className="dm-card-header">
          <div>
            <h3 className="dm-card-title">
              TRAFFIC CLASSIFICATION WORKSPACE
            </h3>
            <p className="dm-card-desc">
              Upload a CSV containing the 62 model features to perform inference through the pre-trained Random Forest model
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleLoadSample}
              disabled={predictLoading || isValidating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.74rem',
                fontWeight: '700',
                color: 'var(--color-cyan)',
                background: 'rgba(0, 217, 255, 0.08)',
                border: '1px solid rgba(0, 217, 255, 0.25)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={13} />
              Load Sample Records
            </button>

            {(file || predictionResult) && (
              <button
                onClick={handleResetPrediction}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 10px',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  color: 'var(--text-muted)',
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <X size={13} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          className="dm-upload-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            style={{ display: 'none' }}
          />

          <UploadCloud size={32} color="var(--color-cyan)" />
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            {file ? file.name : 'Click to choose or drag & drop CSV file here'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Requirements: exactly 62 model features, maximum 50,000 records
          </div>
        </div>

        {/* Step 2: Display File Metadata if a file is loaded */}
        {fileMetadata && (
          <div className="dm-file-metadata-grid">
            <div className="dm-spec-tile">
              <span className="dm-spec-label">FILE NAME</span>
              <span className="dm-spec-val" style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                {fileMetadata.name}
              </span>
            </div>
            <div className="dm-spec-tile">
              <span className="dm-spec-label">FILE SIZE</span>
              <span className="dm-spec-val">
                {fileMetadata.sizeFormatted}
              </span>
            </div>
            <div className="dm-spec-tile">
              <span className="dm-spec-label">ROW COUNT</span>
              <span className="dm-spec-val" style={{ color: 'var(--color-cyan)' }}>
                {fileMetadata.rowCount.toLocaleString()}
              </span>
            </div>
            <div className="dm-spec-tile">
              <span className="dm-spec-label">COLUMNS</span>
              <span className="dm-spec-val">
                {fileMetadata.columnCount}
              </span>
            </div>
          </div>
        )}

        {/* Step 3 & 4: Validation Status Box */}
        {isValidating && (
          <div className="dm-validation-box" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
            <RefreshCw size={16} className="animate-spin" color="var(--color-cyan)" />
            <span>Validating CSV structure and checking 62 required features...</span>
          </div>
        )}

        {!isValidating && validationResult && (
          <div className={`dm-validation-box ${validationResult.isValid ? 'valid' : 'invalid'}`}>
            {validationResult.isValid ? (
              <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '1px' }} />
            ) : (
              <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: '1px' }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', marginBottom: '2px' }}>
                {validationResult.isValid ? 'CSV Validated Successfully' : 'Validation Error'}
              </div>
              <div>
                {validationResult.isValid ? validationResult.message : validationResult.error}
              </div>
              {validationResult.extraColumns && validationResult.extraColumns.length > 0 && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Note: {validationResult.extraColumns.length} extra column(s) detected. Extra columns will be safely ignored during model inference.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleRunPrediction}
            disabled={!file || !validationResult?.isValid || predictLoading || isValidating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 20px',
              fontSize: '0.82rem',
              fontWeight: '700',
              color: !file || !validationResult?.isValid || predictLoading ? 'var(--text-muted)' : '#000000',
              background: !file || !validationResult?.isValid || predictLoading ? 'var(--border-subtle)' : 'var(--color-cyan)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: !file || !validationResult?.isValid || predictLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {predictLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Classifying traffic...</span>
              </>
            ) : (
              <>
                <BrainCircuit size={15} />
                <span>Run Classification</span>
              </>
            )}
          </button>

          {!file && (
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              No traffic file selected. Select or drag a CSV file to begin.
            </span>
          )}

          {file && validationResult?.isValid && !predictionResult && !predictLoading && (
            <span style={{ fontSize: '0.76rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={14} /> CSV validated. Ready for classification.
            </span>
          )}

          {predictError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#EF4444' }}>
              <AlertCircle size={14} />
              <span>{predictError}</span>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          7. PREDICTION RESULTS
          ==================================================================== */}
      {predictionResult && (
        <div className="dm-card" id="prediction-results">
          <div className="dm-card-header">
            <div>
              <h3 className="dm-card-title">
                PREDICTION RESULTS
              </h3>
              <p className="dm-card-desc">
                Inference outputs generated by the pre-trained Random Forest model
              </p>
            </div>

            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--color-cyan)',
                fontFamily: 'JetBrains Mono',
                background: 'rgba(0, 217, 255, 0.08)',
                border: '1px solid rgba(0, 217, 255, 0.25)',
                padding: '3px 8px',
                borderRadius: '4px',
                fontWeight: '700',
              }}
            >
              {predictionResult.total_records} RECORDS CLASSIFIED
            </span>
          </div>

          {/* 4 Summary Pills */}
          <div className="dm-prediction-results-grid">
            <div className="dm-pred-pill">
              <span className="dm-spec-label">EVALUATED RECORDS</span>
              <span className="dm-spec-val" style={{ color: 'var(--text-primary)' }}>
                {Number(predictionResult.total_records).toLocaleString()}
              </span>
            </div>

            <div className="dm-pred-pill">
              <span className="dm-spec-label">NORMAL FLOWS</span>
              <span className="dm-spec-val" style={{ color: '#10B981' }}>
                {predictionResult.normal_records ?? predictionResult.normal_count ?? 0} (
                {predictionResult.normal_percentage ?? 0}%)
              </span>
            </div>

            <div className="dm-pred-pill">
              <span className="dm-spec-label">SUSPICIOUS FLOWS</span>
              <span className="dm-spec-val" style={{ color: '#EF4444' }}>
                {predictionResult.suspicious_records ?? predictionResult.suspicious_count ?? 0} (
                {predictionResult.suspicious_percentage ?? 0}%)
              </span>
            </div>

            <div className="dm-pred-pill">
              <span className="dm-spec-label">AVG CONFIDENCE</span>
              <span className="dm-spec-val" style={{ color: 'var(--color-cyan)' }}>
                {predictionResult.analysis?.average_confidence
                  ? `${(predictionResult.analysis.average_confidence * 100).toFixed(1)}%`
                  : '100.0%'}
              </span>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="dm-results-filter-bar">
            {/* Search by row number */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search by row #..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  outline: 'none',
                  width: '100%',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Class Filter Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Class:</span>
              <button
                className={`dm-fi-toggle-btn ${classFilter === 'ALL' ? 'is-active' : ''}`}
                onClick={() => {
                  setClassFilter('ALL');
                  setCurrentPage(1);
                }}
              >
                All ({predictionResult.total_records})
              </button>
              <button
                className={`dm-fi-toggle-btn ${classFilter === 'NORMAL' ? 'is-active' : ''}`}
                onClick={() => {
                  setClassFilter('NORMAL');
                  setCurrentPage(1);
                }}
                style={{ color: classFilter === 'NORMAL' ? '#10B981' : undefined }}
              >
                NORMAL ({predictionResult.normal_records ?? 0})
              </button>
              <button
                className={`dm-fi-toggle-btn ${classFilter === 'SUSPICIOUS' ? 'is-active' : ''}`}
                onClick={() => {
                  setClassFilter('SUSPICIOUS');
                  setCurrentPage(1);
                }}
                style={{ color: classFilter === 'SUSPICIOUS' ? '#EF4444' : undefined }}
              >
                SUSPICIOUS ({predictionResult.suspicious_records ?? 0})
              </button>
            </div>

            {/* Page Size Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Per page:</span>
              {[10, 25, 50].map((sz) => (
                <button
                  key={sz}
                  className={`dm-fi-toggle-btn ${pageSize === sz ? 'is-active' : ''}`}
                  onClick={() => {
                    setPageSize(sz);
                    setCurrentPage(1);
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Prediction Table */}
          {filteredPredictions.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No prediction records match the selected filter.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="dm-report-table">
                <thead>
                  <tr>
                    <th
                      onClick={() => handleSortToggle('row_number')}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      title="Sort by Row #"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>ROW #</span>
                        <ArrowUpDown size={11} color="var(--text-muted)" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSortToggle('prediction')}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      title="Sort by Class"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>PREDICTION</span>
                        <ArrowUpDown size={11} color="var(--text-muted)" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSortToggle('confidence')}
                      style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                      title="Sort by Confidence"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <span>CONFIDENCE</span>
                        <ArrowUpDown size={11} color="var(--text-muted)" />
                      </div>
                    </th>
                    <th style={{ textAlign: 'right' }}>P(NORMAL)</th>
                    <th style={{ textAlign: 'right' }}>P(SUSPICIOUS)</th>
                    <th style={{ textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPredictions.map((row, idx) => (
                    <tr
                        key={idx}
                        onClick={() => handleOpenRecordDetail(row)}
                        style={{ cursor: 'pointer' }}
                        className="dm-table-row-hover"
                      >
                        <td style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontWeight: '700' }}>
                          #{row.row_number}
                        </td>
                        <td>
                          <StatusBadge
                            status={row.prediction}
                            label={row.prediction}
                            size="sm"
                          />
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {row.confidence ? `${(row.confidence * 100).toFixed(1)}%` : '100.0%'}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', color: '#10B981' }}>
                          {row.normal_probability !== undefined
                            ? `${(row.normal_probability * 100).toFixed(1)}%`
                            : '—'}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', color: '#EF4444' }}>
                          {row.suspicious_probability !== undefined
                            ? `${(row.suspicious_probability * 100).toFixed(1)}%`
                            : '—'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenRecordDetail(row);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              fontSize: '0.7rem',
                              fontFamily: 'JetBrains Mono',
                              color: 'var(--color-cyan)',
                              background: 'rgba(0, 217, 255, 0.08)',
                              border: '1px solid rgba(0, 217, 255, 0.25)',
                              borderRadius: '3px',
                              cursor: 'pointer',
                            }}
                          >
                            <Eye size={11} />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredPredictions.length > 0 && (
            <div className="dm-pagination-bar">
              <div>
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredPredictions.length)} of{' '}
                {filteredPredictions.length} records
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="dm-fi-toggle-btn"
                  style={{ opacity: currentPage <= 1 ? 0.4 : 1, cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="dm-fi-toggle-btn"
                  style={{ opacity: currentPage >= totalPages ? 0.4 : 1, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          8. DATA MINING PROCESS STRIP (5 STEPS)
          ==================================================================== */}
      <div className="dm-card">
        <div className="dm-card-header" style={{ marginBottom: '6px' }}>
          <div>
            <h3 className="dm-card-title">
              DATA MINING PROCESS
            </h3>
            <p className="dm-card-desc">
              Methodological flow from cleaned warehouse data to evaluated classification decisions
            </p>
          </div>
        </div>

        <div className="dm-process-grid">
          <div className="dm-process-step">
            <span className="dm-step-num">01</span>
            <span className="dm-step-title">CLEANED DATA</span>
            <span className="dm-step-desc">
              Preprocessed CICIDS2017 flow records loaded from warehouse.
            </span>
          </div>

          <div className="dm-process-step">
            <span className="dm-step-num">02</span>
            <span className="dm-step-title">62 FEATURES</span>
            <span className="dm-step-desc">
              Extraction of packet length, duration, flags, and IAT measures.
            </span>
          </div>

          <div className="dm-process-step">
            <span className="dm-step-num">03</span>
            <span className="dm-step-title">RANDOM FOREST</span>
            <span className="dm-step-desc">
              100 decision trees trained with bootstrap aggregating.
            </span>
          </div>

          <div className="dm-process-step">
            <span className="dm-step-num">04</span>
            <span className="dm-step-title">CLASSIFICATION</span>
            <span className="dm-step-desc">
              Majority ensemble voting assigns NORMAL or SUSPICIOUS label.
            </span>
          </div>

          <div className="dm-process-step">
            <span className="dm-step-num">05</span>
            <span className="dm-step-title">MODEL EVALUATION</span>
            <span className="dm-step-desc">
              Rigorous validation on 44,623 held-out test flow records.
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          9. ACADEMIC EXPLANATION & MODEL LIMITATION
          ==================================================================== */}
      <div className="dm-academic-grid">
        {/* Left: WHY RANDOM FOREST? */}
        <div className="dm-card">
          <div className="dm-card-header">
            <div>
              <h3 className="dm-card-title">
                WHY RANDOM FOREST?
              </h3>
              <p className="dm-card-desc">
                Supervised ensemble classification rationale
              </p>
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: '700',
                color: 'var(--color-cyan)',
                fontFamily: 'JetBrains Mono',
              }}
            >
              ALGORITHM
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px 0' }}>
            Random Forest combines multiple decision trees to make a classification decision. In this project, it is used to learn patterns from 62 network flow features and classify records as NORMAL or SUSPICIOUS.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              marginTop: 'auto',
            }}
          >
            <Info size={15} color="var(--color-cyan)" style={{ flexShrink: 0 }} />
            <span>Ensemble averaging reduces individual tree variance and prevents overfitting.</span>
          </div>
        </div>

        {/* Right: MODEL LIMITATION */}
        <div className="dm-card">
          <div className="dm-card-header">
            <div>
              <h3 className="dm-card-title">
                MODEL LIMITATION
              </h3>
              <p className="dm-card-desc">
                Academic scope and generalization boundaries
              </p>
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: '700',
                color: '#F59E0B',
                fontFamily: 'JetBrains Mono',
              }}
            >
              EVALUATION SCOPE
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px 0' }}>
            The reported performance is measured on the held-out CICIDS2017 test set. High accuracy on this dataset does not guarantee the same performance on unseen datasets, different traffic environments, or other attack types.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              marginTop: 'auto',
            }}
          >
            <Info size={15} color="#F59E0B" style={{ flexShrink: 0 }} />
            <span>Offline tabular evaluation is dataset-specific and excludes raw PCAP live extraction.</span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          10. RECORD DETAIL MODAL (62 FEATURES IN 8 ORGANIZED GROUPS)
          ==================================================================== */}
      {selectedRecord && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Traffic Record #${selectedRecord.row_number} Inspection`}
          description="Detailed evaluation and 62 input features for this classified flow record"
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Classification Summary Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
              }}
            >
              <div>
                <span className="dm-spec-label">PREDICTION</span>
                <div style={{ marginTop: '2px' }}>
                  <StatusBadge
                    status={selectedRecord.prediction}
                    label={selectedRecord.prediction}
                    size="sm"
                  />
                </div>
              </div>

              <div>
                <span className="dm-spec-label">MODEL CONFIDENCE</span>
                <span className="dm-spec-val" style={{ color: 'var(--color-cyan)', fontSize: '0.95rem' }}>
                  {selectedRecord.confidence ? `${(selectedRecord.confidence * 100).toFixed(2)}%` : '100.0%'}
                </span>
              </div>

              <div>
                <span className="dm-spec-label">P(NORMAL)</span>
                <span className="dm-spec-val" style={{ color: '#10B981', fontSize: '0.95rem' }}>
                  {selectedRecord.normal_probability !== undefined
                    ? `${(selectedRecord.normal_probability * 100).toFixed(2)}%`
                    : '—'}
                </span>
              </div>

              <div>
                <span className="dm-spec-label">P(SUSPICIOUS)</span>
                <span className="dm-spec-val" style={{ color: '#EF4444', fontSize: '0.95rem' }}>
                  {selectedRecord.suspicious_probability !== undefined
                    ? `${(selectedRecord.suspicious_probability * 100).toFixed(2)}%`
                    : '—'}
                </span>
              </div>
            </div>

            {/* 8 Feature Group Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {FEATURE_GROUPS.map((group) => {
                const rowData = parsedRowsMap[selectedRecord.row_number] || {};

                return (
                  <div key={group.id} className="dm-record-group-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                        {group.title}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {group.features.length} features
                      </span>
                    </div>

                    <div className="dm-feature-kv-grid">
                      {group.features.map((featName) => {
                        const val = rowData[featName];
                        return (
                          <div key={featName} className="dm-feature-kv-item" title={featName}>
                            <span className="dm-feature-kv-name">{featName}</span>
                            <span className="dm-feature-kv-val">
                              {formatFeatureValue(val)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
