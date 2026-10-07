'use client';

import React, { useState, useRef } from 'react';
import {
  Plus,
  Brain,
  Mic,
  RotateCw,
  Download,
  Copy,
  Check,
  ArrowLeft,
  Images as ImagesIcon,
  MessageSquare,
  Sparkles,
  X,
  Maximize2,
  Bookmark,
  ArrowDown,
} from 'lucide-react';
import { saveLibraryImage } from '@/lib/libraryStorage';

interface ImagesViewProps {
  onBackToChat: () => void;
  onOpenLibrary: () => void;
  onSendToChat?: (prompt: string, imageUrl: string) => void;
}

interface TemplateCard {
  id: string;
  title: string;
  category: 'trending' | 'templates';
  imageUrl: string;
  prompt: string;
}

const TEMPLATE_CARDS: TemplateCard[] = [
  {
    id: '80s-flashback',
    title: "’80s flashback",
    category: 'trending',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=700&auto=format&fit=crop&q=80',
    prompt: 'A stylish retro portrait of a young man with 1980s voluminous wavy hair, vintage aviator sunglasses, wearing a vibrant color-blocked retro windbreaker, warm 80s film photography aesthetic, soft flash lighting',
  },
  {
    id: 'good-morning',
    title: 'Good morning',
    category: 'trending',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=700&auto=format&fit=crop&q=80',
    prompt: 'Cozy morning aesthetic, steaming ceramic mug of hot coffee on a rustic wooden windowsill, open journal notebook, small vase of wild white flowers, overlooking tranquil foggy mountain valley at golden sunrise, 8k photo',
  },
  {
    id: 'cricket-victory',
    title: 'Join a cricket victory scene',
    category: 'trending',
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=700&auto=format&fit=crop&q=80',
    prompt: 'An electric celebratory cricket stadium scene, cheering teammates and ecstatic fans celebrating with a raised trophy under bright floodlights, falling golden confetti, intense joyful expressions, cinematic sports photography',
  },
  {
    id: 'luxe-collage',
    title: 'Luxe collage',
    category: 'trending',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80',
    prompt: 'High fashion Indian royal aesthetic, elegant portrait surrounded by blooming orange lilies, exquisite maroon velvet outfit with intricate golden zardozi embroidery, cinematic mood, regal elegance',
  },
  {
    id: 'grass-puppy',
    title: 'Puppy love',
    category: 'trending',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700&auto=format&fit=crop&q=80',
    prompt: 'A tiny cute chihuahua puppy sitting in the middle of a lush bright green lawn looking directly up at the camera, aerial top-down perspective, vibrant sunlight, adorable innocent eyes, ultra detailed 8k photography',
  },
  {
    id: 'memory-suitcase',
    title: 'Memory scrapbook',
    category: 'trending',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=700&auto=format&fit=crop&q=80',
    prompt: 'A vintage travel memory box flatlay, open metal tin case packed with miniature retro camera, polaroid photos of mountains, watercolor paint palette, binoculars, stamps and travel badges, aesthetic overhead shot',
  },
  {
    id: 'creative-healer',
    title: 'Creative healer',
    category: 'trending',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=700&auto=format&fit=crop&q=80',
    prompt: 'Cute 3D Pixar anime style female medical intern, wearing blue hospital scrubs and stethoscope around neck, holding medical anatomy book in one hand and colorful artist paint palette in other, bright friendly expression',
  },
  {
    id: 'flower-doodle',
    title: 'Flower & bee doodle',
    category: 'trending',
    imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=700&auto=format&fit=crop&q=80',
    prompt: 'Minimalist aesthetic line art doodle of a smiling daisy flower with green stem and a cute tiny bumblebee hovering above, pure white clean background, whimsical children book illustration, cute graphic design',
  },
  {
    id: 'cyberpunk-city',
    title: 'Neon Tokyo rain',
    category: 'templates',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=700&auto=format&fit=crop&q=80',
    prompt: 'Cinematic cyberpunk Tokyo street in heavy rain, glowing neon signs in Japanese kanji reflecting on wet asphalt, holographic billboards, solitary figure with umbrella, ultra realistic 8k',
  },
  {
    id: 'supercar-sunset',
    title: 'Sunset supercar',
    category: 'templates',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=700&auto=format&fit=crop&q=80',
    prompt: 'Hypercar speeding on an open coastal highway at golden hour, dramatic sunlight flare, glowing taillights, photorealistic 8k automotive photography, motion blur background',
  },
  {
    id: 'mystic-dragon',
    title: 'Cosmic dragon',
    category: 'templates',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=700&auto=format&fit=crop&q=80',
    prompt: 'Majestic crystalline dragon flying across a nebula galaxy filled with glowing purple and turquoise stars, fantasy digital painting, ArtStation trending, epic scale',
  },
  {
    id: 'cozy-cafe',
    title: 'Rainy cafe',
    category: 'templates',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=700&auto=format&fit=crop&q=80',
    prompt: 'Cozy aesthetic Parisian cafe interior during soft autumn rain, warm amber Edison lamps, wooden tables with croissant and espresso, rain droplets on large window pane',
  },
];

