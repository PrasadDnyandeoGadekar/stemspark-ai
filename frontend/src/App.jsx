import Donate from './pages/Donate';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Tutor from './pages/Tutor';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import { useAuth } from './context/AuthContext';
import { recordStudyTime } from './services/learningData';

function StudySessionTracker() {
  const { user } = useAuth();
  const location = useLocation();
  const checkpointRef = useRef(0);
  const lastInteractionRef = useRef(0);
  const isStudyRoute = ['/explore', '/quiz', '/tutor'].includes(location.pathname);

  useEffect(() => {
    checkpointRef.current = Date.now();
    lastInteractionRef.current = checkpointRef.current;
    if (!isStudyRoute) return undefined;
    const sessionUserId = user?.uid;

    const flush = (includeVisibilityChange = false) => {
      const now = Date.now();
      const activeUntil = Math.min(now, lastInteractionRef.current + 60_000);
      const activeMilliseconds = Math.max(0, activeUntil - checkpointRef.current);
      const seconds = Math.floor(activeMilliseconds / 1000);
      checkpointRef.current = now;
      if (seconds > 0 && (includeVisibilityChange || document.visibilityState === 'visible')) {
        recordStudyTime(sessionUserId, seconds);
      }
    };
    const onActivity = () => {
      lastInteractionRef.current = Date.now();
    };
    const interval = window.setInterval(flush, 30_000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush(true);
      else {
        checkpointRef.current = Date.now();
        lastInteractionRef.current = checkpointRef.current;
      }
    };
    window.addEventListener('pointerdown', onActivity, { passive: true });
    window.addEventListener('keydown', onActivity);
    window.addEventListener('touchstart', onActivity, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('touchstart', onActivity);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      flush();
    };
  }, [isStudyRoute, location.pathname, user?.uid]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <StudySessionTracker />
          {/* Global wrapper with default text colors and flex layout to stick footer to bottom */}
          <div className="min-h-screen w-full min-w-0 overflow-x-clip bg-gray-50 font-sans text-gray-900 flex flex-col">

            <Navbar />

            {/* flex-grow ensures the main content stretches to push the footer down on short pages */}
            <main className="flex-grow flex flex-col relative">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/tutor" element={<Tutor />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/donate" element={<Donate />} />
                <Route path="/quiz" element={<Quiz />} />
              </Routes>
            </main>

            <Footer />

          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;