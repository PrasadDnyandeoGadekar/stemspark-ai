// src/components/quiz/QuizSetup.jsx
import React, { useMemo, useState } from "react";
import { Brain, Sparkles, PenLine, ChevronRight } from "lucide-react";
import { courseCategories, coursesList } from "../../data/courseDatabase";

const DIFFICULTIES = ["Easy", "Medium", "Hard", "Mixed"];

// Derives a short list of topic suggestions for a category/subcategory from
// the existing course titles, e.g. "React — Introduction & Setup" -> "React".
function deriveTopicSuggestions(category, subCategory) {
  if (!category || !subCategory) return [];
  const matches = coursesList.filter(
    (c) => c.category === category && c.subCategory === subCategory
  );
  const cleaned = matches.map((c) => c.title.split("—")[0].trim());
  // Always include the subcategory itself as a broad topic option.
  const withSub = [subCategory, ...cleaned];
  return [...new Set(withSub)].slice(0, 10);
}

function PillButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
        active
          ? "bg-indigo-600 border-indigo-600 text-white"
          : "bg-white border-gray-300 text-gray-700 hover:border-indigo-400"
      }`}
    >
      {children}
    </button>
  );
}

export default function QuizSetup({ onStart, initialError }) {
  const [mode, setMode] = useState("browse"); // 'browse' | 'custom'
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [error, setError] = useState(initialError || "");

  const subCategories = useMemo(
    () => courseCategories.find((c) => c.name === category)?.subCategories || [],
    [category]
  );

  const topicSuggestions = useMemo(
    () => deriveTopicSuggestions(category, subCategory),
    [category, subCategory]
  );

  const handleStart = () => {
    const finalTopic = mode === "custom" ? customTopic.trim() : topic.trim();

    if (!finalTopic) {
      setError(
        mode === "custom"
          ? "Please type a topic to practice."
          : "Please select a topic (or switch to 'Enter your own topic')."
      );
      return;
    }

    setError("");
    onStart({
      category: mode === "custom" ? "" : category,
      subCategory: mode === "custom" ? "" : subCategory,
      topic: finalTopic,
      difficulty,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-2xl mb-3">
          <Brain className="w-7 h-7 text-indigo-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Quiz Practice</h1>
        <p className="text-gray-500 mt-1">
          Pick a topic and get 10 fresh AI-generated questions — practice as many rounds as you like.
        </p>
      </div>

      {/* Mode switch */}
      <div className="flex gap-2 mb-5 bg-gray-100 p-1.5 rounded-xl">
        <button
          type="button"
          onClick={() => setMode("browse")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
            mode === "browse" ? "bg-white shadow text-indigo-700" : "text-gray-500"
          }`}
        >
          Browse Categories
        </button>
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1.5 ${
            mode === "custom" ? "bg-white shadow text-indigo-700" : "text-gray-500"
          }`}
        >
          <PenLine className="w-4 h-4" /> Enter Your Own Topic
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 space-y-5">
        {mode === "browse" ? (
          <>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">1. Category</p>
              <div className="flex flex-wrap gap-2">
                {courseCategories.map((cat) => (
                  <PillButton
                    key={cat.name}
                    active={category === cat.name}
                    onClick={() => {
                      setCategory(cat.name);
                      setSubCategory("");
                      setTopic("");
                    }}
                  >
                    {cat.name}
                  </PillButton>
                ))}
              </div>
            </div>

            {category && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">2. Subcategory</p>
                <div className="flex flex-wrap gap-2">
                  {subCategories.map((sub) => (
                    <PillButton
                      key={sub}
                      active={subCategory === sub}
                      onClick={() => {
                        setSubCategory(sub);
                        setTopic("");
                      }}
                    >
                      {sub}
                    </PillButton>
                  ))}
                </div>
              </div>
            )}

            {subCategory && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">3. Topic</p>
                <div className="flex flex-wrap gap-2">
                  {topicSuggestions.map((t) => (
                    <PillButton key={t} active={topic === t} onClick={() => setTopic(t)}>
                      {t}
                    </PillButton>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Your Topic</p>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. Binary Search, Newton's Laws, DBMS Normalization..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}

        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Difficulty</p>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => (
              <PillButton key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
                {d}
              </PillButton>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-colors text-lg"
        >
          <Sparkles className="w-5 h-5" />
          Start Practice
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}