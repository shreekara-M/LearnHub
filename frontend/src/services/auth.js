import api, { setAccessToken } from './api.js';

export function register({ name, email, password }) {
  return api.post('/auth/register', { name, email, password }).then((response) => response.data);
}

export function verifyOtp({ email, code }) {
  return api.post('/auth/verify-otp', { email, code }).then((response) => {
    setAccessToken(response.data.accessToken);
    return response.data;
  });
}

export function login({ email, password }) {
  return api.post('/auth/login', { email, password }).then((response) => {
    setAccessToken(response.data.accessToken);
    return response.data;
  });
}

export function logout() {
  return api.post('/auth/logout').then((response) => {
    setAccessToken(null);
    return response.data;
  });
}

export function resendOtp({ email }) {
  return api.post('/auth/resend-otp', { email }).then((response) => response.data);
}

export function getMe() {
  return api.get('/auth/me').then((response) => response.data);
}

const authService = {
  register,
  verifyOtp,
  login,
  logout,
  resendOtp,
  getMe
};

export default authService;