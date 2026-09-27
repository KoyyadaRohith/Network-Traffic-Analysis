/**
 * Configuration helper for API base URLs
 * Uses VITE_API_BASE_URL when defined, with intelligent fallback
 * for both local dev and production (Vercel monorepo or separate backend).
 */

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

/**
 * Builds an array of prioritized candidate endpoints for a given API path.
 * 1. If VITE_API_BASE_URL is defined, prepends it.
 * 2. Relative path (/api/...) for same-domain or Vite dev proxy.
 * 3. Localhost fallbacks for dev server resiliency.
 */
export function getEndpoints(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const endpoints = [];

  if (API_BASE_URL) {
    endpoints.push(`${API_BASE_URL}${cleanPath}`);
  }

  // Same-domain relative path (crucial for unified Vercel monorepo deployment)
  endpoints.push(cleanPath);

  // Local development direct fallbacks
  const localEndpoint = `http://localhost:8000${cleanPath}`;
  if (!endpoints.includes(localEndpoint)) {
    endpoints.push(localEndpoint);
  }

  const local127 = `http://127.0.0.1:8000${cleanPath}`;
  if (!endpoints.includes(local127)) {
    endpoints.push(local127);
  }

  return [...new Set(endpoints)];
}

/**
 * Returns the primary URL for an endpoint
 */
export function getPrimaryApiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE_URL) {
    return `${API_BASE_URL}${cleanPath}`;
  }
  return cleanPath;
}
