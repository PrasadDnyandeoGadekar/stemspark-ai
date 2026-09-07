import React from 'react';
import { ArrowRight, Sparkles, BookOpen, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Features from '../components/Features';

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Smart routing: sends logged-in users to the dashboard, guests to login
  const handleStartLearning = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="bg-white selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Hero Section Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-32 relative">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-3xl opacity-30 pointer-events-none">
          <div className="absolute top-20 left-0 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-20 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center relative z-10">
          
          {/* Left Column: Text & Call to Action */}
          <div className="lg:col-span-6 text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-sm mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
              AI-Powered Learning
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
              Unlock Your Potential with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">STEMSpark AI</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              A personalized, adaptive educational platform designed to empower every mind. Master science, technology, engineering, and math with an AI tutor that adapts to how you learn best.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={handleStartLearning}
                className="inline-flex justify-center items-center px-8 py-4 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Start Learning Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              
              <button 
                onClick={() => navigate('/tutor')}
                className="inline-flex justify-center items-center px-8 py-4 text-base font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:border-indigo-200 hover:bg-indigo-100 rounded-xl transition-all"
              >
                Launch Tutor
              </button>
            </div>
          </div>

          {/* Right Column: Visual Features */}
          <div className="hidden lg:block lg:col-span-6 mt-16 lg:mt-0">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 relative overflow-hidden border border-indigo-100/50 shadow-sm">
              
              <div className="relative z-10 space-y-6">
                
                {/* Feature Card 1 */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white flex items-start hover:shadow-md transition-shadow">
                  <div className="bg-blue-100 p-3 rounded-xl text-blue-600 mr-5 shadow-inner">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Adaptive AI Tutor</h3>
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">Real-time guidance that adjusts to your pace and learning style.</p>
                  </div>
                </div>

                {/* Feature Card 2 */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white flex items-start transform translate-x-8 hover:shadow-md transition-shadow">
                  <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600 mr-5 shadow-inner">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Interactive Curriculum</h3>
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">Engaging lessons designed specifically for offline and online mastery.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Keeps your custom component intact */}
      <Features />
      
    </div>
  );
}

export default Home;