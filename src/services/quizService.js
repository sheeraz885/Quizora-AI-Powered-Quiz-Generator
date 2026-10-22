import { api } from './api';

export async function generateQuiz(payload) {
  return api.post('/quizzes/generate', payload);
}

export async function fetchDashboardStats() {
  return api.get('/dashboard/stats');
}

export async function fetchQuizHistory() {
  return api.get('/quizzes/history');
}

export async function fetchQuizDetail(quizId) {
  return api.get(`/quizzes/${quizId}`);
}

export async function submitQuiz(quizId, selectedAnswers) {
  return api.post(`/quizzes/${quizId}/submit`, { selectedAnswers });
}

export async function fetchAttemptReview(attemptId) {
  return api.get(`/quizzes/attempts/${attemptId}`);
}

export async function deleteAttempt(attemptId) {
  return api.delete(`/quizzes/attempts/${attemptId}`);
}
