// api/generate-quiz.js
//
// Vercel Serverless Function for generating 10-question quizzes.
//
// IMPORTANT:
// - GEMINI_API_KEY must be configured in Vercel Environment Variables.
// - Never put GEMINI_API_KEY in the frontend.
// - This endpoint is designed to handle temporary Gemini 503/429 errors.
// - The quiz response is validated before being returned to the frontend.

const { GoogleGenerativeAI } = require("@google/generative-ai");

/*
 * Gemini model fallback order.
 *
 * These are stable Gemini models currently documented by Google.
 * We start with Gemini 3.8 Flash and progressively fall back to
 * lighter/older stable Flash models if a model is temporarily
 * unavailable or overloaded.
 */
const MODEL_CANDIDATES = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

const VALID_DIFFICULTIES = [
  "Easy",
  "Medium",
  "Hard",
  "Mixed",
];

/*
 * Keep retries limited because this function runs inside
 * a Vercel Serverless Function with a maximum execution time.
 */
const MAX_RETRIES_PER_MODEL = 1;

/*
 * Small delay helper.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
 * Get Gemini client using the server-side API key.
 */
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Server is missing GEMINI_API_KEY. Set GEMINI_API_KEY in the Vercel project's Environment Variables."
    );
  }

  return new GoogleGenerativeAI(apiKey);
}

/*
 * Build the quiz prompt.
 */
function buildPrompt({
  category,
  subCategory,
  topic,
  difficulty,
  avoidQuestions,
}) {
  const avoidBlock =
    Array.isArray(avoidQuestions) && avoidQuestions.length > 0
      ? `Do NOT repeat or closely reproduce any of these previously asked questions:

- ${avoidQuestions
          .slice(-40)
          .map((q) => String(q))
          .join("\n- ")}

`
      : "";

  return `You are an expert educational quiz creator for students.

Create a multiple-choice quiz with EXACTLY 10 questions.

Quiz information:

Category: ${category || "General"}
Subcategory: ${subCategory || "General"}
Topic: ${topic}
Difficulty: ${difficulty}
Number of questions: 10
Marks per question: 1
Total marks: 10

${avoidBlock}

Rules — follow ALL rules strictly:

1. Generate exactly 10 questions.
2. Every question must have exactly 4 options.
3. Options must be labeled exactly A, B, C, and D.
4. Exactly ONE option must be correct.
5. Never duplicate options within the same question.
6. Do not create ambiguous questions.
7. Do not create questions with multiple possible correct answers.
8. Match the requested difficulty:
   - Easy = basic concepts, definitions, direct understanding.
   - Medium = application and moderate reasoning.
   - Hard = multi-step reasoning, deeper concepts, tricky applications.
   - Mixed = combination of Easy, Medium, and Hard.
9. Mix conceptual and application-based questions where appropriate.
10. For programming topics, short code snippets may be included.
11. For mathematics, create real solvable numerical/algebraic problems.
12. Keep the language simple and student-friendly.
13. Avoid unnecessary jargon.
14. Every explanation must be short and educational.
15. Explanations should normally be 1–2 sentences.
16. Questions must be factually accurate.
17. Never invent facts.
18. Do not mention that you are an AI.
19. Do not include markdown.
20. Return ONLY valid JSON.

Return EXACTLY this structure:

{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": {
        "A": "...",
        "B": "...",
        "C": "...",
        "D": "..."
      },
      "correctAnswer": "B",
      "explanation": "..."
    }
  ]
}`;
}

/*
 * Extract JSON even if the model accidentally adds
 * markdown fences or small surrounding text.
 */
function extractJson(text) {
  if (!text || typeof text !== "string") {
    return null;
  }

  const fenced = text.match(
    /```(?:json)?\s*([\s\S]*?)```/i
  );

  const candidate = fenced ? fenced[1].trim() : text.trim();

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (
    start === -1 ||
    end === -1 ||
    end <= start
  ) {
    return null;
  }

  return candidate.slice(start, end + 1);
}

/*
 * Validate the generated quiz before sending it
 * to the frontend.
 */
