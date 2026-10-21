import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, BrainCircuit, Check, ChevronRight, Compass, Play, Sparkles, Target, Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Features from '../components/Features';
import { useAuth } from '../context/AuthContext';
import { verifiedCourses } from '../data/verifiedCourses';
import { recordCourseVisit } from '../services/learningData';

const featuredCourses = verifiedCourses.filter((course) => course.featured);

const learningSteps = [
  {
    number: '01',
    icon: Compass,
    title: 'Find your next topic',
    description: 'Explore hand-picked lessons across science, technology, engineering and mathematics.',
  },
  {
    number: '02',
    icon: BrainCircuit,
    title: 'Learn with a tutor',
    description: 'Ask questions in plain language and work through tricky ideas at your own pace.',
  },
  {
    number: '03',
    icon: Target,
    title: 'Practice until it clicks',
    description: 'Create a focused AI quiz, check your answers and decide what to learn next.',
  },
];

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCourseCategory, setActiveCourseCategory] = useState('All');
  const [activeCourseIndex, setActiveCourseIndex] = useState(0);
  const [carouselHovered, setCarouselHovered] = useState(false);
  const [carouselFocused, setCarouselFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [courseTrackingError, setCourseTrackingError] = useState('');
  const swipeStartX = useRef(null);
  const suppressSwipeClick = useRef(false);

  const courseCategories = useMemo(
    () => ['All', ...new Set(featuredCourses.map(({ category }) => category))],
    [],
  );
  const visibleFeaturedCourses = useMemo(
    () => activeCourseCategory === 'All'
      ? featuredCourses
      : featuredCourses.filter(({ category }) => category === activeCourseCategory),
    [activeCourseCategory],
  );

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(motionPreference.matches);
    updateMotionPreference();
    motionPreference.addEventListener('change', updateMotionPreference);
    return () => motionPreference.removeEventListener('change', updateMotionPreference);
  }, []);

  const changeCourse = (direction) => {
    if (visibleFeaturedCourses.length < 2) return;
    setActiveCourseIndex((index) => (
      (index + direction + visibleFeaturedCourses.length) % visibleFeaturedCourses.length
    ));
  };

  useEffect(() => {
    if (visibleFeaturedCourses.length < 2 || carouselHovered || carouselFocused || reducedMotion) return undefined;

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setActiveCourseIndex((index) => (index + 1) % visibleFeaturedCourses.length);
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activeCourseCategory, carouselFocused, carouselHovered, reducedMotion, visibleFeaturedCourses.length]);

  const handleCarouselPointerDown = (event) => {
    if (event.pointerType === 'touch') swipeStartX.current = event.clientX;
  };

  const handleCarouselPointerUp = (event) => {
    if (swipeStartX.current === null) return;
    const distance = event.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(distance) < 45) return;
    suppressSwipeClick.current = true;
    changeCourse(distance < 0 ? 1 : -1);
    window.setTimeout(() => {
      suppressSwipeClick.current = false;
    }, 0);
  };

  const handleFeaturedCourseOpen = (course) => {
    try {
      recordCourseVisit(user?.uid, course);
      setCourseTrackingError('');
    } catch (error) {
      setCourseTrackingError(error.message);
    }
  };

  return (
    <div className="home-page overflow-hidden bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-950">
      <section className="home-hero relative isolate">
        <div aria-hidden="true" className="home-orb home-orb-one" />
        <div aria-hidden="true" className="home-orb home-orb-two" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[1.04fr_.96fr] lg:gap-14 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="home-enter relative z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3.5 py-2 text-xs font-bold tracking-wide text-indigo-700 shadow-sm backdrop-blur sm:text-sm">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              A brighter way to learn STEM
            </div>
            <h1 className="mx-auto mt-6 max-w-3xl text-balance text-[clamp(2rem,8vw,3.75rem)] font-black leading-[1.04] tracking-tight text-slate-950 sm:text-6xl lg:mx-0 lg:text-7xl">
              Big questions.
              <span className="home-gradient-text block">Brilliant discoveries.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8 lg:mx-0">
              Build real understanding with trusted free lessons, a patient AI tutor and practice made for the way you learn.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4 lg:justify-start">
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="home-primary-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 sm:text-base"
              >
                Explore free courses <ArrowRight className="h-5 w-5" />
              </button>
              <Link
                to="/tutor"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-white hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 sm:text-base"
              >
                <BrainCircuit className="h-5 w-5" /> Meet your AI tutor
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-500 sm:text-sm lg:justify-start">
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" /> Free learning resources</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" /> Learn at your own pace</span>
            </div>
          </div>

          <div className="home-enter home-enter-delay relative mx-auto w-full max-w-xl lg:max-w-none" aria-label="STEMSpark learning tools preview">
            <div className="home-preview-glow absolute inset-4 rounded-[2rem] blur-2xl" aria-hidden="true" />
            <div className="home-preview relative rounded-[1.75rem] border border-white/80 bg-white/90 p-3 shadow-2xl shadow-indigo-900/10 backdrop-blur sm:rounded-[2rem] sm:p-5">
              <div className="rounded-2xl bg-slate-950 p-5 text-white sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-200"><Sparkles className="h-5 w-5" /></span>
                    <span><span className="block text-xs font-bold text-indigo-200">YOUR LEARNING SPACE</span><span className="mt-0.5 block text-sm font-extrabold">Curiosity starts here</span></span>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300">LEARN · ASK · PRACTICE</span>
                </div>
                <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.06] p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-400/15 text-sky-200"><BookOpen className="h-5 w-5" /></span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-sky-200">EXPLORE A NEW IDEA</p>
                      <p className="mt-1 text-base font-extrabold sm:text-lg">Why does the Moon have phases?</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">Start with a clear explanation, then follow your questions.</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="h-1.5 flex-1 rounded-full bg-indigo-400" />
                    <span className="h-1.5 flex-1 rounded-full bg-indigo-400/50" />
                    <span className="h-1.5 flex-1 rounded-full bg-white/10" />
                    <span className="ml-1 text-[10px] font-semibold text-slate-400">A learning path, not a race</span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3.5">
                    <div className="flex items-center gap-2 text-violet-200"><BrainCircuit className="h-4 w-4" /><span className="text-xs font-bold">AI TUTOR</span></div>
                    <p className="mt-2 text-xs leading-5 text-slate-300">Ask any question. Explore the answer together.</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3.5">
                    <div className="flex items-center gap-2 text-amber-200"><Trophy className="h-4 w-4" /><span className="text-xs font-bold">AI PRACTICE</span></div>
                    <p className="mt-2 text-xs leading-5 text-slate-300">Try a quiz and learn from every answer.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-4 sm:px-3">
                <p className="text-xs font-semibold text-slate-500">One idea at a time adds up.</p>
                <Link to="/quiz" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-extrabold text-indigo-700 transition hover:bg-indigo-50">
                  Try a practice quiz <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="home-float-card absolute -bottom-5 -left-2 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl sm:flex lg:-left-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Play className="ml-0.5 h-4 w-4 fill-current" /></span>
              <span><span className="block text-xs font-extrabold text-slate-900">Your next lesson</span><span className="mt-0.5 block text-[11px] text-slate-500">Picked by your curiosity</span></span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-courses-section border-y border-slate-100 bg-white py-14 sm:py-18 lg:py-20" aria-labelledby="featured-courses-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="home-courses-heading max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-700">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Hand-picked learning
              </span>
              <h2 id="featured-courses-title" className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Featured courses to get you started
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Explore verified lessons from trusted educators. Pick a subject and jump straight into learning.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => changeCourse(-1)}
                disabled={visibleFeaturedCourses.length < 2}
                aria-label="Show previous featured course"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-x-0.5 hover:border-indigo-300 hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => changeCourse(1)}
                disabled={visibleFeaturedCourses.length < 2}
                aria-label="Show next featured course"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:translate-x-0.5 hover:border-indigo-300 hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <Link to="/explore" className="ml-1 hidden min-h-11 items-center gap-1 rounded-lg px-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 sm:inline-flex">
                All courses <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="home-course-filters mt-6 flex gap-2 overflow-x-auto pb-2" aria-label="Filter featured courses by subject">
            {courseCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setActiveCourseCategory(category);
                  setActiveCourseIndex(0);
                }}
                aria-pressed={activeCourseCategory === category}
                className={`min-h-10 shrink-0 rounded-full px-4 py-2 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                  activeCourseCategory === category
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {visibleFeaturedCourses.length > 0 ? (
            <>
              <div
                className="home-course-carousel mt-5 overflow-hidden rounded-3xl"
                onMouseEnter={() => setCarouselHovered(true)}
                onMouseLeave={() => setCarouselHovered(false)}
                onFocusCapture={() => setCarouselFocused(true)}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setCarouselFocused(false);
                }}
                onPointerDown={handleCarouselPointerDown}
                onPointerUp={handleCarouselPointerUp}
                onPointerCancel={() => { swipeStartX.current = null; }}
                onClickCapture={(event) => {
                  if (suppressSwipeClick.current) {
                    event.preventDefault();
                    event.stopPropagation();
                    suppressSwipeClick.current = false;
                  }
                }}
                aria-label="Featured courses. Swipe to change courses; this carousel advances automatically."
              >
                <div
                  className="home-course-track flex"
                  style={{
                    width: `${visibleFeaturedCourses.length * 100}%`,
                    transform: `translateX(-${activeCourseIndex * (100 / visibleFeaturedCourses.length)}%)`,
                  }}
                >
                  {visibleFeaturedCourses.map((course, index) => {
                    const isActive = index === activeCourseIndex;
                    return (
                      <article
                        key={course.id}
                        role="group"
                        aria-hidden={!isActive}
                        aria-label={`Course ${index + 1} of ${visibleFeaturedCourses.length}`}
                        aria-roledescription="slide"
                        className="home-course-slide min-w-0 shrink-0 px-0.5 py-1"
                        inert={!isActive}
                        style={{ width: `${100 / visibleFeaturedCourses.length}%` }}
                      >
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleFeaturedCourseOpen(course)}
                          aria-label={`Start ${course.title} by ${course.instructor}`}
                          className="home-course-card group grid h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-indigo-950/5 transition duration-300 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-indigo-400 lg:grid-cols-[1.08fr_.92fr]"
                        >
                          <div className="home-course-image relative aspect-video overflow-hidden bg-gradient-to-br from-indigo-100 via-violet-100 to-sky-100 lg:aspect-auto lg:min-h-[22rem]">
                            <img
                              src={course.thumbnail}
                              alt={`${course.title} course thumbnail`}
                              loading={isActive ? 'eager' : 'lazy'}
                              decoding="async"
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                            />
                            <span className="absolute left-4 top-4 rounded-full border border-white/40 bg-slate-950/75 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur">
                              {course.subCategory}
                            </span>
                            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 transition-colors group-hover:bg-slate-950/25">
                              <span className="flex h-14 w-14 translate-y-2 items-center justify-center rounded-full bg-white text-indigo-700 opacity-0 shadow-xl transition-all group-hover:translate-y-0 group-hover:opacity-100">
                                <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden="true" />
                              </span>
                            </span>
                          </div>
                          <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-10">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-indigo-700">
                              <span>{course.category}</span>
                              <span className="h-1 w-1 rounded-full bg-indigo-300" aria-hidden="true" />
                              <span>{course.level}</span>
                            </div>
                            <h3 className="mt-3 text-xl font-black leading-tight tracking-tight text-slate-950 sm:text-2xl lg:text-3xl">
                              {course.title}
                            </h3>
                            <p className="mt-2 text-sm font-semibold text-slate-500">{course.instructor}</p>
                            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 sm:text-base">
                              {course.description}
                            </p>
                            <span className="mt-6 inline-flex min-h-12 w-fit items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-extrabold text-white shadow-md shadow-indigo-600/20 transition group-hover:bg-indigo-700">
                              Start learning <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                            </span>
                          </div>
                        </a>
                      </article>
                    );
                  })}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2" role="group" aria-label="Choose a featured course">
                  {visibleFeaturedCourses.map((course, index) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => setActiveCourseIndex(index)}
                      aria-label={`Show course ${index + 1}: ${course.title}`}
                      aria-current={index === activeCourseIndex ? 'true' : undefined}
                      className={`h-2.5 rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                        index === activeCourseIndex ? 'w-8 bg-indigo-600' : 'w-2.5 bg-indigo-200 hover:bg-indigo-400'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs font-bold tabular-nums text-slate-500" aria-live="polite">
                  {String(activeCourseIndex + 1).padStart(2, '0')} <span className="text-slate-300">/</span> {String(visibleFeaturedCourses.length).padStart(2, '0')}
                </p>
              </div>
              {visibleFeaturedCourses.length > 1 && !reducedMotion && (
                <div className="home-course-progress mt-3" aria-hidden="true">
                  <span
                    key={`${activeCourseCategory}-${activeCourseIndex}-${carouselHovered}-${carouselFocused}`}
                    className="home-course-progress-fill"
                    style={{ animationPlayState: carouselHovered || carouselFocused ? 'paused' : 'running' }}
                  />
                </div>
              )}
            </>
          ) : (
            <p className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center font-semibold text-slate-600">
              No featured courses are available in this subject yet.
            </p>
          )}
          <p className="sr-only" role="status">
            Showing featured course {activeCourseIndex + 1} of {visibleFeaturedCourses.length}.
          </p>
          {courseTrackingError && (
            <p role="status" className="mt-2 text-sm font-medium text-rose-700">{courseTrackingError}</p>
          )}
          <Link to="/explore" className="mt-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 sm:hidden">
            Browse all courses <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="home-quick-start border-b border-slate-100 bg-gradient-to-b from-white to-indigo-50/50 py-14 sm:py-16 lg:py-20" aria-labelledby="quick-start-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Your next step
            </span>
            <h2 id="quick-start-title" className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Choose how you want to learn
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Follow a course, get help with a tough idea, or check what you know. Start in the way that works for you.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-5 lg:mt-10">
            <Link to="/explore" className="home-quick-card group rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-950/10 sm:p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white">
                <BookOpen className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-extrabold text-slate-950">Explore courses</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">Find a trusted lesson and learn at your own pace.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-indigo-700">
                Browse the library <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
            <Link to="/tutor" className="home-quick-card group rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-950/10 sm:p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-700 transition group-hover:bg-violet-600 group-hover:text-white">
                <BrainCircuit className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-extrabold text-slate-950">Ask your AI tutor</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">Get a patient explanation and work through questions step by step.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-violet-700">
                Ask a question <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
            <Link to="/quiz" className="home-quick-card group rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-950/10 sm:p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700 transition group-hover:bg-amber-500 group-hover:text-white">
                <Trophy className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-extrabold text-slate-950">Practice with a quiz</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">Turn a topic into a quick quiz and learn from every answer.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-amber-700">
                Start practicing <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50/80">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:grid-cols-3 sm:gap-8 sm:px-6 sm:py-12 lg:px-8">
          {learningSteps.map(({ number, icon: Icon, title, description }, index) => (
            <article key={number} className="home-step-card flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:block sm:border-transparent sm:bg-transparent sm:p-3 sm:shadow-none sm:hover:bg-white sm:hover:shadow-lg" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex shrink-0 items-center gap-3 sm:mb-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Icon className="h-5 w-5" /></span>
                <span className="text-xs font-black tracking-widest text-indigo-400 sm:hidden">{number}</span>
              </div>
              <div>
                <p className="hidden text-xs font-black tracking-widest text-indigo-400 sm:block">{number} / 03</p>
                <h2 className="mt-0.5 text-base font-extrabold text-slate-900 sm:mt-2 sm:text-lg">{title}</h2>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Features />

      <section className="home-closing relative isolate overflow-hidden bg-indigo-700">
        <div aria-hidden="true" className="absolute -right-20 -top-32 h-72 w-72 rounded-full bg-violet-400/30 blur-3xl" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 text-center sm:px-6 sm:py-16 lg:flex-row lg:px-8 lg:text-left">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-200">Your next discovery is waiting</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Ready to learn something new?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">Choose a course, ask a question or practice a topic. Start wherever you are.</p>
          </div>
          <Link to="/explore" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-extrabold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-white/40">
            Start exploring <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
