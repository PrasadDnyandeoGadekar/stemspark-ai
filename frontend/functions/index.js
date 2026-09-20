/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require("firebase-functions");
const { onRequest, onCall, HttpsError } = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// =============================================================================
// QUIZ GENERATION — the Gemini API key lives ONLY here (functions/.env),
// never in the frontend. The frontend calls this via httpsCallable, so no
// key/token of any kind is ever sent to or exposed in the browser.
// =============================================================================

const MODEL_NAME = "gemini-2.0-flash";
const MAX_ATTEMPTS = 3;
const VALID_DIFFICULTIES = ["Easy", "Medium", "Hard", "Mixed"];

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new HttpsError(
      "failed-precondition",
      "Server is missing GEMINI_API_KEY. Set it in functions/.env and redeploy/restart the emulator."
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

function buildPrompt({ category, subCategory, topic, difficulty, avoidQuestions }) {
  const avoidBlock =
    avoidQuestions && avoidQuestions.length > 0
      ? `Do NOT repeat or closely reproduce any of these previously asked questions:\n- ${avoidQuestions
          .slice(-40) // keep prompt size sane even after many rounds of Practice Again
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
  // Gemini sometimes wraps JSON in ```json ... ``` fences despite instructions.
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
  const seenQuestionText = new Set();
  for (const q of data.questions) {
    if (!q || typeof q.question !== "string" || !q.question.trim()) {
      return "A question is missing its text.";
    }
    const norm = q.question.trim().toLowerCase();
    if (seenQuestionText.has(norm)) return "Duplicate question detected within the same quiz.";
    seenQuestionText.add(norm);

    if (!q.options || typeof q.options !== "object") return "A question is missing options.";
    const keys = Object.keys(q.options);
    if (keys.length !== 4 || !["A", "B", "C", "D"].every((k) => keys.includes(k))) {
      return "A question does not have exactly options A, B, C, D.";
    }
    const values = Object.values(q.options).map((v) => String(v).trim().toLowerCase());
    if (new Set(values).size !== 4) return "A question has duplicate option text.";
    if (!["A", "B", "C", "D"].includes(q.correctAnswer)) {
      return "A question has an invalid correctAnswer.";
    }
    if (typeof q.explanation !== "string" || !q.explanation.trim()) {
      return "A question is missing an explanation.";
    }
  }
  return null; // valid
}

async function generateOnce({ category, subCategory, topic, difficulty, avoidQuestions }) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
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
  } catch (e) {
    throw new Error("AI response was not valid JSON.");
  }

  const validationError = validateQuiz(parsed);
  if (validationError) throw new Error(`Invalid quiz structure: ${validationError}`);

  // Normalize ids 1-10 regardless of what the model returned.
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

exports.generateQuiz = onCall({ cors: true, timeoutSeconds: 60 }, async (request) => {
  const data = request.data || {};
  const category = typeof data.category === "string" ? data.category : "";
  const subCategory = typeof data.subCategory === "string" ? data.subCategory : "";
  const topic = typeof data.topic === "string" ? data.topic.trim() : "";
  const difficulty = VALID_DIFFICULTIES.includes(data.difficulty) ? data.difficulty : "Medium";
  const avoidQuestions = Array.isArray(data.previousQuestions) ? data.previousQuestions : [];

  if (!topic) {
    throw new HttpsError("invalid-argument", "A topic is required to generate a quiz.");
  }

  let lastError = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const quiz = await generateOnce({ category, subCategory, topic, difficulty, avoidQuestions });
      return quiz;
    } catch (err) {
      lastError = err;
      logger.warn(`generateQuiz attempt ${attempt} failed`, { message: err.message, topic, difficulty });
    }
  }

  logger.error("generateQuiz: all attempts failed", { message: lastError && lastError.message, topic });
  throw new HttpsError(
    "internal",
    "Unable to generate the quiz right now. Please try again."
  );
});