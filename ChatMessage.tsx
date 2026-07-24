import React, { useState } from 'react';
import { 
  Bot, User, Volume2, VolumeX, CheckCircle, AlertTriangle, 
  Sparkles, ChevronDown, ChevronUp, Plus, Check, Lightbulb, Bookmark
} from 'lucide-react';
import { ChatMessage as ChatMessageType, VocabItem, AppSettings } from './types';
import { speakText, stopSpeech } from './speech';

interface ChatMessageProps {
  message: ChatMessageType;
  settings: AppSettings;
  onSaveVocab: (word: VocabItem) => void;
  savedVocabIds: string[];
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  settings,
  onSaveVocab,
  savedVocabIds,
}) => {
  const isDark = settings.streamlitTheme === 'dark';
  const isAssistant = message.role === 'assistant';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanderOpen, setIsExpanderOpen] = useState(true);

  const handleSpeak = () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(
        message.content,
        settings.speechRate,
        1.0,
        settings.voiceGender,
        () => setIsPlaying(false)
      );
    }
  };

  const grammar = message.grammarAnalysis;
  const vocabList = message.vocabExtracted;

  return (
    <div className={`py-4 px-4 sm:px-6 transition-colors duration-150 ${
      isAssistant 
        ? isDark ? 'bg-[#161b22]/70' : 'bg-slate-50/80'
        : 'bg-transparent'
    }`}>
      <div className="max-w-4xl mx-auto flex gap-3.5 sm:gap-4">
        {/* Streamlit Chat Message Avatar */}
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs font-semibold ${
          isAssistant
            ? 'bg-gradient-to-br from-[#ff4b4b] to-[#ff7676] text-white'
            : isDark ? 'bg-[#262730] text-slate-300' : 'bg-slate-200 text-slate-700'
        }`}>
          {isAssistant ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
        </div>

        {/* Message Content Area */}
        <div className="flex-1 space-y-3 min-w-0">
          {/* Header Role Label & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-[#ff4b4b]">
                st.chat_message("{isAssistant ? 'assistant' : 'user'}")
              </span>
              <span className="text-[11px] text-slate-400">
                {message.timestamp}
              </span>
            </div>

            {/* Audio Speech Button for AI */}
            {isAssistant && (
              <button
                onClick={handleSpeak}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                  isPlaying
                    ? 'bg-[#ff4b4b] text-white border-[#ff4b4b] animate-pulse'
                    : isDark
                      ? 'bg-[#0e1117] border-[#262730] text-slate-300 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                title="Listen to native pronunciation"
              >
                {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Stop' : 'Listen'}</span>
              </button>
            )}
          </div>

          {/* Main Message Text */}
          <div className={`text-sm sm:text-base leading-relaxed font-sans ${
            isDark ? 'text-slate-100' : 'text-slate-800'
          }`}>
            {message.content}
          </div>

          {/* INSTANT GRAMMAR ANALYSIS EXPANDER (st.expander style) */}
          {grammar && (
            <div className={`rounded-xl border transition-all overflow-hidden ${
              grammar.hasErrors
                ? isDark ? 'bg-[#0e1117] border-amber-500/40' : 'bg-amber-50/50 border-amber-200'
                : isDark ? 'bg-[#0e1117] border-emerald-500/40' : 'bg-emerald-50/50 border-emerald-200'
            }`}>
              {/* Expander Header */}
              <button
                onClick={() => setIsExpanderOpen(!isExpanderOpen)}
                className={`w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold ${
                  isDark ? 'bg-[#161b22]' : 'bg-white/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#ff4b4b] font-mono">st.expander</span>
                  <span className="text-slate-400">•</span>
                  {grammar.hasErrors ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Grammar Feedback ({grammar.corrections.length} suggestion{grammar.corrections.length > 1 ? 's' : ''})
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Perfect Grammar!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full font-mono font-bold ${
                    grammar.score >= 90
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : grammar.score >= 70
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}>
                    Score: {grammar.score}/100
                  </span>
                  {isExpanderOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expander Body Content */}
              {isExpanderOpen && (
                <div className="p-3.5 space-y-3 border-t border-inherit text-xs">
                  {/* Corrected vs Original Sentence */}
                  {grammar.hasErrors && grammar.correctedSentence && (
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[11px] font-semibold uppercase">Corrected Version</span>
                      <div className={`p-2.5 rounded-lg font-medium border ${
                        isDark ? 'bg-[#161b22] border-emerald-500/30 text-emerald-300' : 'bg-emerald-100/50 border-emerald-300 text-emerald-900'
                      }`}>
                        ✅ {grammar.correctedSentence}
                      </div>
                    </div>
                  )}

                  {/* Corrections List */}
                  {grammar.corrections && grammar.corrections.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-slate-400 text-[11px] font-semibold uppercase">Specific Rules & Fixes</span>
                      <div className="space-y-1.5">
                        {grammar.corrections.map((c, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-lg border space-y-1 ${
                              isDark ? 'bg-[#161b22] border-[#262730]' : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#ff4b4b]/20 text-[#ff7676]">
                                {c.ruleCategory || c.type}
                              </span>
                              <div className="flex items-center gap-1 text-[11px]">
                                <span className="line-through text-red-400 font-mono">{c.originalText}</span>
                                <span className="text-slate-400">→</span>
                                <span className="text-emerald-400 font-mono font-bold">{c.correctedText}</span>
                              </div>
                            </div>
                            <p className="text-slate-300 text-[11px] leading-relaxed">
                              💡 {c.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Better Native Phrasing */}
                  {grammar.betterPhrasing && (
                    <div className="space-y-1 pt-1">
                      <span className="text-slate-400 text-[11px] font-semibold uppercase flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        Native Phrasing Alternative
                      </span>
                      <p className={`p-2 rounded-lg italic ${
                        isDark ? 'bg-[#161b22] text-amber-200' : 'bg-amber-100/40 text-amber-900'
                      }`}>
                        "{grammar.betterPhrasing}"
                      </p>
                    </div>
                  )}

                  {/* Encouragement Line */}
                  {grammar.encouragement && (
                    <p className="text-slate-400 italic text-[11px]">
                      🌟 {grammar.encouragement}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VOCABULARY EXTRACTED PILLS */}
          {vocabList && vocabList.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-dashed border-slate-700/50">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-sky-400" />
                Key Vocabulary Highlighted
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {vocabList.map((item, idx) => {
                  const isSaved = savedVocabIds.includes(item.word.toLowerCase());
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-start justify-between gap-2 transition-all ${
                        isDark ? 'bg-[#0e1117] border-[#262730]' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-sky-400 font-mono">
                            {item.word}
                          </span>
                          {item.ipa && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.ipa}
                            </span>
                          )}
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                            {item.cefrLevel || 'B1'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-2">
                          {item.definition}
                        </p>
                      </div>

                      <button
                        onClick={() => onSaveVocab(item)}
                        disabled={isSaved}
                        className={`p-1.5 rounded-lg text-xs shrink-0 transition-all ${
                          isSaved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#ff4b4b] text-white hover:bg-red-600'
                        }`}
                        title={isSaved ? 'Word Saved' : 'Add to Vocabulary Bank'}
                      >
                        {isSaved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
