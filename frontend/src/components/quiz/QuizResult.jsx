// src/components/quiz/QuizResult.jsx
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
      <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center sm:p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
          <PartyPopper className="w-8 h-8 text-indigo-600" />
        </div>

        <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">Quiz Complete!</h2>
        <p className="mt-1 break-words font-medium text-gray-500">
          {topic} &middot; {difficulty}
        </p>

        <div className="my-5 sm:my-6">
          <p className="text-4xl font-extrabold text-indigo-600 sm:text-5xl">
            {score} / {total}
          </p>
          <p className="text-xl font-bold text-gray-400 mt-1">{pct}%</p>
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-x-4 gap-y-2 sm:gap-x-6">
          <span className="flex items-center gap-1.5 font-bold text-green-600">
            <Check className="w-5 h-5" /> {score} Correct
          </span>
          <span className="flex items-center gap-1.5 font-bold text-red-500">
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