/**
 * CSV Validator and Feature Grouping Utility
 * Network Traffic Analysis — Data Warehousing & Data Mining using CICIDS2017
 * 
 * Verifies that uploaded CSV files contain the exact 62 model features required
 * by the pre-trained Random Forest classifier, checks row limits (<= 50,000),
 * and structures feature values into logical analytical categories for inspection.
 */

export const MODEL_FEATURES = [
  'Destination Port',
  'Flow Duration',
  'Total Fwd Packets',
  'Total Backward Packets',
  'Total Length of Fwd Packets',
  'Total Length of Bwd Packets',
  'Fwd Packet Length Max',
  'Fwd Packet Length Min',
  'Fwd Packet Length Mean',
  'Fwd Packet Length Std',
  'Bwd Packet Length Max',
  'Bwd Packet Length Min',
  'Bwd Packet Length Mean',
  'Bwd Packet Length Std',
  'Flow Bytes/s',
  'Flow Packets/s',
  'Flow IAT Mean',
  'Flow IAT Std',
  'Flow IAT Max',
  'Flow IAT Min',
  'Fwd IAT Total',
  'Fwd IAT Mean',
  'Fwd IAT Std',
  'Fwd IAT Max',
  'Fwd IAT Min',
  'Bwd IAT Total',
  'Bwd IAT Mean',
  'Bwd IAT Std',
  'Bwd IAT Max',
  'Bwd IAT Min',
  'Fwd PSH Flags',
  'Fwd Header Length',
  'Bwd Header Length',
  'Fwd Packets/s',
  'Bwd Packets/s',
  'Min Packet Length',
  'Max Packet Length',
  'Packet Length Mean',
  'Packet Length Std',
  'Packet Length Variance',
  'FIN Flag Count',
  'SYN Flag Count',
  'RST Flag Count',
  'PSH Flag Count',
  'ACK Flag Count',
  'URG Flag Count',
  'ECE Flag Count',
  'Down/Up Ratio',
  'Average Packet Size',
  'Avg Bwd Segment Size',
  'Init_Win_bytes_forward',
  'Init_Win_bytes_backward',
  'act_data_pkt_fwd',
  'min_seg_size_forward',
  'Active Mean',
  'Active Std',
  'Active Max',
  'Active Min',
  'Idle Mean',
  'Idle Std',
  'Idle Max',
  'Idle Min',
];

export const MAX_ALLOWED_RECORDS = 50000;

/**
 * Logical grouping of the 62 model features for structured record inspection.
 */
export const FEATURE_GROUPS = [
  {
    id: 'flow_id',
    title: 'Flow Identification & Rates',
    description: 'Basic network endpoint and volumetric rate measurements',
    features: [
      'Destination Port',
      'Flow Duration',
      'Flow Bytes/s',
      'Flow Packets/s',
    ],
  },
  {
    id: 'fwd_traffic',
    title: 'Forward Traffic Metrics',
    description: 'Outbound flow volume, packet counts, and header sizes',
    features: [
      'Total Fwd Packets',
      'Total Length of Fwd Packets',
      'Fwd Packet Length Max',
      'Fwd Packet Length Min',
      'Fwd Packet Length Mean',
      'Fwd Packet Length Std',
      'Fwd Header Length',
      'Fwd Packets/s',
      'act_data_pkt_fwd',
      'min_seg_size_forward',
    ],
  },
  {
    id: 'bwd_traffic',
    title: 'Backward Traffic Metrics',
    description: 'Inbound flow volume, packet counts, and response headers',
    features: [
      'Total Backward Packets',
      'Total Length of Bwd Packets',
      'Bwd Packet Length Max',
      'Bwd Packet Length Min',
      'Bwd Packet Length Mean',
      'Bwd Packet Length Std',
      'Bwd Header Length',
      'Bwd Packets/s',
      'Avg Bwd Segment Size',
    ],
  },
  {
    id: 'packet_dist',
    title: 'Packet Length Distributions',
    description: 'Statistical distribution of packet byte lengths across flow',
    features: [
      'Min Packet Length',
      'Max Packet Length',
      'Packet Length Mean',
      'Packet Length Std',
      'Packet Length Variance',
      'Average Packet Size',
      'Down/Up Ratio',
    ],
  },
  {
    id: 'timing_iat',
    title: 'Inter-Arrival Timing (IAT)',
    description: 'Interval timing statistics between successive packet arrivals',
    features: [
      'Flow IAT Mean',
      'Flow IAT Std',
      'Flow IAT Max',
      'Flow IAT Min',
      'Fwd IAT Total',
      'Fwd IAT Mean',
      'Fwd IAT Std',
      'Fwd IAT Max',
      'Fwd IAT Min',
      'Bwd IAT Total',
      'Bwd IAT Mean',
      'Bwd IAT Std',
      'Bwd IAT Max',
      'Bwd IAT Min',
    ],
  },
  {
    id: 'tcp_flags',
    title: 'TCP Flags',
    description: 'Control flag counts indicating connection handshake and teardown',
    features: [
      'FIN Flag Count',
      'SYN Flag Count',
      'RST Flag Count',
      'PSH Flag Count',
      'ACK Flag Count',
      'URG Flag Count',
      'ECE Flag Count',
      'Fwd PSH Flags',
    ],
  },
  {
    id: 'window_segment',
    title: 'Window & Segment Sizes',
    description: 'TCP buffer windows and initial negotiation configurations',
    features: [
      'Init_Win_bytes_forward',
      'Init_Win_bytes_backward',
    ],
  },
  {
    id: 'active_idle',
    title: 'Active & Idle Durations',
    description: 'Time durations during which the flow was active versus idle',
    features: [
      'Active Mean',
      'Active Std',
      'Active Max',
      'Active Min',
      'Idle Mean',
      'Idle Std',
      'Idle Max',
      'Idle Min',
    ],
  },
];

