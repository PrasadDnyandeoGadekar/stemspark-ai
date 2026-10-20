const QUIZ_API_URL = import.meta.env.VITE_QUIZ_API_URL;
const TUTOR_API_URL = QUIZ_API_URL?.replace(/\/generate-quiz\/?$/, "/tutor");

export async function getAITutorResponse(chatHistory, newMessage) {
  if (!TUTOR_API_URL || TUTOR_API_URL === QUIZ_API_URL) {
    throw new Error("AI Tutor is not configured. Please try again later.");
  }

  let response;
  try {
    response = await fetch(TUTOR_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory.slice(-20), message: newMessage }),
      signal: AbortSignal.timeout(55000),
    });
  } catch (error) {
    if (error.name === "TimeoutError") {
      throw new Error("AI Tutor is taking longer than usual. Please try again.", { cause: error });
    }
    throw new Error("Unable to reach AI Tutor. Check your connection and try again.", { cause: error });
  }

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.message || "AI Tutor is temporarily unavailable. Please try again.");
  }
  if (typeof result?.response !== "string" || !result.response.trim()) {
    throw new Error("AI Tutor returned an empty response. Please try again.");
  }

  return result.response;
}
