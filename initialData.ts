import { AppSettings, ChatMessage, VocabItem, UserStats } from './types';

export const TOPICS = [
  { id: 'casual', name: '☕ Casual Coffee Chat', description: 'Practice everyday conversational English and small talk' },
  { id: 'interview', name: '💼 Job Interview Prep', description: 'Prepare for behavioral questions and professional vocabulary' },
  { id: 'travel', name: '✈️ Travel & Airport', description: 'Ask for directions, order food, and check in at hotels' },
  { id: 'food', name: '🍝 Restaurant & Food Order', description: 'Order meals, make reservations, and discuss dietary preferences' },
  { id: 'tech', name: '💻 Tech & Business Meeting', description: 'Discuss software development, project status, and business updates' },
  { id: 'hobbies', name: '🎨 Hobbies & Culture', description: 'Talk about movies, music, books, sports, and travel destinations' },
  { id: 'grammar', name: '✍️ Free Practice & Grammar Focus', description: 'Ask any grammar question or practice writing complex sentences' },
];

export const INITIAL_SETTINGS: AppSettings = {
  proficiencyLevel: 'Intermediate (B1-B2)',
  topic: '☕ Casual Coffee Chat',
  persona: 'Friendly Tutor',
  enableGrammarCheck: true,
  enableVocabExtraction: true,
  speechRate: 1.0,
  voiceGender: 'female',
  autoPlayAudio: false,
  streamlitTheme: 'dark',
};

export const INITIAL_VOCAB: VocabItem[] = [
  {
    id: 'v1',
    word: 'Articulate',
    ipa: '/ɑːrˈtɪk.jə.lət/',
    partOfSpeech: 'adjective',
    definition: 'Expressing ideas clearly and effectively in speech or writing.',
    cefrLevel: 'B2',
    contextSentence: 'She was extremely articulate during the presentation.',
    exampleSentence: 'An articulate speaker can easily convince the audience.',
    synonyms: ['fluent', 'eloquent', 'expressive'],
    savedAt: new Date().toISOString(),
    masteryLevel: 'reviewing',
  },
  {
    id: 'v2',
    word: 'Resilient',
    ipa: '/rɪˈzɪl.i.ənt/',
    partOfSpeech: 'adjective',
    definition: 'Able to withstand or recover quickly from difficult conditions.',
    cefrLevel: 'B2',
    contextSentence: 'Children are often remarkably resilient.',
    exampleSentence: 'Our team remained resilient despite the unexpected deadline.',
    synonyms: ['tough', 'adaptable', 'buoyant'],
    savedAt: new Date().toISOString(),
    masteryLevel: 'mastered',
  },
  {
    id: 'v3',
    word: 'Ephemeral',
    ipa: '/ɪˈfem.ər.əl/',
    partOfSpeech: 'adjective',
    definition: 'Lasting for a very short time; fleeting.',
    cefrLevel: 'C1',
    contextSentence: 'Fame in the digital age can be very ephemeral.',
    exampleSentence: 'Cherry blossoms offer an ephemeral beauty every spring.',
    synonyms: ['transient', 'fleeting', 'momentary'],
    savedAt: new Date().toISOString(),
    masteryLevel: 'learning',
  },
  {
    id: 'v4',
    word: 'Metaphor',
    ipa: '/ˈmet.ə.fɔːr/',
    partOfSpeech: 'noun',
    definition: 'A figure of speech in which a word or phrase is applied to an object or action to which it is not literally applicable.',
    cefrLevel: 'B1',
    contextSentence: 'The poet used a sunset as a metaphor for aging.',
    exampleSentence: 'Life is a journey is a common metaphor.',
    synonyms: ['analogy', 'symbol', 'allegory'],
    savedAt: new Date().toISOString(),
    masteryLevel: 'mastered',
  }
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    role: 'assistant',
    content: "👋 Hello there! I'm your Streamlit AI English Tutor. How are you feeling today? We can practice conversational English, polish your grammar, or build your vocabulary together. What would you like to talk about?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
];

export const INITIAL_STATS: UserStats = {
  messagesSent: 1,
  grammarScores: [95],
  wordsLearned: 4,
  streakDays: 3,
  categoryErrors: {
    'Verb Tenses': 2,
    'Prepositions': 4,
    'Articles': 1,
    'Word Choice': 2,
  }
};
