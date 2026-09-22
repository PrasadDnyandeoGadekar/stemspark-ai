// api/generate-quiz.js
// This is a Vercel Serverless Function. It runs on Vercel's servers, never
// in the browser — so GEMINI_API_KEY (set in Vercel's dashboard, not in
// this file) is never exposed to students using the app.

const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODEL_CANDIDATES = ["gemini-flash-latest", "gemini-3.6-flash"];
const VALID_DIFFICULTIES = ["Easy", "Medium", "Hard", "Mixed"];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Server is missing GEMINI_API_KEY. Set it in the Vercel project's Environment Variables.");
  }
  return new GoogleGenerativeAI(apiKey);
}

function buildPrompt({ category, subCategory, topic, difficulty, avoidQuestions }) {
  const avoidBlock =
    avoidQuestions && avoidQuestions.length > 0
      ? `Do NOT repeat or closely reproduce any of these previously asked questions:\n- ${avoidQuestions
          .slice(-40)
          .join("\n- ")}\n\n`
      : "";

  return `You are an expert educational quiz creator for students (many from underprivileged backgrounds who rely on this platform for free, high-quality practice).

Create a multiple-choice quiz with EXACTLY 10 questions on the following:

Category: ${category || "General"}
Subcategory: ${subCategory || "General"}
Topic: ${topic}
Difficulty: ${difficulty}
Number of questions: 10
Marks per question: 1

${avoidBlock}Rules (follow ALL strictly):
- Exactly 10 questions.
- Each question has exactly 4 options labeled A, B, C, D.
- Exactly ONE option is correct per question.
- Never duplicate options within a question.
- Never have ambiguous or multiple correct answers.
- Match the requested difficulty (Easy = basic recall, Medium = applied understanding, Hard = multi-step/tricky, Mixed = a spread of easy/medium/hard).
- Mix conceptual and application-based questions.
- For programming topics, you may include short code snippets inline in the question text.
- For math topics, use real solvable numeric/algebraic problems.
- Keep language simple and student-friendly, avoid unnecessary jargon.
- Explanations must be short (1-2 sentences) and educational.
- Be factually accurate. Do not invent facts.

Return ONLY valid JSON, no markdown fences, no commentary, in EXACTLY this structure:

{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correctAnswer": "B",
      "explanation": "..."
    }
  ]
}`;
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return candidate.slice(start, end + 1);
}

function validateQuiz(data) {
  if (!data || typeof data !== "object") return "Response is not an object.";
  if (!Array.isArray(data.questions) || data.questions.length !== 10) {
    return "Must contain exactly 10 questions.";
  }
  const seen = new Set();
  for (const q of data.questions) {
    if (!q || typeof q.question !== "string" || !q.question.trim()) return "A question is missing its text.";
    const norm = q.question.trim().toLowerCase();
    if (seen.has(norm)) return "Duplicate question detected within the same quiz.";
    seen.add(norm);

    if (!q.options || typeof q.options !== "object") return "A question is missing options.";
    const keys = Object.keys(q.options);
    if (keys.length !== 4 || !["A", "B", "C", "D"].every((k) => keys.includes(k))) {
      return "A question does not have exactly options A, B, C, D.";
    }
    const values = Object.values(q.options).map((v) => String(v).trim().toLowerCase());
    if (new Set(values).size !== 4) return "A question has duplicate option text.";
    if (!["A", "B", "C", "D"].includes(q.correctAnswer)) return "A question has an invalid correctAnswer.";
    if (typeof q.explanation !== "string" || !q.explanation.trim()) return "A question is missing an explanation.";
  }
  return null;
}

async function generateOnce({ category, subCategory, topic, difficulty, avoidQuestions, modelName }) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = buildPrompt({ category, subCategory, topic, difficulty, avoidQuestions });
  const result = await model.generateContent(prompt);
  const rawText = result.response.text();

  const jsonText = extractJson(rawText);
  if (!jsonText) throw new Error("No JSON found in AI response.");

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("AI response was not valid JSON.");
  }

  const validationError = validateQuiz(parsed);
  if (validationError) throw new Error(`Invalid quiz structure: ${validationError}`);

  parsed.questions = parsed.questions.map((q, i) => ({
    id: i + 1,
    question: q.question.trim(),
    options: {
      A: String(q.options.A).trim(),
      B: String(q.options.B).trim(),
      C: String(q.options.C).trim(),
      D: String(q.options.D).trim(),
    },
    correctAnswer: q.correctAnswer,
    explanation: q.explanation.trim(),
  }));

  return parsed;
}

module.exports = async (req, res) => {
  // --- CORS: allow the frontend (any origin, no secrets are ever sent to
  // the browser here, so this is safe) to call this endpoint. ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  const body = req.body || {};
  const category = typeof body.category === "string" ? body.category : "";
  const subCategory = typeof body.subCategory === "string" ? body.subCategory : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const difficulty = VALID_DIFFICULTIES.includes(body.difficulty) ? body.difficulty : "Medium";
  const avoidQuestions = Array.isArray(body.previousQuestions) ? body.previousQuestions : [];

  if (!topic) {
    res.status(400).json({ error: "invalid-argument", message: "A topic is required to generate a quiz." });
    return;
  }

  let lastError = null;

   for (const modelName of MODEL_CANDIDATES) {
    try {
      const quiz = await generateOnce({ category, subCategory, topic, difficulty, avoidQuestions, modelName });
      res.status(200).json(quiz);
      return;
    } catch (err) {
      lastError = err;
      console.warn(`generateQuiz failed (model: ${modelName}):`, err.message);
    }
  }

  console.error("generateQuiz: all attempts failed:", lastError && lastError.message);
  res.status(500).json({
    error: "internal",
    message: "Unable to generate the quiz right now. Please try again.",
  });
};