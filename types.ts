export type ProficiencyLevel = 'Beginner (A1-A2)' | 'Intermediate (B1-B2)' | 'Advanced (C1-C2)';

export type PersonaType = 'Friendly Tutor' | 'Strict Teacher' | 'Casual Buddy' | 'Business Coach';

export interface GrammarCorrection {
  type: 'Grammar' | 'Spelling' | 'Vocabulary' | 'Punctuation';
  originalText: string;
  correctedText: string;
  explanation: string;
  ruleCategory: string;
}

export interface GrammarAnalysis {
  hasErrors: boolean;
  score: number; // 0 - 100
  correctedSentence: string;
  corrections: GrammarCorrection[];
  betterPhrasing: string;
  encouragement: string;
}

export interface VocabItem {
  id: string;
  word: string;
  ipa?: string;
  partOfSpeech: string;
  definition: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  contextSentence?: string;
  exampleSentence: string;
  synonyms?: string[];
  savedAt: string;
  masteryLevel: 'learning' | 'reviewing' | 'mastered';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  grammarAnalysis?: GrammarAnalysis;
  vocabExtracted?: VocabItem[];
  audioUrl?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  wordTarget: string;
}

export interface AppSettings {
  proficiencyLevel: ProficiencyLevel;
  topic: string;
  persona: PersonaType;
  enableGrammarCheck: boolean;
  enableVocabExtraction: boolean;
  speechRate: number; // 0.75, 1.0, 1.25
  voiceGender: 'female' | 'male';
  autoPlayAudio: boolean;
  streamlitTheme: 'light' | 'dark';
}

export interface UserStats {
  messagesSent: number;
  grammarScores: number[]; // array of scores
  wordsLearned: number;
  streakDays: number;
  categoryErrors: Record<string, number>;
}
