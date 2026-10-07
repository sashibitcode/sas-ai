'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Palette,
  Download,
  Copy,
  Check,
  RotateCw,
  MessageSquare,
  Images,
  ArrowRight,
  Maximize2,
  Wand2,
} from 'lucide-react';
import { saveLibraryImage } from '@/lib/libraryStorage';

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string, imageUrl: string) => void;
  onOpenLibrary?: () => void;
}

const STYLES = [
  {
    id: 'photorealistic',
    name: 'Photorealistic',
    icon: '📸',
    suffix: 'ultra-realistic photography, 8k resolution, cinematic lighting, sharp details, Hasselblad shot',
  },
  {
    id: 'anime',
    name: 'Anime & Manga',
    icon: '🎌',
    suffix: 'vibrant anime aesthetic, Makoto Shinkai style, Studio Ghibli inspired, breathtaking digital art',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    icon: '🏙️',
    suffix: 'neon lights, holographic reflections, futuristic high-tech cyberpunk city, dramatic contrast, 8k',
  },
  {
    id: '3d-render',
    name: '3D CGI / Pixar',
    icon: '🎮',
    suffix: 'Pixar Disney style 3D animation render, Octane Render, smooth textures, warm soft lighting',
  },
  {
    id: 'fantasy',
    name: 'Fantasy Epic',
    icon: '🧙',
    suffix: 'epic high fantasy concept art, magical glowing atmosphere, mythical realm, ArtStation trending',
  },
  {
    id: 'cinematic',
    name: 'Cinematic Movie',
    icon: '🎬',
    suffix: '35mm film still, cinematic anamorphic lens, moody atmospheric lighting, movie poster composition',
  },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square', width: 1024, height: 1024, desc: 'Instagram & Avatar' },
  { id: '16:9', label: '16:9 Landscape', width: 1280, height: 720, desc: 'Desktop & Wallpaper' },
  { id: '9:16', label: '9:16 Portrait', width: 720, height: 1280, desc: 'Mobile & Story' },
];

const SURPRISE_PROMPTS = [
  'Futuristic neon sports car speeding on a wet highway in Tokyo rain at night',
  'Cute robotic cat wearing an astronaut helmet sitting on the lunar surface overlooking Earth',
  'Ancient Japanese temple surrounded by floating glowing sakura petals and waterfalls',
  'Cyberpunk samurai warrior holding a glowing cyan katana in a misty neon alley',
  'Magnificent crystal dragon soaring over a glowing bioluminescent floating island',
  'Cozy futuristic coffee shop on Mars with large glass windows showing red desert storms',
  'Hyper-realistic portrait of an ethereal celestial goddess crowned with stars and galaxies',
  'Tiny cute mythical fox with nine glowing tails sleeping inside an ancient enchanted tree',
];

