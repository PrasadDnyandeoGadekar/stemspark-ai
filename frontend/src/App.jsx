import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Tutor from './pages/Tutor';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

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
              <Route path="/courses" element={<Courses />} />
              <Route path="/tutor" element={<Tutor />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>

          <Footer />
          
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;