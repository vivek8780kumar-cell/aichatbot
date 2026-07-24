import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper for Gemini client
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Chat Endpoint with Conversational Practice, Instant Grammar & Vocabulary Extraction
  app.post("/api/chat", async (req, res) => {
    try {
      const {
        messages = [],
        userMessage = "",
        proficiencyLevel = "Intermediate (B1-B2)",
        topic = "Casual Practice",
        persona = "Friendly Tutor",
        enableGrammarCheck = true,
        enableVocabExtraction = true
      } = req.body;

      const ai = getAi();

      const systemPrompt = `You are "Streamlit AI English Tutor", an expert, warm, and highly engaging English language teacher and conversation partner.
Target Learner Level: ${proficiencyLevel}
Conversation Topic / Scenario: ${topic}
Tutor Persona Tone: ${persona}

Your objectives:
1. Provide a natural, encouraging conversation turn response ("reply") in English tailored strictly to the learner's proficiency level (${proficiencyLevel}). Keep vocabulary and grammar at appropriate CEFR complexity. Ask 1 open-ended follow-up question to keep the conversation going smoothly.
2. If grammar check is enabled (${enableGrammarCheck ? 'YES' : 'NO'}), analyze the learner's input ("${userMessage}"). Identify any spelling, tense, word order, preposition, or article errors. Provide corrections, simple explanation of grammar rules, a grammar score (0 to 100), and a more natural/advanced alternative phrasing ("betterPhrasing").
3. If vocabulary extraction is enabled (${enableVocabExtraction ? 'YES' : 'NO'}), extract 1 to 3 key useful vocabulary words/idioms/phrases from the context with IPA pronunciation, clear definition, part of speech, CEFR level, and example sentence.

Respond STRICTLY in JSON with this structure:
{
  "reply": "Your conversational response in English...",
  "grammarAnalysis": {
    "hasErrors": boolean,
    "score": number,
    "correctedSentence": "Corrected user input",
    "corrections": [
      {
        "type": "Grammar" | "Spelling" | "Vocabulary" | "Punctuation",
        "originalText": "error snippet",
        "correctedText": "fixed snippet",
        "explanation": "Simple grammar rule explanation",
        "ruleCategory": "Verb Tenses" | "Prepositions" | "Articles" | "Subject-Verb Agreement" | "Word Choice"
      }
    ],
    "betterPhrasing": "A natural, native-sounding alternative",
    "encouragement": "Positive feedback line"
  },
  "vocabularyExtracted": [
    {
      "word": "word/phrase",
      "ipa": "/pronunciation/",
      "partOfSpeech": "noun/verb/adjective/idiom",
      "definition": "Definition",
      "cefrLevel": "A1"|"A2"|"B1"|"B2"|"C1"|"C2",
      "contextSentence": "In context...",
      "exampleSentence": "Sample sentence...",
      "synonyms": ["synonym1", "synonym2"]
    }
  ]
}`;

      const historyFormatted = messages.slice(-6).map((m: any) => `${m.role === 'user' ? 'Learner' : 'Tutor'}: ${m.content}`).join('\n');
      const userPrompt = `Conversation History:\n${historyFormatted}\n\nLearner's Input: "${userMessage}"\n\nGenerate json response:`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
      });

      const rawText = response.text || "{}";
      let parsedData;
      try {
        parsedData = JSON.parse(rawText);
      } catch (e) {
        parsedData = {
          reply: rawText,
          grammarAnalysis: {
            hasErrors: false,
            score: 100,
            correctedSentence: userMessage,
            corrections: [],
            betterPhrasing: userMessage,
            encouragement: "Great communication!"
          },
          vocabularyExtracted: []
        };
      }

      res.json({ success: true, ...parsedData });
    } catch (err: any) {
      console.error("Error in /api/chat:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to generate AI response" });
    }
  });

  // Standalone Grammar Checker Endpoint
  app.post("/api/grammar-check", async (req, res) => {
    try {
      const { text = "" } = req.body;
      if (!text.trim()) {
        return res.status(400).json({ success: false, error: "Text is empty" });
      }

      const ai = getAi();
      const prompt = `Analyze the following English text for grammar, spelling, punctuation, and phrasing improvements.
Text: "${text}"

Respond STRICTLY in JSON format:
{
  "hasErrors": boolean,
  "score": number,
  "correctedSentence": "string",
  "corrections": [
    {
      "type": "Grammar" | "Spelling" | "Vocabulary" | "Punctuation",
      "originalText": "string",
      "correctedText": "string",
      "explanation": "string",
      "ruleCategory": "string"
    }
  ],
  "betterPhrasing": "string",
  "encouragement": "string"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("Error in /api/grammar-check:", err);
      res.status(500).json({ success: false, error: err.message || "Grammar check failed" });
    }
  });

  // Quiz Generation Endpoint based on learned vocabulary
  app.post("/api/generate-quiz", async (req, res) => {
    try {
      const { words = [] } = req.body;
      const wordList = words.length > 0 ? words.slice(0, 10).map((w: any) => w.word).join(", ") : "resilient, articulate, meticulous, ephemeral, prioritize";

      const ai = getAi();
      const prompt = `Generate a 4-question interactive English vocabulary practice quiz based on these words: [${wordList}].
Format strictly as JSON:
[
  {
    "id": "q1",
    "type": "multiple-choice",
    "question": "What is the best definition of 'articulate'?",
    "options": ["Able to express thoughts clearly", "Moving quickly and easily", "Reluctant to speak", "Complicated and hard to understand"],
    "correctAnswer": "Able to express thoughts clearly",
    "explanation": "'Articulate' means expressing ideas clearly and fluently in speech or writing.",
    "wordTarget": "articulate"
  }
]`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const quizItems = JSON.parse(response.text || "[]");
      res.json({ success: true, questions: quizItems });
    } catch (err: any) {
      console.error("Error in /api/generate-quiz:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to generate quiz" });
    }
  });

  // Vite Middleware integration for local dev / production static files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
