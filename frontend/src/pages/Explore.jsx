import React, { useState, useMemo } from 'react';
import { PlayCircle, Search, Filter, X, ChevronDown, Star } from 'lucide-react';
import { courseCategories, coursesList } from '../data/courseDatabase';

const PAGE_SIZE = 24;

// Deterministic gradient pair per-card (purely visual variety), computed from
// the course id — no randomness, no network, cannot fail.
const GRADIENTS = [
  'from-indigo-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-sky-500 to-blue-700',
  'from-violet-500 to-indigo-700',
];
function gradientFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

// Renders a real thumbnail image when one exists, and falls back to a pure
// CSS gradient + play icon (no image request at all, so it can never show a
// broken/black box) when it doesn't or when the real one fails to load.
function CourseThumbnail({ course }) {
  const hasRealThumb = typeof course.thumbnail === 'string' && course.thumbnail.startsWith('http');
  const [failed, setFailed] = useState(false);

  if (!hasRealThumb || failed) {
    return (
      <div className={`w-full h-32 sm:h-40 bg-gradient-to-br ${gradientFor(course.id)} flex items-center justify-center`}>
        <PlayCircle className="text-white w-10 h-10 opacity-90" />
      </div>
    );
  }

  return (
    <img
      src={course.thumbnail}
      alt={course.title}
      loading="lazy"
      className="w-full h-32 sm:h-40 object-cover"
      onError={() => setFailed(true)}
    />
  );
}

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LANGUAGES = ['Hindi', 'Hinglish', 'English', 'Marathi', 'Bilingual'];
const TYPES = ['Full Course', 'Tutorial', 'Playlist', 'Lecture', 'Practice', 'Crash Course', 'Certification'];

