import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.js';
import {
  generateQuiz,
  getQuizDetail,
  submitQuiz,
  getHistory,
  getAttemptReview,
  deleteAttempt,
} from '../controllers/quizController.js';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = Router();

// Limit AI generation to 10 requests per 15 minutes per user (protects quota).
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: { message: 'Too many quiz generation requests. Please wait a few minutes and try again.' },
});

router.get('/dashboard/stats', requireAuth, getDashboardStats);

router.post('/quizzes/generate', requireAuth, generateLimiter, generateQuiz);
router.get('/quizzes/history', requireAuth, getHistory);
router.get('/quizzes/:quizId', requireAuth, getQuizDetail);
router.post('/quizzes/:quizId/submit', requireAuth, submitQuiz);
router.get('/quizzes/attempts/:attemptId', requireAuth, getAttemptReview);
router.delete('/quizzes/attempts/:attemptId', requireAuth, deleteAttempt);

export default router;
