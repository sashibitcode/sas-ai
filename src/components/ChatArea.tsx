'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Conversation, Message } from '@/lib/types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import SasAiWordmark from './SasAiWordmark';
import UserAccountMenu from './UserAccountMenu';
import {
  PanelLeft,
  ArrowDown,
  Columns,
  VenetianMask,
  Sparkles,
  Code2,
  Search,
  PenTool,
  Palette,
  Plus,
  Lock,
  User,
} from 'lucide-react';

interface ChatAreaProps {
  currentConversation: Conversation | null;
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  selectedImage: string | null;
  setSelectedImage: (img: string | null) => void;
  onSendMessage: (text?: string) => void;
  isLoading: boolean;
  onStopGeneration: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onOpenUpgradeModal: () => void;
  onOpenComputerModal: () => void;
  onOpenImageStudio?: () => void;
  onEditMessage?: (id: string, newContent: string) => void;
  onRegenerateResponse?: (aiMessageId: string) => void;
  onOpenAuthModal?: () => void;
  isGuestLimitReached?: boolean;
  currentUser?: { username: string; email: string; provider: string } | null;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  onLogout?: () => void;
}

const WELCOME_SUGGESTIONS = [
  {
    title: 'Explain something',
    desc: 'Quantum computing in simple terms',
    prompt: 'Explain quantum computing in simple everyday terms with an easy analogy.',
    icon: Sparkles,
  },
  {
    title: 'Write code',
    desc: 'TypeScript debounce function',
    prompt: 'Write a production-ready debounce function in TypeScript with explanation.',
    icon: Code2,
  },
  {
    title: 'Analyze data',
    desc: 'How to clean & analyze datasets',
    prompt: 'Explain how to clean, analyze, and visualize data using Python and Pandas.',
    icon: Search,
  },
  {
    title: 'Generate AI Image',
    desc: '1024x1024 art with FLUX.1',
    prompt: 'Generate an ultra-realistic 8k image of a futuristic neon sports car speeding through rainy Tokyo night',
    icon: Palette,
  },
];

