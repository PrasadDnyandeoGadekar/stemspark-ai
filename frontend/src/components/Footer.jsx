import React from 'react';
import { Sparkles, Code2, MessageSquare, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-900 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Links and Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <Sparkles className="h-6 w-6 text-indigo-400 mr-2" />
              <span className="text-xl font-bold text-white tracking-tight">STEMSpark AI</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Empowering every mind through adaptive, AI-driven STEM education. Accessible anywhere, for everyone.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4 text-gray-400">
              <a href="#" className="hover:text-white transition-colors"><MessageSquare className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Code2 className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Globe className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Courses</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">AI Tutor</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Experiments</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">About Us</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Careers</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Section: Copyright */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} STEMSpark AI. All rights reserved.
          </p>
          <div className="text-gray-500 text-sm flex items-center space-x-1">
            <span>Made with logic &</span>
            <span className="text-indigo-400">code</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;