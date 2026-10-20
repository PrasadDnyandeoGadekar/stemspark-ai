import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity, ArrowRight, Award, BarChart3, Bookmark, BookOpen, BrainCircuit,
  Check, CheckCircle2, Clock3, Flame, GraduationCap, LayoutDashboard,
  LogOut, Play, Plus, Sparkles, Target, Trophy, TrendingUp, X,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../utils/firebase";
import { courseCategories } from "../data/courseDatabase";
import { verifiedCourses } from "../data/verifiedCourses";
import {
  getActiveDaysInWeek,
  getCurrentStreak,
  getLearningData,
  getQuizHistory,
  getRecentStudyDays,
  recordCourseVisit,
  recordCourseProgress,
  updateStudyGoals,
} from "../services/learningData";
import QuizFormattedText from "../components/quiz/QuizFormattedText";

const COURSE_TABS = ["In Progress", "Completed", "Saved", "Recently Viewed"];
const ACTIVITY_RANGES = [7, 30];
const courseById = new Map(verifiedCourses.map((course) => [course.id, course]));
const categoryNames = new Map(courseCategories.map(({ name }) => [name, name]));

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">{eyebrow}</p>}
        <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail, tone = "indigo" }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    sky: "bg-sky-50 text-sky-700",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        {detail && <span className="text-right text-xs font-medium text-slate-500">{detail}</span>}
      </div>
      <p className="mt-4 text-2xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
      <Icon className="mx-auto h-9 w-9 text-slate-300" aria-hidden="true" />
      <h3 className="mt-3 font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{text}</p>
      {action}
    </div>
  );
}

function ProgressBar({ value, className = "" }) {
  return (
    <div
      className={`h-2 overflow-hidden rounded-full bg-slate-100 ${className}`}
      role="progressbar"
      aria-label="Explicitly recorded course progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <div className="h-full rounded-full bg-indigo-600 transition-[width]" style={{ width: `${value}%` }} />
    </div>
  );
}

