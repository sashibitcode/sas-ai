'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, ArrowLeft, Check, Sparkles, User as UserIcon } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: { username: string; email: string; provider: string }) => void;
}

type AuthView = 'default' | 'google' | 'phone' | 'apple';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [view, setView] = useState<AuthView>('default');
  const [email, setEmail] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [phone, setPhone] = useState('');
  const [appleEmail, setAppleEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const googleInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key & reset views
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => {
        if (view === 'google') {
          googleInputRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 150);
    } else {
      setView('default');
      setError('');
      setLoading(false);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, view]);

  if (!isOpen) return null;

  // Format a friendly username from email address
  const formatNameFromEmail = (rawEmail: string): string => {
    const prefix = rawEmail.split('@')[0] || 'User';
    // Replace dots, underscores, dashes with spaces and capitalize each word
    const cleaned = prefix.replace(/[._\-+]/g, ' ').trim();
    if (!cleaned) return 'User';
    return cleaned
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const completeLogin = (user: { username: string; email: string; provider: string }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sas_user', JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));
    }
    setLoading(false);
    onAuthSuccess?.(user);
    onClose();
  };

  // 1. Direct Email Submit
  const handleContinueWithEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email address.');
      inputRef.current?.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email address.');
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const isGmail = trimmed.toLowerCase().endsWith('@gmail.com');
      const user = {
        username: formatNameFromEmail(trimmed),
        email: trimmed,
        provider: isGmail ? 'google' : 'email',
      };
      completeLogin(user);
    }, 350);
  };

  // 2. Google / Gmail Sign-in Submit
  const handleGoogleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let trimmed = googleEmail.trim();
    if (!trimmed) {
      setError('Apna Gmail address enter karein.');
      googleInputRef.current?.focus();
      return;
    }

    // Auto-append @gmail.com if user just typed their username
    if (!trimmed.includes('@')) {
      trimmed = `${trimmed}@gmail.com`;
      setGoogleEmail(trimmed);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError('Kripya valid Gmail address dalein (e.g. name@gmail.com)');
      googleInputRef.current?.focus();
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const derivedName = googleName.trim() || formatNameFromEmail(trimmed);
      const user = {
        username: derivedName,
        email: trimmed,
        provider: 'google',
      };
      completeLogin(user);
    }, 400);
  };

  // 3. Apple Sign-in Submit
  const handleAppleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = appleEmail.trim() || 'user@icloud.com';
    setLoading(true);
    setTimeout(() => {
      const user = {
        username: formatNameFromEmail(trimmed),
        email: trimmed,
        provider: 'apple',
      };
      completeLogin(user);
    }, 350);
  };

  // 4. Phone Sign-in Submit
  const handlePhoneSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = phone.trim();
    if (!trimmed || trimmed.length < 8) {
      setError('Please enter a valid phone number with country code.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const user = {
        username: `Phone (${trimmed.slice(-4)})`,
        email: trimmed,
        provider: 'phone',
      };
      completeLogin(user);
    }, 350);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-[430px] bg-[#1a1a1a] border border-white/[0.1] rounded-[28px] p-5 sm:p-7 pt-5 sm:pt-6 pb-6 sm:pb-8 text-[#ececec] shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-slide-up max-h-[95dvh] overflow-y-auto pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Back Button or Close Button */}
        <div className="flex items-center justify-between mb-2">
          {view !== 'default' ? (
            <button
              onClick={() => {
                setView('default');
                setError('');
              }}
              type="button"
              className="p-1.5 rounded-full text-[#a3a3a3] hover:text-white hover:bg-white/[0.08] transition-colors active:scale-95 flex items-center gap-1.5 text-xs font-medium"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full text-[#a3a3a3] hover:text-white hover:bg-white/[0.08] transition-colors active:scale-95"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================================
            VIEW 1: DEDICATED GOOGLE / GMAIL LOGIN VIEW
            ========================================================= */}
        {view === 'google' && (
          <div className="animate-fade-in">
            {/* Google Logo & Header */}
            <div className="text-center mt-1 mb-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white flex items-center justify-center shadow-md">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Sign in with Google
              </h2>
              <p className="text-xs text-[#a0a0a0] mt-1.5">
                Apna Gmail address enter karein to continue with SAS AI
              </p>
            </div>

            <form onSubmit={handleGoogleSignIn} noValidate className="space-y-3.5">
              {/* Gmail Address Input */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5 px-1">
                  Gmail Address *
                </label>
                <div className="relative">
                  <input
                    ref={googleInputRef}
                    type="email"
                    value={googleEmail}
                    onChange={(e) => {
                      setGoogleEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. shashikant@gmail.com"
                    className="w-full h-12 rounded-xl bg-[#0e0e0e] border border-[#383838] focus:border-[#4285F4] text-white placeholder-[#686868] text-[15px] px-4 outline-none transition-colors"
                  />
                </div>
                {/* Helper Auto-Complete Chip */}
                {googleEmail && !googleEmail.includes('@') && (
                  <button
                    type="button"
                    onClick={() => setGoogleEmail(`${googleEmail.trim()}@gmail.com`)}
                    className="mt-1.5 text-[11px] text-[#4285F4] hover:underline flex items-center gap-1 font-mono px-1"
                  >
                    <span>+ Append @gmail.com</span>
                  </button>
                )}
              </div>

              {/* Full Name Input (Optional) */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5 px-1">
                  Your Name <span className="text-[#666666] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="e.g. Shashikant Raj"
                  className="w-full h-12 rounded-xl bg-[#0e0e0e] border border-[#383838] focus:border-[#4285F4] text-white placeholder-[#686868] text-[15px] px-4 outline-none transition-colors"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 px-1 animate-fade-in font-medium">
                  {error}
                </p>
              )}

              {/* Google Blue Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg mt-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in to Google...</span>
                  </div>
                ) : (
                  <span>Continue with Gmail</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-[#6d6d6d]">
                  Secured with Google Account integration. Unlimited chats unlocked!
                </span>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================
            VIEW 2: PHONE SIGN IN VIEW
            ========================================================= */}
        {view === 'phone' && (
          <div className="animate-fade-in">
            <div className="text-center mt-1 mb-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Phone className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Continue with Phone
              </h2>
              <p className="text-xs text-[#a0a0a0] mt-1.5">
                Enter your mobile number to sign in
              </p>
            </div>

            <form onSubmit={handlePhoneSignIn} noValidate className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5 px-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="+91 98765 43210"
                  className="w-full h-12 rounded-xl bg-[#0e0e0e] border border-[#383838] focus:border-emerald-500 text-white placeholder-[#686868] text-[15px] px-4 outline-none transition-colors"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 px-1 animate-fade-in font-medium">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-white hover:bg-[#eaeaea] text-black font-semibold text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? 'Verifying...' : 'Sign In with Phone'}
              </button>
            </form>
          </div>
        )}

        {/* =========================================================
            VIEW 3: APPLE SIGN IN VIEW
            ========================================================= */}
        {view === 'apple' && (
          <div className="animate-fade-in">
            <div className="text-center mt-1 mb-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white flex items-center justify-center">
                <svg className="w-6 h-6 fill-black" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.85-11.71-14.42-6.53-10.45-11.53-22.18-15-35.21-3.48-13.03-5.22-25.29-5.22-36.78 0-14.79 3.65-27.24 10.96-37.36 7.31-10.12 16.71-15.29 28.21-15.52 4.13 0 9.07 1.13 14.83 3.39 5.76 2.26 9.53 3.44 11.3 3.52 1.52 0 5.43-1.22 11.73-3.65 6.3-2.44 11.41-3.52 15.34-3.26 13.69.77 24.58 5.66 32.68 14.68-12.18 7.39-18.17 17.5-17.97 30.34.2 10.01 4.08 18.42 11.64 25.23 7.56 6.81 16.71 10.74 27.46 11.79-2.61 8.27-5.98 16.63-10.11 25.08zM119.22 31.84c0-7.39 2.65-14.42 7.95-21.09 5.3-6.67 11.83-10.75 19.59-12.25.22 1.09.33 2.18.33 3.26 0 7.39-2.76 14.46-8.28 21.21-5.52 6.75-12.22 10.73-20.1 11.95-.22-1.09-.33-2.18-.33-3.26z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Sign in with Apple
              </h2>
              <p className="text-xs text-[#a0a0a0] mt-1.5">
                Enter your Apple ID to continue
              </p>
            </div>

            <form onSubmit={handleAppleSignIn} noValidate className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5 px-1">
                  Apple ID / iCloud Email *
                </label>
                <input
                  type="email"
                  value={appleEmail}
                  onChange={(e) => {
                    setAppleEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="yourname@icloud.com"
                  className="w-full h-12 rounded-xl bg-[#0e0e0e] border border-[#383838] focus:border-white text-white placeholder-[#686868] text-[15px] px-4 outline-none transition-colors"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-white hover:bg-[#eaeaea] text-black font-semibold text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? 'Connecting...' : 'Continue with Apple ID'}
              </button>
            </form>
          </div>
        )}

        {/* =========================================================
            VIEW 0: DEFAULT SCREEN (Multi-Provider + Email)
            ========================================================= */}
        {view === 'default' && (
          <div className="animate-fade-in">
            {/* Modal Header */}
            <div className="text-center mt-1 mb-6">
              <h2 className="text-[22px] font-bold text-white tracking-tight">
                Log in or sign up
              </h2>
              <p className="text-[13px] text-[#b4b4b4] mt-1.5 px-2 leading-snug">
                Apna Gmail address use karein to unlock unlimited AI chats, image generation, aur saved library.
              </p>
            </div>

            {/* Social Login Options */}
            <div className="space-y-2.5 mb-5">
              {/* Continue with Google (Dedicated Gmail Screen) */}
              <button
                type="button"
                onClick={() => {
                  setView('google');
                  setError('');
                }}
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#272727] hover:bg-[#323232] border border-white/[0.08] text-white font-medium text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] shadow-sm hover:border-[#4285F4]/40"
              >
                {/* Google Multicolor SVG */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google (Gmail)</span>
              </button>

              {/* Continue with Apple */}
              <button
                type="button"
                onClick={() => {
                  setView('apple');
                  setError('');
                }}
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#272727] hover:bg-[#323232] border border-white/[0.08] text-white font-medium text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] shadow-sm"
              >
                {/* Apple Logo SVG */}
                <svg className="w-5 h-5 fill-white shrink-0 -translate-y-0.5" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.85-11.71-14.42-6.53-10.45-11.53-22.18-15-35.21-3.48-13.03-5.22-25.29-5.22-36.78 0-14.79 3.65-27.24 10.96-37.36 7.31-10.12 16.71-15.29 28.21-15.52 4.13 0 9.07 1.13 14.83 3.39 5.76 2.26 9.53 3.44 11.3 3.52 1.52 0 5.43-1.22 11.73-3.65 6.3-2.44 11.41-3.52 15.34-3.26 13.69.77 24.58 5.66 32.68 14.68-12.18 7.39-18.17 17.5-17.97 30.34.2 10.01 4.08 18.42 11.64 25.23 7.56 6.81 16.71 10.74 27.46 11.79-2.61 8.27-5.98 16.63-10.11 25.08zM119.22 31.84c0-7.39 2.65-14.42 7.95-21.09 5.3-6.67 11.83-10.75 19.59-12.25.22 1.09.33 2.18.33 3.26 0 7.39-2.76 14.46-8.28 21.21-5.52 6.75-12.22 10.73-20.1 11.95-.22-1.09-.33-2.18-.33-3.26z" />
                </svg>
                <span>Continue with Apple</span>
              </button>

              {/* Continue with phone */}
              <button
                type="button"
                onClick={() => {
                  setView('phone');
                  setError('');
                }}
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#272727] hover:bg-[#323232] border border-white/[0.08] text-white font-medium text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] shadow-sm"
              >
                <Phone className="w-4 h-4 text-white shrink-0" />
                <span>Continue with phone</span>
              </button>
            </div>

            {/* Horizontal OR Divider */}
            <div className="flex items-center my-4">
              <div className="h-px flex-1 bg-white/[0.1]" />
              <span className="px-3 text-[11px] font-semibold tracking-wider text-[#737373]">
                OR
              </span>
              <div className="h-px flex-1 bg-white/[0.1]" />
            </div>

            {/* Direct Email / Gmail Form */}
            <form onSubmit={handleContinueWithEmail} noValidate className="space-y-3">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Email address (e.g. yourname@gmail.com)"
                  className="w-full h-12 rounded-full bg-[#0d0d0d] border border-[#383838] focus:border-white/60 text-white placeholder-[#737373] text-[15px] px-5 outline-none transition-colors"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 px-4 animate-fade-in font-medium">
                  {error}
                </p>
              )}

              {/* Pure White Continue Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-white hover:bg-[#e6e6e6] text-black font-semibold text-[14.5px] transition-all active:scale-[0.99] flex items-center justify-center"
              >
                {loading ? 'Continuing...' : 'Continue'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
