import api from './api.js';

export function getStats() {
  return api.get('/admin/stats').then((response) => response.data);
}

export function getUsers(page = 1) {
  return api.get('/admin/users', { params: { page } }).then((response) => response.data);
}

export function getPurchases(page = 1) {
  return api.get('/admin/purchases', { params: { page } }).then((response) => response.data);
}

export function getCourses() {
  return api.get('/admin/courses').then((response) => response.data);
}

export function getCourse(id) {
  return api.get(`/admin/courses/${id}`).then((response) => response.data);
}

export function createCourse(data) {
  return api.post('/admin/courses', data).then((response) => response.data);
}

export function updateCourse(id, data) {
  return api.put(`/admin/courses/${id}`, data).then((response) => response.data);
}

export function deleteCourse(id) {
  return api.delete(`/admin/courses/${id}`).then((response) => response.data);
}

export function addLesson(courseId, data) {
  return api.post(`/admin/courses/${courseId}/lessons`, data).then((response) => response.data);
}

export function updateLesson(courseId, id, data) {
  return api.put(`/admin/courses/${courseId}/lessons/${id}`, data).then((response) => response.data);
}

export function deleteLesson(courseId, id) {
  return api.delete(`/admin/courses/${courseId}/lessons/${id}`).then((response) => response.data);
}

export function reorderLessons(courseId, lessonIds) {
  return api.patch(`/admin/courses/${courseId}/lessons/reorder`, { lessonIds }).then((response) => response.data);
}

export function getPresignedUpload(body) {
  return api.post('/admin/upload/presigned', body).then((response) => response.data);
}

const adminService = {
  getStats,
  getUsers,
  getPurchases,
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  getPresignedUpload
};

export default adminService;