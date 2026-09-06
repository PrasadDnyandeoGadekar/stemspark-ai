import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

function Tutor() {
  // We use React State to temporarily store the chat history while the user is on the page
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Hello! I'm your STEMSpark AI tutor. I can help you with math problems, science experiments, or coding questions. What would you like to learn today?"
    },
    {
      role: 'user',
      content: "Can you explain how a solar cell works?"
    },
    {
      role: 'ai',
      content: "Absolutely! A solar cell converts sunlight into electricity using the photovoltaic effect. When photons from sunlight hit the semiconductor material (usually silicon), they knock electrons loose. These free electrons flow through the material to create an electrical current!"
    }
  ]);

  return (
    <div className="bg-white min-h-[calc(100vh-4rem)] flex flex-col md:flex-row">
      
      {/* Sidebar (Hidden on mobile, shows topics on desktop) */}
      <div className="hidden md:flex w-64 bg-gray-50 border-r border-gray-200 flex-col p-4">
        <div className="flex items-center text-indigo-700 font-bold mb-6">
          <Sparkles className="w-5 h-5 mr-2" />
          Study Sessions
        </div>
        <button className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm mb-2 hover:border-indigo-300 transition-colors">
          Physics: Solar Cells
        </button>
        <button className="text-left px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          Math: Circuit Analysis
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        
        {/* Chat History Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* AI Avatar */}
              {message.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
              )}

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 ${
                message.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                <p className="leading-relaxed text-[15px]">{message.content}</p>
              </div>

              {/* User Avatar */}
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-3 flex-shrink-0 mt-1">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}

            </div>
          ))}
        </div>

        {/* Input Box Area */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Ask me a STEM question..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-6 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-sm">
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">
            AI Tutor can make mistakes. Consider verifying complex equations.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Tutor;