function validateQuiz(data) {
  if (!data || typeof data !== "object") {
    return "Response is not an object.";
  }

  if (
    !Array.isArray(data.questions) ||
    data.questions.length !== 10
  ) {
    return "Quiz must contain exactly 10 questions.";
  }

  const seenQuestions = new Set();

  for (let index = 0; index < data.questions.length; index++) {
    const q = data.questions[index];

    if (!q || typeof q !== "object") {
      return `Question ${index + 1} is invalid.`;
    }

    /*
     * Question text
     */
    if (
      typeof q.question !== "string" ||
      !q.question.trim()
    ) {
      return `Question ${index + 1} is missing its text.`;
    }

    const normalizedQuestion = q.question
      .trim()
      .toLowerCase();

    if (seenQuestions.has(normalizedQuestion)) {
      return `Duplicate question detected at question ${
        index + 1
      }.`;
    }

    seenQuestions.add(normalizedQuestion);

    /*
     * Options
     */
    if (
      !q.options ||
      typeof q.options !== "object" ||
      Array.isArray(q.options)
    ) {
      return `Question ${index + 1} is missing options.`;
    }

    const optionKeys = Object.keys(q.options);

    const requiredKeys = ["A", "B", "C", "D"];

    if (
      optionKeys.length !== 4 ||
      !requiredKeys.every((key) =>
        optionKeys.includes(key)
      )
    ) {
      return `Question ${
        index + 1
      } must have exactly options A, B, C, and D.`;
    }

    /*
     * Option values
     */
    const optionValues = requiredKeys.map((key) =>
      String(q.options[key]).trim()
    );

    if (
      optionValues.some(
        (value) => value.length === 0
      )
    ) {
      return `Question ${
        index + 1
      } contains an empty option.`;
    }

    const normalizedOptions = optionValues.map(
      (value) => value.toLowerCase()
    );

    if (
      new Set(normalizedOptions).size !== 4
    ) {
      return `Question ${
        index + 1
      } contains duplicate options.`;
    }

    /*
     * Correct answer
     */
    if (
      !["A", "B", "C", "D"].includes(
        q.correctAnswer
      )
    ) {
      return `Question ${
        index + 1
      } has an invalid correctAnswer.`;
    }

    /*
     * Explanation
     */
    if (
      typeof q.explanation !== "string" ||
      !q.explanation.trim()
    ) {
      return `Question ${
        index + 1
      } is missing an explanation.`;
    }
  }

  return null;
}

/*
 * Generate one quiz using one specific Gemini model.
 */
async function generateOnce({
  category,
  subCategory,
  topic,
  difficulty,
  avoidQuestions,
  modelName,
}) {
  const genAI = getGenAI();

  const model = genAI.getGenerativeModel({
    model: modelName,

    generationConfig: {
      responseMimeType: "application/json",

      /*
       * Slightly controlled creativity.
       * This helps maintain consistency for educational quizzes.
       */
      temperature: 0.7,
    },
  });

  const prompt = buildPrompt({
    category,
    subCategory,
    topic,
    difficulty,
    avoidQuestions,
  });

  const result = await model.generateContent(prompt);

  const response = result.response;

  if (!response) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  const rawText = response.text();

  if (!rawText) {
    throw new Error(
      "Gemini returned empty response text."
    );
  }

  const jsonText = extractJson(rawText);

  if (!jsonText) {
    throw new Error(
      "No valid JSON object found in AI response."
    );
  }

  let parsed;

  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new Error(
      `AI response was not valid JSON: ${error.message}`
    );
  }

  const validationError = validateQuiz(parsed);

  if (validationError) {
    throw new Error(
      `Invalid quiz structure: ${validationError}`
    );
  }

  /*
   * Normalize the response before sending it
   * to the frontend.
   */
  parsed.topic =
    typeof parsed.topic === "string"
      ? parsed.topic.trim()
      : topic;

  parsed.difficulty =
    VALID_DIFFICULTIES.includes(
      parsed.difficulty
    )
      ? parsed.difficulty
      : difficulty;

  parsed.questions = parsed.questions.map(
    (q, index) => ({
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
    })
  );

  return parsed;
}

/*
 * Determine whether an error is temporary and worth retrying.
 *
 * Google recommends exponential backoff for transient
 * errors such as 503 and 429.
 */
