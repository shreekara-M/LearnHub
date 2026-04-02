import api from './api.js';

export function getCourses() {
  return api.get('/courses').then((response) => response.data);
}

export function getCourse(id) {
  return api.get(`/courses/${id}`).then((response) => response.data);
}

const courseService = {
  getCourses,
  getCourse
};

export default courseService;