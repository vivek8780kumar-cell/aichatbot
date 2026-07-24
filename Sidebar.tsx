import React from 'react';
import { 
  X, RotateCcw, Volume2, Sparkles, CheckCircle, Brain, 
  HelpCircle, MessageCircle, BarChart3, Settings2 
} from 'lucide-react';
import { AppSettings, ProficiencyLevel, PersonaType, UserStats } from './types';
import { TOPICS } from './initialData';

interface SidebarProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  stats: UserStats;
  onResetSession: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  settings,
  setSettings,
  stats,
  onResetSession,
  isOpen,
  onClose,
}) => {
  const isDark = settings.streamlitTheme === 'dark';

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const avgGrammarScore = stats.grammarScores.length > 0
    ? Math.round(stats.grammarScores.reduce((a, b) => a + b, 0) / stats.grammarScores.length)
    : 100;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Streamlit Sidebar Panel */}
      <aside className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-80 transition-transform duration-300 ease-in-out border-r flex flex-col h-full overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${
        isDark ? 'bg-[#161b22] border-[#262730] text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}>
        {/* Streamlit Sidebar Title Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-[#262730] bg-[#0e1117]/50' : 'border-slate-200 bg-slate-100/50'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-[#ff4b4b] font-mono text-xs font-bold uppercase tracking-wider">
              st.sidebar
            </span>
            <span className="text-xs text-slate-400">• Controls</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6 flex-1">
          {/* Streamlit Metrics Widget Block */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-[#ff4b4b]" />
              <span>st.metric Summary</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className={`p-2.5 rounded-xl border ${
                isDark ? 'bg-[#0e1117] border-[#262730]' : 'bg-white border-slate-200'
              }`}>
                <span className="text-[10px] text-slate-400 block font-sans">Turns</span>
                <span className="text-base font-bold text-[#ff4b4b] font-mono">
                  {stats.messagesSent}
                </span>
                <span className="text-[9px] text-emerald-500 block font-medium">↑ active</span>
              </div>

              <div className={`p-2.5 rounded-xl border ${
                isDark ? 'bg-[#0e1117] border-[#262730]' : 'bg-white border-slate-200'
              }`}>
                <span className="text-[10px] text-slate-400 block font-sans">Accuracy</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {avgGrammarScore}%
                </span>
                <span className="text-[9px] text-slate-400 block font-medium">avg grammar</span>
              </div>

              <div className={`p-2.5 rounded-xl border ${
                isDark ? 'bg-[#0e1117] border-[#262730]' : 'bg-white border-slate-200'
              }`}>
                <span className="text-[10px] text-slate-400 block font-sans">Vocab</span>
                <span className="text-base font-bold text-sky-400 font-mono">
                  {stats.wordsLearned}
                </span>
                <span className="text-[9px] text-sky-500 block font-medium">words</span>
              </div>
            </div>
          </div>

          {/* 1. Proficiency Level (st.radio / st.selectbox) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>English Level (CEFR)</span>
              <span className="text-[10px] text-[#ff4b4b] font-mono">st.selectbox</span>
            </label>
            <div className="space-y-1">
              {(['Beginner (A1-A2)', 'Intermediate (B1-B2)', 'Advanced (C1-C2)'] as ProficiencyLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => updateSetting('proficiencyLevel', level)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between border ${
                    settings.proficiencyLevel === level
                      ? 'bg-[#ff4b4b]/15 border-[#ff4b4b] text-[#ff4b4b] font-semibold'
                      : isDark 
                        ? 'bg-[#0e1117] border-[#262730] text-slate-300 hover:border-slate-700' 
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>{level}</span>
                  {settings.proficiencyLevel === level && (
                    <CheckCircle className="w-3.5 h-3.5 text-[#ff4b4b]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Topic Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Practice Topic</span>
              <span className="text-[10px] text-[#ff4b4b] font-mono">st.selectbox</span>
            </label>
            <select
              value={settings.topic}
              onChange={(e) => updateSetting('topic', e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-1 focus:ring-[#ff4b4b] ${
                isDark ? 'bg-[#0e1117] border-[#262730] text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {TOPICS.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 italic">
              {TOPICS.find((t) => t.name === settings.topic)?.description}
            </p>
          </div>

          {/* 3. Tutor Persona */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>AI Tutor Persona</span>
              <span className="text-[10px] text-[#ff4b4b] font-mono">st.radio</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['Friendly Tutor', 'Strict Teacher', 'Casual Buddy', 'Business Coach'] as PersonaType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => updateSetting('persona', p)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-center transition-all border ${
                    settings.persona === p
                      ? 'bg-[#ff4b4b] text-white border-[#ff4b4b] font-semibold'
                      : isDark
                        ? 'bg-[#0e1117] border-[#262730] text-slate-300 hover:border-slate-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Streamlit Checkbox Toggles */}
          <div className="space-y-3 pt-2 border-t border-[#262730]">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Feature Toggles (st.checkbox)
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-medium text-slate-300">Instant Grammar Check</span>
              <input
                type="checkbox"
                checked={settings.enableGrammarCheck}
                onChange={(e) => updateSetting('enableGrammarCheck', e.target.checked)}
                className="w-4 h-4 accent-[#ff4b4b] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-medium text-slate-300">Auto Vocabulary Extractor</span>
              <input
                type="checkbox"
                checked={settings.enableVocabExtraction}
                onChange={(e) => updateSetting('enableVocabExtraction', e.target.checked)}
                className="w-4 h-4 accent-[#ff4b4b] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-medium text-slate-300">Auto-Play Audio Response</span>
              <input
                type="checkbox"
                checked={settings.autoPlayAudio}
                onChange={(e) => updateSetting('autoPlayAudio', e.target.checked)}
                className="w-4 h-4 accent-[#ff4b4b] rounded cursor-pointer"
              />
            </label>
          </div>

          {/* 5. Speech Pronunciation Rate (st.slider) */}
          <div className="space-y-2 pt-2 border-t border-[#262730]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400 uppercase tracking-wider">Pronunciation Speed</span>
              <span className="font-mono text-[#ff4b4b] font-bold">{settings.speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.25"
              value={settings.speechRate}
              onChange={(e) => updateSetting('speechRate', parseFloat(e.target.value))}
              className="w-4/5 accent-[#ff4b4b] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.75x (Slow)</span>
              <span>1.0x (Normal)</span>
              <span>1.25x (Fast)</span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Reset Button */}
        <div className={`p-4 border-t ${isDark ? 'border-[#262730] bg-[#0e1117]' : 'border-slate-200 bg-slate-100'}`}>
          <button
            onClick={onResetSession}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/30 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Chat Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
