import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, BookOpen, BrainCircuit, LogIn } from 'lucide-react';

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

          {/* Navigation Links & Login Button */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 flex items-center font-medium transition-colors">
              <Home className="h-5 w-5 sm:mr-1.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link to="/courses" className="text-gray-600 hover:text-indigo-600 flex items-center font-medium transition-colors">
              <BookOpen className="h-5 w-5 sm:mr-1.5" />
              <span className="hidden sm:inline">Explore</span>
            </Link>
            <Link to="/tutor" className="text-gray-600 hover:text-indigo-600 flex items-center font-medium transition-colors">
              <BrainCircuit className="h-5 w-5 sm:mr-1.5" />
              <span className="hidden sm:inline">AI Tutor</span>
            </Link>
            
            {/* Added Dashboard Link */}
            <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 flex items-center font-medium transition-colors">
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            
            {/* New Login Button */}
            <div className="pl-2 border-l border-gray-200 ml-2">
              <Link to="/login" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors">
                <LogIn className="h-4 w-4 mr-2 hidden sm:block" />
                Sign In
              </Link>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;