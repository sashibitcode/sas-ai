'use client';

import React from 'react';
import { X, Sparkles, Cpu, Sliders, Heart } from 'lucide-react';
import { DEVELOPER_INFO } from '@/config/ai';
import SasAiWordmark from './SasAiWordmark';

interface CustomiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export default function CustomiseModal({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
}: CustomiseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#202020] border border-[#2e2e2d] rounded-2xl p-6 text-[#ececec] shadow-2xl animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2e2e2d]">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="SAS AI Logo"
              className="w-9 h-9 object-contain drop-shadow"
            />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <SasAiWordmark size="md" />
                <span className="text-[10px] text-[#737373] border-l border-[#383838] pl-1.5 font-medium">Customise</span>
              </div>
              <p className="text-xs text-[#8f8f8f]">Preferences & System Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8f8f8f] hover:text-[#ececec] hover:bg-[#2c2c2c] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {/* Creator Attribution Card */}
          <div className="p-4 rounded-xl bg-[#191919] border border-[#2e2e2d]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8f8f8f] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                Creator & Developer
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#20b8cd]/10 text-[#20b8cd] border border-[#20b8cd]/20">
                Lead AI Engineer
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#ececec]">{DEVELOPER_INFO.name}</p>
                <p className="text-xs text-[#8f8f8f] font-mono">@{DEVELOPER_INFO.handle}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#ececec] font-medium">SAS AI Studio</p>
                <p className="text-[11px] text-[#8f8f8f]">Version 2.0</p>
              </div>
            </div>
          </div>

          {/* AI Engine Status */}
          <div className="p-4 rounded-xl bg-[#191919] border border-[#2e2e2d] space-y-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8f8f8f] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#20b8cd]" />
              Inference Engine
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#242424] border border-[#2e2e2d]">
                <p className="text-[11px] text-[#8f8f8f]">NVIDIA NIM</p>
                <p className="font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active & Connected
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#242424] border border-[#2e2e2d]">
                <p className="text-[11px] text-[#8f8f8f]">Image Model</p>
                <p className="font-semibold text-[#ececec] mt-0.5">FLUX.1 Schnell</p>
              </div>
            </div>
          </div>

          {/* Model Capabilities */}
          <div className="p-4 rounded-xl bg-[#191919] border border-[#2e2e2d] space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8f8f8f] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Supported Languages & Modes
            </span>
            <ul className="text-xs text-[#8f8f8f] space-y-1.5 list-disc list-inside">
              <li><strong className="text-[#ececec]">Hinglish & Hindi:</strong> Native Roman & Devanagari conversational fluency</li>
              <li><strong className="text-[#ececec]">English:</strong> Advanced technical writing and coding</li>
              <li><strong className="text-[#ececec]">Vision AI:</strong> Multimodal image analysis with Meta Llama 3.2</li>
              <li><strong className="text-[#ececec]">FLUX.1:</strong> Instant AI image generation via Pollinations</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#2e2e2d] flex items-center justify-between">
          <span className="text-xs text-[#8f8f8f]">Plan: <strong className="text-[#ececec]">Free tier</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#ececec] hover:bg-white text-[#191919] font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
