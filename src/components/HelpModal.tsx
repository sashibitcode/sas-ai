'use client';

import React, { useState } from 'react';
import { X, HelpCircle, Keyboard, MessageSquare, Image, ShieldCheck, Cpu, ChevronDown, ChevronUp, Heart, Sparkles, ExternalLink } from 'lucide-react';
import { DEVELOPER_INFO } from '@/config/ai';
import SasAiWordmark from './SasAiWordmark';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FaqItem {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs: FaqItem[] = [
    {
      question: 'How does the Dual-Inference Auto-Failover work?',
      answer:
        'SAS AI runs primarily on Google Gemini for ultra-fast streaming responses. If Google Gemini reaches rate limits or quota caps, the system seamlessly and automatically switches over to NVIDIA NIM (Llama 3.2 3B Instruct) without dropping your session.',
      icon: <Cpu className="w-4 h-4 text-blue-400" />,
    },
    {
      question: 'How can I generate AI images?',
      answer:
        'Simply type your prompt starting with "generate an image of...", "draw a...", or in Hindi/Hinglish like "ek sher ki photo banao". SAS AI detects image requests and uses the FLUX.1 neural diffusion model to generate high-resolution images.',
      icon: <Image className="w-4 h-4 text-pink-400" />,
    },
    {
      question: 'Are my chats saved? Is there a limit?',
      answer:
        'When you sign in with your Google account, you get unlimited chats. All your conversations and library items are saved directly in your browser. Unauthenticated guests are given a 2-message preview.',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    },
    {
      question: 'Can SAS AI understand Hindi & Hinglish?',
      answer:
        'Yes! SAS AI has native conversational fluency in English, Hindi (Devanagari), and Hinglish (Roman Hindi), allowing you to chat naturally in whatever language you prefer.',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
    },
  ];

  const shortcuts = [
    { keys: ['Enter'], desc: 'Send message' },
    { keys: ['Shift', 'Enter'], desc: 'New line in input' },
    { keys: ['Esc'], desc: 'Close open modal or menu' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#1c1c1c] border border-white/[0.1] rounded-3xl p-5 sm:p-6 text-[#ececec] shadow-[0_24px_70px_rgba(0,0,0,0.85)] animate-slide-up max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
                  Help & Support
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-[#a0a0a0] font-mono">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-[#7d7d7d]">Frequently asked questions & shortcuts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8f8f8f] hover:text-white hover:bg-white/[0.08] transition-colors active:scale-95"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="py-4 space-y-4 overflow-y-auto scrollbar-thin pb-safe pr-0.5">
          {/* Keyboard Shortcuts */}
          <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2.5">
              <Keyboard className="w-3.5 h-3.5 text-[#20b8cd]" />
              <span className="text-xs font-semibold text-white">Keyboard Shortcuts</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {shortcuts.map((sc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.04] text-xs"
                >
                  <span className="text-[#8e8e8e] text-[11px]">{sc.desc}</span>
                  <div className="flex items-center gap-1">
                    {sc.keys.map((k, ki) => (
                      <kbd
                        key={ki}
                        className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[10px] font-mono text-[#dcdcdc] border border-white/[0.1] shadow-xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7e7e7e] px-1 flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 text-[#20b8cd]" />
              Frequently Asked Questions
            </span>
            <div className="space-y-2">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl bg-[#141414] border border-white/[0.06] overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-3 text-left flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                      type="button"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {faq.icon}
                        <span className="text-xs font-medium text-[#e4e4e4] truncate">
                          {faq.question}
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#888888] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#888888] shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3 pt-0 text-xs text-[#9d9d9d] leading-relaxed border-t border-white/[0.04] mt-1 pt-2 animate-fade-in">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Creator Attribution */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/20 via-purple-950/20 to-transparent border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#20b8cd]/10 border border-[#20b8cd]/20 flex items-center justify-center text-[#20b8cd]">
                  <Heart className="w-4 h-4 fill-[#20b8cd]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{DEVELOPER_INFO.name}</p>
                  <p className="text-[10px] text-[#7a7a7a] font-mono">@{DEVELOPER_INFO.handle} &bull; Lead AI Engineer</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.05] text-[#b0b0b0] font-mono">
                Creator
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#6b6b6b]">Need further assistance?</span>
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-[#ededed] text-black font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
