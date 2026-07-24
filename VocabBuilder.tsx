import React, { useState } from 'react';
import { 
  BookOpen, Search, Filter, Volume2, CheckCircle, RefreshCw, 
  Trash2, Brain, Sparkles, Layers, ChevronRight, Award, Plus
} from 'lucide-react';
import { VocabItem, AppSettings, QuizQuestion } from './types';
import { speakText } from './speech';

interface VocabBuilderProps {
  vocabList: VocabItem[];
  setVocabList: React.Dispatch<React.SetStateAction<VocabItem[]>>;
  settings: AppSettings;
  onAddCustomWord: (word: VocabItem) => void;
}

export const VocabBuilder: React.FC<VocabBuilderProps> = ({
  vocabList,
  setVocabList,
  settings,
  onAddCustomWord,
}) => {
  const isDark = settings.streamlitTheme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [cefrFilter, setCefrFilter] = useState<string>('ALL');
  const [activeMode, setActiveMode] = useState<'bank' | 'flashcards' | 'quiz'>('bank');

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Custom Word Modal state
  const [newWord, setNewWord] = useState('');
  const [newDef, setNewDef] = useState('');

  const filteredList = vocabList.filter((v) => {
    const matchesSearch = v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCefr = cefrFilter === 'ALL' || v.cefrLevel === cefrFilter;
    return matchesSearch && matchesCefr;
  });

  const handleDelete = (id: string) => {
    setVocabList((prev) => prev.filter((v) => v.id !== id));
  };

  const handleMasteryChange = (id: string, level: VocabItem['masteryLevel']) => {
    setVocabList((prev) => prev.map((v) => v.id === id ? { ...v, masteryLevel: level } : v));
  };

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    setQuizSubmitted(false);
    setUserAnswers({});
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: vocabList }),
      });
      const data = await res.json();
      if (data.success && data.questions) {
        setQuizQuestions(data.questions);
        setActiveMode('quiz');
      }
    } catch (err) {
      console.error('Quiz error:', err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleAddWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newDef.trim()) return;
    const newItem: VocabItem = {
      id: `custom-${Date.now()}`,
      word: newWord.trim(),
      definition: newDef.trim(),
      partOfSpeech: 'noun',
      cefrLevel: 'B2',
      exampleSentence: `Practice using '${newWord}' in your next sentence.`,
      savedAt: new Date().toISOString(),
      masteryLevel: 'learning',
    };
    onAddCustomWord(newItem);
    setNewWord('');
    setNewDef('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Streamlit Subheader / Mode Selector */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDark ? 'bg-[#161b22] border-[#262730]' : 'bg-white border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#ff4b4b] font-mono text-xs font-bold uppercase">st.dataframe</span>
            <span className="text-slate-500">•</span>
            <h2 className="text-lg font-bold">Vocabulary Building Deck</h2>
          </div>
          <p className="text-xs text-slate-400">
            {vocabList.length} words saved from conversation practice
          </p>
        </div>

        {/* Mode Toggle Buttons */}
        <div className={`flex items-center p-1 rounded-xl border ${
          isDark ? 'bg-[#0e1117] border-[#262730]' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveMode('bank')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'bank'
                ? 'bg-[#ff4b4b] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Word Bank</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('flashcards');
              setCardIndex(0);
              setIsFlipped(false);
            }}
            disabled={vocabList.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'flashcards'
                ? 'bg-[#ff4b4b] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Flashcards</span>
          </button>

          <button
            onClick={handleGenerateQuiz}
            disabled={isGeneratingQuiz}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'quiz'
                ? 'bg-[#ff4b4b] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>{isGeneratingQuiz ? 'Generating...' : 'AI Quiz'}</span>
          </button>
        </div>
      </div>

      {/* MODE 1: WORD BANK */}
      {activeMode === 'bank' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search input */}
            <div className={`col-span-2 flex items-center px-3 py-2 rounded-xl border ${
              isDark ? 'bg-[#161b22] border-[#262730]' : 'bg-white border-slate-200'
            }`}>
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search saved words or definitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs focus:outline-none"
              />
            </div>

            {/* CEFR Level Filter */}
            <div className={`flex items-center px-3 py-2 rounded-xl border ${
              isDark ? 'bg-[#161b22] border-[#262730]' : 'bg-white border-slate-200'
            }`}>
              <Filter className="w-4 h-4 text-[#ff4b4b] mr-2" />
              <select
                value={cefrFilter}
                onChange={(e) => setCefrFilter(e.target.value)}
                className="w-full bg-transparent text-xs focus:outline-none font-mono"
              >
                <option value="ALL">All CEFR Levels</option>
                <option value="A1">A1 - Beginner</option>
                <option value="A2">A2 - Elementary</option>
                <option value="B1">B1 - Intermediate</option>
                <option value="B2">B2 - Upper-Inter</option>
                <option value="C1">C1 - Advanced</option>
                <option value="C2">C2 - Mastery</option>
              </select>
            </div>
          </div>

          {/* Quick Add Word Form */}
          <form onSubmit={handleAddWordSubmit} className={`p-3 rounded-2xl border flex flex-col sm:flex-row gap-2 ${
            isDark ? 'bg-[#161b22] border-[#262730]' : 'bg-white border-slate-200'
          }`}>
            <input
              type="text"
              placeholder="Add word (e.g., Ubiquitous)"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-xs border flex-1 ${
                isDark ? 'bg-[#0e1117] border-[#262730]' : 'bg-slate-50 border-slate-200'
              }`}
            />
            <input
              type="text"
              placeholder="Definition (e.g., Present everywhere)"
              value={newDef}
              onChange={(e) => setNewDef(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-xs border flex-2 ${
                isDark ? 'bg-[#0e1117] border-[#262730]' : 'bg-slate-50 border-slate-200'
              }`}
            />
            <button
              type="submit"
              disabled={!newWord.trim() || !newDef.trim()}
              className="px-3 py-1.5 rounded-lg bg-[#ff4b4b] text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-50"
            >
              + Save Word
            </button>
          </form>

          {/* Vocabulary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredList.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border space-y-3 transition-all ${
                  isDark ? 'bg-[#161b22] border-[#262730] hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base font-mono text-sky-400">
                        {item.word}
                      </h3>
                      {item.ipa && (
                        <span className="text-xs text-slate-400 font-mono">
                          {item.ipa}
                        </span>
                      )}
                      <button
                        onClick={() => speakText(item.word, settings.speechRate)}
                        className="p-1 rounded-md text-slate-400 hover:text-white"
                        title="Pronounce Word"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ff4b4b]/20 text-[#ff7676]">
                        {item.cefrLevel || 'B2'}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 capitalize italic">
                        {item.partOfSpeech}
                      </span>
                    </div>
                  </div>

                  {/* Mastery Pill Toggle */}
                  <select
                    value={item.masteryLevel}
                    onChange={(e) => handleMasteryChange(item.id, e.target.value as any)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                      item.masteryLevel === 'mastered'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : item.masteryLevel === 'reviewing'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <option value="learning">🔴 Learning</option>
                    <option value="reviewing">🟡 Reviewing</option>
                    <option value="mastered">🟢 Mastered</option>
                  </select>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.definition}
                </p>

                {item.exampleSentence && (
                  <div className={`p-2 rounded-lg text-xs italic ${
                    isDark ? 'bg-[#0e1117] text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    "{item.exampleSentence}"
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Saved: {new Date(item.savedAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 2: FLASHCARDS DECK */}
      {activeMode === 'flashcards' && vocabList.length > 0 && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs text-slate-400 font-mono">
              Card {cardIndex + 1} of {vocabList.length}
            </span>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#ff4b4b] h-full transition-all duration-300"
                style={{ width: `${((cardIndex + 1) / vocabList.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Flip Card Area */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`min-h-[260px] p-8 rounded-3xl border cursor-pointer flex flex-col items-center justify-center text-center shadow-lg transition-all transform duration-300 ${
              isDark ? 'bg-[#161b22] border-[#262730] hover:border-[#ff4b4b]' : 'bg-white border-slate-200 hover:border-[#ff4b4b]'
            }`}
          >
            {!isFlipped ? (
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#ff4b4b] uppercase tracking-wider">Tap to Flip</span>
                <h3 className="text-3xl font-extrabold font-mono text-sky-400">
                  {vocabList[cardIndex].word}
                </h3>
                {vocabList[cardIndex].ipa && (
                  <p className="text-sm font-mono text-slate-400">
                    {vocabList[cardIndex].ipa}
                  </p>
                )}
                <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                  {vocabList[cardIndex].partOfSpeech}
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Definition & Example</span>
                <p className="text-base font-medium text-slate-100">
                  {vocabList[cardIndex].definition}
                </p>
                {vocabList[cardIndex].exampleSentence && (
                  <p className="text-xs italic text-slate-400 bg-slate-900/60 p-3 rounded-xl">
                    "{vocabList[cardIndex].exampleSentence}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Flashcard Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIndex((prev) => (prev > 0 ? prev - 1 : vocabList.length - 1));
              }}
              className="px-4 py-2 rounded-xl border text-xs font-semibold border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              ← Previous
            </button>

            <button
              onClick={() => speakText(vocabList[cardIndex].word, settings.speechRate)}
              className="p-2.5 rounded-xl bg-[#ff4b4b]/20 text-[#ff4b4b] border border-[#ff4b4b]/30"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIndex((prev) => (prev < vocabList.length - 1 ? prev + 1 : 0));
              }}
              className="px-4 py-2 rounded-xl bg-[#ff4b4b] text-white text-xs font-semibold hover:bg-red-600"
            >
              Next Card →
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: AI PRACTICE QUIZ */}
      {activeMode === 'quiz' && quizQuestions.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-4 rounded-2xl bg-[#ff4b4b]/10 border border-[#ff4b4b]/30 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#ff4b4b]">AI Vocabulary Practice Quiz</h3>
              <p className="text-xs text-slate-400">4 custom questions generated from your saved words</p>
            </div>
            <Award className="w-6 h-6 text-[#ff4b4b]" />
          </div>

          <div className="space-y-4">
            {quizQuestions.map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#161b22] border-[#262730]' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#ff4b4b] font-mono">Q{qIdx + 1}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono">
                    Target: {q.wordTarget}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-100">
                  {q.question}
                </p>

                {/* Options */}
                <div className="space-y-1.5">
                  {q.options?.map((opt, optIdx) => {
                    const isSelected = userAnswers[q.id] === opt;
                    const isCorrect = opt === q.correctAnswer;
                    let btnStyle = isDark ? 'bg-[#0e1117] border-[#262730] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800';

                    if (quizSubmitted) {
                      if (isCorrect) btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold';
                      else if (isSelected) btnStyle = 'bg-red-500/20 border-red-500 text-red-400';
                    } else if (isSelected) {
                      btnStyle = 'bg-[#ff4b4b]/20 border-[#ff4b4b] text-[#ff4b4b] font-bold';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={quizSubmitted}
                        onClick={() => setUserAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <p className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {!quizSubmitted ? (
            <button
              onClick={() => setQuizSubmitted(true)}
              className="w-full py-3 rounded-2xl bg-[#ff4b4b] text-white text-sm font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
            >
              Submit Quiz & View Results
            </button>
          ) : (
            <button
              onClick={handleGenerateQuiz}
              className="w-full py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold shadow-lg hover:bg-emerald-500 transition-all"
            >
              Try Another Quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
};
