const QUIZ_API_URL = import.meta.env.VITE_QUIZ_API_URL;
const API_URL = import.meta.env.VITE_CODE_ARENA_API_URL
  || QUIZ_API_URL?.replace(/\/generate-quiz\/?$/, "/code-arena")
  || "https://stemspark-quiz-api.vercel.app/api/code-arena";

async function request(path, options = {}) {
  if (!API_URL) {
    throw new Error("Code Arena is not configured. Set VITE_CODE_ARENA_API_URL to your serverless endpoint.");
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      signal: options.signal || AbortSignal.timeout(35000),
    });
  } catch (error) {
    if (error.name === "TimeoutError") {
      throw new Error("The execution service took too long to respond. Try again.", { cause: error });
    }
    throw new Error("Unable to reach the execution service. Check your connection and try again.", { cause: error });
  }

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.message || "The execution service is temporarily unavailable. Try again.");
  }
  return result;
}

export async function getCodeLanguages() {
  const result = await request("?action=languages", { method: "GET" });
  if (!Array.isArray(result?.languages)) {
    throw new Error("The execution service returned an invalid language list.");
  }
  return result.languages;
}

export async function executeCode({ sourceCode, languageId, stdin }) {
  return request("", {
    method: "POST",
    body: JSON.stringify({ sourceCode, languageId, stdin }),
  });
}
