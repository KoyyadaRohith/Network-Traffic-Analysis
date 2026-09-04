/**
 * DWDM Analysis API Client
 * Connects to real MySQL star schema warehouse endpoints for OLAP operations
 */

async function fetchFromEndpoints(paths) {
  let lastError = null;
  for (const p of paths) {
    try {
      const response = await fetch(p, {
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Network request failed');
}

export async function fetchDWDMOverview() {
  return fetchFromEndpoints([
    '/api/dwdm/overview',
    'http://127.0.0.1:8000/api/dwdm/overview',
  ]);
}

export async function fetchDWDMClassificationSummary() {
  return fetchFromEndpoints([
    '/api/dwdm/classification-summary',
    'http://127.0.0.1:8000/api/dwdm/classification-summary',
  ]);
}

export async function fetchDWDMPortAnalysis(limit = 15) {
  return fetchFromEndpoints([
    `/api/dwdm/port-analysis?limit=${limit}`,
    `http://127.0.0.1:8000/api/dwdm/port-analysis?limit=${limit}`,
  ]);
}

export async function fetchDWDMStatusComparison() {
  return fetchFromEndpoints([
    '/api/dwdm/status-comparison',
    'http://127.0.0.1:8000/api/dwdm/status-comparison',
  ]);
}

export async function fetchDWDMRollup() {
  return fetchFromEndpoints([
    '/api/dwdm/rollup',
    'http://127.0.0.1:8000/api/dwdm/rollup',
  ]);
}

export async function fetchDWDMDrilldown(port = 80) {
  return fetchFromEndpoints([
    `/api/dwdm/drilldown/${port}`,
    `http://127.0.0.1:8000/api/dwdm/drilldown/${port}`,
  ]);
}

export async function fetchDWDMQueries() {
  return fetchFromEndpoints([
    '/api/dwdm/queries',
    'http://127.0.0.1:8000/api/dwdm/queries',
  ]);
}

export async function fetchSliceDiceResults(status = 'ALL', port = 'ALL') {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  if (port && port !== 'ALL') params.append('destination_port', port);
  const qStr = params.toString() ? `?${params.toString()}` : '';

  return fetchFromEndpoints([
    `/api/analytics/traffic${qStr}`,
    `http://127.0.0.1:8000/api/analytics/traffic${qStr}`,
  ]);
}
