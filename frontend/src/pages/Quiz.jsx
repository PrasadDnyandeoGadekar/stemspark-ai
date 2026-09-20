// src/pages/Quiz.jsx
import React, { useCallback, useState } from "react";
import { Loader2, AlertTriangle, RefreshCcw, ArrowLeft, Trophy } from "lucide-react";

import QuizSetup from "../components/quiz/QuizSetup";
import QuizQuestion from "../components/quiz/QuizQuestion";
import QuizResult from "../components/quiz/QuizResult";
import QuizReview from "../components/quiz/QuizReview";
import QuizHistory from "../components/quiz/QuizHistory";

import { generateQuiz } from "../services/quizService";
import { getQuizStats, saveQuizResult } from "../utils/quizUtils";

// STATES: setup | generating | quiz | result | review | error | session-summary
const STATE = {
  SETUP: "setup",
  GENERATING: "generating",
  QUIZ: "quiz",
  RESULT: "result",
  REVIEW: "review",
  ERROR: "error",
  SESSION_SUMMARY: "session-summary",
};

const LOADING_MESSAGES = [
  "Creating your quiz...",
  "Preparing 10 fresh questions...",
  "Shuffling in some new challenges...",
];

export default function Quiz() {
  const [state, setState] = useState(STATE.SETUP);
  const [setupError, setSetupError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Current practice topic/config (persists across "Practice Again" rounds)
  const [config, setConfig] = useState(null); // { category, subCategory, topic, difficulty }
  const [quiz, setQuiz] = useState(null); // { topic, difficulty, questions }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // answers[i] = selected option key

  // Tracks question text already asked this practice session, so
  // "Practice Again" doesn't repeat questions.
  const [askedQuestions, setAskedQuestions] = useState([]);

  // Tracks this continuous-practice session's rounds for the summary screen.
  const [sessionRounds, setSessionRounds] = useState([]); // [{score, total}]

  const loadQuiz = useCallback(async (cfg, previousQuestions) => {
    setState(STATE.GENERATING);
    setErrorMessage("");
    try {
      const result = await generateQuiz({
        category: cfg.category,
        subCategory: cfg.subCategory,
        topic: cfg.topic,
        difficulty: cfg.difficulty,
        previousQuestions,
      });
      setQuiz(result);
      setCurrentIndex(0);
      setAnswers([]);
      setAskedQuestions((prev) => [...prev, ...result.questions.map((q) => q.question)]);
      setState(STATE.QUIZ);
    } catch (err) {
      setErrorMessage(err.message || "Unable to generate the quiz right now. Please try again.");
      setState(STATE.ERROR);
    }
  }, []);

  const handleStart = (cfg) => {
    setConfig(cfg);
    setAskedQuestions([]);
    setSessionRounds([]);
    loadQuiz(cfg, []);
  };

  const handleAnswer = (selectedKey) => {
    const nextAnswers = [...answers, selectedKey];
    setAnswers(nextAnswers);

    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Quiz finished — calculate score and persist the result.
      const score = quiz.questions.reduce((sum, q, i) => {
        const opt = q.options.find((o) => o.key === nextAnswers[i]);
        return sum + (opt?.correct ? 1 : 0);
      }, 0);

      saveQuizResult({
        topic: quiz.topic,
        category: config.category,
        subCategory: config.subCategory,
        difficulty: quiz.difficulty,
        score,
        totalQuestions: quiz.questions.length,
      });

      setSessionRounds((prev) => [...prev, { score, total: quiz.questions.length }]);
      setState(STATE.RESULT);
    }
  };

  const currentScore = () => {
    if (!quiz) return 0;
    return quiz.questions.reduce((sum, q, i) => {
      const opt = q.options.find((o) => o.key === answers[i]);
      return sum + (opt?.correct ? 1 : 0);
    }, 0);
  };

  const handlePracticeAgain = () => {
    loadQuiz(config, askedQuestions);
  };

  const handleStop = () => {
    setState(STATE.SESSION_SUMMARY);
  };

  const handleChooseAnotherTopic = () => {
    setConfig(null);
    setQuiz(null);
    setAnswers([]);
    setAskedQuestions([]);
    setSessionRounds([]);
    setSetupError("");
    setState(STATE.SETUP);
  };

  const overallStats = getQuizStats();

  // ---------------------------------------------------------------------
  // Render per state
  // ---------------------------------------------------------------------

  if (state === STATE.SETUP) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <QuizHistory stats={overallStats} />
        <QuizSetup onStart={handleStart} initialError={setupError} />
      </div>
    );
  }

  if (state === STATE.GENERATING) {
    const msg = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-lg font-bold text-gray-900">{msg}</p>
        <p className="text-gray-500 mt-1">
          Topic: {config?.topic} &middot; {config?.difficulty}
        </p>
      </div>
    );
  }

  if (state === STATE.ERROR) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>
        <p className="text-lg font-bold text-gray-900 mb-1">Something went wrong</p>
        <p className="text-gray-500 mb-6 max-w-sm">{errorMessage}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => loadQuiz(config, askedQuestions)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl transition-colors"
          >
            <RefreshCcw className="w-4 h-4" /> Try Again
          </button>
          <button
            type="button"
            onClick={handleChooseAnotherTopic}
            className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-bold px-5 py-3 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Change Topic
          </button>
        </div>
      </div>
    );
  }

  if (state === STATE.QUIZ && quiz) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <QuizQuestion
          question={quiz.questions[currentIndex]}
          index={currentIndex}
          total={quiz.questions.length}
          onAnswer={handleAnswer}
        />
      </div>
    );
  }

  if (state === STATE.RESULT && quiz) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <QuizResult
          topic={quiz.topic}
          difficulty={quiz.difficulty}
          score={currentScore()}
          total={quiz.questions.length}
          onPracticeAgain={handlePracticeAgain}
          onReview={() => setState(STATE.REVIEW)}
          onStop={handleStop}
        />
      </div>
    );
  }

  if (state === STATE.REVIEW && quiz) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <QuizReview
          questions={quiz.questions}
          answers={answers}
          onBack={() => setState(STATE.RESULT)}
          onPracticeAgain={handlePracticeAgain}
          onStop={handleStop}
        />
      </div>
    );
  }

  if (state === STATE.SESSION_SUMMARY) {
    const attempted = sessionRounds.length;
    const totalScore = sessionRounds.reduce((s, r) => s + r.score, 0);
    const totalQuestions = sessionRounds.reduce((s, r) => s + r.total, 0);
    const avg = attempted ? Math.round((totalScore / attempted) * 10) / 10 : 0;
    const best = attempted ? Math.max(...sessionRounds.map((r) => r.score)) : 0;
    const accuracy = totalQuestions ? Math.round((totalScore / totalQuestions) * 100) : 0;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-2xl mb-4">
            <Trophy className="w-7 h-7 text-indigo-600" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-4">Practice Session Complete</h2>

          <div className="grid grid-cols-2 gap-3 text-left mb-6">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500">Quizzes Attempted</p>
              <p className="text-lg font-extrabold text-gray-900">{attempted}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500">Average Score</p>
              <p className="text-lg font-extrabold text-gray-900">{avg}/10</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500">Best Score</p>
              <p className="text-lg font-extrabold text-gray-900">{best}/10</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500">Accuracy</p>
              <p className="text-lg font-extrabold text-gray-900">{accuracy}%</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleChooseAnotherTopic}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            Choose Another Topic
          </button>
        </div>
      </div>
    );
  }

  return null;
}