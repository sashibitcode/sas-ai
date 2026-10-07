'use client';

import React, { useState } from 'react';
import { X, User, Mail, ShieldCheck, Calendar, Sparkles, MessageSquare, Image, Check, Edit3 } from 'lucide-react';
import SasAiWordmark from './SasAiWordmark';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    username: string;
    email: string;
    provider: string;
  };
  onUpdateUser: (updated: { username: string; email: string; provider: string }) => void;
  conversationCount?: number;
  libraryCount?: number;
}

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  conversationCount = 0,
  libraryCount = 0,
}: ProfileModalProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user.username || 'User');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const initial = ((user.username || 'U').trim().charAt(0) || 'U').toUpperCase();

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editedName.trim();
    if (!trimmed) return;

    const updatedUser = {
      ...user,
      username: trimmed,
    };
    onUpdateUser(updatedUser);
    setIsEditingName(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#1c1c1c] border border-white/[0.1] rounded-3xl p-5 sm:p-6 text-[#ececec] shadow-[0_24px_70px_rgba(0,0,0,0.85)] animate-slide-up max-h-[92dvh] overflow-y-auto pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#20b8cd]" />
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
              User Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8f8f8f] hover:text-white hover:bg-white/[0.08] transition-colors active:scale-95"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Profile Card */}
        <div className="py-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 border-b border-white/[0.06]">
          {/* Large Gradient Avatar */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-tr from-[#1fd5f0] via-[#2563eb] to-[#7c3aed] flex items-center justify-center text-white text-3xl font-extrabold shadow-xl">
              {initial}
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-black border-2 border-[#1c1c1c]" title="Online & Active">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>

          {/* User Info & Editable Name */}
          <div className="flex-1 text-center sm:text-left min-w-0 w-full">
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-2 mb-1.5">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#0e0e0e] border border-blue-500 text-white text-sm font-semibold outline-none w-full"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditedName(user.username);
                    setIsEditingName(false);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-[#a0a0a0] text-xs shrink-0"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="text-lg font-bold text-white truncate">
                  {user.username || 'User'}
                </h3>
                <button
                  onClick={() => setIsEditingName(true)}
                  type="button"
                  className="p-1 rounded-md text-[#787878] hover:text-[#ececec] hover:bg-white/[0.06] transition-colors"
                  title="Edit display name"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                {saveSuccess && (
                  <span className="text-[11px] text-emerald-400 font-medium animate-fade-in flex items-center gap-1">
                    <Check className="w-3 h-3" /> Saved!
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#a0a0a0] mb-2 font-mono">
              <Mail className="w-3.5 h-3.5 text-[#707070] shrink-0" />
              <span className="truncate">{user.email || 'user@gmail.com'}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10.5px] font-medium">
                <ShieldCheck className="w-3 h-3" />
                Verified Google Account
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10.5px] font-mono">
                Unlimited Chats Active
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-4">
          <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.06] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-bold text-white leading-none mb-1">
                {conversationCount}
              </p>
              <p className="text-[11px] text-[#787878]">Active Conversations</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.06] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400">
              <Image className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-bold text-white leading-none mb-1">
                {libraryCount}
              </p>
              <p className="text-[11px] text-[#787878]">Saved in Library</p>
            </div>
          </div>
        </div>

        {/* Account Details & Plan Tier */}
        <div className="space-y-2 mb-5">
          <div className="p-3 rounded-xl bg-[#141414] border border-white/[0.05] flex items-center justify-between text-xs">
            <span className="text-[#888888]">Plan Status</span>
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              SAS AI Free Tier (Unlimited Access)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#141414] border border-white/[0.05] flex items-center justify-between text-xs">
            <span className="text-[#888888]">Primary AI Engine</span>
            <span className="font-semibold text-blue-400 font-mono text-[11px]">
              Google Gemini (Primary) + NVIDIA NIM Fallback
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#141414] border border-white/[0.05] flex items-center justify-between text-xs">
            <span className="text-[#888888]">Authentication Provider</span>
            <span className="font-medium text-[#cccccc] capitalize">
              {user.provider || 'google'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-[11px] text-[#6d6d6d]">SAS AI Cloud Workspace</span>
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-[#ededed] text-black font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
