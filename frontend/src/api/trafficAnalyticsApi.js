/**
 * Traffic Analytics API client service
 * Supports OLAP filtered aggregation queries and port drill-down
 */

export async function fetchTrafficAnalytics(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== 'ALL') {
    params.append('status', filters.status);
  }
  if (filters.destination_port && filters.destination_port !== 'ALL') {
    params.append('destination_port', filters.destination_port);
  }
  if (filters.date && filters.date !== 'ALL') {
    params.append('date', filters.date);
  }

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const endpoints = [
    `/api/analytics/traffic${queryString}`,
    `http://127.0.0.1:8000/api/analytics/traffic${queryString}`
  ];

  let lastError = null;
  for (const ep of endpoints) {
    try {
      const response = await fetch(ep, {
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to fetch traffic analytics');
}

export async function fetchPortDrillDown(port) {
  const endpoints = [
    `/api/analytics/port-drilldown/${port}`,
    `http://127.0.0.1:8000/api/analytics/port-drilldown/${port}`
  ];

  let lastError = null;
  for (const ep of endpoints) {
    try {
      const response = await fetch(ep, {
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Failed to fetch drill-down for port ${port}`);
}
