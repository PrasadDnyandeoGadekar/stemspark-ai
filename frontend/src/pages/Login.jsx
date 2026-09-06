import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // <-- Import context

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login } = useAuth(); // <-- Get login function
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password); // Execute global login
    navigate('/dashboard'); // Immediately redirect to dashboard
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="text-center mb-8">
          <Sparkles className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? 'New to STEMSpark AI? ' : 'Already have an account? '}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors focus:outline-none"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

        {/* Form triggers handleSubmit on submit */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" 
                placeholder="you@example.com" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;