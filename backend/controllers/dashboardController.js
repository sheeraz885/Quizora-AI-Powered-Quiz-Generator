import { QuizAttempt } from '../models/QuizAttempt.js';

export async function getDashboardStats(req, res, next) {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .lean();

    const totalAttempted = attempts.length;
    const averageScore =
      totalAttempted > 0
        ? attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempted
        : 0;
    const bestScore =
      totalAttempted > 0 ? Math.max(...attempts.map((a) => a.percentage)) : 0;

    res.json({
      totalAttempted,
      averageScore: Math.round(averageScore * 10) / 10,
      bestScore,
      recentAttempts: attempts.slice(0, 5).map((a) => ({
        _id: a._id.toString(),
        quizId: a.quizId.toString(),
        topic: a.topic,
        difficulty: a.difficulty,
        score: a.score,
        totalQuestions: a.totalQuestions,
        percentage: a.percentage,
        completedAt: a.completedAt.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
}
