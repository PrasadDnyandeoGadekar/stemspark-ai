const DEFAULT_JUDGE0_URL = "https://ce.judge0.com";
const MAX_SOURCE_LENGTH = 30000;
const MAX_STDIN_LENGTH = 10000;
const MAX_OUTPUT_LENGTH = 20000;
const REQUEST_TIMEOUT_MS = 8000;
const EXECUTION_TIMEOUT_MS = 30000;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 10;
const MAX_CONCURRENT_EXECUTIONS = 8;
const TERMINAL_STATUSES = new Set([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);

const rateLimits = new Map();
let cachedLanguages = null;
let languagesCachedAt = 0;
let activeExecutions = 0;

function getOriginAllowlist() {
  const configured = process.env.CODE_ARENA_ALLOWED_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const origins = new Set(configured?.length
    ? configured
    : [
      "https://stemspark-ai.web.app",
      "https://stemspark-ai.firebaseapp.com",
      "https://stemspark-frontend.vercel.app",
      "https://stemspark-frontend-stempark-ai.vercel.app",
    ]);
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:5173");
    origins.add("http://127.0.0.1:5173");
  }
  return origins;
}

function setCors(req, res) {
  const origin = req.headers?.origin;
  if (origin && !getOriginAllowlist().has(origin)) {
    res.status(403).json({ message: "This origin is not allowed to use Code Arena." });
    return false;
  }
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  return true;
}

function getClientIp(req) {
  const forwarded = req.headers?.["x-forwarded-for"];
  const firstForwarded = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return String(firstForwarded || req.socket?.remoteAddress || "unknown").trim().slice(0, 100);
}

function isRateLimited(req, method) {
  const now = Date.now();
  if (rateLimits.size > 1000) {
    for (const [key, value] of rateLimits) {
      if (now - value.startedAt > RATE_WINDOW_MS) rateLimits.delete(key);
    }
  }
  const key = `${getClientIp(req)}:${method}`;
  const limit = rateLimits.get(key);
  if (!limit || now - limit.startedAt >= RATE_WINDOW_MS) {
    rateLimits.set(key, { startedAt: now, count: 1 });
    return false;
  }
  limit.count += 1;
  return limit.count > (method === "POST" ? RATE_LIMIT : 60);
}

function getJudge0Url() {
  const baseUrl = (process.env.JUDGE0_API_URL || DEFAULT_JUDGE0_URL).replace(/\/+$/, "");
  const parsed = new URL(baseUrl);
  if (parsed.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && parsed.hostname === "localhost")) {
    throw new Error("Judge0 endpoint must use HTTPS.");
  }
  return baseUrl;
}

function getJudge0Headers() {
  const headers = { "Content-Type": "application/json" };
  const apiKey = process.env.JUDGE0_API_KEY;
  const apiHost = process.env.JUDGE0_API_HOST;
  const authToken = process.env.JUDGE0_AUTH_TOKEN;
  if (apiKey) {
    headers["X-RapidAPI-Key"] = apiKey;
    if (apiHost) headers["X-RapidAPI-Host"] = apiHost;
  }
  if (authToken) headers["X-Auth-Token"] = authToken;
  return headers;
}