function Explore() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubCategory, setActiveSubCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLevel, setActiveLevel] = useState('All');
  const [activeLanguage, setActiveLanguage] = useState('All');
  const [activeType, setActiveType] = useState('All');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const currentSubCategories = activeCategory === 'All'
    ? []
    : courseCategories.find(c => c.name === activeCategory)?.subCategories || [];

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return coursesList.filter(course => {
      const matchCategory = activeCategory === 'All' || course.category === activeCategory;
      const matchSubCategory = activeSubCategory === 'All' || course.subCategory === activeSubCategory;
      const matchLevel = activeLevel === 'All' || course.level === activeLevel;
      const matchLanguage = activeLanguage === 'All' || course.language === activeLanguage;
      const matchType = activeType === 'All' || course.type === activeType;
      const matchFeatured = !featuredOnly || course.featured === true;

      if (!q) {
        return matchCategory && matchSubCategory && matchLevel && matchLanguage && matchType && matchFeatured;
      }

      const haystack = [
        course.title,
        course.instructor,
        course.category,
        course.subCategory,
        course.language,
        course.level,
        course.type,
        course.platform,
        course.description,
        ...(course.tags || []),
        ...(course.skills || [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchSearch = haystack.includes(q);

      return matchCategory && matchSubCategory && matchLevel && matchLanguage && matchType && matchFeatured && matchSearch;
    });
  }, [activeCategory, activeSubCategory, activeLevel, activeLanguage, activeType, featuredOnly, searchQuery]);

  const visibleCourses = filteredCourses.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCourses.length;

  const resetPaging = () => setVisibleCount(PAGE_SIZE);

  const clearAllFilters = () => {
    setActiveCategory('All');
    setActiveSubCategory('All');
    setActiveLevel('All');
    setActiveLanguage('All');
    setActiveType('All');
    setFeaturedOnly(false);
    setSearchQuery('');
    resetPaging();
  };

  const activeFilterCount = [
    activeCategory !== 'All',
    activeSubCategory !== 'All',
    activeLevel !== 'All',
    activeLanguage !== 'All',
    activeType !== 'All',
    featuredOnly
  ].filter(Boolean).length;

  const openCourse = (course) => {
    window.open(course.url, '_blank', 'noopener,noreferrer');
  };

  const FilterPill = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? 'bg-gray-900 text-white'
          : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">

      {/* Sidebar: category navigation */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 p-4 md:p-6 flex-shrink-0">
        <div className="mb-4 md:mb-8">
          <h2 className="text-xl font-bold text-gray-900 flex items-center mb-4">
            <Filter className="w-5 h-5 mr-2 text-indigo-600" />
            Catalog
          </h2>

          {/* Horizontally scrollable on mobile, stacked on desktop */}
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0">
            <button
              onClick={() => {
                setActiveCategory('All');
                setActiveSubCategory('All');
                resetPaging();
              }}
              className={`flex-shrink-0 text-left px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeCategory === 'All'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Courses
            </button>

            {courseCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setActiveCategory(cat.name);
                  setActiveSubCategory('All');
                  resetPaging();
                }}
                className={`flex-shrink-0 text-left px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeCategory === cat.name
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">

        <div className="mb-6 space-y-3">

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search title, instructor, skill, language..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                resetPaging();
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Subcategory pills */}
          {activeCategory !== 'All' && (
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              <FilterPill active={activeSubCategory === 'All'} onClick={() => { setActiveSubCategory('All'); resetPaging(); }}>
                All {activeCategory}
              </FilterPill>
              {currentSubCategories.map((sub) => (
                <FilterPill key={sub} active={activeSubCategory === sub} onClick={() => { setActiveSubCategory(sub); resetPaging(); }}>
                  {sub}
                </FilterPill>
              ))}
            </div>
          )}

          {/* Collapsible filter panel (mobile-friendly) */}
          <div>
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5">{activeFilterCount}</span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            </button>

            {filtersOpen && (
              <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4 space-y-4">

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Level</p>
                  <div className="flex flex-wrap gap-2">
                    <FilterPill active={activeLevel === 'All'} onClick={() => { setActiveLevel('All'); resetPaging(); }}>All</FilterPill>
                    {LEVELS.map((lvl) => (
                      <FilterPill key={lvl} active={activeLevel === lvl} onClick={() => { setActiveLevel(lvl); resetPaging(); }}>{lvl}</FilterPill>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Language</p>
                  <div className="flex flex-wrap gap-2">
                    <FilterPill active={activeLanguage === 'All'} onClick={() => { setActiveLanguage('All'); resetPaging(); }}>All</FilterPill>
                    {LANGUAGES.map((lang) => (
                      <FilterPill key={lang} active={activeLanguage === lang} onClick={() => { setActiveLanguage(lang); resetPaging(); }}>{lang}</FilterPill>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Type</p>
                  <div className="flex flex-wrap gap-2">
                    <FilterPill active={activeType === 'All'} onClick={() => { setActiveType('All'); resetPaging(); }}>All</FilterPill>
                    {TYPES.map((t) => (
                      <FilterPill key={t} active={activeType === t} onClick={() => { setActiveType(t); resetPaging(); }}>{t}</FilterPill>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={featuredOnly}
                      onChange={(e) => { setFeaturedOnly(e.target.checked); resetPaging(); }}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    Featured only
                  </label>

                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="flex items-center gap-1 text-sm text-red-600 font-medium hover:underline"
                    >
                      <X className="w-4 h-4" /> Clear all
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500">
            {filteredCourses.length} resource{filteredCourses.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">

          {visibleCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col"
            >
              <div
                className="relative cursor-pointer"
                onClick={() => openCourse(course)}
              >
                <CourseThumbnail course={course} />

                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <PlayCircle className="text-white w-10 h-10 sm:w-12 sm:h-12 opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all" />
                </div>

                {course.level && (
                  <span className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded">
                    {course.level}
                  </span>
                )}

                {course.featured && (
                  <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-900" /> Featured
                  </span>
                )}
              </div>

              <div className="p-3 sm:p-4 flex-1 flex flex-col">
                <p className="text-xs font-bold text-indigo-600 mb-1">
                  {course.subCategory}
                </p>

                <h3
                  className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2 text-sm sm:text-base"
                  title={course.title}
                >
                  {course.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-500 mb-2">
                  {course.instructor}
                </p>

                <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                  {course.language && (
                    <span className="text-[10px] sm:text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {course.language}
                    </span>
                  )}
                  {course.type && (
                    <span className="text-[10px] sm:text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {course.type}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredCourses.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No courses found matching your search.
            </div>
          )}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Load More ({filteredCourses.length - visibleCount} more)
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default Explore;
