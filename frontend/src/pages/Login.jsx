import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const getAuthErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'An account already exists for this email. Sign in or use another address.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled for this Firebase project. Enable it in Firebase Authentication settings.';
    case 'auth/weak-password':
      return 'Choose a stronger password with at least 8 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a little before trying again.';
    case 'auth/unauthorized-continue-uri':
    case 'auth/unauthorized-domain':
      return 'This website domain is not authorized for Firebase sign-in. Add it under Firebase Authentication authorized domains.';
    default:
      return error.message || 'Something went wrong. Please try again.';
  }
};

function Login() {
  const {
    createAccount,
    loginWithEmail,
    loginWithGoogle,
    resendVerificationEmail,
    user,
  } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const clearFeedback = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setNeedsVerification(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearFeedback();
    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMessage('Your passwords do not match.');
      return;
    }

    setPending(true);
    try {
      if (mode === 'signup') {
        await createAccount(name, email, password);
        setMode('signin');
        setSuccessMessage('Account created. Check your email for a verification link, then sign in here.');
      } else {
        await loginWithEmail(email, password);
      }
    } catch (error) {
      if (error.code === 'auth/email-not-verified') setNeedsVerification(true);
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearFeedback();
    setPending(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  const handleResendVerification = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setPending(true);
    try {
      await resendVerificationEmail(email, password);
      setNeedsVerification(true);
      setSuccessMessage('A new verification link has been sent. Check your inbox and spam folder.');
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  const changeMode = (nextMode) => {
    clearFeedback();
    setMode(nextMode);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-10 sm:px-6">
      <section className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
        <header className="mb-7 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-indigo-600" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'signin'
              ? 'Sign in to save your STEMSpark AI progress.'
              : 'Verify your email to keep your learning progress safe.'}
          </p>
        </header>

        <div className="mb-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1" aria-label="Account options">
          <button
            type="button"
            onClick={() => changeMode('signin')}
            aria-pressed={mode === 'signin'}
            className={`min-h-10 rounded-lg px-3 text-sm font-bold transition ${mode === 'signin' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => changeMode('signup')}
            aria-pressed={mode === 'signup'}
            className={`min-h-10 rounded-lg px-3 text-sm font-bold transition ${mode === 'signup' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Create account
          </button>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={pending}
          className="mb-6 flex min-h-12 w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-wait disabled:opacity-60"
        >
          <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with email</span>
          </div>
        </div>

        {successMessage && (
          <p role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">
            {successMessage}
          </p>
        )}
        {errorMessage && (
          <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-800">
            {errorMessage}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label className="block">
              <span className="sr-only">Your name</span>
              <span className="relative block">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  autoComplete="name"
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  required
                  value={name}
                />
              </span>
            </label>
          )}
          <label className="block">
            <span className="sr-only">Email address</span>
            <span className="relative block">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </span>
          </label>
          <label className="block">
            <span className="sr-only">Password</span>
            <span className="relative block">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                minLength={mode === 'signup' ? 8 : undefined}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password (at least 8 characters)"
                required
                type="password"
                value={password}
              />
            </span>
          </label>
          {mode === 'signup' && (
            <label className="block">
              <span className="sr-only">Confirm password</span>
              <span className="relative block">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  minLength={8}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm password"
                  required
                  type="password"
                  value={confirmPassword}
                />
              </span>
            </label>
          )}
          <button
            type="submit"
            disabled={pending}
            className="flex min-h-12 w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? 'Please wait…' : mode === 'signup' ? 'Create account and send verification link' : 'Sign in with email'}
          </button>
        </form>

        {needsVerification && (
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={pending || !email || !password}
            className="mt-4 min-h-10 w-full rounded-lg px-3 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Resend verification link
          </button>
        )}
      </section>
    </div>
  );
}

export default Login;
