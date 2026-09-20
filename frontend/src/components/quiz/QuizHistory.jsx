// src/components/quiz/QuizHistory.jsx
import React from "react";
import { Trophy, Target, ListChecks, Percent } from "lucide-react";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
      <Icon className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
      <p className="text-lg font-extrabold text-gray-900">{value}</p>
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
  );
}

export default function QuizHistory({ stats }) {
  if (!stats || stats.quizzesCompleted === 0) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 mb-4">
      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={ListChecks} label="Quizzes" value={stats.quizzesCompleted} />
        <StatCard icon={Target} label="Avg Score" value={`${stats.averageScore}/10`} />
        <StatCard icon={Trophy} label="Best" value={`${stats.bestScore}/10`} />
        <StatCard icon={Percent} label="Accuracy" value={`${stats.accuracy}%`} />
      </div>
    </div>
  );
}