import React from 'react';
import { BookOpen, Clock, Star, PlayCircle } from 'lucide-react';

function Courses() {
  // We store course data in an array so it is easy to update later
  const courseList = [
    {
      title: "Introduction to Quantum Computing",
      category: "Technology",
      level: "Beginner",
      duration: "4 Weeks",
      rating: "4.9",
      description: "Understand the fundamentals of qubits, superposition, and quantum algorithms without advanced math.",
      imageColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Advanced Bio-Engineering",
      category: "Science",
      level: "Advanced",
      duration: "8 Weeks",
      rating: "4.8",
      description: "Explore genetic modifications, CRISPR basics, and the ethics of modern bio-engineering.",
      imageColor: "bg-emerald-100",
      iconColor: "text-emerald-600"
    },
    {
      title: "Applied Calculus for Robotics",
      category: "Mathematics",
      level: "Intermediate",
      duration: "6 Weeks",
      rating: "4.7",
      description: "Learn how to use calculus to calculate trajectories, forces, and motion in robotic systems.",
      imageColor: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Course Catalog</h1>
          <p className="text-xl text-gray-600">Discover AI-tailored courses designed to challenge and inspire.</p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courseList.map((course, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              
              {/* Card Image Area (Placeholder) */}
              <div className={`h-48 ${course.imageColor} flex items-center justify-center relative`}>
                <BookOpen className={`w-16 h-16 ${course.iconColor} opacity-50`} />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
                  {course.category}
                </div>
              </div>

              {/* Card Content Area */}
              <div className="p-6">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {course.duration}</span>
                  <span className="flex items-center"><Star className="w-4 h-4 mr-1 text-yellow-400 fill-current"/> {course.rating}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md">
                    {course.level}
                  </span>
                  <button className="flex items-center text-gray-900 font-bold hover:text-indigo-600 transition-colors">
                    <PlayCircle className="w-5 h-5 mr-1" /> Start
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Courses;