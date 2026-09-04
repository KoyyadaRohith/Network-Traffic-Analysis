/**
 * Model Evaluation API Client
 * Retrieves real model performance metrics, confusion matrix, and feature importances
 */

export async function fetchModelEvaluation() {
  const endpoints = [
    '/api/model/evaluation',
    'http://127.0.0.1:8000/api/model/evaluation'
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

  throw lastError || new Error('Failed to fetch model evaluation');
}

export async function fetchFeatureImportance() {
  const endpoints = [
    '/api/model/feature-importance',
    'http://127.0.0.1:8000/api/model/feature-importance'
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

  throw lastError || new Error('Failed to fetch feature importance');
}