/**
 * Parses a simple CSV string into headers and array of row objects.
 * Extra columns are tolerated; missing required features are reported.
 */
export function parseCSV(text) {
  if (!text || typeof text !== 'string') {
    return { headers: [], rows: [] };
  }

  const lines = text.split(/\r\n|\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Parse header line respecting commas
  const headers = splitCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === '')) {
      continue;
    }
    const rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = values[j] !== undefined ? values[j].trim() : '';
    }
    rows.push(rowObj);
  }

  return { headers, rows };
}

/**
 * Splits a CSV line handling quoted commas if present.
 */
function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Validates the parsed CSV headers and row count.
 * Returns { isValid, error, warnings, rowCount, columnCount, missingFeatures, extraColumns }
 */
export function validateCSVData(headers, rowCount) {
  if (!headers || headers.length === 0) {
    return {
      isValid: false,
      error: 'The CSV file does not contain a valid header row.',
      missingFeatures: MODEL_FEATURES,
      extraColumns: [],
      rowCount: 0,
      columnCount: 0,
    };
  }

  if (rowCount === 0) {
    return {
      isValid: false,
      error: 'The uploaded CSV file contains no data rows.',
      missingFeatures: [],
      extraColumns: [],
      rowCount: 0,
      columnCount: headers.length,
    };
  }

  if (rowCount > MAX_ALLOWED_RECORDS) {
    return {
      isValid: false,
      error: `File contains ${rowCount.toLocaleString()} records. Maximum supported size is ${MAX_ALLOWED_RECORDS.toLocaleString()}.`,
      missingFeatures: [],
      extraColumns: [],
      rowCount,
      columnCount: headers.length,
    };
  }

  // Check required features
  const headerSet = new Set(headers.map((h) => h.trim()));
  const missingFeatures = MODEL_FEATURES.filter((f) => !headerSet.has(f));
  const extraColumns = headers.filter((h) => !MODEL_FEATURES.includes(h));

  if (missingFeatures.length > 0) {
    const sampleMissing = missingFeatures.slice(0, 3).join(', ');
    const countText = missingFeatures.length > 3 ? ` and ${missingFeatures.length - 3} more` : '';
    return {
      isValid: false,
      error: `Missing required feature${missingFeatures.length > 1 ? 's' : ''}: ${sampleMissing}${countText}.`,
      missingFeatures,
      extraColumns,
      rowCount,
      columnCount: headers.length,
    };
  }

  return {
    isValid: true,
    error: null,
    message: 'CSV is valid for classification. All 62 model features detected.',
    missingFeatures: [],
    extraColumns,
    rowCount,
    columnCount: headers.length,
  };
}

/**
 * Formats a feature value for clean numerical display.
 */
export function formatFeatureValue(val) {
  if (val === undefined || val === null || val === '') return '—';
  const num = Number(val);
  if (isNaN(num)) return String(val);
  if (Number.isInteger(num)) return num.toLocaleString();
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}
