import api from './api.js';

export function getDashboard() {
  return api.get('/user/dashboard').then((response) => response.data);
}

const userService = {
  getDashboard
};

export default userService;