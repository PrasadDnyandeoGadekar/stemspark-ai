import React from 'react';
import { Microscope, Cpu, Wrench, Calculator } from 'lucide-react';

function Features() {
  // We store our data in an array so we can map over it cleanly
  const pillars = [
    {
      name: 'Science',
      description: 'Explore biology, chemistry, and physics through interactive, AI-driven experiments.',
      icon: <Microscope className="w-8 h-8 text-emerald-600" />,
      bgColor: 'bg-emerald-50',
    },
    {
      name: 'Technology',
      description: 'Learn coding, AI concepts, and software development from the ground up.',
      icon: <Cpu className="w-8 h-8 text-blue-600" />,
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Engineering',
      description: 'Master structural design, robotics, and real-world problem-solving.',
      icon: <Wrench className="w-8 h-8 text-amber-600" />,
      bgColor: 'bg-amber-50',
    },
    {
      name: 'Mathematics',
      description: 'Build a rock-solid foundation in logic, algebra, and advanced calculus.',
      icon: <Calculator className="w-8 h-8 text-purple-600" />,
      bgColor: 'bg-purple-50',
    }
  ];

  return (
    <div className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            The Pillars of STEM
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
            A comprehensive curriculum tailored exactly to your learning pace.
          </p>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, index) => (
            <div key={index} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className={`inline-flex p-4 rounded-xl ${pillar.bgColor} mb-4`}>
                {pillar.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{pillar.name}</h3>
              <p className="text-gray-600 leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Features;