import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    selectedAnswers: {
      type: Map,
      of: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

quizAttemptSchema.methods.toSummaryJSON = function () {
  return {
    _id: this._id.toString(),
    quizId: this.quizId.toString(),
    topic: this.topic,
    difficulty: this.difficulty,
    score: this.score,
    totalQuestions: this.totalQuestions,
    percentage: this.percentage,
    completedAt: this.completedAt.toISOString(),
  };
};

export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
