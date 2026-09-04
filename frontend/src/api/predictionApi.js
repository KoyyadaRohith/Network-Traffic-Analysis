/**
 * Prediction API client service
 * Uploads network traffic CSV files for Random Forest inference
 */

const API_ENDPOINTS = [
  '/api/predict',
  'http://127.0.0.1:8000/api/predict'
];

export async function predictTraffic(file) {
  if (!file) {
    throw new Error('Please select a CSV file before submitting.');
  }

  if (!file.name.toLowerCase().endsWith('.csv')) {
    throw new Error('Invalid file format. Only CSV files (.csv) are accepted.');
  }

  const formData = new FormData();
  formData.append('file', file);

  let lastError = null;

  for (const endpoint of API_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorJson = await response.json();
          if (errorJson.detail) {
            errorDetail = errorJson.detail;
          }
        } catch {
          // Keep generic detail if JSON parsing fails
        }
        throw new Error(errorDetail);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      lastError = err;
      // If it's a 400 Bad Request error from the server (e.g. missing columns), don't retry other endpoints
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Failed to connect to the prediction API service.');
}
