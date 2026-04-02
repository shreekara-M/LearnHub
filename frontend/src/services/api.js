import axios from 'axios';

let _accessToken = null;
let _refreshPromise = null;

export function setAccessToken(token) {
  _accessToken = token;
}

export function getAccessToken() {
  return _accessToken;
}

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || '';

    if (status !== 401 || !original) {
      throw error;
    }

    if (url.includes('/auth/refresh')) {
      setAccessToken(null);
      throw error;
    }

    if (original._retry) {
      throw error;
    }

    original._retry = true;

    try {
      if (!_refreshPromise) {
        _refreshPromise = axios
          .post('/api/v1/auth/refresh', {}, { withCredentials: true })
          .then((response) => {
            const nextToken = response.data.accessToken || null;
            setAccessToken(nextToken);
            return nextToken;
          })
          .finally(() => {
            _refreshPromise = null;
          });
      }

      const nextToken = await _refreshPromise;
      original.headers = original.headers || {};

      if (nextToken) {
        original.headers.Authorization = `Bearer ${nextToken}`;
      }

      return api(original);
    } catch (refreshError) {
      setAccessToken(null);
      throw refreshError;
    }
  }
);

export default api;