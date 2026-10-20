const STORAGE_PREFIX = "stemspark_learning_v1";
const LEGACY_QUIZ_KEY = "stemspark_quiz_history_v1";
const MAX_HISTORY = 500;

function storageKey(userId) {
  return `${STORAGE_PREFIX}:${userId || "guest"}`;
}

function emptyData() {
  return {
    courses: {},
    savedCourseIds: [],
    recentCourseIds: [],
    quizAttempts: [],
    studyByDay: {},
    dailyGoalMinutes: 30,
    weeklyGoalDays: 5,
  };
}

function normalizeData(data) {
  const base = emptyData();
  if (!data || typeof data !== "object") return base;
  return {
    ...base,
    ...data,
    courses: data.courses && typeof data.courses === "object" ? data.courses : {},
    savedCourseIds: Array.isArray(data.savedCourseIds) ? data.savedCourseIds : [],
    recentCourseIds: Array.isArray(data.recentCourseIds) ? data.recentCourseIds : [],
    quizAttempts: Array.isArray(data.quizAttempts) ? data.quizAttempts : [],
    studyByDay: data.studyByDay && typeof data.studyByDay === "object" ? data.studyByDay : {},
    dailyGoalMinutes: Number.isFinite(data.dailyGoalMinutes) ? data.dailyGoalMinutes : base.dailyGoalMinutes,
    weeklyGoalDays: Number.isFinite(data.weeklyGoalDays) ? data.weeklyGoalDays : base.weeklyGoalDays,
  };
}

export function getLearningData(userId) {
  try {
    const stored = localStorage.getItem(storageKey(userId));
    const data = normalizeData(stored ? JSON.parse(stored) : null);

    if (!userId && data.quizAttempts.length === 0) {
      const legacy = localStorage.getItem(LEGACY_QUIZ_KEY);
      if (legacy) data.quizAttempts = JSON.parse(legacy).filter((attempt) => attempt && attempt.date);
    }
    return data;
  } catch (error) {
    console.error("Could not read learning data:", error);
    return emptyData();
  }
}

function updateLearningData(userId, updater) {
  const current = getLearningData(userId);
  const updated = normalizeData(updater(current));
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("stemspark-learning-data-updated", { detail: { userId: userId || null } }));
  } catch (error) {
    console.error("Could not save learning data:", error);
    throw new Error("Your learning progress could not be saved on this device.", { cause: error });
  }
  return updated;
}

export function recordCourseVisit(userId, course) {
  const now = new Date().toISOString();
  return updateLearningData(userId, (data) => ({
    ...data,
    courses: {
      ...data.courses,
      [course.id]: {
        ...data.courses[course.id],
        courseId: course.id,
        title: course.title,
        category: course.category,
        subCategory: course.subCategory,
        instructor: course.instructor,
        thumbnail: course.thumbnail,
        url: course.url,
        lastVisitedAt: now,
        startedAt: data.courses[course.id]?.startedAt || now,
      },
    },
    recentCourseIds: [course.id, ...data.recentCourseIds.filter((id) => id !== course.id)].slice(0, 50),
  }));
}

export function recordCourseProgress(userId, course, progress, lastLesson = "") {
  if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
    throw new Error("Course progress must be a percentage from 0 to 100.");
  }
  if (!lastLesson.trim()) {
    throw new Error("Add the lesson or section you completed.");
  }
  const now = new Date().toISOString();
  const percent = Math.min(100, Math.max(0, Math.round(progress)));
  return updateLearningData(userId, (data) => ({
    ...data,
    courses: {
      ...data.courses,
      [course.id]: {
        ...data.courses[course.id],
        courseId: course.id,
        title: course.title,
        category: course.category,
        subCategory: course.subCategory,
        instructor: course.instructor,
        thumbnail: course.thumbnail,
        url: course.url,
        lastLesson: lastLesson.trim(),
        progress: Math.max(percent, data.courses[course.id]?.progress || 0),
        startedAt: data.courses[course.id]?.startedAt || now,
        lastVisitedAt: now,
        completedAt: percent === 100 ? now : data.courses[course.id]?.completedAt || null,
      },
    },
    recentCourseIds: [course.id, ...data.recentCourseIds.filter((id) => id !== course.id)].slice(0, 50),
  }));
}

export function toggleSavedCourse(userId, course) {
  return updateLearningData(userId, (data) => {
    const isSaved = data.savedCourseIds.includes(course.id);
    const courses = isSaved
      ? data.courses
      : {
          ...data.courses,
          [course.id]: {
            ...data.courses[course.id],
            courseId: course.id,
            title: course.title,
            category: course.category,
            subCategory: course.subCategory,
            instructor: course.instructor,
            thumbnail: course.thumbnail,
            url: course.url,
          },
        };
    return {
      ...data,
      courses,
      savedCourseIds: isSaved
        ? data.savedCourseIds.filter((id) => id !== course.id)
        : [course.id, ...data.savedCourseIds],
    };
  });
}

export function recordQuizAttempt(userId, attempt) {
  return updateLearningData(userId, (data) => ({
    ...data,
    quizAttempts: [{ ...attempt, id: attempt.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }, ...data.quizAttempts].slice(0, MAX_HISTORY),
  }));
}

export function updateStudyGoals(userId, { dailyGoalMinutes, weeklyGoalDays }) {
  if (!Number.isFinite(dailyGoalMinutes) || !Number.isFinite(weeklyGoalDays)) {
    throw new Error("Enter valid numbers for both study goals.");
  }
  return updateLearningData(userId, (data) => ({
    ...data,
    dailyGoalMinutes: Math.min(600, Math.max(5, Math.round(dailyGoalMinutes))),
    weeklyGoalDays: Math.min(7, Math.max(1, Math.round(weeklyGoalDays))),
  }));
}

export function recordStudyTime(userId, seconds, date = new Date()) {
  const duration = Math.max(0, Math.floor(seconds));
  if (!duration) return getLearningData(userId);
  const day = date.toISOString().slice(0, 10);
  return updateLearningData(userId, (data) => ({
    ...data,
    studyByDay: {
      ...data.studyByDay,
      [day]: (Number(data.studyByDay[day]) || 0) + duration,
    },
  }));
}

export function getRecentStudyDays(data, days = 7, now = new Date()) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(now);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - (days - index - 1));
    const key = date.toISOString().slice(0, 10);
    return { date: key, seconds: Number(data.studyByDay[key]) || 0 };
  });
}

export function getCurrentStreak(data, now = new Date()) {
  const activeDays = new Set(
    Object.entries(data.studyByDay)
      .filter(([, seconds]) => Number(seconds) > 0)
      .map(([day]) => day),
  );
  const cursor = new Date(now);
  cursor.setUTCHours(0, 0, 0, 0);
  let streak = 0;
  if (!activeDays.has(cursor.toISOString().slice(0, 10))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (activeDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export function getActiveDaysInWeek(data, now = new Date()) {
  return getRecentStudyDays(data, 7, now).filter(({ seconds }) => seconds > 0).length;
}

export function getQuizHistory(userId) {
  const data = getLearningData(userId);
  if (!userId && data.quizAttempts.length === 0) {
    try {
      return JSON.parse(localStorage.getItem(LEGACY_QUIZ_KEY) || "[]");
    } catch (error) {
      console.error("Could not read legacy quiz history:", error);
    }
  }
  return data.quizAttempts;
}
