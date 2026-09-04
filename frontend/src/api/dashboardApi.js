/**
 * Dashboard API client service
 * Communicates with FastAPI backend for network traffic analytics
 */

const API_ENDPOINTS = [
  '/api/dashboard',
  'http://127.0.0.1:8000/api/dashboard'
];

export async function fetchDashboardData() {
  let lastError = null;

  for (const endpoint of API_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      lastError = err;
      // Continue to next endpoint attempt if any
    }
  }

  throw lastError || new Error('Failed to fetch dashboard data from all endpoints');
}
