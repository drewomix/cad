import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api',
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config.__isRetryRequest) {
      try {
        const { data } = await api.post('/auth/refresh', { refreshToken: localStorage.getItem('refreshToken') });
        setAccessToken(data.accessToken, data.refreshToken);
        error.config.headers = {
          ...(error.config.headers ?? {}),
          Authorization: `Bearer ${data.accessToken}`
        };
        error.config.__isRetryRequest = true;
        return api(error.config);
      } catch (refreshError) {
        localStorage.removeItem('refreshToken');
      }
    }
    return Promise.reject(error);
  }
);

export const setAccessToken = (token: string, refreshToken: string) => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = () => {
  delete api.defaults.headers.common.Authorization;
  localStorage.removeItem('refreshToken');
};
