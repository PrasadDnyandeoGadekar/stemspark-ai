// src/services/quizService.js
import { normalizeAndShuffleQuiz, validateQuizShape } from "../utils/quizUtils";

// Set this to your deployed Vercel API URL, e.g.
// https://stemspark-quiz-api.vercel.app/api/generate-quiz
// Stored in an env var since it's not secret (just an endpoint address) —
// the actual Gemini key lives only on Vercel's server, never here.
const API_URL = import.meta.env.VITE_QUIZ_API_URL;

/**
 * Requests a fresh 10-question quiz from the secure backend.
 *
 * @param {object} params
 * @param {string} params.category
 * @param {string} params.subCategory
 * @param {string} params.topic
 * @param {'Easy'|'Medium'|'Hard'|'Mixed'} params.difficulty
 * @param {string[]} params.previousQuestions - question texts already asked this session
 * @returns {Promise<{topic:string, difficulty:string, questions:Array}>}
 *          Already shuffled and validated, ready to render.
 * @throws {Error} with a user-friendly message on any failure.
 */
export async function generateQuiz({ category, subCategory, topic, difficulty, previousQuestions = [] }) {
  if (!API_URL) {
    throw new Error(
      "Quiz service is not configured. Set VITE_QUIZ_API_URL in your .env file."
    );
  }

  let response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, subCategory, topic, difficulty, previousQuestions }),
    });
  } catch {
    throw new Error("Network error — unable to reach the quiz service. Check your connection.");
  }

  if (!response.ok) {
    let message = "Unable to generate the quiz right now. Please try again.";
    try {
      const errBody = await response.json();
      if (errBody?.message) message = errBody.message;
    } catch {
      // response wasn't JSON — keep the default message
    }
    if (response.status === 504 || response.status === 408) {
      message = "The quiz is taking too long to generate. Please try again.";
    }
    throw new Error(message);
  }

  let raw;
  try {
    raw = await response.json();
  } catch {
    throw new Error("The quiz service returned an unexpected response. Please try again.");
  }

  const validationError = validateQuizShape(raw);
  if (validationError) {
    throw new Error("The quiz came back in an unexpected format. Please try again.");
  }

  return normalizeAndShuffleQuiz(raw);
}