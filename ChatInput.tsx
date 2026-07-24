import React, { useState, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, CornerDownLeft } from 'lucide-react';
import { AppSettings } from './types';
import { createSpeechRecognition } from './speech';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  settings: AppSettings;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  settings,
}) => {
  const isDark = settings.streamlitTheme === 'dark';
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const rec = createSpeechRecognition(
      (transcript) => {
        setText((prev) => prev ? `${prev} ${transcript}` : transcript);
      },
      (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
    setRecognition(rec);
  }, []);

  const toggleMic = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. Try Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim());
    setText('');
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const quickPrompts = [
    "Ask me a question about my weekend!",
    "Can you correct my grammar in a sample sentence?",
    "Let's practice ordering food at a restaurant.",
    "Explain the difference between 'make' and 'do'."
  ];

  return (
    <div className={`p-3 sm:p-4 border-t sticky bottom-0 z-20 ${
      isDark ? 'bg-[#0e1117] border-[#262730]' : 'bg-white border-slate-200'
    }`}>
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[#ff4b4b] font-mono text-[10px] uppercase font-bold shrink-0">
            st.chat_input
          </span>
          <span className="text-slate-500 shrink-0">•</span>
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(p)}
              disabled={isLoading}
              className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-all border ${
                isDark
                  ? 'bg-[#161b22] border-[#262730] text-slate-300 hover:border-slate-600 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Speech-to-Text Microphone Button */}
          <button
            type="button"
            onClick={toggleMic}
            className={`p-3 rounded-2xl transition-all border ${
              isListening
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : isDark
                  ? 'bg-[#161b22] border-[#262730] text-slate-300 hover:text-white hover:bg-[#262730]'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={isListening ? 'Listening... Click to stop' : 'Click to speak (Voice Input)'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-[#ff4b4b]" />}
          </button>

          {/* Text Input Container */}
          <div className={`flex-1 flex items-center px-4 py-2.5 rounded-2xl border transition-all ${
            isDark
              ? 'bg-[#161b22] border-[#262730] focus-within:border-[#ff4b4b] focus-within:ring-1 focus-within:ring-[#ff4b4b]'
              : 'bg-slate-50 border-slate-200 focus-within:border-[#ff4b4b] focus-within:ring-1 focus-within:ring-[#ff4b4b]'
          }`}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isListening ? "Listening... speak now..." : "Type your message in English..."}
              disabled={isLoading}
              className={`w-full bg-transparent border-none text-sm focus:outline-none ${
                isDark ? 'text-slate-100 placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className={`p-3 rounded-2xl transition-all flex items-center justify-center ${
              !text.trim() || isLoading
                ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                : 'bg-[#ff4b4b] text-white hover:bg-red-600 shadow-md shadow-red-500/20'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
