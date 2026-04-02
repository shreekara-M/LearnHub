import api from './api.js';

export function mockPurchase(courseId) {
  return api.post('/payments/mock-purchase', { courseId }).then((response) => response.data);
}

export function getPurchaseStatus(courseId) {
  return api.get(`/payments/status/${courseId}`).then((response) => response.data);
}

const paymentsService = {
  mockPurchase,
  getPurchaseStatus
};

export default paymentsService;