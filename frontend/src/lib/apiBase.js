const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});
const configuredBase = (env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

export const API_BASE_URL = configuredBase
  ? (configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`)
  : '/api';
