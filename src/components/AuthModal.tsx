'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Phone } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: { username: string; email: string; provider: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key & auto focus input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
      const username = trimmed.split('@')[0];
      const user = {
        username: username.charAt(0).toUpperCase() + username.slice(1),
        email: trimmed,
        provider: 'email',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('sas_user', JSON.stringify(user));
        window.dispatchEvent(new Event('storage'));
      }
      setLoading(false);
      setEmail('');
      onAuthSuccess?.(user);
      onClose();
    }, 400);
  };

  const handleSocialLogin = (provider: 'google' | 'apple' | 'phone') => {
    setLoading(true);
    setTimeout(() => {
      let user = {
        username: 'Google User',
        email: 'user@gmail.com',
        provider: 'google',
      };

      if (provider === 'apple') {
        user = {
          username: 'Apple User',
          email: 'user@icloud.com',
          provider: 'apple',
        };
      } else if (provider === 'phone') {
        user = {
          username: 'Phone User',
          email: '+91 98765 43210',
          provider: 'phone',
        };
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('sas_user', JSON.stringify(user));
        window.dispatchEvent(new Event('storage'));
      }
      setLoading(false);
      onAuthSuccess?.(user);
      onClose();
    }, 350);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-[420px] bg-[#212121] border border-white/[0.08] rounded-[28px] p-7 pt-6 pb-8 text-[#ececec] shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-1 rounded-full text-[#a3a3a3] hover:text-white hover:bg-white/[0.08] transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mt-2 mb-6">
          <h2 className="text-[22px] font-bold text-white tracking-tight">
            Log in or sign up
          </h2>
          <p className="text-[13.5px] text-[#b4b4b4] mt-2 px-3 leading-snug">
            You’ll get smarter responses and can upload files, images, and more.
          </p>
        </div>

        {/* Social Login Options */}
        <div className="space-y-3 mb-5">
          {/* Continue with Google */}
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="w-full h-12 rounded-full bg-[#2f2f2f] hover:bg-[#383838] border border-white/[0.06] text-white font-medium text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99]"
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
            <span>Continue with Google</span>
          </button>

          {/* Continue with Apple */}
          <button
            type="button"
            onClick={() => handleSocialLogin('apple')}
            disabled={loading}
            className="w-full h-12 rounded-full bg-[#2f2f2f] hover:bg-[#383838] border border-white/[0.06] text-white font-medium text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99]"
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
            onClick={() => handleSocialLogin('phone')}
            disabled={loading}
            className="w-full h-12 rounded-full bg-[#2f2f2f] hover:bg-[#383838] border border-white/[0.06] text-white font-medium text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99]"
          >
            <Phone className="w-4 h-4 text-white shrink-0" />
            <span>Continue with phone</span>
          </button>
        </div>

        {/* Horizontal OR Divider */}
        <div className="flex items-center my-5">
          <div className="h-px flex-1 bg-white/[0.12]" />
          <span className="px-4 text-[11px] font-semibold tracking-wider text-[#737373]">
            OR
          </span>
          <div className="h-px flex-1 bg-white/[0.12]" />
        </div>

        {/* Email Form */}
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
              placeholder="Email address"
              className="w-full h-12 rounded-full bg-[#0d0d0d] border border-[#383838] focus:border-white/60 text-white placeholder-[#737373] text-[14px] px-5 outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 px-4 animate-fade-in">
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
    </div>
  );
}
