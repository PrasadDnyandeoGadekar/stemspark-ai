import { useState, useRef, useEffect } from 'react';
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
      const finalMessages = [...newMessages, {
        role: 'ai',
        content: error.message || "AI Tutor is temporarily unavailable. Please try again.",
      }];
      setMessages(finalMessages);
      await saveChatToDatabase(finalMessages);
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
      <div className="tutor-initializing fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="font-medium text-gray-500 animate-pulse">Syncing secure study session...</p>
      </div>
    );
  }

  return (
    <div className="tutor-shell fixed inset-x-0 bottom-0 top-16 z-30 flex min-h-0 flex-col overflow-hidden bg-white md:flex-row">
      
      <div className="tutor-sidebar hidden w-64 flex-col border-r border-gray-200 bg-gray-50 p-4 md:flex">
        <div className="flex items-center text-indigo-700 font-bold mb-6">
          <Sparkles className="w-5 h-5 mr-2" />
          Study Sessions
        </div>
        
        <button className="tutor-session-active mb-3 w-full rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-left text-sm font-bold text-indigo-700 shadow-sm">
          Active Study Session
        </button>
        
        <button 
          onClick={handleNewSession}
          className="tutor-session-button group mb-2 flex w-full items-center rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-indigo-400 hover:text-indigo-700"
        >
          <PlusCircle className="w-4 h-4 mr-2 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          Start New Topic
        </button>
      </div>

      <div className="mx-auto flex h-full min-h-0 w-full min-w-0 max-w-4xl flex-1 flex-col">
        
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-3 sm:space-y-6 sm:p-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex min-w-0 gap-2 sm:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {message.role === 'ai' && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 shadow-sm">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
              )}

              <div className={`min-w-0 max-w-[calc(100%-2.5rem)] overflow-hidden rounded-2xl px-3 py-3 shadow-sm sm:max-w-[75%] sm:px-5 sm:py-4 ${
                message.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'tutor-ai-message bg-white border border-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                {message.role === 'user' ? (
                  <p className="break-words text-[15px] leading-relaxed">{message.content}</p>
                ) : (
                  <div className="prose prose-sm min-w-0 max-w-none break-words text-[15px] leading-relaxed prose-pre:m-0 prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:bg-transparent prose-pre:p-0">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        code({ inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <div className="my-4 min-w-0 max-w-full overflow-hidden rounded-md border border-gray-700 shadow-md">
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
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 shadow-sm">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 shadow-sm">
                <Bot className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="tutor-typing flex max-w-[calc(100%-2.5rem)] items-center space-x-2 rounded-2xl rounded-tl-none border border-gray-100 bg-white px-5 py-4 shadow-sm sm:max-w-[75%]">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          
          
          <div ref={messagesEndRef} />
        </div>

        <div className="tutor-composer shrink-0 border-t border-gray-100 bg-gray-50/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:p-4">
          <form onSubmit={handleSendMessage} className="tutor-input-form relative flex items-center rounded-full border border-gray-200 bg-white shadow-sm transition-colors hover:border-indigo-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me a STEM question..." 
              className="w-full min-w-0 bg-transparent border-none rounded-full pl-4 pr-12 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 sm:py-4 sm:pl-6 sm:pr-14"
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