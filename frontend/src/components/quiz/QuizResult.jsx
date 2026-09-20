// src/components/quiz/QuizResult.jsx
import React from "react";
import { PartyPopper, Check, X, RotateCcw, ListChecks, Square } from "lucide-react";
import { feedbackForScore } from "../../utils/quizUtils";

export default function QuizResult({
  topic,
  difficulty,
  score,
  total,
  onPracticeAgain,
  onReview,
  onStop,
}) {
  const wrong = total - score;
  const pct = Math.round((score / total) * 100);

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
          <PartyPopper className="w-8 h-8 text-indigo-600" />
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900">Quiz Complete!</h2>
        <p className="text-gray-500 font-medium mt-1">
          {topic} &middot; {difficulty}
        </p>

        <div className="my-6">
          <p className="text-5xl font-extrabold text-indigo-600">
            {score} / {total}
          </p>
          <p className="text-xl font-bold text-gray-400 mt-1">{pct}%</p>
        </div>

        <div className="flex justify-center gap-6 mb-6">
          <span className="flex items-center gap-1.5 text-green-600 font-bold">
            <Check className="w-5 h-5" /> {score} Correct
          </span>
          <span className="flex items-center gap-1.5 text-red-500 font-bold">
            <X className="w-5 h-5" /> {wrong} Wrong
          </span>
        </div>

        <p className="text-gray-700 bg-indigo-50 rounded-xl px-4 py-3 font-medium mb-6">
          {feedbackForScore(score)}
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onPracticeAgain}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-colors text-lg"
          >
            <RotateCcw className="w-5 h-5" /> Practice Again
          </button>
          <button
            type="button"
            onClick={onReview}
            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-indigo-300 text-gray-700 font-bold py-3.5 rounded-xl transition-colors"
          >
            <ListChecks className="w-5 h-5" /> Review Answers
          </button>
          <button
            type="button"
            onClick={onStop}
            className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 font-semibold py-2.5 rounded-xl transition-colors"
          >
            <Square className="w-4 h-4" /> Stop Practice
          </button>
        </div>
      </div>
    </div>
  );
}