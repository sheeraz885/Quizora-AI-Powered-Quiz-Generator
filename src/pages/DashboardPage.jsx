import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Award, Target, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { fetchDashboardStats } from '@/services/quizService';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/Spinner';
import { EmptyState } from '@/components/EmptyState';
import { ApiError } from '@/services/api';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchDashboardStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load dashboard.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="text-violet-500" />
      </div>
    );
  if (error || !stats)
    return (
      <EmptyState title="Couldn't load your dashboard" description={error || 'Please try again later.'} />
    );

  const statCards = [
    {
      label: 'Quizzes Attempted',
      value: stats.totalAttempted,
      icon: Target,
      color: 'bg-violet-50 text-violet-600',
    },
    {
      label: 'Average Score',
      value: `${stats.averageScore.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Best Score',
      value: `${stats.bestScore}%`,
      icon: Award,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="relative">
          <p className="text-violet-100 text-sm">Welcome back,</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">{user?.name}</h1>
          <p className="text-violet-100 mt-2 max-w-lg text-sm">
            Generate a new AI-powered quiz, review your history, and track your progress.
          </p>
          <Link
            to="/generate"
            className="inline-flex items-center gap-2 mt-5 bg-white text-violet-700 font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-violet-50 transition-colors"
          >
            <Sparkles size={16} />
            Generate New Quiz
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-violet-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent attempts */}
      <div className="bg-white rounded-xl border border-violet-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-violet-50">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Clock size={18} className="text-violet-500" />
            Recent Quizzes
          </h2>
          <Link to="/history" className="text-sm text-violet-600 hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {stats.recentAttempts.length === 0 ? (
          <EmptyState
            title="No quizzes yet"
            description="Generate your first quiz to see your progress here."
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
        ) : (
          <ul className="divide-y divide-violet-50">
            {stats.recentAttempts.slice(0, 5).map((attempt) => (
              <li key={attempt._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-violet-50/30">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                    <BookOpen size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{attempt.topic}</p>
                    <p className="text-xs text-gray-400">
                      {attempt.difficulty} · {new Date(attempt.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold px-2.5 py-1 rounded-md ${
                    attempt.percentage >= 70
                      ? 'bg-emerald-50 text-emerald-600'
                      : attempt.percentage >= 40
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {attempt.percentage}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
