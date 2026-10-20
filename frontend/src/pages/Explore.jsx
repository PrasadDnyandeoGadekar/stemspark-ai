import { useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Filter,
  Languages,
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { courseCategories } from "../data/courseDatabase";
import { verifiedCourses } from "../data/verifiedCourses";

const PAGE_SIZE = 12;
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Unspecified"];
const LANGUAGES = ["English", "Hindi", "Hinglish"];
const COURSE_TYPES = ["Full Course", "Tutorial", "Lecture"];
const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "title-asc", label: "Title: A to Z" },
  { value: "title-desc", label: "Title: Z to A" },
  { value: "instructor", label: "Instructor" },
];

function CourseThumbnail({ course }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-indigo-100 via-violet-100 to-sky-100">
      {!failed ? (
        <img
          src={course.thumbnail}
          alt={`${course.title} video thumbnail`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-indigo-600 to-violet-700 px-4 text-center text-white">
          <BookOpen className="h-8 w-8 opacity-90" aria-hidden="true" />
          <span className="line-clamp-2 text-sm font-semibold">{course.subCategory}</span>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/0 transition-colors group-hover:bg-slate-950/20">
        <span className="flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-white/95 text-indigo-700 opacity-0 shadow-xl transition-all group-hover:translate-y-0 group-hover:opacity-100">
          <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
        </span>
      </div>
      <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
        {course.type}
      </span>
      {course.featured && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-sm">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          Featured
        </span>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, icon: Icon }) {
  return (
    <label className="relative block min-w-0">
      <span className="sr-only">{label}</span>
      {Icon && (
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      )}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pr-9 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 ${Icon ? "pl-9" : "pl-3"}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
    </label>
  );
}

function Explore() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [level, setLevel] = useState("All");
  const [language, setLanguage] = useState("All");
  const [type, setType] = useState("All");
  const [sort, setSort] = useState("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const categories = useMemo(
    () => ["All", ...courseCategories.map(({ name }) => name).filter((name) => verifiedCourses.some((item) => item.category === name))],
    [],
  );

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    const filtered = verifiedCourses.filter((course) => {
      if (activeCategory !== "All" && course.category !== activeCategory) return false;
      if (level !== "All" && course.level !== level) return false;
      if (language !== "All" && course.language !== language) return false;
      if (type !== "All" && course.type !== type) return false;
      if (!query) return true;

      return [
        course.title,
        course.instructor,
        course.category,
        course.subCategory,
        course.language,
        course.level,
        course.type,
        course.description,
      ].some((value) => value.toLocaleLowerCase().includes(query));
    });

    if (sort === "title-asc") return filtered.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "title-desc") return filtered.sort((a, b) => b.title.localeCompare(a.title));
    if (sort === "instructor") return filtered.sort((a, b) => a.instructor.localeCompare(b.instructor));
    return filtered.sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [activeCategory, language, level, searchQuery, sort, type]);

  const visibleCourses = filteredCourses.slice(0, visibleCount);
  const activeFilterCount = [level !== "All", language !== "All", type !== "All"].filter(Boolean).length;

  const resetFilters = () => {
    setActiveCategory("All");
    setSearchQuery("");
    setLevel("All");
    setLanguage("All");
    setType("All");
    setSort("recommended");
    setVisibleCount(PAGE_SIZE);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setVisibleCount(PAGE_SIZE);
  };

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <section className="relative isolate overflow-hidden bg-slate-950">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.36),_transparent_54%),radial-gradient(ellipse_at_bottom_left,_rgba(14,165,233,0.16),_transparent_45%)]" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-indigo-100">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              FREE, HAND-VERIFIED LEARNING
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Learn something
              <span className="block bg-gradient-to-r from-indigo-300 via-violet-200 to-sky-200 bg-clip-text text-transparent">
                that moves you forward.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Explore trusted, free lessons from leading educators. Every video link and thumbnail in this collection has been checked.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-200">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                {verifiedCourses.length} verified resources
              </span>
              <span className="inline-flex items-center gap-2">
                <Languages className="h-4 w-4 text-sky-300" aria-hidden="true" />
                English, Hindi & Hinglish
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Course categories"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 py-5 scrollbar-none sm:mx-0 sm:px-0"
        >
          {categories.map((category) => {
            const count = category === "All"
              ? verifiedCourses.length
              : verifiedCourses.filter((course) => course.category === category).length;
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                aria-pressed={isActive}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                {category}
                <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </nav>

        <section aria-label="Find courses" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search courses</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                placeholder="Search courses, skills or educators..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </label>
            <div className="grid grid-cols-2 gap-3 lg:w-[23rem]">
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[11px] text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <FilterSelect
                label="Sort courses"
                value={sort}
                onChange={handleFilterChange(setSort)}
                options={SORT_OPTIONS}
                icon={ArrowDownWideNarrow}
              />
            </div>
          </div>

          {filtersOpen && (
            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
              <FilterSelect
                label="Filter by level"
                value={level}
                onChange={handleFilterChange(setLevel)}
                options={[{ value: "All", label: "All levels" }, ...LEVELS.map((item) => ({ value: item, label: item === "Unspecified" ? "Not specified" : item }))]}
              />
              <FilterSelect
                label="Filter by language"
                value={language}
                onChange={handleFilterChange(setLanguage)}
                options={[{ value: "All", label: "All languages" }, ...LANGUAGES.map((item) => ({ value: item, label: item }))]}
                icon={Languages}
              />
              <FilterSelect
                label="Filter by course type"
                value={type}
                onChange={handleFilterChange(setType)}
                options={[{ value: "All", label: "All formats" }, ...COURSE_TYPES.map((item) => ({ value: item, label: item }))]}
              />
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setLevel("All");
                    setLanguage("All");
                    setType("All");
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className="inline-flex items-center gap-1.5 justify-self-start text-sm font-semibold text-indigo-700 hover:text-indigo-900 sm:col-span-3"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Clear filters
                </button>
              )}
            </div>
          )}
        </section>

        <div className="flex flex-col gap-2 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-700">{activeCategory === "All" ? "THE LEARNING LIBRARY" : activeCategory.toUpperCase()}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {activeCategory === "All" ? "Explore free courses" : `Explore ${activeCategory}`}
            </h2>
          </div>
          <p className="text-sm text-slate-500" aria-live="polite">
            Showing <span className="font-semibold text-slate-800">{visibleCourses.length}</span> of{" "}
            <span className="font-semibold text-slate-800">{filteredCourses.length}</span> verified resources
          </p>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleCourses.map((course) => (
              <a
                key={course.id}
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Watch ${course.title} by ${course.instructor} on YouTube`}
                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/70 focus:outline-none focus:ring-4 focus:ring-indigo-200"
              >
                <CourseThumbnail course={course} />
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">{course.subCategory}</p>
                  <h3 className="mt-2 line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-950">
                    {course.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-1 text-sm text-slate-500">{course.instructor}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-600">{course.description}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                    {[course.level === "Unspecified" ? "Level not specified" : course.level, course.language].map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {tag}
                      </span>
                    ))}
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      Verified
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-semibold">
                    <span className="text-indigo-700">Watch free</span>
                    <ArrowUpRight className="h-4 w-4 text-indigo-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <Search className="mx-auto h-9 w-9 text-slate-300" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-bold text-slate-900">No courses match those filters</h3>
            <p className="mt-1 text-sm text-slate-500">Try another search or clear your filters to see more lessons.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              Clear search and filters
            </button>
          </div>
        )}

        {visibleCount < filteredCourses.length && (
          <div className="mt-9 flex flex-col items-center">
            <p className="mb-3 text-xs text-slate-500">
              {filteredCourses.length - visibleCount} more {filteredCourses.length - visibleCount === 1 ? "resource" : "resources"}
            </p>
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              Load more courses
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default Explore;
