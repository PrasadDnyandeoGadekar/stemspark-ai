// api/generate-quiz.js
// Vercel Serverless Function: generates a 10-question multiple-choice quiz.
// GEMINI_API_KEY must be set in Vercel's Environment Variables, never in the frontend.

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Verify these names against Google's current model list. An invalid name
// just fails and the loop moves on, but it wastes time.
const MODEL_CANDIDATES = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

const VALID_DIFFICULTIES = ["Easy", "Medium", "Hard", "Mixed"];
const MAX_RETRIES_PER_MODEL = 1;

// Stop trying new models after this long, so we respond before Vercel
// kills the function. Keep it below your function's maxDuration.
const TIME_BUDGET_MS = 45000;
const MAX_TOPIC_LENGTH = 200;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Server is missing GEMINI_API_KEY. Set it in the Vercel project's Environment Variables."
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

function buildPrompt({ category, subCategory, topic, difficulty, avoidQuestions }) {
  const avoidBlock =
    Array.isArray(avoidQuestions) && avoidQuestions.length > 0
      ? `Do NOT repeat or closely reproduce any of these previously asked questions:\n- ${avoidQuestions
          .slice(-40)
          .map((q) => String(q))
          .join("\n- ")}\n\n`
      : "";

  return `You are an expert educational quiz creator for students (many from underprivileged backgrounds who rely on this platform for free, high-quality practice).

Create a multiple-choice quiz with EXACTLY 10 questions.

Quiz information:
Category: ${category || "General"}
Subcategory: ${subCategory || "General"}
Topic: ${topic}
Difficulty: ${difficulty}
Number of questions: 10
Marks per question: 1
Total marks: 10

${avoidBlock}Rules - follow ALL strictly:
1. Generate exactly 10 questions.
2. Every question must have exactly 4 options, labeled exactly A, B, C, and D.
3. Exactly ONE option must be correct.
4. Never duplicate options within the same question.
5. Do not create ambiguous questions or questions with multiple possible correct answers.
6. Match the requested difficulty:
   - Easy = basic concepts, definitions, direct understanding.
   - Medium = application and moderate reasoning.
   - Hard = multi-step reasoning, deeper concepts, tricky applications.
   - Mixed = a combination of Easy, Medium, and Hard.
7. Mix conceptual and application-based questions where appropriate.
8. For programming topics, short code snippets may be included in the question text.
9. For mathematics, create real solvable numerical/algebraic problems.
10. Keep the language simple and student-friendly. Avoid unnecessary jargon.
11. Every explanation must be short and educational (normally 1-2 sentences).
12. Be factually accurate. Never invent facts.
13. Do not mention that you are an AI.
14. Do not include markdown. Return ONLY valid JSON.

Return EXACTLY this structure:

{
  "topic": ${JSON.stringify(topic)},
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

// Pull a JSON object out of the text even if the model adds fences or chatter.
function extractJson(text) {
  if (!text || typeof text !== "string") return null;

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : text.trim();

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  return candidate.slice(start, end + 1);
}

// Returns an error string, or null if the quiz is valid.
function validateQuiz(data) {
  if (!data || typeof data !== "object") return "Response is not an object.";

  if (!Array.isArray(data.questions) || data.questions.length !== 10) {
    return "Quiz must contain exactly 10 questions.";
  }

  const requiredKeys = ["A", "B", "C", "D"];
  const seenQuestions = new Set();

  for (let index = 0; index < data.questions.length; index++) {
    const q = data.questions[index];
    const n = index + 1;

    if (!q || typeof q !== "object") return `Question ${n} is invalid.`;

    if (typeof q.question !== "string" || !q.question.trim()) {
      return `Question ${n} is missing its text.`;
    }

    const normalizedQuestion = q.question.trim().toLowerCase();
    if (seenQuestions.has(normalizedQuestion)) {
      return `Duplicate question detected at question ${n}.`;
    }
    seenQuestions.add(normalizedQuestion);

    if (!q.options || typeof q.options !== "object" || Array.isArray(q.options)) {
      return `Question ${n} is missing options.`;
    }

    const optionKeys = Object.keys(q.options);
    if (
      optionKeys.length !== 4 ||
      !requiredKeys.every((key) => optionKeys.includes(key))
    ) {
      return `Question ${n} must have exactly options A, B, C, and D.`;
    }

    const optionValues = requiredKeys.map((key) => String(q.options[key]).trim());
    if (optionValues.some((value) => value.length === 0)) {
      return `Question ${n} contains an empty option.`;
    }
    if (new Set(optionValues.map((v) => v.toLowerCase())).size !== 4) {
      return `Question ${n} contains duplicate options.`;
    }

    if (!requiredKeys.includes(q.correctAnswer)) {
      return `Question ${n} has an invalid correctAnswer.`;
    }

    if (typeof q.explanation !== "string" || !q.explanation.trim()) {
      return `Question ${n} is missing an explanation.`;
    }
  }

  return null;
}

// One attempt with one specific model.
async function generateOnce({ category, subCategory, topic, difficulty, avoidQuestions, modelName }) {
  const genAI = getGenAI();

  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const prompt = buildPrompt({ category, subCategory, topic, difficulty, avoidQuestions });

  const result = await model.generateContent(prompt);
  const response = result.response;
  if (!response) throw new Error("Gemini returned an empty response.");

  const rawText = response.text();
  if (!rawText) throw new Error("Gemini returned empty response text.");

  const jsonText = extractJson(rawText);
  if (!jsonText) throw new Error("No valid JSON object found in AI response.");

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new Error(`AI response was not valid JSON: ${error.message}`);
  }

  const validationError = validateQuiz(parsed);
  if (validationError) throw new Error(`Invalid quiz structure: ${validationError}`);

  // Normalize before sending to the frontend.
  parsed.topic = typeof parsed.topic === "string" ? parsed.topic.trim() : topic;
  parsed.difficulty = VALID_DIFFICULTIES.includes(parsed.difficulty)
    ? parsed.difficulty
    : difficulty;

  parsed.questions = parsed.questions.map((q, index) => ({
    id: index + 1,
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

// Temporary errors (overload, rate limit, timeout) are worth retrying.
function isRetryableError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return (
    message.includes("503") ||
    message.includes("service unavailable") ||
    message.includes("unavailable") ||
    message.includes("high demand") ||
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("too many requests") ||
    message.includes("408") ||
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("500")
  );
}

// Retry the same model with short exponential backoff.
async function generateWithRetry(params) {
  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
    try {
      return await generateOnce(params);
    } catch (error) {
      lastError = error;

      console.warn(
        `Gemini request failed | model=${params.modelName} | attempt=${attempt + 1}/${
          MAX_RETRIES_PER_MODEL + 1
        } | message=${error?.message || error}`
      );

      if (!isRetryableError(error) || attempt >= MAX_RETRIES_PER_MODEL) {
        throw error;
      }

      const delay = 1000 * Math.pow(2, attempt) + Math.floor(Math.random() * 500);
      await sleep(delay);
    }
  }

  throw lastError || new Error("Gemini generation failed.");
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({
      error: "method-not-allowed",
      message: "Use POST for quiz generation.",
    });
    return;
  }

  try {
    // Vercel only parses the body when Content-Type is application/json.
    const body = req.body && typeof req.body === "object" ? req.body : {};

    const category = typeof body.category === "string" ? body.category.trim() : "";
    const subCategory = typeof body.subCategory === "string" ? body.subCategory.trim() : "";
    const topic =
      typeof body.topic === "string" ? body.topic.trim().slice(0, MAX_TOPIC_LENGTH) : "";
    const difficulty = VALID_DIFFICULTIES.includes(body.difficulty) ? body.difficulty : "Medium";
    const avoidQuestions = Array.isArray(body.previousQuestions)
      ? body.previousQuestions
          .filter((q) => typeof q === "string")
          .map((q) => q.trim())
          .filter(Boolean)
      : [];

    if (!topic) {
      res.status(400).json({
        error: "invalid-argument",
        message: "A topic is required to generate a quiz.",
      });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing from server environment.");
      res.status(500).json({
        error: "configuration-error",
        message: "Quiz service is not configured correctly on the server.",
      });
      return;
    }

    const startedAt = Date.now();
    let lastError = null;

    // Try models in order; if one is overloaded, the next gets a chance.
    for (const modelName of MODEL_CANDIDATES) {
      if (Date.now() - startedAt > TIME_BUDGET_MS) {
        console.warn("Time budget exhausted; not trying more models.");
        break;
      }

      try {
        console.log(`Attempting quiz generation with model=${modelName}`);

        const quiz = await generateWithRetry({
          category,
          subCategory,
          topic,
          difficulty,
          avoidQuestions,
          modelName,
        });

        console.log(`Quiz generated successfully with model=${modelName}`);
        res.status(200).json(quiz);
        return;
      } catch (error) {
        lastError = error;
        console.warn(`Model failed: ${modelName} | ${error?.message || error}`);
      }
    }

    console.error("generateQuiz: all Gemini model attempts failed.", lastError?.message || lastError);

    // Don't expose internal Gemini error details to students.
    res.status(503).json({
      error: "service-unavailable",
      message: "Quiz generation is temporarily unavailable. Please try again in a moment.",
    });
  } catch (error) {
    console.error("generateQuiz: unexpected server error:", error?.message || error);
    res.status(500).json({
      error: "internal",
      message: "Unable to generate the quiz right now. Please try again.",
    });
  }
};
