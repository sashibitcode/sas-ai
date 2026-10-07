'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Monitor,
  Mic,
  ArrowUp,
  Square,
  X,
  ChevronDown,
  Globe,
  PenTool,
  GraduationCap,
  Code2,
  Youtube,
  Radio,
  Palette,
} from 'lucide-react';
import ModelSelector from './ModelSelector';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  selectedImage: string | null;
  setSelectedImage: (img: string | null) => void;
  onSend: (text?: string) => void;
  isLoading: boolean;
  onStop: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  variant?: 'hero' | 'followup';
  onComputerToggle?: () => void;
  onOpenImageStudio?: () => void;
}

const SEARCH_MODES = [
  { id: 'all', label: 'Search', icon: Search, desc: 'Web search & reasoning' },
  { id: 'image', label: 'Image Gen', icon: Palette, desc: 'Generate AI images with FLUX.1' },
  { id: 'academic', label: 'Academic', icon: GraduationCap, desc: 'Search published papers' },
  { id: 'writing', label: 'Writing', icon: PenTool, desc: 'Generate text or code without web' },
  { id: 'code', label: 'Code', icon: Code2, desc: 'Optimized for debugging & scripts' },
  { id: 'youtube', label: 'YouTube', icon: Youtube, desc: 'Find video transcripts' },
];

