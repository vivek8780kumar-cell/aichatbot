import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { VocabBuilder } from './VocabBuilder';
import { GrammarCheckerTool } from './GrammarCheckerTool';
import { ProgressDashboard } from './ProgressDashboard';
import { 
  AppSettings, ChatMessage as ChatMessageType, VocabItem, UserStats 
} from './types';
import { 
  INITIAL_SETTINGS, INITIAL_MESSAGES, INITIAL_VOCAB, INITIAL_STATS 
} from './initialData';
import { speakText } from './speech';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [messages, setMessages] = useState<ChatMessageType[]>(INITIAL_MESSAGES);
  const [vocabList, setVocabList] = useState<VocabItem[]>(INITIAL_VOCAB);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);

  const [activeTab, setActiveTab] = useState<'chat' | 'vocab' | 'grammar' | 'stats'>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isDark = settings.streamlitTheme === 'dark';

  // Toggle Streamlit Theme
  const handleToggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      streamlitTheme: prev.streamlitTheme === 'dark' ? 'light' : 'dark',
    }));
  };

  // Reset Session
  const handleResetSession = () => {
    if (confirm('Reset chat history and start a fresh session?')) {
      setMessages(INITIAL_MESSAGES);
      setSidebarOpen(false);
    }
  };

  // Save new vocabulary word
  const handleSaveVocab = (word: VocabItem) => {
    if (!vocabList.some((v) => v.word.toLowerCase() === word.word.toLowerCase())) {
      const newWord: VocabItem = {
        ...word,
        id: `v-${Date.now()}`,
        savedAt: new Date().toISOString(),
        masteryLevel: 'learning',
      };
      setVocabList((prev) => [newWord, ...prev]);
      setStats((prev) => ({ ...prev, wordsLearned: prev.wordsLearned + 1 }));
    }
  };

  // Send message to Express / Gemini AI
  const handleSendMessage = async (text: string) => {
    const userMsgId = `usr-${Date.now()}`;
    const userMessage: ChatMessageType = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setStats((prev) => ({ ...prev, messagesSent: prev.messagesSent + 1 }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          userMessage: text,
          proficiencyLevel: settings.proficiencyLevel,
          topic: settings.topic,
          persona: settings.persona,
          enableGrammarCheck: settings.enableGrammarCheck,
          enableVocabExtraction: settings.enableVocabExtraction,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update user message with grammar analysis if available
        if (data.grammarAnalysis) {
          setMessages((prev) =>
            prev.map((m) => (m.id === userMsgId ? { ...m, grammarAnalysis: data.grammarAnalysis } : m))
          );

          if (typeof data.grammarAnalysis.score === 'number') {
            setStats((prev) => ({
              ...prev,
              grammarScores: [...prev.grammarScores, data.grammarAnalysis.score],
            }));
          }
        }

        // Add AI response message
        const assistantMsg: ChatMessageType = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.reply || "That's very interesting! Could you tell me more about that?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          vocabExtracted: data.vocabularyExtracted || [],
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Auto-play TTS audio if enabled
        if (settings.autoPlayAudio && data.reply) {
          speakText(data.reply, settings.speechRate, 1.0, settings.voiceGender);
        }
      } else {
        // Fallback error message
        const errorMsg: ChatMessageType = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: "I'm having a brief connection pause. Please try asking again!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMsg: ChatMessageType = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "Network error. Please make sure the server is running and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const savedVocabIds = vocabList.map((v) => v.word.toLowerCase());

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#0e1117] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Streamlit Top Header */}
      <Header
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Body Layout with Streamlit Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          settings={settings}
          setSettings={setSettings}
          stats={stats}
          onResetSession={handleResetSession}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content View Container */}
        <main className="flex-1 flex flex-col overflow-y-auto relative">
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between">
              {/* Message List */}
              <div className="flex-1 divide-y divide-[#262730]/40">
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    settings={settings}
                    onSaveVocab={handleSaveVocab}
                    savedVocabIds={savedVocabIds}
                  />
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="py-4 px-6 flex items-center gap-3 max-w-4xl mx-auto">
                    <div className="w-8 h-8 rounded-xl bg-[#ff4b4b] text-white flex items-center justify-center animate-bounce font-bold text-xs">
                      AI
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <div className="w-2 h-2 rounded-full bg-[#ff4b4b] animate-ping" />
                      <span>Streamlit AI Tutor is analyzing & drafting response...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                settings={settings}
              />
            </div>
          )}

          {activeTab === 'vocab' && (
            <VocabBuilder
              vocabList={vocabList}
              setVocabList={setVocabList}
              settings={settings}
              onAddCustomWord={handleSaveVocab}
            />
          )}

          {activeTab === 'grammar' && (
            <GrammarCheckerTool settings={settings} />
          )}

          {activeTab === 'stats' && (
            <ProgressDashboard stats={stats} settings={settings} />
          )}
        </main>
      </div>
    </div>
  );
}
