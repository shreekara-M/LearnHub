export const queryKeys = {
  courses: ['courses'],
  course: (id) => ['courses', id],
  purchaseStatus: (id) => ['purchase-status', id],
  dashboard: ['dashboard'],
  progress: (id) => ['progress', id],
  stream: (id) => ['stream', id],
  adminStats: ['admin', 'stats'],
  adminCourses: ['admin', 'courses'],
  adminCourse: (id) => ['admin', 'courses', id],
  adminUsers: ['admin', 'users'],
  adminPurchases: ['admin', 'purchases']
};