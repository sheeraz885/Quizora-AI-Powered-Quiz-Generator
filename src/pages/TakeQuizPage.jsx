import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CircleAlert as AlertCircle, Eye, Lock } from 'lucide-react';
import { fetchQuizDetail, submitQuiz } from '@/services/quizService';
import { Spinner } from '@/components/Spinner';
import { EmptyState } from '@/components/EmptyState';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/api';

export function TakeQuizPage() {
  const { quizId = '' } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchQuizDetail(quizId)
      .then(({ quiz }) => {
        if (!cancelled) setQuiz(quiz);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load quiz.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  const questions = quiz?.questions ?? [];
  const total = questions.length;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const currentQ = questions[currentIdx];

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner className="text-violet-500" size={28} />
        <p className="text-sm text-gray-400">Loading your quiz...</p>
      </div>
    );

  if (error || !quiz)
    return (
      <EmptyState
        title="Couldn't load this quiz"
        description={error || 'The quiz may not exist or you may not have access to it.'}
        action={
          <button
            onClick={() => navigate('/history')}
            className="text-sm text-violet-600 font-medium hover:underline"
          >
            Back to My Quizzes
          </button>
        }
      />
    );

  const selectAnswer = (questionId, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const goNext = () => setCurrentIdx((i) => Math.min(i + 1, total - 1));
  const goPrev = () => {
    if (showReview) {
      setShowReview(false);
      return;
    }
    setCurrentIdx((i) => Math.max(i - 1, 0));
  };

  const handleSubmit = async () => {
    if (answeredCount < total) {
      showToast('Please answer all questions before submitting.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitQuiz(quizId, answers);
      showToast('Quiz submitted!', 'success');
      navigate(`/results/${result.attemptId}`, { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Submission failed. Please try again.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((currentIdx + 1) / total) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-gray-800 truncate">{quiz.topic}</h1>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-50 text-violet-600">
            {quiz.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-violet-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${showReview ? 100 : progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 font-medium tabular-nums">
            {showReview ? total : currentIdx + 1}/{total}
          </span>
        </div>
      </div>

      {showReview ? (
        <ReviewView
          questions={questions}
          answers={answers}
          onSelect={(qid, idx) => selectAnswer(qid, idx)}
        />
      ) : currentQ ? (
        <QuestionView
          question={currentQ}
          index={currentIdx}
          total={total}
          selected={answers[currentQ.questionId]}
          onSelect={(idx) => selectAnswer(currentQ.questionId, idx)}
        />
      ) : null}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0 && !showReview}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          <ArrowLeft size={16} />
          {showReview ? 'Back to Questions' : 'Previous'}
        </button>

        {!showReview && currentIdx < total - 1 ? (
          <button
            onClick={goNext}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            Next <ArrowRight size={16} />
          </button>
        ) : !showReview && currentIdx === total - 1 ? (
          <button
            onClick={() => setShowReview(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            <Eye size={16} />
            Review Answers
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || answeredCount < total}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? <Spinner className="text-white" size={16} /> : <Check size={16} />}
            Submit Quiz
          </button>
        )}
      </div>

      {showReview && (
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 bg-violet-50/60 rounded-lg px-3 py-2.5">
          <Lock size={14} className="text-violet-400" />
          <span>
            {answeredCount} of {total} answered. Correct answers are revealed after submission and scored on the
            server.
          </span>
        </div>
      )}

      {showReview && answeredCount < total && (
        <div className="mt-3 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{total - answeredCount} question(s) still need an answer before you can submit.</span>
        </div>
      )}
    </div>
  );
}

function QuestionView({ question, index, total, selected, onSelect }) {
  return (
    <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6">
      <p className="text-xs font-medium text-violet-500 mb-2">
        Question {index + 1} of {total}
      </p>
      <h2 className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed mb-5">
        {question.question}
      </h2>
      <div className="space-y-2.5">
        {question.options.map((option, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                isSelected
                  ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-100'
                  : 'border-gray-200 hover:border-violet-200 hover:bg-violet-50/30'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0 ${
                  isSelected ? 'border-violet-500 bg-violet-500 text-white' : 'border-gray-300 text-gray-400'
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-gray-700">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReviewView({ questions, answers, onSelect }) {
  return (
    <div className="space-y-3">
      {questions.map((q, i) => {
        const selected = answers[q.questionId];
        return (
          <div key={q.questionId} className="bg-white rounded-xl border border-violet-100 shadow-sm p-4">
            <div className="flex items-start gap-2 mb-3">
              <span className="text-xs font-semibold text-violet-500 mt-0.5">Q{i + 1}</span>
              <p className="text-sm font-medium text-gray-800 flex-1">{q.question}</p>
              {selected === undefined ? (
                <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Unanswered</span>
              ) : (
                <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Answered</span>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {q.options.map((opt, idx) => {
                const isSelected = selected === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => onSelect(q.questionId, idx)}
                    className={`text-left text-xs px-3 py-2 rounded-lg border flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-200 text-gray-600 hover:border-violet-200'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                        isSelected ? 'border-violet-500 bg-violet-500 text-white' : 'border-gray-300 text-gray-400'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
