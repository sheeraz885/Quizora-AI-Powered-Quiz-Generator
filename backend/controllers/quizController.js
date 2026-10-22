
import mongoose from 'mongoose';
import { Quiz } from '../models/Quiz.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { generateQuizWithGemini } from '../services/geminiService.js';

const ALLOWED_COUNTS = [5, 10, 15];
const ALLOWED_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export async function generateQuiz(req, res, next) {
  try {
    const {
      topic,
      difficulty,
      questionCount,
      additionalInstructions,
    } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length < 2) {
      return res.status(400).json({
        message: 'Topic must be at least 2 characters.',
      });
    }

    if (!ALLOWED_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({
        message: 'Difficulty must be Easy, Medium, or Hard.',
      });
    }

    const count = Number(questionCount);

    if (!ALLOWED_COUNTS.includes(count)) {
      return res.status(400).json({
        message: 'Question count must be 5, 10, or 15.',
      });
    }

    if (
      additionalInstructions &&
      (typeof additionalInstructions !== 'string' ||
        additionalInstructions.length > 500)
    ) {
      return res.status(400).json({
        message: 'Additional instructions must be under 500 characters.',
      });
    }

    const questions = await generateQuizWithGemini({
      topic: topic.trim(),
      difficulty,
      questionCount: count,
      additionalInstructions,
    });

    const quiz = await Quiz.create({
      userId: req.user._id,
      topic: topic.trim(),
      difficulty,
      questionCount: count,
      additionalInstructions: additionalInstructions?.trim() || '',
      questions,
    });

    // Do not expose correct answers before submission.
    const safeQuestions = questions.map((q) => ({
      questionId: q.questionId,
      question: q.question,
      options: q.options,
    }));

    res.status(201).json({
      quiz: {
        _id: quiz._id.toString(),
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        questionCount: quiz.questionCount,
        createdAt: quiz.createdAt.toISOString(),
      },
      questions: safeQuestions,
    });
  } catch (err) {
    next(err);
  }
}

export async function getQuizDetail(req, res, next) {
  try {
    const { quizId } = req.params;

    if (!mongoose.isValidObjectId(quizId)) {
      return res.status(400).json({
        message: 'Invalid quiz ID.',
      });
    }

    const quiz = await Quiz.findOne({
      _id: quizId,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found or you do not have access to it.',
      });
    }

    res.json({
      quiz: {
        _id: quiz._id.toString(),
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        questionCount: quiz.questionCount,
        createdAt: quiz.createdAt.toISOString(),
        questions: quiz.questions.map((q) => ({
          questionId: q.questionId,
          question: q.question,
          options: q.options,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function submitQuiz(req, res, next) {
  try {
    const { quizId } = req.params;

    if (!mongoose.isValidObjectId(quizId)) {
      return res.status(400).json({
        message: 'Invalid quiz ID.',
      });
    }

    const quiz = await Quiz.findOne({
      _id: quizId,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found or you do not have access to it.',
      });
    }

    const { selectedAnswers } = req.body;

    if (
      !selectedAnswers ||
      typeof selectedAnswers !== 'object' ||
      Array.isArray(selectedAnswers)
    ) {
      return res.status(400).json({
        message: 'Selected answers are required.',
      });
    }

    const existing = await QuizAttempt.findOne({
      quizId: quiz._id,
      userId: req.user._id,
    });

    if (existing) {
      return res.status(409).json({
        message: 'You have already submitted this quiz.',
        attemptId: existing._id.toString(),
      });
    }

    // Validate answers and calculate the score on the server.
    let score = 0;
    const normalizedAnswers = {};

    for (const q of quiz.questions) {
      const selected = selectedAnswers[q.questionId];

      const selectedIndex =
        Number.isInteger(selected) &&
        selected >= 0 &&
        selected < q.options.length
          ? selected
          : null;

      if (selectedIndex !== null) {
        normalizedAnswers[q.questionId] = selectedIndex;
      }

      if (selectedIndex === q.correctIndex) {
        score += 1;
      }
    }

    const totalQuestions = quiz.questions.length;

    if (totalQuestions === 0) {
      return res.status(400).json({
        message: 'This quiz has no questions.',
      });
    }

    const percentage = Math.round(
      (score / totalQuestions) * 100
    );

    const attempt = await QuizAttempt.create({
      userId: req.user._id,
      quizId: quiz._id,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      selectedAnswers: normalizedAnswers,
      score,
      totalQuestions,
      percentage,
    });

    res.status(201).json({
      attemptId: attempt._id.toString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req, res, next) {
  try {
    const attempts = await QuizAttempt.find({
      userId: req.user._id,
    })
      .sort({ completedAt: -1 })
      .lean();

    res.json({
      attempts: attempts.map((a) => ({
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

export async function getAttemptReview(req, res, next) {
  try {
    const { attemptId } = req.params;

    if (!mongoose.isValidObjectId(attemptId)) {
      return res.status(400).json({
        message: 'Invalid attempt ID.',
      });
    }

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId: req.user._id,
    }).lean();

    if (!attempt) {
      return res.status(404).json({
        message: 'Attempt not found or you do not have access to it.',
      });
    }

    const quiz = await Quiz.findOne({
      _id: attempt.quizId,
      userId: req.user._id,
    }).lean();

    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found.',
      });
    }

    // With .lean(), selectedAnswers is a plain object, not a Map.
    const selectedAnswers = attempt.selectedAnswers || {};

    const review = quiz.questions.map((q) => {
      const selected = selectedAnswers instanceof Map
        ? selectedAnswers.get(q.questionId)
        : selectedAnswers[q.questionId];

      const selectedIndex =
        Number.isInteger(selected) ? selected : null;

      return {
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        selectedIndex,
        explanation: q.explanation,
        isCorrect: selectedIndex === q.correctIndex,
      };
    });

    res.json({
      _id: attempt._id.toString(),
      quizId: attempt.quizId.toString(),
      topic: attempt.topic,
      difficulty: attempt.difficulty,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      completedAt: attempt.completedAt.toISOString(),
      review,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAttempt(req, res, next) {
  try {
    const { attemptId } = req.params;

    if (!mongoose.isValidObjectId(attemptId)) {
      return res.status(400).json({
        message: 'Invalid attempt ID.',
      });
    }

    const attempt = await QuizAttempt.findOneAndDelete({
      _id: attemptId,
      userId: req.user._id,
    });

    if (!attempt) {
      return res.status(404).json({
        message: 'Attempt not found or you do not have access to it.',
      });
    }

    res.json({
      message: 'Quiz record deleted.',
    });
  } catch (err) {
    next(err);
  }
}
