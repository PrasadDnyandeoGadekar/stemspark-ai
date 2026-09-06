import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { getAITutorResponse } from '../utils/gemini';

function Tutor() {
    useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Hello! I'm your STEMSpark AI tutor. I'm connected and ready to help you with math problems, science experiments, or coding questions. What would you like to learn today?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null); // Used to auto-scroll to bottom

  // Auto-scroll to the newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault(); // Prevent page refresh on form submit
    
    if (!inputValue.trim()) return; // Don't send empty messages

    const userMessage = inputValue;
    setInputValue(''); // Clear the input box instantly
    
    // 1. Add user message to the screen
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    
    // 2. Show the loading spinner
    setIsTyping(true);

    // 3. Send to Gemini API and wait for the answer
    const aiResponseText = await getAITutorResponse(messages, userMessage);

    // 4. Add AI response to the screen and hide spinner
    setMessages([...newMessages, { role: 'ai', content: aiResponseText }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-white flex flex-col md:flex-row overflow-hidden z-30">
      
      {/* Sidebar */}
      <div className="hidden md:flex w-64 bg-gray-50 border-r border-gray-200 flex-col p-4">
        <div className="flex items-center text-indigo-700 font-bold mb-6">
          <Sparkles className="w-5 h-5 mr-2" />
          Study Sessions
        </div>
        <button className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm mb-2">
          Current Session
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full h-full">
        
        {/* Chat History Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {message.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 ${
                message.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                {/* We use whitespace-pre-wrap so Gemini's line breaks render correctly */}
                <p className="leading-relaxed text-[15px] whitespace-pre-wrap">{message.content}</p>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-3 flex-shrink-0 mt-1">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              </div>
              <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-tl-none px-5 py-4 flex items-center">
                <span className="text-sm italic">AI Tutor is thinking...</span>
              </div>
            </div>
          )}
          
          {/* Invisible div to scroll to */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box Area */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
              placeholder="Ask me a STEM question..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-6 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={isTyping || !inputValue.trim()}
              className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-3">
            AI Tutor can make mistakes. Consider verifying complex equations.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Tutor;