async function judge0Fetch(path, options = {}) {
  let response;
  try {
    response = await fetch(`${getJudge0Url()}${path}`, {
      ...options,
      headers: { ...getJudge0Headers(), ...options.headers },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const serviceError = new Error("Unable to reach Judge0. Check the server configuration and try again.");
    serviceError.status = error.name === "TimeoutError" ? 504 : 503;
    throw serviceError;
  }
  if (!response.ok) {
    const serviceError = new Error(
      response.status === 429
        ? "Judge0 is rate limited right now. Please wait a moment and try again."
        : `Judge0 could not process the request (HTTP ${response.status}).`,
    );
    serviceError.status = response.status === 429 ? 429 : response.status >= 500 ? 503 : 502;
    throw serviceError;
  }
  try {
    return await response.json();
  } catch {
    const serviceError = new Error("Judge0 returned an invalid response.");
    serviceError.status = 502;
    throw serviceError;
  }
}

async function getLanguages() {
  if (cachedLanguages && Date.now() - languagesCachedAt < 5 * 60_000) {
    return cachedLanguages;
  }
  const languages = await judge0Fetch("/languages?base64_encoded=false");
  if (!Array.isArray(languages)) {
    const serviceError = new Error("Judge0 returned an invalid language list.");
    serviceError.status = 502;
    throw serviceError;
  }
  cachedLanguages = languages
    .filter((language) => Number.isInteger(Number(language.id)) && typeof language.name === "string")
    .map(({ id, name }) => ({ id: Number(id), name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  languagesCachedAt = Date.now();
  return cachedLanguages;
}

function parseBody(body) {
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return body && typeof body === "object" ? body : null;
}

function validateSubmission(body) {
  if (!body || typeof body.sourceCode !== "string" || !body.sourceCode.trim()) {
    return "Enter some code before running it.";
  }
  if (body.sourceCode.length > MAX_SOURCE_LENGTH) {
    return `Code must be ${MAX_SOURCE_LENGTH.toLocaleString()} characters or fewer.`;
  }
  if (body.sourceCode.includes("\0")) return "Code contains an invalid character.";
  if (!Number.isInteger(Number(body.languageId))) return "Choose a valid programming language.";
  if (body.stdin !== undefined && typeof body.stdin !== "string") return "Input must be plain text.";
  if ((body.stdin || "").length > MAX_STDIN_LENGTH) {
    return `Input must be ${MAX_STDIN_LENGTH.toLocaleString()} characters or fewer.`;
  }
  return null;
}

function trimOutput(value) {
  if (typeof value !== "string") return null;
  return value.length > MAX_OUTPUT_LENGTH
    ? `${value.slice(0, MAX_OUTPUT_LENGTH)}\n\n[Output truncated]`
    : value;
}

async function waitForResult(token) {
  const deadline = Date.now() + EXECUTION_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const result = await judge0Fetch(
      `/submissions/${encodeURIComponent(token)}?base64_encoded=false&fields=stdout,stderr,compile_output,message,status,time,memory`,
      { method: "GET" },
    );
    if (TERMINAL_STATUSES.has(Number(result.status?.id))) {
      return {
        status: result.status,
        stdout: trimOutput(result.stdout),
        stderr: trimOutput(result.stderr),
        compileOutput: trimOutput(result.compile_output),
        message: trimOutput(result.message),
        time: result.time,
        memory: result.memory,
      };
    }
  }
  const timeout = new Error("Execution took too long. The sandbox or queue did not finish in time.");
  timeout.status = 504;
  throw timeout;
}

async function handleExecution(req, res) {
  if (isRateLimited(req, "POST")) {
    return res.status(429).json({ message: "Too many runs. Please wait a minute before running more code." });
  }
  if (activeExecutions >= MAX_CONCURRENT_EXECUTIONS) {
    return res.status(429).json({ message: "Code Arena is busy right now. Please try again shortly." });
  }

  const body = parseBody(req.body);
  const validationError = validateSubmission(body);
  if (validationError) return res.status(400).json({ message: validationError });

  activeExecutions += 1;
  try {
    const languages = await getLanguages();
    const languageId = Number(body.languageId);
    if (!languages.some((language) => language.id === languageId)) {
      return res.status(400).json({ message: "That language is not available in the execution service." });
    }

    const submission = await judge0Fetch("/submissions?base64_encoded=false&wait=false", {
      method: "POST",
      body: JSON.stringify({
        source_code: body.sourceCode,
        language_id: languageId,
        stdin: body.stdin || "",
        cpu_time_limit: 5,
        cpu_extra_time: 2,
        wall_time_limit: 15,
        memory_limit: 256000,
        stack_limit: 64000,
        max_processes_and_or_threads: 60,
        max_file_size: 15000,
      }),
    });
    if (typeof submission.token !== "string" || !submission.token) {
      const serviceError = new Error("Judge0 did not create an execution job.");
      serviceError.status = 502;
      throw serviceError;
    }
    const result = await waitForResult(submission.token);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Code Arena execution failed:", error.message);
    return res.status(error.status || 503).json({
      message: error.message || "Code execution failed. Please try again.",
    });
  } finally {
    activeExecutions -= 1;
  }
}

module.exports = async (req, res) => {
  if (!setCors(req, res)) return;
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "POST" && Number(req.headers?.["content-length"]) > 50_000) {
    return res.status(413).json({ message: "The code request is too large." });
  }
  if (req.method === "GET" && new URL(req.url, "https://code-arena.local").searchParams.get("action") === "languages") {
    if (isRateLimited(req, "GET")) {
      return res.status(429).json({ message: "Too many requests. Please wait a moment and try again." });
    }
    try {
      const languages = await getLanguages();
      return res.status(200).json({ languages });
    } catch (error) {
      console.error("Code Arena language list failed:", error.message);
      return res.status(error.status || 503).json({ message: error.message });
    }
  }
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Use GET for languages or POST to run code." });
  }
  return handleExecution(req, res);
};

module.exports.validateSubmission = validateSubmission;