export default function ImageStudioModal({
  isOpen,
  onClose,
  onSendToChat,
  onOpenLibrary,
}: ImageStudioModalProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [resultImage, setResultImage] = useState<{
    url: string;
    prompt: string;
    fullPrompt: string;
    style: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [chatSent, setChatSent] = useState(false);

  if (!isOpen) return null;

  const handleSurpriseMe = () => {
    const random = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    setPrompt(random);
  };

  const handleGenerate = (customPrompt?: string) => {
    const text = (customPrompt || prompt).trim();
    if (!text || isGenerating) return;

    setIsGenerating(true);
    setImageLoaded(false);
    setChatSent(false);

    const styleObj = STYLES.find((s) => s.id === selectedStyle) || STYLES[0];
    const fullEnhancedPrompt = `${text}, ${styleObj.suffix}`;
    const encoded = encodeURIComponent(fullEnhancedPrompt);
    const seed = Math.floor(Math.random() * 9999999);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${selectedRatio.width}&height=${selectedRatio.height}&seed=${seed}&nologo=true&model=flux`;

    // Save automatically to Library
    saveLibraryImage({
      url: imageUrl,
      prompt: text,
      model: `FLUX.1 (${styleObj.name})`,
    });

    setResultImage({
      url: imageUrl,
      prompt: text,
      fullPrompt: fullEnhancedPrompt,
      style: styleObj.name,
    });

    // Timeout fallback for image loading state
    setTimeout(() => {
      setIsGenerating(false);
    }, 1200);
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    try {
      const response = await fetch(resultImage.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const safeName = resultImage.prompt.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
      a.download = `${safeName}-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(resultImage.url, '_blank');
    }
  };

  const handleCopyPrompt = async () => {
    if (!resultImage) return;
    try {
      await navigator.clipboard.writeText(resultImage.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSendToChat = () => {
    if (!resultImage || !onSendToChat) return;
    onSendToChat(resultImage.prompt, resultImage.url);
    setChatSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative flex flex-col w-full max-w-3xl max-h-[94dvh] sm:max-h-[90vh] bg-[#090e1c]/95 border border-white/[0.08] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-[#ececec]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-400 shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base font-semibold text-white truncate">AI Image Studio</h2>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 font-semibold border border-pink-500/30 shrink-0">
                  FLUX.1 Schnell
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#8f8f8f] truncate max-w-xs sm:max-w-none">
                Prompt likhein aur instant high-resolution AI visual generate karein
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 sm:p-1.5 rounded-lg text-[#8f8f8f] hover:text-white hover:bg-white/[0.06] transition-colors shrink-0 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 scrollbar-thin pb-safe">
          {/* Prompt Input Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#d4d4d4] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Image Description / Prompt</span>
              </label>
              <button
                onClick={handleSurpriseMe}
                type="button"
                className="flex items-center gap-1 text-[11px] text-pink-400 hover:text-pink-300 font-medium transition-colors active:scale-95"
              >
                <Wand2 className="w-3 h-3" />
                <span>🎲 Surprise Me</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your vision (e.g. Cyberpunk samurai warrior in neon rain)..."
                rows={3}
                className="w-full p-3 text-[16px] sm:text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#6e6e6e] focus:outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/30 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Art Style Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#d4d4d4]">
              Choose Art Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STYLES.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    type="button"
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs transition-all text-left ${
                      isSelected
                        ? 'bg-pink-500/15 border border-pink-500/40 text-white font-medium shadow-sm'
                        : 'bg-white/[0.03] border border-white/[0.06] text-[#a3a3a3] hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="text-sm">{style.icon}</span>
                    <span className="truncate">{style.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#d4d4d4]">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((ratio) => {
                const isSelected = selectedRatio.id === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    onClick={() => setSelectedRatio(ratio)}
                    type="button"
                    className={`flex flex-col p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-[#20b8cd]/15 border border-[#20b8cd]/40 text-white shadow-sm'
                        : 'bg-white/[0.03] border border-white/[0.06] text-[#a3a3a3] hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="text-xs font-medium text-[#ececec]">{ratio.label}</span>
                    <span className="text-[10px] text-[#737373] mt-0.5">{ratio.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={() => handleGenerate()}
            disabled={!prompt.trim() || isGenerating}
            type="button"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-[#20b8cd] hover:from-pink-600 hover:to-[#1da3b5] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Generating Artwork with FLUX.1...</span>
              </>
            ) : (
              <>
                <Palette className="w-4 h-4" />
                <span>Generate Image</span>
              </>
            )}
          </button>

          {/* Generated Result Preview Card */}
          {resultImage && (
            <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Generated Artwork</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> Saved to Library
                  </span>
                </div>

                {onOpenLibrary && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLibrary();
                    }}
                    type="button"
                    className="flex items-center gap-1 text-[11px] text-[#20b8cd] hover:underline"
                  >
                    <Images className="w-3 h-3" />
                    <span>View in Library</span>
                  </button>
                )}
              </div>

              {/* Image with Loading State */}
              <div className="relative rounded-xl overflow-hidden bg-black/60 border border-white/[0.06] flex items-center justify-center max-h-[380px]">
                <img
                  src={resultImage.url}
                  alt={resultImage.prompt}
                  className={`w-full h-auto max-h-[380px] object-contain transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-85'
                  }`}
                  onLoad={() => {
                    setImageLoaded(true);
                    setIsGenerating(false);
                  }}
                />
              </div>

              <p className="text-xs text-[#a0a0a0] italic">
                "{resultImage.prompt}"
              </p>

              {/* Action Toolbar */}
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
                    onClick={handleCopyPrompt}
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-white transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
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
                    title="Generate new variation"
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
                    <span>{chatSent ? 'Added to Chat' : 'Add to Chat'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
