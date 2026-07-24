import React, { useState } from 'react';
import { CheckSquare, Sparkles, AlertTriangle, CheckCircle, Lightbulb, Copy, Check } from 'lucide-react';
import { AppSettings, GrammarAnalysis } from './types';

interface GrammarCheckerToolProps {
  settings: AppSettings;
}

export const GrammarCheckerTool: React.FC<GrammarCheckerToolProps> = ({ settings }) => {
  const isDark = settings.streamlitTheme === 'dark';
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<GrammarAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAnalysis(data.data);
      }
    } catch (err) {
      console.error('Grammar check failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyCorrected = () => {
    if (analysis?.correctedSentence) {
      navigator.clipboard.writeText(analysis.correctedSentence);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sampleTexts = [
    "Yesterday I go to the supermarket and I buyed two apples because I was feeling hungry.",
    "He don't know where is the nearest train station for go to work.",
    "If I would have known about the meeting, I would come earlier."
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Streamlit Title Header */}
      <div className={`p-4 rounded-2xl border ${
        isDark ? 'bg-[#161b22] border-[#262730]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-[#ff4b4b] font-mono text-xs font-bold uppercase">st.text_area</span>
          <span className="text-slate-500">•</span>
          <h2 className="text-lg font-bold">Instant Grammar & Writing Proofreader</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Paste any English sentence, paragraph, or email below for instant correction and grammar analysis.
        </p>
      </div>

      {/* Input Area Form */}
      <div className={`p-4 rounded-2xl border space-y-3 ${
        isDark ? 'bg-[#161b22] border-[#262730]' : 'bg-white border-slate-200'
      }`}>
        {/* Sample Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 shrink-0 text-[11px]">Try sample:</span>
          {sampleTexts.map((s, i) => (
            <button
              key={i}
              onClick={() => setInputText(s)}
              className={`px-2.5 py-1 rounded-lg text-[11px] truncate max-w-[200px] border ${
                isDark ? 'bg-[#0e1117] border-[#262730] text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              "{s}"
            </button>
          ))}
        </div>

        <textarea
          rows={5}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or write your English text here..."
          className={`w-full p-3 rounded-xl border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-[#ff4b4b] ${
            isDark ? 'bg-[#0e1117] border-[#262730] text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}
        />

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={!inputText.trim() || isAnalyzing}
            className="px-5 py-2.5 rounded-xl bg-[#ff4b4b] text-white text-xs font-bold shadow-md shadow-red-500/20 hover:bg-red-600 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing Grammar...</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4" />
                <span>Check Grammar & Fluency</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Output Result (st.expander / st.json style) */}
      {analysis && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDark ? 'bg-[#161b22] border-[#262730]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-inherit">
            <div className="flex items-center gap-2">
              <span className="text-[#ff4b4b] font-mono text-xs font-bold uppercase">st.success</span>
              <h3 className="font-bold text-base">Analysis Results</h3>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
              analysis.score >= 90
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              Grammar Score: {analysis.score}/100
            </span>
          </div>

          {/* Corrected Text Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Corrected Text</span>
              <button
                onClick={handleCopyCorrected}
                className="text-xs text-[#ff4b4b] flex items-center gap-1 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p className={`p-3 rounded-xl font-medium text-sm border ${
              isDark ? 'bg-[#0e1117] border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              ✅ {analysis.correctedSentence || inputText}
            </p>
          </div>

          {/* Rules / Corrections Breakdown */}
          {analysis.corrections && analysis.corrections.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Rule Breakdown & Explanations</span>
              <div className="space-y-2">
                {analysis.corrections.map((c, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border space-y-1.5 ${
                      isDark ? 'bg-[#0e1117] border-[#262730]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ff4b4b]/20 text-[#ff7676]">
                        {c.ruleCategory || c.type}
                      </span>
                      <div className="text-xs font-mono">
                        <span className="line-through text-red-400">{c.originalText}</span>
                        <span className="text-slate-500 mx-1.5">→</span>
                        <span className="text-emerald-400 font-bold">{c.correctedText}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300">
                      💡 {c.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Better Native Phrasing */}
          {analysis.betterPhrasing && (
            <div className={`p-3 rounded-xl border flex items-start gap-2 ${
              isDark ? 'bg-[#0e1117] border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold block">Native Alternative:</span>
                <p className="italic">"{analysis.betterPhrasing}"</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
