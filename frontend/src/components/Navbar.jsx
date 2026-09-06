import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, BookOpen, BrainCircuit } from 'lucide-react';

function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Sparkles className="h-7 w-7 text-indigo-600 mr-2" />
            <Link to="/" className="text-2xl font-extrabold text-gray-900 tracking-tight">
              STEMSpark AI
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 flex items-center font-medium transition-colors">
              <Home className="h-5 w-5 sm:mr-1.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link to="/" className="text-gray-600 hover:text-indigo-600 flex items-center font-medium transition-colors">
              <BookOpen className="h-5 w-5 sm:mr-1.5" />
              <span className="hidden sm:inline">Explore</span>
            </Link>
            <Link to="/" className="text-gray-600 hover:text-indigo-600 flex items-center font-medium transition-colors">
              <BrainCircuit className="h-5 w-5 sm:mr-1.5" />
              <span className="hidden sm:inline">AI Tutor</span>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;