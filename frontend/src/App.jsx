import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      {/* The Navbar sits outside the Routes so it always stays on screen */}
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        
        {/* The main content area where pages will load */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;