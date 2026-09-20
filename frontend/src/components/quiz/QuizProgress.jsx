// src/components/quiz/QuizProgress.jsx
import React from "react";

export default function QuizProgress({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm font-semibold text-gray-500 mb-1.5">
        <span>
          Question {current} / {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div
        className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}