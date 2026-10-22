import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CircleAlert as AlertCircle, BookOpen, ChartBar as BarChart3, Hash, MessageSquare } from 'lucide-react';
import { generateQuiz } from '@/services/quizService';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/api';
import { Spinner } from '@/components/Spinner';

const TOPIC_SUGGESTIONS = ['JavaScript', 'Python', 'Data Structures', 'DBMS', 'Operating Systems'];

const difficulties = [
  { value: 'Easy', desc: 'Beginner-friendly basics' },
  { value: 'Medium', desc: 'Intermediate concepts' },
  { value: 'Hard', desc: 'Advanced problem-solving' },
];

const questionCounts = [5, 10, 15];

export function GenerateQuizPage() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (topic.trim().length < 2) {
      setError('Please enter a quiz topic.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await generateQuiz({
        topic: topic.trim(),
        difficulty,
        questionCount,
        additionalInstructions: additionalInstructions.trim() || undefined,
      });
      showToast('Quiz generated successfully!', 'success');
      navigate(`/quiz/${result.quiz._id}`, { replace: true });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Failed to generate quiz. The AI service may be busy — please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="text-violet-500" size={24} />
          Generate a Quiz
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure your quiz below and let AI create tailored multiple-choice questions.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-5 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic */}
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <BookOpen size={16} className="text-violet-400" />
              Topic
            </label>
            <input
              id="topic"
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none text-sm"
              placeholder="e.g. JavaScript, Python, DBMS..."
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {TOPIC_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTopic(s)}
                  className="text-xs px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <BarChart3 size={16} className="text-violet-400" />
              Difficulty
            </span>
            <div className="grid grid-cols-3 gap-2">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  className={`px-3 py-3 rounded-lg border text-center transition-all ${
                    difficulty === d.value
                      ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-100'
                      : 'border-gray-200 hover:border-violet-200'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-800">{d.value}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Question count */}
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Hash size={16} className="text-violet-400" />
              Number of Questions
            </span>
            <div className="grid grid-cols-3 gap-2">
              {questionCounts.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    questionCount === count
                      ? 'border-violet-500 bg-violet-50 text-violet-700 ring-2 ring-violet-100'
                      : 'border-gray-200 text-gray-600 hover:border-violet-200'
                  }`}
                >
                  {count} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Additional instructions */}
          <div>
            <label
              htmlFor="instructions"
              className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
            >
              <MessageSquare size={16} className="text-violet-400" />
              Additional Instructions <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="instructions"
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none text-sm resize-none"
              placeholder="e.g. Focus on closures and async/await..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Spinner className="text-white" size={18} />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Quiz
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
