/**
 * Dataset Explorer API client service
 * Retrieves real project dataset metadata, class distribution, and 62 model features
 */

import { getEndpoints } from './config';

export async function fetchDatasetSummary() {
  const endpoints = getEndpoints('/api/dataset/summary');

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

  throw lastError || new Error('Failed to fetch dataset summary');
}

export async function fetchDatasetClassDistribution() {
  const endpoints = getEndpoints('/api/dataset/class-distribution');

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

  throw lastError || new Error('Failed to fetch dataset class distribution');
}

export async function fetchDatasetFeatures() {
  const endpoints = getEndpoints('/api/dataset/features');

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

  throw lastError || new Error('Failed to fetch dataset features');
}
