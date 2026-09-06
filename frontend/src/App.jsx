import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // <-- Imported the Brain
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Tutor from './pages/Tutor';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider> {/* <-- Wrapped the whole app */}
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          
          <main className="flex-grow">
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