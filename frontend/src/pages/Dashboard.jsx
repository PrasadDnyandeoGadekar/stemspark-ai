import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, BookOpen, Clock } from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Failsafe: If someone types /dashboard in the URL without logging in
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">Please sign in to view your dashboard.</p>
        <button 
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-sm"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Extract first name from Google Display Name
  const firstName = user.displayName ? user.displayName.split(' ')[0] : 'Student';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between mb-8">
        <div className="mb-6 sm:mb-0 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            Welcome back, {firstName}!
          </h1>
          <p className="text-indigo-100 text-lg max-w-xl">
            Your AI tutor is standing by. Review your recent sessions or start a new deep dive.
          </p>
        </div>
        
        {/* Google Profile Picture */}
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-white/30 shadow-xl object-cover"
            referrerPolicy="no-referrer" // Required to display Google images securely
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-3xl font-bold shadow-xl">
            {firstName.charAt(0)}
          </div>
        )}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Launch Tutor Card */}
        <button
          onClick={() => navigate('/tutor')}
          className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
        >
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
          <span className="text-xl font-bold text-gray-900">Launch AI Tutor</span>
          <span className="text-sm text-gray-500 mt-2">Start a new study session</span>
        </button>

        {/* Logout Card */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-red-200 transition-all group"
        >
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <LogOut className="w-8 h-8 text-red-500" />
          </div>
          <span className="text-xl font-bold text-gray-900">Log Out</span>
          <span className="text-sm text-gray-500 mt-2">Securely sign out of your account</span>
        </button>

      </div>
    </div>
  );
}

export default Dashboard;