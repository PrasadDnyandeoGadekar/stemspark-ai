import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Home, BookOpen, BrainCircuit, Trophy, LogIn, LogOut, LayoutDashboard, Heart, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // <-- Import the context

function Navbar() {
  const { user, logout } = useAuth(); // <-- Get user status
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const desktopViewport = window.matchMedia('(min-width: 900px)');
    const closeMenuOnDesktop = (event) => {
      if (event.matches) setMenuOpen(false);
    };
    desktopViewport.addEventListener('change', closeMenuOnDesktop);
    return () => desktopViewport.removeEventListener('change', closeMenuOnDesktop);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link to="/" className="flex min-w-0 items-center" aria-label="STEMSpark AI home">
            <Sparkles className="mr-2 h-6 w-6 shrink-0 text-indigo-600 sm:h-7 sm:w-7" />
            <span className="truncate text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
              STEMSpark AI
            </span>
          </Link>

          <div className="hidden items-center gap-3 min-[900px]:flex xl:gap-6">
            <Link to="/" className="flex items-center font-medium text-gray-600 transition-colors hover:text-indigo-600">
              <Home className="h-5 w-5 sm:mr-1.5" />
              <span>Home</span>
            </Link>
            <Link to="/explore" className="flex items-center font-medium text-gray-600 transition-colors hover:text-indigo-600">
              <BookOpen className="h-5 w-5 sm:mr-1.5" />
              <span>Explore</span>
            </Link>
            <Link to="/tutor" className="flex items-center font-medium text-gray-600 transition-colors hover:text-indigo-600">
              <BrainCircuit className="h-5 w-5 sm:mr-1.5" />
              <span>AI Tutor</span>
            </Link>
            <Link to="/quiz" className="flex items-center font-medium text-gray-600 transition-colors hover:text-indigo-600">
              <Trophy className="h-5 w-5 sm:mr-1.5" />
              <span>Quiz</span>
            </Link>
            <Link to="/donate" className="flex items-center font-bold text-rose-600 transition-colors hover:text-rose-800">
              <Heart className="h-5 w-5 sm:mr-1.5" />
              <span>Donate</span>
            </Link>
            <div className="ml-2 flex items-center gap-4 border-l border-gray-200 pl-4">
              {user ? (
                <>
                  <Link to="/dashboard" className="flex items-center font-bold text-indigo-600 transition-colors hover:text-indigo-800">
                    <LayoutDashboard className="h-5 w-5 sm:mr-1.5" />
                    <span>Dashboard</span>
                  </Link>
                  <button type="button" onClick={handleLogout} aria-label="Sign out" className="flex items-center font-medium text-gray-500 transition-colors hover:text-red-600">
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <Link to="/login" className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-100">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-[900px]:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div id="mobile-navigation" className="absolute left-0 right-0 top-full border-t border-gray-100 bg-white px-4 pb-4 pt-2 shadow-lg min-[900px]:hidden">
          <div className="mx-auto grid max-w-7xl gap-1 sm:grid-cols-2">
            <Link to="/" onClick={closeMenu} className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
              <Home className="h-5 w-5" /> Home
            </Link>
            <Link to="/explore" onClick={closeMenu} className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
              <BookOpen className="h-5 w-5" /> Explore courses
            </Link>
            <Link to="/tutor" onClick={closeMenu} className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
              <BrainCircuit className="h-5 w-5" /> AI Tutor
            </Link>
            <Link to="/quiz" onClick={closeMenu} className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
              <Trophy className="h-5 w-5" /> Quiz
            </Link>
            <Link to="/donate" onClick={closeMenu} className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 font-bold text-rose-600 hover:bg-rose-50">
              <Heart className="h-5 w-5" /> Donate
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={closeMenu} className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 font-bold text-indigo-700 hover:bg-indigo-50">
                  <LayoutDashboard className="h-5 w-5" /> Dashboard
                </Link>
                <button type="button" onClick={handleLogout} className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-left font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-700">
                  <LogOut className="h-5 w-5" /> Sign out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={closeMenu} className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 font-bold text-indigo-700 hover:bg-indigo-50">
                <LogIn className="h-5 w-5" /> Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;