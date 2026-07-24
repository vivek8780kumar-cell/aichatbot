import React from 'react';
import { BarChart2, Award, Zap, TrendingUp, CheckCircle, BookOpen, AlertCircle } from 'lucide-react';
import { UserStats, AppSettings } from './types';

interface ProgressDashboardProps {
  stats: UserStats;
  settings: AppSettings;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ stats, settings }) => {
  const isDark = settings.streamlitTheme === 'dark';

  const avgGrammarScore = stats.grammarScores.length > 0
    ? Math.round(stats.grammarScores.reduce((a, b) => a + b, 0) / stats.grammarScores.length)
    : 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <div className={`p-4 rounded-2xl border ${
        isDark ? 'bg-[#161b22] border-[#262730]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-[#ff4b4b] font-mono text-xs font-bold uppercase">st.metric & st.bar_chart</span>
          <span className="text-slate-500">•</span>
          <h2 className="text-lg font-bold">English Learning Analytics & Progress</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Track your conversational practice metrics, grammar accuracy improvements, and vocabulary mastery.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`p-4 rounded-2xl border space-y-2 ${
          isDark ? 'bg-[#161b22] border-[#262730]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase">Practice Turns</span>
            <TrendingUp className="w-4 h-4 text-[#ff4b4b]" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#ff4b4b]">
            {stats.messagesSent}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">↑ Active Session</span>
        </div>

        <div className={`p-4 rounded-2xl border space-y-2 ${
          isDark ? 'bg-[#161b22] border-[#262730]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase">Grammar Score</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            {avgGrammarScore}%
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Average Accuracy</span>
        </div>

        <div className={`p-4 rounded-2xl border space-y-2 ${
          isDark ? 'bg-[#161b22] border-[#262730]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase">Vocab Saved</span>
            <BookOpen className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-sky-400">
            {stats.wordsLearned}
          </div>
          <span className="text-[11px] text-sky-400 font-medium">Words in Bank</span>
        </div>

        <div className={`p-4 rounded-2xl border space-y-2 ${
          isDark ? 'bg-[#161b22] border-[#262730]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase">Day Streak</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">
            {stats.streakDays} Days
          </div>
          <span className="text-[11px] text-amber-400 font-medium">🔥 Streak Active</span>
        </div>
      </div>

      {/* Category Error Distribution (st.bar_chart style) */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isDark ? 'bg-[#161b22] border-[#262730]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#ff4b4b]" />
            <span>Grammar Rule Improvement Areas</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">st.bar_chart</span>
        </div>

        <div className="space-y-3">
          {Object.entries(stats.categoryErrors).map(([category, count]) => {
            const counts = Object.values(stats.categoryErrors) as number[];
            const maxVal = Math.max(...counts, 10);
            const numCount = Number(count);
            const percentage = Math.min(100, Math.round((numCount / maxVal) * 100));

            return (
              <div key={category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-300">{category}</span>
                  <span className="font-mono text-slate-400">{count} corrections</span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#ff4b4b] to-amber-500 h-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Tutor Recommendation Card */}
      <div className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
        isDark ? 'bg-[#161b22] border-[#262730]' : 'bg-white border-slate-200'
      }`}>
        <Award className="w-6 h-6 text-[#ff4b4b] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-sm text-slate-100">Personalized Learning Insight</h4>
          <p className="text-slate-300 leading-relaxed">
            You're doing great! Your prepositions and verb tenses are improving steadily. For your next turn, try using more complex connector words like <span className="text-sky-400 font-mono font-bold">"furthermore"</span>, <span className="text-sky-400 font-mono font-bold">"nevertheless"</span>, or <span className="text-sky-400 font-mono font-bold">"consequently"</span> to level up your CEFR fluency!
          </p>
        </div>
      </div>
    </div>
  );
};
