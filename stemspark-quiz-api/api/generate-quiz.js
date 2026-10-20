const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.6-flash",
].filter((model, index, models) => models.indexOf(model) === index);
const MODEL_REQUEST_TIMEOUT_MS = 12000;
const VALID_DIFFICULTIES = ["Easy", "Medium", "Hard", "Mixed"];

function buildPrompt({ category, subCategory, topic, difficulty, avoidQuestions }) {
  const avoidBlock = avoidQuestions?.length
    ? `Avoid repeating these:\n- ${avoidQuestions.slice(-40).join("\n- ")}\n\n`
    : "";
  return `Create a multiple-choice quiz with EXACTLY 10 questions.
Category: ${category || "General"}
Subcategory: ${subCategory || "General"}
Topic: ${topic}
Difficulty: ${difficulty}
${avoidBlock}Create exactly 10 distinct multiple-choice questions, each with exactly four options labeled A, B, C, and D; one correct answer; and a short, accurate explanation. Return only the requested structured data.

For mathematics, chemistry, physics, and other notation:
- Write inline formulas in LaTeX wrapped in single dollar signs, such as "$\\log_{2}(32) + \\log_{3}(81)$" or "$\\sin(30^\\circ) \\times \\cos(60^\\circ)$".
- Use "$$...$$" only for a standalone display equation.
- Keep the surrounding sentence outside the math delimiters; never output raw formatting markers such as "##" instead of math delimiters.
- Escape backslashes correctly so the response remains valid JSON.`;
}

const QUIZ_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    topic: { type: "string" },
    difficulty: { type: "string" },
    questions: {
      type: "array",
      minItems: 10,
      maxItems: 10,
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          question: { type: "string" },
          options: {
            type: "object",
            properties: {
              A: { type: "string" },
              B: { type: "string" },
              C: { type: "string" },
              D: { type: "string" },
            },
            required: ["A", "B", "C", "D"],
          },
          correctAnswer: { type: "string", enum: ["A", "B", "C", "D"] },
          explanation: { type: "string" },
        },
        required: ["id", "question", "options", "correctAnswer", "explanation"],
      },
    },
  },
  required: ["topic", "difficulty", "questions"],
};

function getOutputText(interaction) {
  const content = (interaction.steps || [])
    .filter((step) => step.type === "model_output")
    .flatMap((step) => step.content || []);
  return content
    .filter((item) => item.type === "text" && typeof item.text === "string")
    .map((item) => item.text)
    .join("\n")
    .trim();
}

function validateQuiz(data) {
  if (!data || !Array.isArray(data.questions) || data.questions.length !== 10) return "Need 10 questions.";
  for (const q of data.questions) {
    if (!q?.question || !q.options || !["A","B","C","D"].includes(q.correctAnswer) || !q.explanation) return "Bad question.";
    if (Object.keys(q.options).length !== 4) return "Need 4 options.";
  }
  return null;
}

function isTransientError(error) {
  return error?.name === "TimeoutError"
    || error?.name === "AbortError"
    || [408, 429, 500, 502, 503, 504].includes(Number(error?.status));
}

async function generateOnce({ category, subCategory, topic, difficulty, avoidQuestions, modelName }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY.");

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      model: modelName,
      input: buildPrompt({ category, subCategory, topic, difficulty, avoidQuestions }),
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: QUIZ_RESPONSE_SCHEMA,
      },
      store: false,
    }),
    signal: AbortSignal.timeout(MODEL_REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const details = await response.json().catch(() => null);
    const error = new Error(details?.error?.message || `Gemini API returned HTTP ${response.status}.`);
    error.status = response.status;
    throw error;
  }

  const interaction = await response.json();
  const text = getOutputText(interaction);
  if (!text) throw new Error("Gemini returned no quiz content.");
  const parsed = JSON.parse(text);
  const err = validateQuiz(parsed);
  if (err) throw new Error(err);
  parsed.questions = parsed.questions.map((q, i) => ({ ...q, id: i + 1 }));
  return parsed;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Use POST." });

  const body = req.body || {};
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const difficulty = VALID_DIFFICULTIES.includes(body.difficulty) ? body.difficulty : "Medium";
  if (!topic) return res.status(400).json({ message: "Topic required." });

  let lastError = null;
  for (let modelIndex = 0; modelIndex < MODEL_CANDIDATES.length; modelIndex += 1) {
    const modelName = MODEL_CANDIDATES[modelIndex];
    const attempts = modelIndex === 0 ? 2 : 1;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const quiz = await generateOnce({
          category: body.category || "", subCategory: body.subCategory || "",
          topic, difficulty, avoidQuestions: body.previousQuestions || [], modelName,
        });
        return res.status(200).json(quiz);
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} attempt ${attempt} failed:`, err.message);
        if (!isTransientError(err) || attempt === attempts) break;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }
  console.error("All models failed:", lastError?.message);
  const isTransient = isTransientError(lastError);
  res.status(isTransient ? 503 : 500).json({
    error: isTransient ? "temporarily_unavailable" : "internal",
    message: isTransient
      ? "Quiz generation is temporarily busy. Please try again in a few moments."
      : "Unable to generate the quiz right now. Please try again.",
  });
};