import Donate from './pages/Donate';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Tutor from './pages/Tutor';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Global wrapper with default text colors and flex layout to stick footer to bottom */}
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">

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
    </AuthProvider>
  );
}

export default App;