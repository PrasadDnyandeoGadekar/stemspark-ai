import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { getAITutorResponse } from '../utils/gemini';

function Tutor() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Hello! I'm your STEMSpark AI tutor. I'm connected and ready to help you with math problems, science experiments, or coding questions. What would you like to learn today?"
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Force scroll to top when page first loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Auto-scroll to the newest message smoothly
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Unified function to handle sending messages
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault(); 
    
    if (!inputValue.trim()) return; 

    const userMessage = inputValue;
    setInputValue(''); // Clear the input box instantly
    
    // Add user message to the screen
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    
    // Show the animated loading dots
    setIsTyping(true);

    try {
      // Send to Gemini API and wait for the answer
      const aiResponseText = await getAITutorResponse(messages, userMessage);
      setMessages([...newMessages, { role: 'ai', content: aiResponseText }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'ai', content: "Sorry, I had trouble connecting. Please try again." }]);
    } finally {
      // Hide the loading dots
      setIsTyping(false);
    }
  };

  // Allow sending with the Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-white flex flex-col md:flex-row overflow-hidden z-30">
      
      {/* Sidebar */}
      <div className="hidden md:flex w-64 bg-gray-50 border-r border-gray-200 flex-col p-4">
        <div className="flex items-center text-indigo-700 font-bold mb-6">
          <Sparkles className="w-5 h-5 mr-2" />
          Study Sessions
        </div>
        <button className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm mb-2 hover:border-indigo-300 transition-colors">
          Current Session
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full h-full">
        
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
                {message.role === 'user' ? (
                  <p className="leading-relaxed text-[15px]">{message.content}</p>
                ) : (
                  <div className="leading-relaxed text-[15px] prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-3 flex-shrink-0 mt-1">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {/* Animated Loading Dots (Only shows when isTyping is true) */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-none px-6 py-5 flex items-center space-x-2 max-w-[85%] sm:max-w-[75%]">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          
          {/* Invisible Anchor for Auto-Scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box Area */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me a STEM question..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-6 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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