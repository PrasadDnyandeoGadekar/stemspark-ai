import React from 'react';
import { BookOpen, Trophy, Clock, PlayCircle } from 'lucide-react';

function Dashboard() {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Banner */}
        <div className="bg-indigo-600 rounded-3xl p-8 sm:p-10 text-white shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
          {/* Background decorative circles */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-64 h-64 bg-indigo-500 rounded-full opacity-50 blur-3xl"></div>
          
          <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Welcome back, Student!</h1>
            <p className="text-indigo-100 text-lg">You've studied for 4 hours this week. Keep the spark alive!</p>
          </div>
          <button className="relative z-10 flex items-center bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-md">
            <PlayCircle className="w-5 h-5 mr-2" />
            Resume Learning
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Stat Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center transform hover:-translate-y-1 transition-transform">
            <div className="bg-blue-100 p-4 rounded-xl mr-4"><BookOpen className="text-blue-600 w-7 h-7" /></div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
          {/* Stat Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center transform hover:-translate-y-1 transition-transform">
            <div className="bg-amber-100 p-4 rounded-xl mr-4"><Trophy className="text-amber-600 w-7 h-7" /></div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Badges Earned</p>
              <p className="text-2xl font-bold text-gray-900">7</p>
            </div>
          </div>
          {/* Stat Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center transform hover:-translate-y-1 transition-transform">
            <div className="bg-emerald-100 p-4 rounded-xl mr-4"><Clock className="text-emerald-600 w-7 h-7" /></div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Study Hours</p>
              <p className="text-2xl font-bold text-gray-900">32</p>
            </div>
          </div>
        </div>

        {/* Continue Learning Section */}
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Continue Learning</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="bg-purple-100 p-4 rounded-xl mr-5">
                <BookOpen className="text-purple-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Applied Calculus for Robotics</h3>
                <p className="text-sm text-gray-500 mt-1">Module 3: Calculating Trajectories</p>
              </div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md">65% Completed</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
            <div className="bg-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: '65%' }}></div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;