export default function ImagesView({
  onBackToChat,
  onOpenLibrary,
  onSendToChat,
}: ImagesViewProps) {
  const [activeTab, setActiveTab] = useState<'trending' | 'templates'>('trending');
  const [promptText, setPromptText] = useState('');
  const [thinkMode, setThinkMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    url: string;
    prompt: string;
    model?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [chatSent, setChatSent] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Filter cards by category
  const displayedCards = TEMPLATE_CARDS.filter((c) =>
    activeTab === 'trending' ? true : c.category === 'templates'
  );

  // When clicking any template card
  const handleCardClick = (card: TemplateCard) => {
    setPromptText(card.prompt);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Voice dictation
  const handleToggleVoice = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is supported in Chrome, Edge, and Safari.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPromptText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Generate image with multi-tier fallback (FLUX.1 -> SDXL Turbo)
  const handleGenerate = async (customPrompt?: string) => {
    const raw = (customPrompt || promptText).trim();
    if (!raw || isGenerating) return;

    setIsGenerating(true);
    setChatSent(false);

    let finalPrompt = raw;
    if (thinkMode) {
      finalPrompt = `${raw}, masterpiece, hyper-detailed, photorealistic 8k, dramatic cinematic lighting, volumetric atmosphere, unreal engine 5 render style`;
    } else {
      finalPrompt = `${raw}, high quality, detailed 8k photography, crisp lighting`;
    }

    const encoded = encodeURIComponent(finalPrompt);
    const seed = Math.floor(Math.random() * 9999999);
    const fluxUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;
    const turboUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true&model=turbo`;

    // Preload image so the user never sees a broken/blank box
    let targetUrl = fluxUrl;
    let modelName = 'FLUX.1';
    let isSettled = false;

    const img = new Image();

    // 6-second timeout fallback to turbo
    const fallbackTimer = setTimeout(() => {
      if (!isSettled) {
        targetUrl = turboUrl;
        modelName = 'SDXL Turbo';
        img.src = turboUrl;
      }
    }, 6000);

    const finishGeneration = (url: string, model: string) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(fallbackTimer);

      saveLibraryImage({
        url,
        prompt: raw,
        model,
      });

      setGeneratedResult({
        url,
        prompt: raw,
        model,
      });

      setIsGenerating(false);
    };

    img.onload = () => {
      finishGeneration(targetUrl, modelName);
    };

    img.onerror = () => {
      if (targetUrl !== turboUrl) {
        targetUrl = turboUrl;
        modelName = 'SDXL Turbo';
        img.src = turboUrl;
      } else {
        finishGeneration(turboUrl, 'AI Generated');
      }
    };

    img.src = fluxUrl;
  };

  const handleBookmarkToggle = () => {
    if (!generatedResult) return;
    saveLibraryImage({
      url: generatedResult.url,
      prompt: generatedResult.prompt,
      model: generatedResult.model || 'FLUX.1',
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleDownload = async () => {
    if (!generatedResult) return;
    try {
      const response = await fetch(generatedResult.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const safeName = generatedResult.prompt.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
      a.download = `${safeName}-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(generatedResult.url, '_blank');
    }
  };

  const handleCopyPrompt = async () => {
    if (!generatedResult) return;
    try {
      await navigator.clipboard.writeText(generatedResult.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSendToChat = () => {
    if (!generatedResult || !onSendToChat) return;
    onSendToChat(generatedResult.prompt, generatedResult.url);
    setChatSent(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#0a0d14] text-[#ececec] scrollbar-thin select-none">
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToChat}
            type="button"
            className="flex items-center gap-2 text-xs font-medium text-[#8f8f8f] hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.04]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Chat</span>
          </button>

          <button
            onClick={onOpenLibrary}
            type="button"
            className="flex items-center gap-1.5 text-xs font-medium text-[#20b8cd] hover:text-[#52e2f4] transition-colors px-3 py-1.5 rounded-xl bg-[#20b8cd]/10 border border-[#20b8cd]/20 hover:bg-[#20b8cd]/15"
          >
            <ImagesIcon className="w-3.5 h-3.5" />
            <span>My Library</span>
          </button>
        </div>

        {/* Title: Images */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Images
          </h1>
        </div>

        {/* Pill-Shaped Main Input Box (Matching Screenshot) */}
        <div className="relative">
          <div
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#161a24] border transition-all shadow-xl ${
              promptText
                ? 'border-[#20b8cd]/50 shadow-[0_0_24px_rgba(32,184,205,0.15)]'
                : 'border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            {/* + Button on the left */}
            <button
              onClick={() => {
                // Focus input and add trigger word
                if (inputRef.current) inputRef.current.focus();
              }}
              type="button"
              title="Add image details"
              className="p-1.5 rounded-full text-[#8f8f8f] hover:text-white hover:bg-white/[0.08] transition-colors shrink-0"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </button>

            {/* Input field: Describe a new image */}
            <input
              ref={inputRef}
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe a new image"
              className="flex-1 bg-transparent text-sm sm:text-[15px] text-white placeholder-[#6f7686] focus:outline-none min-w-0"
            />

            {/* Trailing Controls: Think, Mic, Send Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Think Button */}
              <button
                onClick={() => setThinkMode(!thinkMode)}
                type="button"
                title="Toggle AI prompt enhancement"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  thinkMode
                    ? 'bg-[#20b8cd]/20 text-[#20b8cd] border border-[#20b8cd]/40'
                    : 'text-[#8f8f8f] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Think</span>
              </button>

              {/* Mic Button */}
              <button
                onClick={handleToggleVoice}
                type="button"
                title={isListening ? 'Listening...' : 'Voice prompt'}
                className={`p-1.5 rounded-full transition-colors ${
                  isListening
                    ? 'text-red-400 bg-red-950/40 animate-pulse'
                    : 'text-[#8f8f8f] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Blue Circular Generate / Send Action Button (Matching Screenshot) */}
              <button
                onClick={() => handleGenerate()}
                disabled={!promptText.trim() || isGenerating}
                type="button"
                title="Generate Image (FLUX.1)"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#1d6ee5] to-[#20b8cd] hover:from-[#1a62cc] hover:to-[#1ca4b7] text-white flex items-center justify-center transition-all shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {isGenerating ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  /* Audio / Waveform icon matching screenshot */
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M12 3v18" />
                    <path d="M8 8v8" />
                    <path d="M16 8v8" />
                    <path d="M4 11v2" />
                    <path d="M20 11v2" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* In-Flight Generation Loading Card */}
        {isGenerating && (
          <div className="p-8 rounded-2xl bg-[#121622] border border-[#20b8cd]/30 shadow-2xl flex flex-col items-center justify-center space-y-3 animate-fade-in text-center">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-[#20b8cd] border-t-transparent rounded-full animate-spin" />
              <Sparkles className="w-5 h-5 text-[#20b8cd] absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Synthesizing AI Artwork...</p>
              <p className="text-xs text-[#8f8f8f] mt-1 italic max-w-lg truncate">
                "{promptText}"
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#20b8cd] bg-[#20b8cd]/10 px-3 py-1 rounded-full border border-[#20b8cd]/25">
              <span>FLUX.1 High-Resolution Mode</span>
            </div>
          </div>
        )}

        {/* Generated Image Result Card (if generated) */}
        {generatedResult && (
          <div className="p-4 rounded-2xl bg-[#121622] border border-[#20b8cd]/30 shadow-2xl space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#20b8cd]" />
                <span className="text-xs font-semibold text-white">
                  Generated with {generatedResult.model || 'FLUX.1'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/25 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> Saved to Library
                </span>
              </div>

              <button
                onClick={() => setGeneratedResult(null)}
                className="p-1 rounded-lg text-[#8f8f8f] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              onClick={() => setShowPreviewModal(true)}
              className="group relative rounded-xl overflow-hidden bg-black/60 border border-white/[0.08] flex items-center justify-center max-h-[460px] cursor-pointer"
            >
              <img
                src={generatedResult.url}
                alt={generatedResult.prompt}
                className="w-full h-auto max-h-[460px] object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
              />

              {/* Bookmark button on image top-right */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmarkToggle();
                }}
                type="button"
                title="Save to Library"
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/85 backdrop-blur-md text-white/90 hover:text-white border border-white/15 transition-all shadow-lg active:scale-95"
              >
                {isSaved ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>

              {/* Download button on image bottom-right */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                type="button"
                title="Download Image"
                className="absolute bottom-3 right-3 p-2.5 rounded-full bg-black/65 hover:bg-black/90 backdrop-blur-md text-white border border-white/15 transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <ArrowDown className="w-4 h-4" />
              </button>

              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-medium border border-white/20 flex items-center gap-1.5 shadow-lg">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Preview</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-[#d4d4d4] italic">
              "{generatedResult.prompt}"
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDownload}
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#20b8cd] hover:bg-[#1da3b5] text-black font-semibold text-xs shadow-md transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={handleBookmarkToggle}
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-white transition-colors"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Bookmark</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyPrompt}
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleGenerate()}
                  type="button"
                  title="Generate variation"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-white transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Reroll</span>
                </button>
              </div>

              {onSendToChat && (
                <button
                  onClick={handleSendToChat}
                  disabled={chatSent}
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    chatSent
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/[0.06] hover:bg-white/[0.1] text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{chatSent ? 'Added to Chat' : 'Open in Chat'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Lightbox Modal */}
        {showPreviewModal && generatedResult && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/92 backdrop-blur-md animate-fade-in"
            onClick={() => setShowPreviewModal(false)}
          >
            <div
              className="relative max-w-4xl max-h-[92vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPreviewModal(false)}
                className="absolute -top-10 right-0 p-1 text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={generatedResult.url}
                alt={generatedResult.prompt}
                className="max-h-[82vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/10"
              />
              <p className="mt-2 text-xs text-white/80 text-center max-w-xl italic">
                "{generatedResult.prompt}"
              </p>
            </div>
          </div>
        )}

        {/* Filter Pills: Trending / Templates (Matching Screenshot) */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setActiveTab('trending')}
            type="button"
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'trending'
                ? 'bg-[#222838] text-white border border-white/[0.12] shadow-sm'
                : 'text-[#8f8f8f] hover:text-white'
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            type="button"
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'templates'
                ? 'bg-[#222838] text-white border border-white/[0.12] shadow-sm'
                : 'text-[#8f8f8f] hover:text-white'
            }`}
          >
            Templates
          </button>
        </div>

        {/* Visual Card Gallery Grid (Matching Screenshot) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 pb-12">
          {displayedCards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer bg-[#141824] border border-white/[0.06] hover:border-[#20b8cd]/40 transition-all duration-300 shadow-md hover:shadow-2xl hover:scale-[1.02]"
            >
              {/* Background Image */}
              <img
                src={card.imageUrl}
                alt={card.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Dark subtle gradient overlay at bottom for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3 sm:p-3.5">
                {/* Title in bottom-left (Matching Screenshot exactly) */}
                <h3 className="text-xs sm:text-sm font-semibold text-white drop-shadow-md leading-snug">
                  {card.title}
                </h3>
                <p className="text-[10px] text-white/70 line-clamp-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to use prompt
                </p>
              </div>

              {/* Hover Glow Highlight */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#20b8cd]/50 rounded-2xl transition-colors pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
