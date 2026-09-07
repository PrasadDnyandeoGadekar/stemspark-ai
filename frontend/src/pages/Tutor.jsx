import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Send, Bot, User, Sparkles, PlusCircle, Loader2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getAITutorResponse } from '../utils/gemini';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Tutor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef(null);

  // 1. Fetch Chat History from Firestore
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (user) {
        const chatRef = doc(db, 'chats', user.uid);
        const chatSnap = await getDoc(chatRef);
        
        if (chatSnap.exists()) {
          setMessages(chatSnap.data().messages);
        } else {
          setMessages([{
            role: 'ai',
            content: "Hello! I'm your STEMSpark AI tutor. I'm connected and ready to help you with math problems, science experiments, or coding questions. What would you like to learn today?"
          }]);
        }
      } else {
        setMessages([{
          role: 'ai',
          content: "Hello! I'm your STEMSpark AI tutor. **Note: You are currently using a guest session. Please log in to permanently save your chat history and equations.** What would you like to learn today?"
        }]);
      }
      setIsInitializing(false);
    };

    fetchChatHistory();
    window.scrollTo(0, 0);
  }, [user]);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const saveChatToDatabase = async (updatedMessages) => {
    if (user) {
      const chatRef = doc(db, 'chats', user.uid);
      await setDoc(chatRef, { messages: updatedMessages });
    }
  };

  const handleNewSession = async () => {
    const defaultMessage = [{
      role: 'ai',
      content: "Hello! I'm your STEMSpark AI tutor. I'm connected and ready to help you with math problems, science experiments, or coding questions. What would you like to learn today?"
    }];
    
    setMessages(defaultMessage); 
    
    if (user) {
      const chatRef = doc(db, 'chats', user.uid);
      await setDoc(chatRef, { messages: defaultMessage });
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault(); 
    if (!inputValue.trim()) return; 

    const userMessage = inputValue;
    setInputValue(''); 
    
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    await saveChatToDatabase(newMessages);
    
    setIsTyping(true);

    try {
      const aiResponseText = await getAITutorResponse(messages, userMessage);
      const finalMessages = [...newMessages, { role: 'ai', content: aiResponseText }];
      setMessages(finalMessages);
      await saveChatToDatabase(finalMessages);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'ai', content: "Sorry, I had trouble connecting. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="font-medium text-gray-500 animate-pulse">Syncing secure study session...</p>
      </div>
    );
  }

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-white flex flex-col md:flex-row overflow-hidden z-30">
      
      <div className="hidden md:flex w-64 bg-gray-50 border-r border-gray-200 flex-col p-4">
        <div className="flex items-center text-indigo-700 font-bold mb-6">
          <Sparkles className="w-5 h-5 mr-2" />
          Study Sessions
        </div>
        
        <button className="text-left w-full px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-bold text-indigo-700 shadow-sm mb-3">
          Active Study Session
        </button>
        
        <button 
          onClick={handleNewSession}
          className="text-left w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm mb-2 hover:border-indigo-400 hover:text-indigo-700 transition-colors flex items-center group"
        >
          <PlusCircle className="w-4 h-4 mr-2 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          Start New Topic
        </button>
      </div>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full h-full">
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {message.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0 mt-1 shadow-sm">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                message.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                {message.role === 'user' ? (
                  <p className="leading-relaxed text-[15px]">{message.content}</p>
                ) : (
                  <div className="leading-relaxed text-[15px] prose prose-sm max-w-none overflow-x-auto break-words prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <div className="rounded-md overflow-hidden my-4 shadow-md border border-gray-700">
                              <div className="bg-gray-800 text-gray-300 text-xs px-4 py-2 flex justify-between items-center font-mono border-b border-gray-700">
                                <span>{match[1]}</span>
                              </div>
                              <SyntaxHighlighter
                                {...props}
                                children={String(children).replace(/\n$/, '')}
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{ margin: 0, padding: '1rem', borderRadius: '0 0 0.375rem 0.375rem' }}
                              />
                            </div>
                          ) : (
                            <code {...props} className="bg-gray-100 border border-gray-200 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono">
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center ml-3 flex-shrink-0 mt-1 shadow-sm">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0 mt-1 shadow-sm">
                <Bot className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-none px-6 py-5 flex items-center space-x-2 max-w-[85%] sm:max-w-[75%]">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
          <form onSubmit={handleSendMessage} className="relative flex items-center shadow-sm rounded-full bg-white border border-gray-200 hover:border-indigo-300 transition-colors focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me a STEM question..." 
              className="w-full bg-transparent border-none rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-0 text-gray-700 placeholder-gray-400"
            />
            <button 
              type="submit"
              disabled={isTyping || !inputValue.trim()}
              className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Tutor;