import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Trash2, ArrowRight, Sparkles, CircleAlert as AlertCircle } from 'lucide-react';
import { deleteAttempt, fetchQuizHistory } from '@/services/quizService';
import { Spinner } from '@/components/Spinner';
import { EmptyState } from '@/components/EmptyState';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/api';

export function HistoryPage() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [attempts, setAttempts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadHistory = () => {
    setLoading(true);
    fetchQuizHistory()
      .then(({ attempts }) => setAttempts(attempts))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load history.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadHistory, []);

  const handleDelete = async (attemptId) => {
    if (!confirm('Delete this quiz record? This cannot be undone.')) return;
    setDeletingId(attemptId);
    try {
      await deleteAttempt(attemptId);
      setAttempts((prev) => prev?.filter((a) => a._id !== attemptId) ?? null);
      showToast('Quiz record deleted.', 'success');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to delete.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="text-violet-500" />
      </div>
    );

  if (error)
    return (
      <EmptyState
        title="Couldn't load your quizzes"
        description={error}
        action={
          <button onClick={loadHistory} className="text-sm text-violet-600 font-medium hover:underline">
            Try again
          </button>
        }
      />
    );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Quizzes</h1>
          <p className="text-sm text-gray-500 mt-1">Your quiz history and results.</p>
        </div>
        <Link
          to="/generate"
          className="inline-flex items-center gap-2 bg-violet-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-violet-700 transition-colors"
        >
          <Sparkles size={16} />
          New Quiz
        </Link>
      </div>

      {!attempts || attempts.length === 0 ? (
        <div className="bg-white rounded-xl border border-violet-100 shadow-sm">
          <EmptyState
            title="No quizzes yet"
            description="Generate your first AI quiz and your attempts will appear here."
            action={
              <Link
                to="/generate"
                className="inline-flex items-center gap-2 bg-violet-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-violet-700"
              >
                <Sparkles size={16} />
                Generate Quiz
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {attempts.map((attempt) => (
            <div
              key={attempt._id}
              className="group bg-white rounded-xl border border-violet-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                    <BookOpen size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{attempt.topic}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {attempt.difficulty} · {new Date(attempt.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold px-2.5 py-1 rounded-md shrink-0 ${
                    attempt.percentage >= 70
                      ? 'bg-emerald-50 text-emerald-600'
                      : attempt.percentage >= 40
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {attempt.percentage}%
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Scored {attempt.score}/{attempt.totalQuestions}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(attempt._id)}
                    disabled={deletingId === attempt._id}
                    className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    aria-label="Delete quiz record"
                  >
                    {deletingId === attempt._id ? <Spinner size={15} /> : <Trash2 size={16} />}
                  </button>
                  <button
                    onClick={() => navigate(`/results/${attempt._id}`)}
                    className="flex items-center gap-1 text-sm font-medium text-violet-600 hover:underline"
                  >
                    View <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {attempts && attempts.length > 0 && (
        <div className="flex items-start gap-2 text-xs text-gray-400 bg-violet-50/50 rounded-lg px-3 py-2.5">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>You can only view and delete your own quiz records. Other users' records are private.</span>
        </div>
      )}
    </div>
  );
}
