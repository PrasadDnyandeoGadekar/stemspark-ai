// src/utils/quizUtils.js

const HISTORY_KEY = "stemspark_quiz_history_v1";

/** Fisher-Yates shuffle — does not mutate the input array. */
export function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Converts a raw AI quiz object (topic, difficulty, questions[]) into a
 * normalized, shuffled form the UI can render safely:
 *   {
 *     topic, difficulty,
 *     questions: [
 *       { id, question, explanation,
 *         options: [{ key: 'A'|'B'|'C'|'D', text, correct: bool }] }
 *     ]
 *   }
 * Both question order and option order are shuffled, while the correct
 * option is tracked by content (not by original letter), so shuffling is safe.
 */
export function normalizeAndShuffleQuiz(raw) {
  const questions = raw.questions.map((q) => {
    const entries = Object.entries(q.options).map(([key, text]) => ({
      key,
      text,
      correct: key === q.correctAnswer,
    }));
    const shuffledEntries = shuffleArray(entries);
    const letters = ["A", "B", "C", "D"];
    const options = shuffledEntries.map((opt, i) => ({
      key: letters[i],
      text: opt.text,
      correct: opt.correct,
    }));
    return {
      id: q.id,
      question: q.question,
      explanation: q.explanation,
      options,
    };
  });

  return {
    topic: raw.topic,
    difficulty: raw.difficulty,
    questions: shuffleArray(questions),
  };
}

/**
 * Validates the raw shape returned from the backend before we trust it.
 * Returns null if valid, or a short human-readable error string if not.
 */
export function validateQuizShape(raw) {
  if (!raw || typeof raw !== "object") return "No quiz data received.";
  if (!Array.isArray(raw.questions) || raw.questions.length !== 10) {
    return "Quiz did not contain exactly 10 questions.";
  }
  for (const q of raw.questions) {
    if (!q || typeof q.question !== "string" || !q.question.trim()) {
      return "A question is malformed.";
    }
    if (!q.options || typeof q.options !== "object") return "A question is missing options.";
    const keys = Object.keys(q.options);
    if (keys.length !== 4 || !["A", "B", "C", "D"].every((k) => keys.includes(k))) {
      return "A question does not have exactly 4 options (A-D).";
    }
    if (!["A", "B", "C", "D"].includes(q.correctAnswer)) {
      return "A question has an invalid correct answer.";
    }
  }
  return null;
}

/** Returns a friendly, encouraging feedback message for a score out of 10. */
export function feedbackForScore(score) {
  if (score >= 9) return "Excellent! You have a strong understanding of this topic.";
  if (score >= 7) return "Good job! You understand most of the concepts. Review the mistakes and try again.";
  if (score >= 5) return "You're making progress. Practice this topic again and focus on the concepts you missed.";
  return "Keep practicing. Review the basics of this topic before attempting another quiz.";
}

// ---------------------------------------------------------------------------
// localStorage-based quiz history (used until/unless the app wires this into
// a real backend — swap these three functions out later without touching UI).
// ---------------------------------------------------------------------------

export function getQuizHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQuizResult(entry) {
  try {
    const history = getQuizHistory();
    history.push({ ...entry, date: new Date().toISOString() });
    // Keep this bounded so localStorage doesn't grow forever.
    const trimmed = history.slice(-200);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage can fail (private browsing, quota) — never let this crash the quiz.
  }
}

export function getQuizStats(topic) {
  const history = topic
    ? getQuizHistory().filter((h) => h.topic === topic)
    : getQuizHistory();

  if (history.length === 0) {
    return { quizzesCompleted: 0, averageScore: 0, bestScore: 0, accuracy: 0, questionsAttempted: 0 };
  }

  const totalScore = history.reduce((sum, h) => sum + h.score, 0);
  const totalQuestions = history.reduce((sum, h) => sum + h.totalQuestions, 0);
  const bestScore = Math.max(...history.map((h) => h.score));

  return {
    quizzesCompleted: history.length,
    averageScore: Math.round((totalScore / history.length) * 10) / 10,
    bestScore,
    accuracy: totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0,
    questionsAttempted: totalQuestions,
  };
}