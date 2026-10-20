import { ArrowRight, Sparkles, BookOpen, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Features from '../components/Features';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-white selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Hero Section Container */}
      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 lg:pt-28">
        
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
            
            <h1 className="mb-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-gray-900 [overflow-wrap:anywhere] sm:mb-6 sm:text-6xl lg:text-7xl">
              Unlock Your Potential with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">STEMSpark AI</span>
            </h1>
            
            <p className="mx-auto mb-7 max-w-2xl text-base leading-relaxed text-gray-600 sm:mb-10 sm:text-xl lg:mx-0">
              A personalized, adaptive educational platform designed to empower every mind. Master science, technology, engineering, and math with an AI tutor that adapts to how you learn best.
            </p>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 lg:justify-start">
              
              {/* Changed onClick to navigate directly to /explore */}
              <button 
                onClick={() => navigate('/explore')}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl sm:w-auto sm:px-8 sm:py-4"
              >
                Start Learning Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              
              <button 
                onClick={() => navigate('/tutor')}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 px-6 py-3.5 text-base font-bold text-indigo-700 transition-all hover:border-indigo-200 hover:bg-indigo-100 sm:w-auto sm:px-8 sm:py-4"
              >
                Launch Tutor
              </button>
            </div>
          </div>

          {/* Right Column: Visual Features */}
          <div className="mt-10 hidden lg:col-span-6 lg:mt-0 lg:block">
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