function ActivityChart({ days, range, onRangeChange }) {
  const max = Math.max(60, ...days.map(({ seconds }) => seconds));
  const points = days.map(({ seconds }, index) => {
    const x = days.length === 1 ? 50 : (index / (days.length - 1)) * 100;
    const y = 94 - (seconds / max) * 78;
    return `${x},${y}`;
  }).join(" ");
  const totalMinutes = Math.round(days.reduce((sum, day) => sum + day.seconds, 0) / 60);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">Recorded focused time</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{totalMinutes} <span className="text-sm font-semibold text-slate-500">min</span></p>
        </div>
        <div className="inline-flex rounded-lg bg-slate-100 p-1" aria-label="Activity chart range">
          {ACTIVITY_RANGES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={range === value}
              onClick={() => onRangeChange(value)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold ${range === value ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}
            >
              {value}d
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-36 w-full overflow-visible" role="img" aria-label={`Learning activity during the last ${range} days`}>
          <defs>
            <linearGradient id="activity-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity=".22" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="94" x2="100" y2="94" stroke="#e2e8f0" strokeWidth=".7" />
          <polyline points={`0,94 ${points} 100,94`} fill="url(#activity-fill)" stroke="none" />
          <polyline points={points} fill="none" stroke="#4f46e5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="mt-2 grid grid-cols-7 text-center text-[10px] font-medium text-slate-400">
          {days.filter((_, index) => range === 7 || index % 4 === 0 || index === days.length - 1).map((day) => (
            <span key={day.date} className="truncate">{new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" })}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityCalendar({ days, dailyGoalMinutes }) {
  const goalSeconds = dailyGoalMinutes * 60;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-950">28-day activity calendar</h3>
          <p className="mt-1 text-xs text-slate-500">Each square shows recorded focused study time for that day.</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400" aria-hidden="true">
          <span>Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
            <span key={intensity} className={`h-3 w-3 rounded-sm ${intensity === 0 ? "bg-slate-100" : intensity < 0.5 ? "bg-indigo-200" : intensity < 1 ? "bg-indigo-400" : "bg-indigo-700"}`} />
          ))}
          <span>More</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2" role="group" aria-label="Study activity for the last 28 days">
        {days.map(({ date, seconds }) => {
          const intensity = goalSeconds > 0 ? Math.min(1, seconds / goalSeconds) : 0;
          const color = !seconds ? "bg-slate-100" : intensity < 0.25 ? "bg-indigo-200" : intensity < 0.75 ? "bg-indigo-400" : "bg-indigo-700";
          return (
            <span
              key={date}
              title={`${date}: ${Math.floor(seconds / 60)} focused minutes`}
              aria-label={`${date}: ${Math.floor(seconds / 60)} focused minutes`}
              className={`aspect-square rounded-md ${color}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dataState, setDataState] = useState(() => ({ userId: user?.uid || null, value: getLearningData(user?.uid) }));
  const data = dataState.userId === (user?.uid || null) ? dataState.value : getLearningData(user?.uid);
  const [tab, setTab] = useState(COURSE_TABS[0]);
  const [activityRange, setActivityRange] = useState(7);
  const [expandedAttempt, setExpandedAttempt] = useState(null);
  const [tutorConversation, setTutorConversation] = useState(null);
  const [tutorLoading, setTutorLoading] = useState(true);
  const [goalInputState, setGoalInputState] = useState({ userId: user?.uid || null, value: data.dailyGoalMinutes });
  const goalInput = goalInputState.userId === (user?.uid || null) ? goalInputState.value : data.dailyGoalMinutes;
  const [weeklyGoalInputState, setWeeklyGoalInputState] = useState({ userId: user?.uid || null, value: data.weeklyGoalDays });
  const weeklyGoalInput = weeklyGoalInputState.userId === (user?.uid || null) ? weeklyGoalInputState.value : data.weeklyGoalDays;
  const [saveError, setSaveError] = useState("");

  const refreshData = useCallback(() => {
    const next = getLearningData(user?.uid);
    setDataState({ userId: user?.uid || null, value: next });
    setGoalInputState({ userId: user?.uid || null, value: next.dailyGoalMinutes });
    setWeeklyGoalInputState({ userId: user?.uid || null, value: next.weeklyGoalDays });
  }, [user?.uid]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === `stemspark_learning_v1:${user?.uid || "guest"}`) refreshData();
    };
    const onUpdated = (event) => {
      if (!event.detail?.userId || event.detail.userId === (user?.uid || null)) refreshData();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("stemspark-learning-data-updated", onUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("stemspark-learning-data-updated", onUpdated);
    };
  }, [refreshData, user?.uid]);

  useEffect(() => {
    let cancelled = false;
    async function loadTutorHistory() {
      setTutorLoading(true);
      if (!user?.uid) {
        setTutorConversation(null);
        setTutorLoading(false);
        return;
      }
      try {
        const snapshot = await getDoc(doc(db, "chats", user.uid));
        const messages = snapshot.exists() && Array.isArray(snapshot.data().messages)
          ? snapshot.data().messages
          : [];
        if (!cancelled) {
          const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
          setTutorConversation(lastUserMessage
            ? { messages, preview: lastUserMessage.content, updatedAt: snapshot.data().updatedAt || null }
            : null);
        }
      } catch (error) {
        console.error("Could not load saved AI Tutor conversation:", error);
        if (!cancelled) setTutorConversation(null);
      } finally {
        if (!cancelled) setTutorLoading(false);
      }
    }
    loadTutorHistory();
    return () => { cancelled = true; };
  }, [user?.uid]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const attempts = getQuizHistory(user?.uid);
  const startedCourses = Object.values(data.courses).filter((course) => course.startedAt);
  const completedCourses = startedCourses.filter((course) => course.progress >= 100);
  const inProgressCourses = startedCourses.filter((course) => (course.progress || 0) < 100);
  const overallProgress = startedCourses.length
    ? Math.round(startedCourses.reduce((sum, course) => sum + (course.progress || 0), 0) / startedCourses.length)
    : 0;
  const averageScore = attempts.length
    ? Math.round(attempts.reduce((sum, attempt) => sum + (Number(attempt.score) || 0), 0) / attempts.length * 10) / 10
    : 0;
  const bestScore = attempts.length ? Math.max(...attempts.map((attempt) => Number(attempt.score) || 0)) : 0;
  const totalCorrect = attempts.reduce((sum, attempt) => sum + (Number(attempt.score) || 0), 0);
  const totalQuestions = attempts.reduce((sum, attempt) => sum + (Number(attempt.totalQuestions) || 0), 0);
  const accuracy = totalQuestions ? Math.round(totalCorrect / totalQuestions * 100) : 0;
  const streak = getCurrentStreak(data);
  const activeDays = getActiveDaysInWeek(data);
  const today = new Date().toISOString().slice(0, 10);
  const todayMinutes = Math.floor((Number(data.studyByDay[today]) || 0) / 60);
  const activityDays = getRecentStudyDays(data, activityRange);
  const calendarDays = getRecentStudyDays(data, 28);
  const recentCourses = data.recentCourseIds
    .map((id) => ({ ...courseById.get(id), ...data.courses[id] }))
    .filter((course) => course?.id)
    .slice(0, 4);
  const courseTabItems = (() => {
    if (tab === "In Progress") {
      return inProgressCourses.map((item) => ({ ...courseById.get(item.courseId), ...item })).filter((item) => item.id);
    }
    if (tab === "Completed") {
      return completedCourses.map((item) => ({ ...courseById.get(item.courseId), ...item })).filter((item) => item.id);
    }
    if (tab === "Saved") {
      return data.savedCourseIds.map((id) => ({ ...courseById.get(id), ...data.courses[id] })).filter((item) => item.id);
    }
    return recentCourses;
  })();

  const topicStats = (() => {
    const byTopic = new Map();
    for (const attempt of attempts) {
      const topic = (attempt.topic || "General").trim();
      const stat = byTopic.get(topic) || { topic, correct: 0, total: 0, attempts: 0, lastDate: attempt.date };
      stat.correct += Number(attempt.score) || 0;
      stat.total += Number(attempt.totalQuestions) || 0;
      stat.attempts += 1;
      byTopic.set(topic, stat);
    }
    return [...byTopic.values()]
      .map((item) => ({ ...item, mastery: item.total ? Math.round(item.correct / item.total * 100) : 0 }))
      .sort((a, b) => a.mastery - b.mastery);
  })();
  const weakestTopic = topicStats[0];
  const strongestTopic = [...topicStats].sort((a, b) => b.mastery - a.mastery)[0];
  const distribution = (() => {
    const counts = new Map();
    for (const course of startedCourses) {
      const category = course.category || "Other";
      counts.set(category, (counts.get(category) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  })();
  const scoreTrend = [...attempts].slice(0, 10).reverse();
  const completionDays = activityDays.map(({ date }) => ({
    date,
    count: startedCourses.filter((course) =>
      course.completedAt && new Date(course.completedAt).toISOString().slice(0, 10) === date,
    ).length,
  }));
  const maxCompletions = Math.max(1, ...completionDays.map(({ count }) => count));

  const matchingCourses = (topic) => verifiedCourses.filter((course) =>
    `${course.title} ${course.subCategory} ${course.category}`.toLowerCase().includes(topic.toLowerCase()),
  );
  const nextCourse = weakestTopic
    ? matchingCourses(weakestTopic.topic).find((course) => !data.courses[course.id]?.progress)
    : recentCourses[0] || verifiedCourses.find((course) => !data.courses[course.id]?.progress);

  const updateProgress = (item) => {
    const enteredProgress = window.prompt(
      `Enter your completed course percentage (1–100). Current recorded progress: ${item.progress || 0}%`,
      String(item.progress || 0),
    );
    if (enteredProgress === null) return;
    const nextProgress = Number(enteredProgress);
    if (!Number.isFinite(nextProgress) || nextProgress < Math.max(1, item.progress || 0) || nextProgress > 100) {
      setSaveError(`Enter a percentage from ${Math.max(1, item.progress || 0)} to 100.`);
      return;
    }
    const lesson = window.prompt("Which lesson or section did you complete?");
    if (!lesson?.trim()) return;
    try {
      recordCourseProgress(user?.uid, item, nextProgress, lesson.trim());
      setSaveError("");
      refreshData();
    } catch (error) {
      setSaveError(error.message);
    }
  };

  const handleCourseOpen = (course) => {
    try {
      recordCourseVisit(user?.uid, course);
      setSaveError("");
      refreshData();
    } catch (error) {
      setSaveError(error.message);
    }
  };

  const saveGoal = () => {
    try {
      if (goalInput === "" || weeklyGoalInput === "") {
        throw new Error("Enter a value for both study goals.");
      }
      const next = updateStudyGoals(user?.uid, { dailyGoalMinutes: Number(goalInput), weeklyGoalDays: Number(weeklyGoalInput) });
      setDataState({ userId: user?.uid || null, value: next });
      setGoalInputState({ userId: user?.uid || null, value: next.dailyGoalMinutes });
      setWeeklyGoalInputState({ userId: user?.uid || null, value: next.weeklyGoalDays });
      setSaveError("");
    } catch (error) {
      setSaveError(error.message);
    }
  };

  const firstName = user?.displayName?.trim().split(/\s+/)[0] || "Student";
  const tutorLastActivity = tutorConversation?.updatedAt?.toDate
    ? tutorConversation.updatedAt.toDate()
    : tutorConversation?.updatedAt
      ? new Date(tutorConversation.updatedAt)
      : null;
  const achievements = [
    { title: "First quiz", unlocked: attempts.length >= 1, icon: Trophy },
    { title: "First lesson tracked", unlocked: startedCourses.some((course) => course.progress > 0), icon: BookOpen },
    { title: "7-day streak", unlocked: streak >= 7, icon: Flame },
    { title: "10 quizzes", unlocked: attempts.length >= 10, icon: Award },
    { title: "1 hour focused", unlocked: Object.values(data.studyByDay).reduce((sum, seconds) => sum + Number(seconds || 0), 0) >= 3600, icon: Clock3 },
  ];

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700"><LayoutDashboard aria-hidden="true" /></div>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-950">Your learning, in one place</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to see your personal progress, saved courses, quiz results and study goals.</p>
          <Link to="/login" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700">Sign in <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <header className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-lg sm:px-9 sm:py-9">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {user.photoURL
                ? <img src={user.photoURL} alt="" className="h-14 w-14 rounded-2xl border border-white/20 object-cover" referrerPolicy="no-referrer" />
                : <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold">{firstName[0]}</div>}
              <div>
                <p className="text-sm font-semibold text-indigo-200">YOUR LEARNING DASHBOARD</p>
                <h1 className="mt-1 text-2xl font-black sm:text-3xl">Welcome back, {firstName}</h1>
                <p className="mt-1 text-sm text-slate-300">Your progress, practice and next steps—grounded in what you record.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/explore" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-indigo-50"><BookOpen className="h-4 w-4" /> Explore courses</Link>
              <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"><LogOut className="h-4 w-4" /> Sign out</button>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={GraduationCap} label="Courses started" value={startedCourses.length} detail={`${completedCourses.length} completed`} />
          <StatCard icon={TrendingUp} label="Recorded course progress" value={`${overallProgress}%`} detail={startedCourses.length ? "Based on your saved updates" : "No progress recorded"} tone="emerald" />
          <StatCard icon={Trophy} label="Quiz attempts" value={attempts.length} detail={attempts.length ? `${averageScore}/10 average` : "No completed quizzes"} tone="sky" />
          <StatCard icon={Flame} label="Current study streak" value={`${streak} ${streak === 1 ? "day" : "days"}`} detail={`${todayMinutes} min today`} tone="amber" />
        </div>

        <section className="mt-9">
          <SectionHeading eyebrow="Pick up where you left off" title="Continue learning" action={<Link to="/explore" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-700 hover:text-indigo-900">Find a course <ArrowRight className="h-4 w-4" /></Link>} />
          {recentCourses.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {recentCourses.slice(0, 2).map((course) => (
                <article key={course.id} className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <a href={course.url} target="_blank" rel="noopener noreferrer" onClick={() => handleCourseOpen(course)} className="w-32 shrink-0 bg-slate-100 sm:w-44" aria-label={`Resume ${course.title}`}>
                    <img src={course.thumbnail} alt="" loading="lazy" className="h-full min-h-32 w-full object-cover" />
                  </a>
                  <div className="flex min-w-0 flex-1 flex-col p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">{course.subCategory}</p>
                    <h3 className="mt-1 line-clamp-2 font-bold text-slate-950">{course.title}</h3>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">{course.lastLesson ? `Last recorded lesson: ${course.lastLesson}` : "Video watch position is not available"}</p>
                    <div className="mt-auto pt-3">
                      <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-500"><span>Recorded progress</span><span>{course.progress || 0}%</span></div>
                      <ProgressBar value={course.progress || 0} />
                      <a href={course.url} target="_blank" rel="noopener noreferrer" onClick={() => handleCourseOpen(course)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 hover:text-indigo-900">
                        <Play className="h-4 w-4" /> Resume learning
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState icon={BookOpen} title="Your learning starts here" text="Open a course from Explore; it will appear here after you choose to watch it." action={<Link to="/explore" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">Explore courses <ArrowRight className="h-4 w-4" /></Link>} />
          )}
        </section>

        <section className="mt-9">
          <SectionHeading eyebrow="Your library" title="My courses" />
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="My course lists">
            {COURSE_TABS.map((item) => (
              <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${tab === item ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200"}`}>{item}</button>
            ))}
          </div>
          {courseTabItems.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courseTabItems.slice(0, 6).map((course) => (
                <article key={course.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <a href={course.url} target="_blank" rel="noopener noreferrer" onClick={() => handleCourseOpen(course)} className="block aspect-video bg-slate-100"><img src={course.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" /></a>
                  <div className="p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">{course.category}</p>
                    <h3 className="mt-1 line-clamp-2 font-bold text-slate-950">{course.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{course.instructor} · {course.progress || 0}% recorded</p>
                    <ProgressBar value={course.progress || 0} className="mt-3" />
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <a href={course.url} target="_blank" rel="noopener noreferrer" onClick={() => handleCourseOpen(course)} className="text-sm font-bold text-indigo-700">Open course</a>
                      <button type="button" onClick={() => updateProgress(course)} disabled={(course.progress || 0) >= 100} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-default disabled:text-emerald-700">
                        {(course.progress || 0) >= 100 ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        {(course.progress || 0) >= 100 ? "Completed" : "Update progress"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState icon={tab === "Saved" ? Bookmark : BookOpen} title={tab === "Saved" ? "No saved courses yet" : `No courses ${tab === "Completed" ? "completed" : "in this list"} yet`} text={tab === "Saved" ? "Save courses from Explore using the bookmark button to build your personal library." : "Visit a course, then record your progress here. Course progress is only what you explicitly mark."} action={<Link to="/explore" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-indigo-700">Browse courses <ArrowRight className="h-4 w-4" /></Link>} />
          )}
        </section>

        <section className="mt-9">
          <SectionHeading eyebrow="Practice insights" title="AI quiz analytics" action={<Link to="/quiz" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-700">Start AI quiz <ArrowRight className="h-4 w-4" /></Link>} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Trophy} label="Completed attempts" value={attempts.length} tone="indigo" />
            <StatCard icon={Activity} label="Average score" value={attempts.length ? `${averageScore}/10` : "—"} detail={attempts.length ? `${accuracy}% accuracy` : "No quiz data yet"} tone="sky" />
            <StatCard icon={Award} label="Best score" value={attempts.length ? `${bestScore}/10` : "—"} tone="emerald" />
            <StatCard icon={CheckCircle2} label="Questions answered" value={totalQuestions} detail={`${totalCorrect} correct · ${totalQuestions - totalCorrect} incorrect`} tone="amber" />
          </div>
          <div className="mt-4 space-y-3">
            {attempts.slice(0, 5).map((attempt) => (
              <article key={attempt.id || attempt.date} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-950">{attempt.topic || "Quiz"} <span className="font-medium text-slate-400">· {attempt.difficulty || "Difficulty unavailable"}</span></h3>
                    <p className="mt-1 text-xs text-slate-500">{attempt.category || "General"}{attempt.subCategory ? ` / ${attempt.subCategory}` : ""} · {attempt.date ? new Date(attempt.date).toLocaleString() : "Date unavailable"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-indigo-700">{attempt.score}/{attempt.totalQuestions}</span>
                    {Array.isArray(attempt.questions) && <button type="button" onClick={() => setExpandedAttempt(expandedAttempt === attempt.id ? null : attempt.id)} aria-expanded={expandedAttempt === attempt.id} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">{expandedAttempt === attempt.id ? "Hide review" : "Review quiz"}</button>}
                  </div>
                </div>
                {expandedAttempt === attempt.id && (
                  <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                    {attempt.questions.map((question, index) => (
                      <div key={question.id || index} className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-400">Question {index + 1}</p>
                        <p className="mt-1 font-semibold text-slate-900"><QuizFormattedText>{question.question}</QuizFormattedText></p>
                        <p className={`mt-2 text-sm font-semibold ${question.isCorrect ? "text-emerald-700" : "text-rose-700"}`}>{question.isCorrect ? "Correct" : "Incorrect"} · Your answer: <QuizFormattedText>{question.options?.find((option) => option.key === question.selectedKey)?.text || "Unavailable"}</QuizFormattedText></p>
                        <p className="mt-1 text-sm text-slate-600">Correct answer: <QuizFormattedText>{question.options?.find((option) => option.key === question.correctKey)?.text || "Unavailable"}</QuizFormattedText></p>
                        {question.explanation && <p className="mt-2 text-sm text-slate-600"><span className="font-bold">Explanation: </span><QuizFormattedText>{question.explanation}</QuizFormattedText></p>}
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
          {attempts.length === 0 && <div className="mt-4"><EmptyState icon={Trophy} title="No quiz attempts yet" text="Complete an AI-generated quiz to see real scores, answer reviews, topic mastery and recommendations." action={<Link to="/quiz" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">Start a quiz <ArrowRight className="h-4 w-4" /></Link>} /></div>}
        </section>

        <section className="mt-9">
          <SectionHeading eyebrow="What to learn next" title="Learning intelligence" />
          {topicStats.length ? (
            <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-indigo-700" /><h3 className="font-bold text-slate-950">Topic mastery</h3></div>
                <div className="mt-4 space-y-4">
                  {topicStats.slice(0, 6).map((item) => (
                    <div key={item.topic}>
                      <div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="truncate font-semibold text-slate-700">{item.topic}</span><span className="shrink-0 font-bold text-slate-500">{item.mastery}% · {item.attempts} quiz{item.attempts === 1 ? "" : "zes"}</span></div>
                      <ProgressBar value={item.mastery} />
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-500">Mastery is correct answers divided by attempted questions in completed quizzes.</p>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
                <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-indigo-700" /><h3 className="font-bold text-slate-950">Personalized next steps</h3></div>
                <p className="mt-4 text-sm text-slate-600">Strongest topic: <strong className="text-slate-900">{strongestTopic?.topic}</strong> ({strongestTopic?.mastery}%).</p>
                <p className="mt-2 text-sm text-slate-600">Revision priority: <strong className="text-slate-900">{weakestTopic?.topic}</strong> ({weakestTopic?.mastery}%).</p>
                <button type="button" onClick={() => navigate(`/quiz?topic=${encodeURIComponent(weakestTopic.topic)}`)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Practice weak topic <ArrowRight className="h-4 w-4" /></button>
                {nextCourse && <a href={nextCourse.url} target="_blank" rel="noopener noreferrer" onClick={() => handleCourseOpen(nextCourse)} className="mt-3 flex items-center gap-3 rounded-xl border border-indigo-100 bg-white p-3 hover:border-indigo-300"><img src={nextCourse.thumbnail} alt="" className="h-14 w-20 rounded-lg object-cover" /><span className="min-w-0"><span className="block text-[10px] font-bold uppercase text-indigo-600">Recommended course</span><span className="mt-1 block line-clamp-2 text-xs font-bold text-slate-900">{nextCourse.title}</span></span></a>}
              </div>
            </div>
          ) : (
            <EmptyState icon={BrainCircuit} title="Recommendations will grow with your practice" text="Topic strength and revision suggestions appear after you finish quizzes. We don't estimate mastery before there's quiz evidence." action={<Link to="/quiz" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-indigo-700">Take your first quiz <ArrowRight className="h-4 w-4" /></Link>} />
          )}
        </section>

        <section className="mt-9">
          <SectionHeading eyebrow="Build a consistent habit" title="Study goals & streaks" />
          <div className="grid gap-4 lg:grid-cols-[.85fr_1.15fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2"><Target className="h-5 w-5 text-indigo-700" /><h3 className="font-bold text-slate-950">Daily focus goal</h3></div>
              <p className="mt-3 text-sm text-slate-500">{todayMinutes} of {data.dailyGoalMinutes} recorded minutes today</p>
              <ProgressBar value={Math.min(100, Math.round(todayMinutes / data.dailyGoalMinutes * 100))} className="mt-2" />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <label className="text-xs font-semibold text-slate-500" htmlFor="daily-goal">Minutes per day
                  <input id="daily-goal" type="number" min="5" max="600" step="5" value={goalInput} onChange={(event) => setGoalInputState({ userId: user?.uid || null, value: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-900" />
                </label>
                <label className="text-xs font-semibold text-slate-500" htmlFor="weekly-goal">Active days per week
                  <input id="weekly-goal" type="number" min="1" max="7" step="1" value={weeklyGoalInput} onChange={(event) => setWeeklyGoalInputState({ userId: user?.uid || null, value: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-900" />
                </label>
                <button type="button" onClick={saveGoal} className="col-span-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700">Save goals</button>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Current streak</p><p className="mt-1 text-xl font-black text-slate-900">{streak} days</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Active days this week</p><p className="mt-1 text-xl font-black text-slate-900">{activeDays}/{data.weeklyGoalDays}</p></div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Time counts only while this app is open on Explore, Quiz or Tutor in a visible tab.</p>
            </div>
            <ActivityChart days={activityDays} range={activityRange} onRangeChange={setActivityRange} />
          </div>
          <div className="mt-4">
            <ActivityCalendar days={calendarDays} dailyGoalMinutes={data.dailyGoalMinutes} />
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><Award className="h-5 w-5 text-amber-600" /><h3 className="font-bold text-slate-950">Achievements earned</h3></div>
            <div className="mt-4 flex flex-wrap gap-2">
              {achievements.filter((item) => item.unlocked).map(({ title, icon: Icon }) => <span key={title} className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"><Icon className="h-4 w-4" />{title}</span>)}
              {!achievements.some((item) => item.unlocked) && <p className="text-sm text-slate-500">Achievements unlock from completed quizzes, recorded course progress and actual study time.</p>}
            </div>
          </div>
        </section>

        <section className="mt-9">
          <SectionHeading eyebrow="Your learning patterns" title="Learning analytics" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-indigo-700" /><h3 className="font-bold text-slate-950">Course interests by subject</h3></div>
              {distribution.length ? <div className="mt-4 space-y-3">{distribution.map(([category, count]) => <div key={category}><div className="mb-1 flex justify-between text-xs"><span className="font-semibold text-slate-700">{categoryNames.get(category) || category}</span><span className="text-slate-500">{count} course{count === 1 ? "" : "s"}</span></div><ProgressBar value={Math.round(count / startedCourses.length * 100)} /></div>)}</div> : <p className="mt-4 text-sm text-slate-500">Subject distribution appears after you open courses.</p>}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-sm font-bold text-slate-800">Course completions · last {activityRange} days</p>
                <div className="mt-3 flex h-16 items-end gap-1" role="img" aria-label={`Course completions during the last ${activityRange} days`}>
                  {completionDays.map((day) => {
                    const count = day.count;
                    return <span key={day.date} title={`${day.date}: ${count} completed`} className={`min-w-0 flex-1 rounded-t-sm ${count ? "bg-emerald-500" : "bg-slate-100"}`} style={{ height: `${count ? Math.max(12, count / maxCompletions * 100) : 6}%` }} />;
                  })}
                </div>
                <p className="mt-2 text-xs text-slate-500">{completedCourses.length} course{completedCourses.length === 1 ? "" : "s"} explicitly marked complete from {startedCourses.length} started.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-700" /><h3 className="font-bold text-slate-950">Quiz score improvement</h3></div>
              {scoreTrend.length ? (
                <>
                  <div className="mt-5 flex h-36 items-end gap-2 border-b border-slate-200 px-1">
                    {scoreTrend.map((attempt, index) => {
                      const scorePercent = Math.max(4, (Number(attempt.score) || 0) / Math.max(1, Number(attempt.totalQuestions) || 10) * 100);
                      return <div key={attempt.id || index} className="group relative flex h-full flex-1 items-end justify-center"><span title={`${attempt.topic}: ${attempt.score}/${attempt.totalQuestions}`} className="w-full max-w-10 rounded-t-md bg-indigo-500 transition-colors group-hover:bg-indigo-700" style={{ height: `${scorePercent}%` }} /><span className="absolute -bottom-5 text-[9px] text-slate-400">{index + 1}</span></div>;
                    })}
                  </div>
                  <p className="mt-8 text-xs text-slate-500">Scores from oldest to newest completed quiz; each bar uses its recorded result.</p>
                </>
              ) : <p className="mt-4 text-sm text-slate-500">Complete a quiz to start your score trend.</p>}
            </div>
          </div>
        </section>

        <section className="mt-9">
          <SectionHeading eyebrow="Saved learning support" title="AI Tutor history" action={<Link to="/tutor" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-700">Ask AI Tutor <ArrowRight className="h-4 w-4" /></Link>} />
          {tutorLoading ? (
            <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"><div className="h-4 w-1/3 rounded bg-slate-100" /><div className="mt-3 h-3 w-2/3 rounded bg-slate-100" /></div>
          ) : tutorConversation ? (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex min-w-0 items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><BrainCircuit className="h-5 w-5" /></div><div className="min-w-0"><p className="font-bold text-slate-950">Saved Tutor conversation</p><p className="mt-1 line-clamp-2 text-sm text-slate-600">{tutorConversation.preview}</p><p className="mt-1 text-xs text-slate-400">{tutorLastActivity ? tutorLastActivity.toLocaleString() : `${tutorConversation.messages.length} saved messages`}</p></div></div>
              <Link to="/tutor" className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-50">Resume conversation <ArrowRight className="h-4 w-4" /></Link>
            </div>
          ) : (
            <EmptyState icon={BrainCircuit} title="No saved Tutor conversation yet" text="Your signed-in Tutor conversation is stored with your account. Start chatting to see the latest saved topic here." action={<Link to="/tutor" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">Open AI Tutor <ArrowRight className="h-4 w-4" /></Link>} />
          )}
        </section>

        <section className="mt-9">
          <SectionHeading eyebrow="Jump back in" title="Quick actions" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { title: "Explore courses", description: "Find a new lesson", icon: BookOpen, to: "/explore" },
              { title: "Continue learning", description: recentCourses[0]?.title || "Your recent courses", icon: Play, to: recentCourses[0]?.url || "/explore", external: Boolean(recentCourses[0]) },
              { title: "Start AI Quiz", description: "Practice a topic", icon: Trophy, to: "/quiz" },
              { title: "Ask AI Tutor", description: "Get learning help", icon: BrainCircuit, to: "/tutor" },
            ].map(({ title, description, icon: Icon, to, external }) => external ? (
              <a key={title} href={to} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-200 hover:shadow-md"><Icon className="h-5 w-5 text-indigo-700" /><p className="mt-3 font-bold text-slate-950">{title}</p><p className="mt-1 line-clamp-1 text-xs text-slate-500">{description}</p></a>
            ) : (
              <Link key={title} to={to} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-200 hover:shadow-md"><Icon className="h-5 w-5 text-indigo-700" /><p className="mt-3 font-bold text-slate-950">{title}</p><p className="mt-1 line-clamp-1 text-xs text-slate-500">{description}</p></Link>
            ))}
          </div>
        </section>

        {saveError && <div role="alert" className="mt-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"><X className="h-4 w-4" />{saveError}</div>}
        <p className="mt-8 text-center text-xs leading-5 text-slate-400">Learning progress, saved courses, goals and study time are stored locally in this browser and scoped to your account. They do not sync across devices. Quiz history created before per-account tracking may not be attributable to your account.</p>
      </div>
    </main>
  );
}

export default Dashboard;
