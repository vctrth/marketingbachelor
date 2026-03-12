import React, { useState } from 'react';
import { supabase } from '../hooks/useSupabase';
import { LoadingSpinner } from './ui';

// ============================================================================
// AUTH COMPONENT
// ============================================================================

interface AuthProps {
  onSuccess?: () => void;
}

export function Auth({ onSuccess }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>('signin');

  // Handle email + password sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Provide more helpful error messages
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        throw error;
      }

      if (data.user) {
        setMessage('Signed in successfully!');
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  // Handle email + password sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: email.split('@')[0],
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.confirmed_at) {
          setMessage('Account created! You can now sign in.');
          // Auto switch to sign in mode
          setTimeout(() => {
            setMode('signin');
            setMessage(null);
          }, 2000);
        } else {
          setMessage('Account created! Please check your email to verify your account before signing in.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  // Handle magic link (passwordless)
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      setMessage('Check your email for the login link!');
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (mode === 'signin') return handleSignIn(e);
    if (mode === 'signup') return handleSignUp(e);
    if (mode === 'magic') return handleMagicLink(e);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌱</div>
          <h1 className="text-3xl font-black text-[#36392b] mb-2">Garden Match</h1>
          <p className="text-gray-600">Connect with local gardeners</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 px-4 rounded-full font-semibold text-sm transition ${
              mode === 'signin'
                ? 'bg-white text-[#36392b] shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 px-4 rounded-full font-semibold text-sm transition ${
              mode === 'signup'
                ? 'bg-white text-[#36392b] shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setMode('magic')}
            className={`flex-1 py-2 px-4 rounded-full font-semibold text-sm transition ${
              mode === 'magic'
                ? 'bg-white text-[#36392b] shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition"
            />
          </div>

          {/* Password Input (not for magic link) */}
          {mode !== 'magic' && (
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size={20} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'magic' && 'Send Magic Link'}
              </>
            )}
          </button>
        </form>

        {/* Info text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {mode === 'magic' && (
            <p>We'll send you a secure login link to your email</p>
          )}
          {mode === 'signup' && (
            <p>By signing up, you agree to our Terms of Service</p>
          )}
        </div>
      </div>

      {/* Debug info (remove in production) */}
      <div className="mt-8 text-center text-xs text-gray-400">
        <p>Demo: You can create a test account with any email</p>
        <p className="mt-1">Make sure Supabase credentials are set in .env.local</p>
      </div>
    </div>
  );
}
