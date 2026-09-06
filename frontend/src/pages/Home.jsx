import React from 'react';
import { ArrowRight, Sparkles, BookOpen, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-32">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          
          {/* Left Column: Text & Call to Action */}
          <div className="lg:col-span-6 text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Learning
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Unlock Your Potential with <span className="text-indigo-600">STEMSpark AI</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              A personalized, adaptive educational platform designed to empower every mind. Master science, technology, engineering, and math with an AI tutor that adapts to how you learn best.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/" className="inline-flex justify-center items-center px-8 py-4 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg hover:shadow-indigo-200">
                Start Learning Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/" className="inline-flex justify-center items-center px-8 py-4 text-base font-bold text-indigo-600 bg-white border-2 border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl transition-all">
                Explore Courses
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Features (Hidden on small mobile screens to save space) */}
          <div className="hidden lg:block lg:col-span-6 mt-16 lg:mt-0">
            <div className="bg-indigo-50 rounded-3xl p-8 relative overflow-hidden shadow-inner">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-64 h-64 bg-indigo-200 rounded-full opacity-50 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-64 h-64 bg-blue-200 rounded-full opacity-50 blur-3xl"></div>
              
              <div className="relative z-10 space-y-6">
                {/* Feature Card 1 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100/50 flex items-start">
                  <div className="bg-blue-100 p-3 rounded-lg text-blue-600 mr-4">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Adaptive AI Tutor</h3>
                    <p className="text-gray-600 text-sm mt-1">Real-time guidance that adjusts to your pace and learning style.</p>
                  </div>
                </div>

                {/* Feature Card 2 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100/50 flex items-start transform translate-x-4">
                  <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600 mr-4">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Interactive Curriculum</h3>
                    <p className="text-gray-600 text-sm mt-1">Engaging lessons designed specifically for offline and online mastery.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Home;