export default function ChatInput({
  input,
  setInput,
  selectedImage,
  setSelectedImage,
  onSend,
  isLoading,
  onStop,
  selectedModel,
  onSelectModel,
  variant = 'hero',
  onComputerToggle,
  onOpenImageStudio,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSearchMode, setActiveSearchMode] = useState(SEARCH_MODES[0]);
  const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const searchMenuRef = useRef<HTMLDivElement>(null);

  // Auto resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = variant === 'hero' ? 240 : 160;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input, variant]);

  // Click outside listener for Search mode dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchMenuRef.current && !searchMenuRef.current.contains(e.target as Node)) {
        setIsSearchMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Web Speech API for voice input
  const handleToggleVoice = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is supported in Google Chrome, Microsoft Edge, and Safari.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Supports Hindi, Hinglish & English
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(input ? `${input} ${transcript}` : transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  // Compress image before loading
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1024;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        setSelectedImage(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clipboard paste support
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processImageFile(file);
          break;
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (input.trim() || selectedImage)) {
        onSend();
      }
    }
  };

  const hasContent = Boolean(input.trim() || selectedImage);
  const ActiveSearchIcon = activeSearchMode.icon;

  return (
    <div
      className="relative w-full rounded-3xl bg-[#0e1320]/90 backdrop-blur-xl border border-white/[0.1] transition-all shadow-xl focus-within:border-[#20b8cd]/40 focus-within:shadow-[0_0_24px_rgba(32,184,205,0.12)] p-2.5 sm:p-3"
    >
      {/* Uploaded Image Preview Thumbnail */}
      {selectedImage && (
        <div className="mb-2.5 px-1 flex items-center">
          <div className="relative inline-block group">
            <img
              src={selectedImage}
              alt="Selected"
              className="w-14 h-14 object-cover rounded-xl border border-[#3e3e3e] shadow-md"
            />
            <button
              onClick={() => setSelectedImage(null)}
              type="button"
              title="Remove"
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#333333] hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}

      {/* Image Gen Active Mode Indicator */}
      {selectedModel === 'flux-image-gen' && (
        <div className="mb-2 px-1 flex items-center justify-between text-xs text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-xl w-fit">
          <div className="flex items-center gap-1.5 font-medium">
            <Palette className="w-3.5 h-3.5" />
            <span>FLUX.1 Image Gen Active</span>
          </div>
          <button
            onClick={() => onSelectModel('auto')}
            type="button"
            className="ml-2 text-pink-300 hover:text-white"
            title="Switch back to Chat Mode"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Textarea */}
      <div className="w-full">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={
            selectedModel === 'flux-image-gen'
              ? 'Describe the image to generate (e.g. Cyberpunk samurai in neon rain)...'
              : 'Message SAS AI...'
          }
          className="w-full bg-transparent resize-none text-[#ececec] placeholder-[#6e6e6e] text-sm md:text-[15px] focus:outline-none min-h-[44px] leading-relaxed scrollbar-thin px-2 pt-1"
        />
      </div>

      {/* Bottom Controls Row inside the Card */}
      <div className="flex items-center justify-between pt-1.5 border-t border-transparent mt-0.5 select-none">
        {/* Left Side: + (attach), Search ⌵, Computer */}
        <div className="flex items-center gap-1 text-[#8f8f8f]">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* + Attachment Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            type="button"
            title="Attach image or file"
            className="p-1.5 rounded-lg text-[#8f8f8f] hover:text-[#ececec] hover:bg-white/[0.06] transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Search ⌵ Mode Dropdown */}
          <div className="relative" ref={searchMenuRef}>
            <button
              onClick={() => setIsSearchMenuOpen(!isSearchMenuOpen)}
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#a0a0a0] hover:text-[#ececec] hover:bg-white/[0.06] transition-colors"
            >
              <ActiveSearchIcon className="w-3.5 h-3.5 text-[#8f8f8f]" />
              <span>{activeSearchMode.label}</span>
              <ChevronDown
                className={`w-3 h-3 text-[#707070] transition-transform duration-200 ${
                  isSearchMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isSearchMenuOpen && (
              <div className="absolute left-0 bottom-full mb-2 w-56 rounded-xl border border-white/[0.08] bg-[#0c101a]/95 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-1 z-50 text-[#ececec] animate-slide-up">
                <div className="px-2.5 py-1 text-[10px] font-semibold text-[#737373] uppercase tracking-wider">
                  Focus Mode
                </div>
                {SEARCH_MODES.map((mode) => {
                  const ModeIcon = mode.icon;
                  const isSelected = mode.id === activeSearchMode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setActiveSearchMode(mode);
                        setIsSearchMenuOpen(false);
                      }}
                      type="button"
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-colors text-xs ${
                        isSelected
                          ? 'bg-white/[0.08] text-[#ececec]'
                          : 'hover:bg-white/[0.05] text-[#a0a0a0] hover:text-[#ececec]'
                      }`}
                    >
                      <ModeIcon className="w-3.5 h-3.5" />
                      <div>
                        <div className="font-medium">{mode.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Computer Button */}
          <button
            onClick={() => onComputerToggle?.()}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#a0a0a0] hover:text-[#ececec] hover:bg-white/[0.06] transition-colors"
          >
            <Monitor className="w-3.5 h-3.5 text-[#8f8f8f]" />
            <span className="hidden sm:inline">Computer</span>
          </button>

          {/* Dedicated Image Gen Studio Button */}
          <button
            onClick={() => onOpenImageStudio?.()}
            type="button"
            title="Open AI Image Studio (FLUX.1)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 transition-colors"
          >
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Image</span>
          </button>
        </div>

        {/* Right Side: Model ⌵, Mic, Submit/Audio action */}
        <div className="flex items-center gap-1.5">
          {/* Model Selector */}
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={onSelectModel}
          />

          {/* Mic Button */}
          <button
            onClick={handleToggleVoice}
            type="button"
            title={isListening ? 'Listening... click to stop' : 'Voice input'}
            className={`p-1.5 rounded-lg transition-colors ${
              isListening
                ? 'text-red-400 bg-red-950/40 animate-pulse'
                : 'text-[#8f8f8f] hover:text-[#ececec] hover:bg-white/[0.06]'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Submit / Action Button */}
          {isLoading ? (
            <button
              onClick={onStop}
              type="button"
              title="Stop generating"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-all shadow-md active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
            </button>
          ) : hasContent ? (
            <button
              onClick={() => onSend()}
              type="button"
              title="Send message"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1d4ed8] hover:bg-blue-600 text-white shadow-md transition-all active:scale-95"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.4]" />
            </button>
          ) : (
            <button
              disabled
              type="button"
              title="Type a message to send"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] text-[#555555] cursor-not-allowed transition-colors"
            >
              <ArrowUp className="w-4 h-4 stroke-[2]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
