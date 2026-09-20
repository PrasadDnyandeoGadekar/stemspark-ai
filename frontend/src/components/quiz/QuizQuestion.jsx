// src/components/quiz/QuizQuestion.jsx
import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import QuizProgress from "./QuizProgress";

export default function QuizQuestion({ question, index, total, onAnswer }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (key) => {
    if (selected) return; // prevent accidental multiple selections
    setSelected(key);
  };

  const handleNext = () => {
    if (!selected) return;
    onAnswer(selected);
    setSelected(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <QuizProgress current={index + 1} total={total} />

      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-7">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-5 leading-snug">
          {question.question}
        </h2>

        <div className="space-y-3" role="radiogroup" aria-label={`Question ${index + 1} options`}>
          {question.options.map((opt) => {
            const isSelected = selected === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelect(opt.key)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <span
                  className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {opt.key}
                </span>
                <span className="text-gray-800 font-medium">{opt.text}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={!selected}
          className={`w-full mt-6 flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-colors text-lg ${
            selected
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {index + 1 === total ? "Finish Quiz" : "Next Question"}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}