function isRetryableError(error) {
  const message = String(
    error?.message || error || ""
  ).toLowerCase();

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

/*
 * Generate with retry + exponential backoff.
 *
 * Attempt 1 -> immediate
 * Attempt 2 -> waits ~1 second
 *
 * We intentionally keep this short because Vercel
 * has a function execution limit.
 */
async function generateWithRetry({
  category,
  subCategory,
  topic,
  difficulty,
  avoidQuestions,
  modelName,
}) {
  let lastError = null;

  for (
    let attempt = 0;
    attempt <= MAX_RETRIES_PER_MODEL;
    attempt++
  ) {
    try {
      return await generateOnce({
        category,
        subCategory,
        topic,
        difficulty,
        avoidQuestions,
        modelName,
      });
    } catch (error) {
      lastError = error;

      console.warn(
        `Gemini request failed | model=${modelName} | attempt=${
          attempt + 1
        }/${MAX_RETRIES_PER_MODEL + 1} | message=${
          error?.message || error
        }`
      );

      /*
       * If the error is not temporary, don't waste time
       * retrying the same request.
       */
      if (!isRetryableError(error)) {
        throw error;
      }

      /*
       * No retry after the final attempt.
       */
      if (attempt >= MAX_RETRIES_PER_MODEL) {
        throw error;
      }

      /*
       * Exponential backoff with small jitter.
       *
       * First retry is roughly 1–1.5 seconds later.
       */
      const baseDelay =
        1000 * Math.pow(2, attempt);

      const jitter = Math.floor(
        Math.random() * 500
      );

      const delay = baseDelay + jitter;

      console.warn(
        `Retrying model=${modelName} after ${delay}ms`
      );

      await sleep(delay);
    }
  }

  throw lastError || new Error(
    "Gemini generation failed."
  );
}

/*
 * Vercel Serverless Function
 */
module.exports = async (req, res) => {
  /*
   * CORS
   */
  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  /*
   * Handle browser preflight request.
   */
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  /*
   * Only POST is supported.
   */
  if (req.method !== "POST") {
    res.status(405).json({
      error: "method-not-allowed",
      message: "Use POST for quiz generation.",
    });

    return;
  }

  try {
    /*
     * Read request body safely.
     */
    const body =
      req.body &&
      typeof req.body === "object"
        ? req.body
        : {};

    const category =
      typeof body.category === "string"
        ? body.category.trim()
        : "";

    const subCategory =
      typeof body.subCategory === "string"
        ? body.subCategory.trim()
        : "";

    const topic =
      typeof body.topic === "string"
        ? body.topic.trim()
        : "";

    const difficulty =
      VALID_DIFFICULTIES.includes(
        body.difficulty
      )
        ? body.difficulty
        : "Medium";

    const avoidQuestions =
      Array.isArray(body.previousQuestions)
        ? body.previousQuestions
            .filter(
              (q) => typeof q === "string"
            )
            .map((q) => q.trim())
            .filter(Boolean)
        : [];

    /*
     * Topic is required.
     */
    if (!topic) {
      res.status(400).json({
        error: "invalid-argument",
        message:
          "A topic is required to generate a quiz.",
      });

      return;
    }

    /*
     * Make sure the API key exists before attempting
     * any model request.
     */
    if (!process.env.GEMINI_API_KEY) {
      console.error(
        "GEMINI_API_KEY is missing from server environment."
      );

      res.status(500).json({
        error: "configuration-error",
        message:
          "Quiz service is not configured correctly on the server.",
      });

      return;
    }

    let lastError = null;

    /*
     * Try models one by one.
     *
     * If one model is temporarily overloaded,
     * the next model gets a chance.
     */
    for (const modelName of MODEL_CANDIDATES) {
      try {
        console.log(
          `Attempting quiz generation with model=${modelName}`
        );

        const quiz =
          await generateWithRetry({
            category,
            subCategory,
            topic,
            difficulty,
            avoidQuestions,
            modelName,
          });

        console.log(
          `Quiz generated successfully with model=${modelName}`
        );

        res.status(200).json(quiz);
        return;
      } catch (error) {
        lastError = error;

        console.warn(
          `Model failed: ${modelName} | ${
            error?.message || error
          }`
        );

        /*
         * Continue to the next model.
         */
        continue;
      }
    }

    /*
     * All models failed.
     */
    console.error(
      "generateQuiz: all Gemini model attempts failed.",
      lastError?.message || lastError
    );

    /*
     * Do not expose internal Gemini error details
     * to students.
     */
    res.status(503).json({
      error: "service-unavailable",
      message:
        "Quiz generation is temporarily unavailable. Please try again in a moment.",
    });

    return;
  } catch (error) {
    /*
     * Final unexpected error handler.
     */
    console.error(
      "generateQuiz: unexpected server error:",
      error?.message || error
    );

    res.status(500).json({
      error: "internal",
      message:
        "Unable to generate the quiz right now. Please try again.",
    });
  }
};
EOF