import React from 'react';
import { Sparkles, Bot, BookOpen, CheckSquare, BarChart2, MessageSquare, Sun, Moon, Sliders } from 'lucide-react';
import { AppSettings } from './types';

interface HeaderProps {
  settings: AppSettings;
  activeTab: 'chat' | 'vocab' | 'grammar' | 'stats';
  setActiveTab: (tab: 'chat' | 'vocab' | 'grammar' | 'stats') => void;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeTab,
  setActiveTab,
  onToggleSidebar,
  onToggleTheme,
}) => {
  const isDark = settings.streamlitTheme === 'dark';

  return (
    <header className={`sticky top-0 z-30 transition-colors duration-200 border-b ${
      isDark ? 'bg-[#0e1117] border-[#262730] text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* Streamlit Signature Red Top Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#ff4b4b] via-[#ff8f8f] to-[#ff4b4b]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-lg transition-colors border ${
              isDark 
                ? 'bg-[#161b22] border-[#262730] hover:bg-[#262730] text-slate-200' 
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
            title="Toggle Streamlit Sidebar"
          >
            <Sliders className="w-4 h-4 text-[#ff4b4b]" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff4b4b] to-[#ff7676] flex items-center justify-center text-white shadow-md shadow-red-500/20 font-bold text-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight font-sans">
                  streamlit <span className="text-[#ff4b4b]">AI Tutor</span>
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isDark ? 'bg-[#ff4b4b]/20 text-[#ff7676]' : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {settings.proficiencyLevel.split(' ')[0]}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Conversational Practice • Instant Grammar • Vocab Builder
              </p>
            </div>
          </div>
        </div>

        {/* Center Streamlit-Style Nav Tabs */}
        <nav className={`hidden md:flex items-center p-1 rounded-xl border ${
          isDark ? 'bg-[#161b22] border-[#262730]' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-[#ff4b4b] text-white shadow-sm font-semibold'
                : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Practice</span>
          </button>

          <button
            onClick={() => setActiveTab('vocab')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'vocab'
                ? 'bg-[#ff4b4b] text-white shadow-sm font-semibold'
                : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Vocab Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('grammar')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'grammar'
                ? 'bg-[#ff4b4b] text-white shadow-sm font-semibold'
                : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Grammar Check</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'stats'
                ? 'bg-[#ff4b4b] text-white shadow-sm font-semibold'
                : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Progress</span>
          </button>
        </nav>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {/* Streamlit Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl transition-all border ${
              isDark
                ? 'bg-[#161b22] border-[#262730] text-amber-400 hover:bg-[#262730]'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle Streamlit Dark/Light Mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Tabs Bar */}
      <div className={`md:hidden flex items-center justify-around px-2 py-1.5 border-t text-xs ${
        isDark ? 'bg-[#0e1117] border-[#262730]' : 'bg-slate-50 border-slate-200'
      }`}>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg ${
            activeTab === 'chat' ? 'text-[#ff4b4b] font-bold' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('vocab')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg ${
            activeTab === 'vocab' ? 'text-[#ff4b4b] font-bold' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Vocab</span>
        </button>
        <button
          onClick={() => setActiveTab('grammar')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg ${
            activeTab === 'grammar' ? 'text-[#ff4b4b] font-bold' : 'text-slate-400'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Grammar</span>
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg ${
            activeTab === 'stats' ? 'text-[#ff4b4b] font-bold' : 'text-slate-400'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Stats</span>
        </button>
      </div>
    </header>
  );
};
