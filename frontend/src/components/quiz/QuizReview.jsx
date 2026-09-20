// src/components/quiz/QuizReview.jsx
import React from "react";
import { Check, X, ArrowLeft, RotateCcw, Square } from "lucide-react";

export default function QuizReview({ questions, answers, onBack, onPracticeAgain, onStop }) {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-gray-900">Review Answers</h2>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to result
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => {
          const studentKey = answers[i];
          const studentOpt = q.options.find((o) => o.key === studentKey);
          const correctOpt = q.options.find((o) => o.correct);
          const isCorrect = studentOpt?.correct;

          return (
            <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
              <p className="text-xs font-bold text-gray-400 mb-1">Question {i + 1}</p>
              <p className="font-bold text-gray-900 mb-3">{q.question}</p>

              <div className="text-sm space-y-1.5 mb-3">
                <p className="text-gray-600">
                  Your answer:{" "}
                  <span className={`font-semibold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                    {studentOpt ? studentOpt.text : "No answer"}
                  </span>
                </p>
                {!isCorrect && (
                  <p className="text-gray-600">
                    Correct answer: <span className="font-semibold text-green-600">{correctOpt?.text}</span>
                  </p>
                )}
              </div>

              <div
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${
                  isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                {isCorrect ? "Correct" : "Incorrect"}
              </div>

              <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                <span className="font-semibold text-gray-700">Explanation: </span>
                {q.explanation}
              </p>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 mt-6">
        <button
          type="button"
          onClick={onPracticeAgain}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-colors text-lg"
        >
          <RotateCcw className="w-5 h-5" /> Practice Again
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
  );
}