/**
 * Traffic Analytics API client service
 * Supports OLAP filtered aggregation queries and port drill-down
 */

import { getEndpoints } from './config';

export async function fetchTrafficAnalytics(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== 'ALL') {
    params.append('status', filters.status);
  }
  if (filters.destination_port && filters.destination_port !== 'ALL') {
    params.append('destination_port', filters.destination_port);
  }
  if (filters.port && filters.port !== 'ALL') {
    params.append('destination_port', filters.port);
  }
  if (filters.date && filters.date !== 'ALL') {
    params.append('date', filters.date);
  }
  if (filters.search && filters.search.trim()) {
    params.append('search', filters.search.trim());
  }
  if (filters.page != null) {
    params.append('page', filters.page);
  }
  if (filters.page_size != null) {
    params.append('page_size', filters.page_size);
  }
  if (filters.sort_by) {
    params.append('sort_by', filters.sort_by);
  }
  if (filters.sort_order) {
    params.append('sort_order', filters.sort_order);
  }

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const endpoints = getEndpoints(`/api/analytics/traffic${queryString}`);

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

export async function fetchTrafficRecord(trafficId) {
  const endpoints = getEndpoints(`/api/analytics/traffic/record/${trafficId}`);

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

  throw lastError || new Error(`Failed to fetch traffic record ${trafficId}`);
}

export async function fetchPortDrillDown(port) {
  const endpoints = getEndpoints(`/api/analytics/port-drilldown/${port}`);

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
