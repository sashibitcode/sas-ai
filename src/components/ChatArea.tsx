'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Conversation, Message } from '@/lib/types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import SasAiWordmark from './SasAiWordmark';
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
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);

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
      <header className="h-14 flex items-center justify-between px-4 z-20 shrink-0 select-none border-b border-white/[0.05] bg-[#080b12]/40 backdrop-blur-md">
        {/* Left: Mobile sidebar toggle + Session Title */}
        <div className="flex items-center gap-2.5">
          {!isSidebarOpen && (
            <button
              onClick={onToggleSidebar}
              type="button"
              title="Open sidebar"
              className="p-1.5 rounded-lg text-[#8f8f8f] hover:text-[#ececec] hover:bg-white/[0.06] transition-colors"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs font-medium text-[#737373] truncate max-w-[200px] sm:max-w-xs">
            {currentConversation?.title || 'SAS AI'}
          </span>
        </div>

        {/* Right Action Icons: Incognito & Layout */}
        <div className="flex items-center gap-1 text-[#8f8f8f]">
          {/* Incognito session toggle */}
          <button
            onClick={() => setIsIncognito(!isIncognito)}
            type="button"
            title={isIncognito ? 'Private session active' : 'Incognito session'}
            className={`p-1.5 rounded-lg transition-colors ${
              isIncognito
                ? 'text-[#20b8cd] bg-[#20b8cd]/10'
                : 'hover:text-[#ececec] hover:bg-white/[0.06]'
            }`}
          >
            <VenetianMask className="w-4 h-4" />
          </button>

          {/* Layout toggle icon */}
          <button
            onClick={onToggleSidebar}
            type="button"
            title="Toggle sidebar layout"
            className="p-1.5 rounded-lg hover:text-[#ececec] hover:bg-white/[0.06] transition-colors"
          >
            <Columns className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {isEmpty ? (
        /* ==================================================
           WELCOME SCREEN (When there are no messages)
           ================================================== */
        <div className="flex-1 flex flex-col justify-between overflow-y-auto scrollbar-thin">
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 animate-fade-in max-w-2xl mx-auto w-full">
            {/* Branding: 3D Logo & Official Typography */}
            <div className="flex flex-col items-center mb-3">
              <div className="w-14 h-14 md:w-16 md:h-16 mb-2.5 flex items-center justify-center hover:scale-105 transition-transform duration-200 drop-shadow-[0_8px_24px_rgba(32,184,205,0.25)]">
                <img
                  src="/logo.png"
                  alt="SAS AI Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <SasAiWordmark size="lg" />
            </div>

            {/* Welcome Heading */}
            <h1 className="text-2xl sm:text-3xl font-medium text-[#f0f0f0] tracking-tight mb-8 text-center">
              How can I help you today?
            </h1>

            {/* 4 Interactive Suggestion Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
              {WELCOME_SUGGESTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    onClick={() => onSendMessage(item.prompt)}
                    type="button"
                    className="text-left p-3.5 rounded-2xl bg-[#0e1320]/60 hover:bg-[#141b2e]/85 border border-white/[0.08] hover:border-blue-500/35 transition-all group backdrop-blur-md flex items-start gap-3"
                  >
                    <div className="p-2 rounded-xl bg-white/[0.04] text-[#20b8cd] group-hover:bg-blue-500/10 transition-colors shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#ececec] group-hover:text-white transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#787878] mt-0.5 leading-snug">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Chat Composer */}
          <div className="p-3 sm:p-4 bg-gradient-to-t from-[#080b12] via-[#080b12]/95 to-transparent shrink-0 z-20">
            <div className="max-w-[860px] mx-auto w-full">
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
            className="flex-1 overflow-y-auto px-4 md:px-6 py-6 scrollbar-thin"
          >
            <div className="max-w-[860px] mx-auto w-full space-y-6">
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
              className="absolute right-6 bottom-24 p-2 rounded-full bg-[#0e1320]/80 backdrop-blur-md border border-white/[0.1] text-[#ececec] shadow-xl hover:bg-[#161c2e] hover:border-[#20b8cd]/40 transition-all z-20"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          )}

          {/* Sticky Bottom Chat Composer */}
          <div className="p-3 sm:p-4 bg-gradient-to-t from-[#080b12] via-[#080b12]/95 to-transparent shrink-0 z-20">
            <div className="max-w-[860px] mx-auto w-full">
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
