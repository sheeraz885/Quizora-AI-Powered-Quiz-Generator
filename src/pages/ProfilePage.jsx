import { User as UserIcon, Mail, Calendar, LogOut, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  const fields = [
    { label: 'Name', value: user.name, icon: UserIcon },
    { label: 'Email', value: user.email, icon: Mail },
    { label: 'Member since', value: new Date(user.createdAt).toLocaleDateString(), icon: Calendar },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your account details.</p>
      </div>

      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <span className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-lg font-semibold text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <dl className="space-y-4">
          {fields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.label} className="flex items-center gap-3 pb-4 border-b border-gray-50 last:border-0">
                <span className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </span>
                <div>
                  <dt className="text-xs text-gray-400">{field.label}</dt>
                  <dd className="text-sm font-medium text-gray-800">{field.value}</dd>
                </div>
              </div>
            );
          })}
        </dl>

        <button
          onClick={handleLogout}
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
          <Brain size={18} className="text-violet-500" />
          About QuizAI
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          QuizAI generates personalized multiple-choice quizzes using Google's Gemini AI. Pick a topic, difficulty,
          and question count, then take the quiz and get instant scoring with detailed explanations.
        </p>
      </div>
    </div>
  );
}
