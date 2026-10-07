'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AVAILABLE_MODELS } from '@/config/ai';
import { ChevronDown, Sparkles, Zap, Check, Cpu, Palette } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  variant?: 'pill' | 'button';
}

export default function ModelSelector({
  selectedModel,
  onSelectModel,
  variant = 'pill',
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel =
    AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getModelIcon = (id: string) => {
    if (id === 'auto') return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    if (id === 'gemini-flash') return <Sparkles className="w-3.5 h-3.5 text-blue-400" />;
    if (id === 'flux-image-gen') return <Palette className="w-3.5 h-3.5 text-pink-400" />;
    if (id.includes('11b')) return <Zap className="w-3.5 h-3.5 text-[#20b8cd]" />;
    return <Cpu className="w-3.5 h-3.5 text-violet-400" />;
  };

  const getShortName = (name: string) => {
    if (name.includes('Gemini (Primary)')) return 'Gemini';
    if (name.includes('Gemini + Failover')) return 'Auto (Gemini)';
    return name.split(' ')[0];
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        title="Select AI Model"
        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-lg text-xs font-medium text-[#a0a0a0] hover:text-[#ececec] hover:bg-white/[0.06] transition-colors shrink-0 active:scale-95"
      >
        <span className="hidden xs:inline">{getShortName(currentModel.name)}</span>
        <span className="xs:hidden">Model</span>
        <ChevronDown
          className={`w-3 h-3 text-[#707070] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-72 max-w-[calc(100vw-24px)] rounded-xl border border-white/[0.08] bg-[#0c101a]/95 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-1.5 z-50 animate-slide-up text-[#ececec]">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-[#8f8f8f] uppercase tracking-wider">
            Select AI Model
          </div>
          <div className="space-y-0.5">
            {AVAILABLE_MODELS.map((model) => {
              const isSelected = model.id === currentModel.id;
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  type="button"
                  className={`w-full text-left px-3 py-2.5 sm:py-2 rounded-lg flex items-start justify-between gap-2 transition-colors active:bg-white/[0.1] ${
                    isSelected
                      ? 'bg-white/[0.08] text-[#ececec]'
                      : 'hover:bg-white/[0.05] text-[#b5b5b5] hover:text-[#ececec]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">{getModelIcon(model.id)}</div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium">{model.name}</span>
                        {model.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#333333] text-[#20b8cd] font-mono">
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#787878] mt-0.5 leading-snug">
                        {model.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#20b8cd] shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