export default function ChatArea({
  currentConversation,
  messages,
  input,
  setInput,
  selectedImage,
  setSelectedImage,
  onSendMessage,
  isLoading,
  onStopGeneration,
  selectedModel,
  onSelectModel,
  isSidebarOpen,
  onToggleSidebar,
  onNewChat,
  onOpenUpgradeModal,
  onOpenComputerModal,
  onOpenImageStudio,
  onEditMessage,
  onRegenerateResponse,
  onOpenAuthModal,
  isGuestLimitReached,
  currentUser,
  onOpenProfile,
  onOpenSettings,
  onOpenHelp,
  onLogout,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      if (isNearBottom || isLoading) {
        scrollToBottom('smooth');
      }
    }
  }, [messages, isLoading]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 300;
    setShowScrollBottom(isFarFromBottom);
  };

  const isEmpty = messages.length === 0;

  return (
    <main className="flex-1 flex flex-col h-full bg-transparent text-[#ececec] relative overflow-hidden select-text">
      {/* Top Header Bar */}
      <header className="h-14 flex items-center justify-between px-3 sm:px-4 z-20 shrink-0 select-none border-b border-white/[0.05] bg-[#080b12]/50 backdrop-blur-md pt-safe">
        {/* Left: Mobile sidebar toggle + Session Title */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {!isSidebarOpen && (
            <button
              onClick={onToggleSidebar}
              type="button"
              title="Open sidebar"
              className="p-2 sm:p-1.5 rounded-xl text-[#8f8f8f] hover:text-[#ececec] hover:bg-white/[0.06] transition-colors shrink-0 active:scale-95"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/logo.png"
              alt="SAS AI"
              className="w-4 h-4 object-contain sm:hidden shrink-0"
            />
            <span className="text-xs font-medium text-[#8f8f8f] truncate max-w-[130px] sm:max-w-xs">
              {currentConversation?.title || 'SAS AI'}
            </span>
          </div>
        </div>

        {/* Right Action Icons: Quick + New Chat, Incognito, Desktop Layout */}
        <div className="flex items-center gap-1.5 text-[#8f8f8f]">
          {/* Quick New Chat Button (Extra convenient on mobile!) */}
          <button
            onClick={onNewChat}
            type="button"
            title="Start new chat"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#20b8cd] bg-[#20b8cd]/10 hover:bg-[#20b8cd]/20 border border-[#20b8cd]/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="text-[11px] font-semibold">New</span>
          </button>

          {/* Incognito session toggle */}
          <button
            onClick={() => setIsIncognito(!isIncognito)}
            type="button"
            title={isIncognito ? 'Private session active' : 'Incognito session'}
            className={`p-2 sm:p-1.5 rounded-xl transition-colors active:scale-95 ${
              isIncognito
                ? 'text-[#20b8cd] bg-[#20b8cd]/10'
                : 'hover:text-[#ececec] hover:bg-white/[0.06]'
            }`}
          >
            <VenetianMask className="w-4 h-4" />
          </button>

          {/* Desktop-only Layout toggle icon */}
          <button
            onClick={onToggleSidebar}
            type="button"
            title="Toggle sidebar layout"
            className="hidden md:flex p-1.5 rounded-xl hover:text-[#ececec] hover:bg-white/[0.06] transition-colors"
          >
            <Columns className="w-4 h-4" />
          </button>

          {/* User Sign In / Profile Avatar with Dropdown Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#1fd5f0] to-[#3b82f6] flex items-center justify-center text-white text-[11px] font-bold shadow shrink-0 hover:ring-2 hover:ring-[#20b8cd]/50 transition-all active:scale-95"
                title={`Account: ${currentUser.username} (${currentUser.email})`}
              >
                {((currentUser.username || 'U').trim().charAt(0) || 'U').toUpperCase()}
              </button>

              <UserAccountMenu
                isOpen={isUserMenuOpen}
                onClose={() => setIsUserMenuOpen(false)}
                user={currentUser}
                onOpenProfile={() => {
                  setIsUserMenuOpen(false);
                  onOpenProfile?.();
                }}
                onOpenSettings={() => {
                  setIsUserMenuOpen(false);
                  onOpenSettings?.();
                }}
                onOpenHelp={() => {
                  setIsUserMenuOpen(false);
                  onOpenHelp?.();
                }}
                onLogout={() => {
                  setIsUserMenuOpen(false);
                  onLogout?.();
                }}
                placement="top-down"
                className="mt-2.5 right-0"
              />
            </div>
          ) : (
            onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-[#ededed] text-black text-xs font-semibold transition-all active:scale-95 shadow shrink-0 ml-1"
                title="Sign in with Gmail"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Sign In</span>
              </button>
            )
          )}
        </div>
      </header>

      {/* Main Content Area */}
      {isEmpty ? (
        /* ==================================================
           WELCOME SCREEN (When there are no messages)
           ================================================== */
        <div className="flex-1 flex flex-col justify-between overflow-y-auto scrollbar-thin">
          <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-4 sm:py-8 animate-fade-in max-w-2xl mx-auto w-full">
            {/* Branding: 3D Logo & Official Typography */}
            <div className="flex flex-col items-center mb-2.5 sm:mb-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mb-2 flex items-center justify-center hover:scale-105 transition-transform duration-200 drop-shadow-[0_8px_24px_rgba(32,184,205,0.25)]">
                <img
                  src="/logo.png"
                  alt="SAS AI Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <SasAiWordmark size="lg" />
            </div>

            {/* Welcome Heading */}
            <h1 className="text-xl sm:text-3xl font-medium text-[#f0f0f0] tracking-tight mb-4 sm:mb-8 text-center px-2">
              How can I help you today?
            </h1>

            {/* 4 Interactive Suggestion Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 w-full">
              {WELCOME_SUGGESTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    onClick={() => onSendMessage(item.prompt)}
                    type="button"
                    className="text-left p-3 sm:p-3.5 rounded-2xl bg-[#0e1320]/60 hover:bg-[#141b2e]/85 border border-white/[0.08] hover:border-blue-500/35 transition-all group backdrop-blur-md flex items-start gap-2.5 sm:gap-3 active:scale-[0.99]"
                  >
                    <div className="p-2 rounded-xl bg-white/[0.04] text-[#20b8cd] group-hover:bg-blue-500/10 transition-colors shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#ececec] group-hover:text-white transition-colors truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#787878] mt-0.5 leading-snug line-clamp-1 sm:line-clamp-2">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Chat Composer */}
          <div className="p-2 sm:p-4 pb-safe bg-gradient-to-t from-[#080b12] via-[#080b12]/95 to-transparent shrink-0 z-20">
            <div className="max-w-[860px] mx-auto w-full">
              {isGuestLimitReached && (
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 mb-2.5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-[#10192e] to-blue-950/60 border border-blue-500/40 text-xs shadow-xl animate-fade-in">
                  <div className="flex items-center gap-2 text-blue-200">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-medium text-[12.5px]">
                      Free guest limit (2 chats) poori ho chuki hai. Aage chat jari rakhne ke liye Sign In karein!
                    </span>
                  </div>
                  {onOpenAuthModal && (
                    <button
                      onClick={onOpenAuthModal}
                      type="button"
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#ededed] text-black font-semibold text-xs transition-colors shrink-0 active:scale-95 shadow"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              )}
              <ChatInput
                input={input}
                setInput={setInput}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                onSend={onSendMessage}
                isLoading={isLoading}
                onStop={onStopGeneration}
                selectedModel={selectedModel}
                onSelectModel={onSelectModel}
                onComputerToggle={onOpenComputerModal}
                onOpenImageStudio={onOpenImageStudio}
              />
            </div>
          </div>
        </div>
      ) : (
        /* ==================================================
           ACTIVE CONVERSATION STREAM (AI ← Left, User ← Right)
           ================================================== */
        <div className="flex-1 flex flex-col h-[calc(100%-3.5rem)] relative overflow-hidden">
          {/* Scrollable Messages Stream */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 scrollbar-thin"
          >
            <div className="max-w-[860px] mx-auto w-full space-y-5 sm:space-y-6">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={
                    isLoading &&
                    message.role === 'assistant' &&
                    message.id === messages[messages.length - 1]?.id
                  }
                  onRewrite={
                    onRegenerateResponse
                      ? () => onRegenerateResponse(message.id)
                      : (text) => onSendMessage(text)
                  }
                  onEdit={onEditMessage}
                  onOpenAuthModal={onOpenAuthModal}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          {/* Scroll To Bottom Floating Button */}
          {showScrollBottom && (
            <button
              onClick={() => scrollToBottom('smooth')}
              type="button"
              title="Scroll to bottom"
              className="absolute right-4 sm:right-6 bottom-20 sm:bottom-24 p-2 rounded-full bg-[#0e1320]/80 backdrop-blur-md border border-white/[0.1] text-[#ececec] shadow-xl hover:bg-[#161c2e] hover:border-[#20b8cd]/40 transition-all z-20 active:scale-95"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          )}

          {/* Sticky Bottom Chat Composer */}
          <div className="p-2 sm:p-4 pb-safe bg-gradient-to-t from-[#080b12] via-[#080b12]/95 to-transparent shrink-0 z-20">
            <div className="max-w-[860px] mx-auto w-full">
              {isGuestLimitReached && (
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 mb-2.5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-[#10192e] to-blue-950/60 border border-blue-500/40 text-xs shadow-xl animate-fade-in">
                  <div className="flex items-center gap-2 text-blue-200">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-medium text-[12.5px]">
                      Free guest limit (2 chats) poori ho chuki hai. Aage chat jari rakhne ke liye Sign In karein!
                    </span>
                  </div>
                  {onOpenAuthModal && (
                    <button
                      onClick={onOpenAuthModal}
                      type="button"
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#ededed] text-black font-semibold text-xs transition-colors shrink-0 active:scale-95 shadow"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              )}
              <ChatInput
                input={input}
                setInput={setInput}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                onSend={onSendMessage}
                isLoading={isLoading}
                onStop={onStopGeneration}
                selectedModel={selectedModel}
                onSelectModel={onSelectModel}
                onComputerToggle={onOpenComputerModal}
                onOpenImageStudio={onOpenImageStudio}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
