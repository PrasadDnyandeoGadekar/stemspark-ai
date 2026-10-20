const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.6-flash",
].filter((model, index, models) => models.indexOf(model) === index);
const MODEL_REQUEST_TIMEOUT_MS = 12000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 6000;
const SYSTEM_INSTRUCTION = `You are the STEMSpark AI Tutor, a friendly and patient tutor for STEM subjects. Explain concepts clearly with simple analogies, show steps for math and coding questions, and encourage the student to learn. Keep answers focused and educational.`;

function isTransientError(error) {
  return error?.name === "TimeoutError"
    || error?.name === "AbortError"
    || [408, 429, 500, 502, 503, 504].includes(Number(error?.status));
}

function buildInput(messages, message) {
  const history = messages
    .filter((item) => item && ["user", "ai", "model"].includes(item.role))
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => {
      const speaker = item.role === "user" ? "Student" : "Tutor";
      return `${speaker}: ${item.content.trim().slice(0, MAX_MESSAGE_LENGTH)}`;
    });

  history.push(`Student: ${message}`);
  return `${SYSTEM_INSTRUCTION}\n\nConversation:\n${history.join("\n\n")}\n\nTutor:`;
}

function getOutputText(interaction) {
  return (interaction.steps || [])
    .filter((step) => step.type === "model_output")
    .flatMap((step) => step.content || [])
    .filter((item) => item.type === "text" && typeof item.text === "string")
    .map((item) => item.text)
    .join("\n")
    .trim();
}

async function generateResponse(input, modelName) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Server is missing GEMINI_API_KEY.");

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({ model: modelName, input, store: false }),
    signal: AbortSignal.timeout(MODEL_REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const details = await response.json().catch(() => null);
    const error = new Error(details?.error?.message || `Gemini API returned HTTP ${response.status}.`);
    error.status = response.status;
    throw error;
  }

  const text = getOutputText(await response.json());
  if (!text) throw new Error("Gemini returned no tutor response.");
  return text;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Use POST." });

  const body = req.body || {};
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!message) return res.status(400).json({ message: "A message is required." });
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ message: "Please keep messages under 6,000 characters." });
  }
  if (messages.some((item) => item && typeof item.content !== "string")) {
    return res.status(400).json({ message: "Chat history contains an invalid message." });
  }

  const input = buildInput(messages, message);
  let lastError = null;
  for (let modelIndex = 0; modelIndex < MODEL_CANDIDATES.length; modelIndex += 1) {
    const modelName = MODEL_CANDIDATES[modelIndex];
    const attempts = modelIndex === 0 ? 2 : 1;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const response = await generateResponse(input, modelName);
        return res.status(200).json({ response });
      } catch (error) {
        lastError = error;
        console.warn(`AI Tutor model ${modelName} attempt ${attempt} failed:`, error.message);
        if (!isTransientError(error) || attempt === attempts) break;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  console.error("AI Tutor: all models failed:", lastError?.message);
  const isTransient = isTransientError(lastError);
  return res.status(isTransient ? 503 : 500).json({
    error: isTransient ? "temporarily_unavailable" : "internal",
    message: isTransient
      ? "AI Tutor is temporarily busy. Please try again in a few moments."
      : "AI Tutor could not respond right now. Please try again.",
  });
};
