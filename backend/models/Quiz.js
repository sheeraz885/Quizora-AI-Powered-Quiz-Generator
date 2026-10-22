import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length === 4, 'Each question must have exactly 4 options'],
    },
    correctIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    explanation: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    questionCount: {
      type: Number,
      required: true,
      min: 1,
      max: 15,
    },
    additionalInstructions: {
      type: String,
      default: '',
    },
    questions: {
      type: [questionSchema],
      required: true,
      validate: [(arr) => arr.length > 0, 'A quiz must have at least one question'],
    },
  },
  { timestamps: true }
);

export const Quiz = mongoose.model('Quiz', quizSchema);
