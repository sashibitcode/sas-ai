'use client';

import React, { useEffect, useRef } from 'react';
import { User, Settings, HelpCircle, LogOut, Sparkles, Check, ChevronRight } from 'lucide-react';

interface UserAccountMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    username: string;
    email: string;
    provider: string;
  };
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onLogout: () => void;
  placement?: 'bottom-up' | 'top-down';
  className?: string;
}

export default function UserAccountMenu({
  isOpen,
  onClose,
  user,
  onOpenProfile,
  onOpenSettings,
  onOpenHelp,
  onLogout,
  placement = 'bottom-up',
  className = '',
}: UserAccountMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const initial = ((user.username || 'U').trim().charAt(0) || 'U').toUpperCase();

  const isBottomUp = placement === 'bottom-up';

  return (
    <div
      ref={menuRef}
      className={`absolute z-50 w-64 max-w-[calc(100vw-32px)] bg-[#171717]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.7)] p-1.5 text-[#ececec] animate-scale-in select-none ${
        isBottomUp ? 'bottom-full mb-2 left-0' : 'top-full mt-2 right-0'
      } ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* User Identity Header Card */}
      <div className="p-2.5 mb-1 rounded-xl bg-white/[0.04] border border-white/[0.04] flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1fd5f0] to-[#3b82f6] flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
          {initial}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white truncate">
              {user.username || 'User'}
            </span>
          </div>
          <span className="text-[11px] text-[#8e8e8e] truncate" title={user.email}>
            {user.email || 'user@gmail.com'}
          </span>
          <span className="text-[9.5px] font-mono text-[#20b8cd] mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#20b8cd]" />
            Google Account
          </span>
        </div>
      </div>

      {/* Menu Actions List */}
      <div className="space-y-0.5">
        {/* 1. Profile */}
        <button
          onClick={() => {
            onClose();
            onOpenProfile();
          }}
          type="button"
          className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/[0.08] transition-colors group active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-white/[0.05] text-[#b3b3b3] group-hover:text-white group-hover:bg-[#20b8cd]/10 transition-colors">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#f0f0f0]">Profile</p>
              <p className="text-[10px] text-[#787878]">Personal info & account stats</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#5e5e5e] group-hover:text-[#a0a0a0] transition-colors" />
        </button>

        {/* 2. Settings */}
        <button
          onClick={() => {
            onClose();
            onOpenSettings();
          }}
          type="button"
          className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/[0.08] transition-colors group active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-white/[0.05] text-[#b3b3b3] group-hover:text-white group-hover:bg-amber-400/10 transition-colors">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#f0f0f0]">Settings</p>
              <p className="text-[10px] text-[#787878]">Preferences & AI models</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#5e5e5e] group-hover:text-[#a0a0a0] transition-colors" />
        </button>

        {/* 3. Help & FAQ */}
        <button
          onClick={() => {
            onClose();
            onOpenHelp();
          }}
          type="button"
          className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/[0.08] transition-colors group active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-white/[0.05] text-[#b3b3b3] group-hover:text-white group-hover:bg-blue-400/10 transition-colors">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#f0f0f0]">Help & FAQ</p>
              <p className="text-[10px] text-[#787878]">Shortcuts, guide & support</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#5e5e5e] group-hover:text-[#a0a0a0] transition-colors" />
        </button>
      </div>

      {/* Divider */}
      <div className="my-1.5 h-px bg-white/[0.08]" />

      {/* 4. Log Out */}
      <button
        onClick={() => {
          onClose();
          onLogout();
        }}
        type="button"
        className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors group active:scale-[0.99]"
      >
        <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20 transition-colors">
          <LogOut className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-semibold">Log out</p>
          <p className="text-[10px] text-red-400/70">Sign out of this session</p>
        </div>
      </button>
    </div>
  );
}
