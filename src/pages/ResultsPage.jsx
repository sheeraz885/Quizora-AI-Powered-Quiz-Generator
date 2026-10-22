import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CircleCheck as CheckCircle2, Circle as XCircle, Sparkles, RefreshCw, Chrome as Home, Award, TrendingUp, Target } from 'lucide-react';
import { fetchAttemptReview } from '@/services/quizService';
import { Spinner } from '@/components/Spinner';
import { EmptyState } from '@/components/EmptyState';
import { ApiError } from '@/services/api';

export function ResultsPage() {
  const { attemptId = '' } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAttemptReview(attemptId)
      .then((data) => {
        if (!cancelled) setReview(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load results.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner className="text-violet-500" size={28} />
        <p className="text-sm text-gray-400">Calculating your results...</p>
      </div>
    );

  if (error || !review)
    return (
      <EmptyState
        title="Couldn't load results"
        description={error || 'This attempt may not exist or belong to you.'}
        action={
          <Link to="/history" className="text-sm text-violet-600 font-medium hover:underline">
            Back to My Quizzes
          </Link>
        }
      />
    );

  const { score, totalQuestions, percentage, review: items, topic, difficulty } = review;
  const incorrect = totalQuestions - score;
  const passed = percentage >= 70;

  const summaryCards = [
    { label: 'Total Questions', value: totalQuestions, icon: Target, color: 'bg-violet-50 text-violet-600' },
    { label: 'Correct', value: score, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Incorrect', value: incorrect, icon: XCircle, color: 'bg-red-50 text-red-600' },
    { label: 'Percentage', value: `${percentage}%`, icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Score hero */}
      <div
        className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white ${
          passed
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
            : 'bg-gradient-to-br from-violet-600 to-purple-700'
        }`}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-12 -mt-12" />
        <div className="relative flex items-center gap-4">
          <span className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Award size={32} />
          </span>
          <div>
            <p className="text-white/80 text-sm">Your Score</p>
            <p className="text-3xl font-bold">
              {score}/{totalQuestions} · {percentage}%
            </p>
            <p className="text-white/80 text-sm mt-0.5">{topic} · {difficulty}</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-violet-100 p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${card.color}`}>
                <Icon size={18} />
              </div>
              <p className="text-xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate('/generate')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          <Sparkles size={16} />
          Generate Another Quiz
        </button>
        <button
          onClick={() => navigate(`/quiz/${review.quizId}`)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-violet-200 text-violet-700 text-sm font-medium hover:bg-violet-50 transition-colors"
        >
          <RefreshCw size={16} />
          Retry This Quiz
        </button>
        <Link
          to="/dashboard"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <Home size={16} />
          Dashboard
        </Link>
      </div>

      {/* Question-by-question review */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">Question Review</h2>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className={`bg-white rounded-xl border p-5 shadow-sm ${
                item.isCorrect ? 'border-emerald-100' : 'border-red-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    item.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                  }`}
                >
                  {item.isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {i + 1}. {item.question}
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {item.options.map((opt, idx) => {
                      const isCorrect = idx === item.correctIndex;
                      const isChosen = idx === item.selectedIndex;
                      return (
                        <div
                          key={idx}
                          className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${
                            isCorrect
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : isChosen
                              ? 'bg-red-50 text-red-700 border border-red-100'
                              : 'bg-gray-50 text-gray-500 border border-gray-100'
                          }`}
                        >
                          <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span>
                          <span className="flex-1">{opt}</span>
                          {isCorrect && <CheckCircle2 size={14} className="text-emerald-500" />}
                          {isChosen && !isCorrect && <XCircle size={14} className="text-red-500" />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 bg-violet-50/60 rounded-lg px-3 py-2.5">
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold text-violet-600">Explanation: </span>
                      {item.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
