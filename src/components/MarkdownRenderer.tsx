'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  Check,
  Copy,
  Terminal,
  Download,
  Maximize2,
  X,
  Bookmark,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import { saveLibraryItem } from '@/lib/libraryStorage';
import { downloadTextFile } from '@/lib/fileExport';
import PhotoGallery, { GalleryPhoto } from './PhotoGallery';
import 'highlight.js/styles/atom-one-dark.css';

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function ChatImage({ src, alt }: { src?: string; alt?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Auto fallback to Turbo model if FLUX model errors or hangs
  const handleError = () => {
    if (currentSrc.includes('model=flux')) {
      const fallback = currentSrc.replace('model=flux', 'model=turbo');
      setCurrentSrc(fallback);
    } else {
      setHasError(true);
      setIsLoaded(true);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSrc) return;
    saveLibraryItem({
      title: alt || 'AI Generated Image',
      type: 'image',
      url: currentSrc,
      prompt: alt,
      model: currentSrc.includes('pollinations') ? 'FLUX.1' : 'Image',
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSrc) return;
    setIsDownloading(true);
    handleBookmark(e);

    try {
      const response = await fetch(currentSrc);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const cleanName = (alt || 'ai-image')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .slice(0, 30);
      a.download = `${cleanName}-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(currentSrc, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  if (hasError) {
    return (
      <div className="my-3 p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-[#8f8f8f] flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#20b8cd]" />
        <span>Image loading failed. Please retry your generation.</span>
      </div>
    );
  }

  return (
    <>
      <div className="my-4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#141824] group relative max-w-xl animate-fade-in">
        {/* Loading skeleton shimmer */}
        {!isLoaded && (
          <div className="w-full h-64 bg-white/[0.04] animate-pulse flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-xs text-[#737373]">
              <div className="w-5 h-5 border-2 border-[#20b8cd] border-t-transparent rounded-full animate-spin" />
              <span>Rendering image...</span>
            </div>
          </div>
        )}

        <div
          className={`relative overflow-hidden cursor-pointer ${
            !isLoaded ? 'hidden' : 'block'
          }`}
          onClick={() => setIsOpen(true)}
        >
          <img
            src={currentSrc}
            alt={alt || 'AI Generated Image'}
            onLoad={() => setIsLoaded(true)}
            onError={handleError}
            className="w-full h-auto max-h-[500px] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            loading="lazy"
          />

          {/* Top-Right: Bookmark Icon Button (Matching Screenshot) */}
          <button
            onClick={handleBookmark}
            type="button"
            title={isSaved ? 'Saved to Library!' : 'Bookmark / Save to Library'}
            className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/85 backdrop-blur-md text-white/90 hover:text-white border border-white/15 transition-all shadow-lg active:scale-95"
          >
            {isSaved ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>

          {/* Bottom-Right: Circular Downward Arrow Download Button (Matching Screenshot) */}
          <button
            onClick={handleDownload}
            type="button"
            title="Download Image"
            className="absolute bottom-3 right-3 p-2.5 rounded-full bg-black/65 hover:bg-black/90 backdrop-blur-md text-white border border-white/15 transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            {isDownloading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )}
          </button>

          {/* Center hover overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-medium border border-white/20 flex items-center gap-1.5 shadow-lg">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Preview</span>
            </span>
          </div>
        </div>

        {/* Footer info bar */}
        {isLoaded && (
          <div className="p-3 bg-[#0d111a] border-t border-white/[0.06] flex items-center justify-between text-xs text-[#a0a0a0]">
            <span className="truncate mr-2 font-medium text-white/90">
              {alt || 'AI Generated Image'}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleDownload}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#20b8cd]/15 hover:bg-[#20b8cd]/25 text-[#20b8cd] font-medium transition-colors border border-[#20b8cd]/30"
              >
                <Download className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isOpen && currentSrc && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-10 right-0 p-1 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={currentSrc}
              alt={alt || ''}
              className="max-h-[82vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/10"
            />
            {alt && (
              <p className="mt-2 text-xs text-white/80 text-center max-w-xl">
                "{alt}"
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function CodeBlock({ inline, className, children, ...props }: CodeProps) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeText = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (inline || !match) {
    return (
      <code
        className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#282828] border border-[#383838] text-[#20b8cd] font-mono text-[13px] font-medium"
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleSaveFile = () => {
    const ext = language ? `.${language}` : '.txt';
    const fileName = `code_${Date.now()}${ext}`;
    saveLibraryItem({
      title: `${language ? language.toUpperCase() : 'Code'} File (${fileName})`,
      type: 'code',
      content: codeText,
      language: language || 'code',
      fileName,
    });
    downloadTextFile(fileName, codeText);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-[#2e2e2d] bg-[#1e1e1e] shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-[#2e2e2d] text-xs text-[#a0a0a0] select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#20b8cd]" />
          <span className="font-mono font-medium lowercase text-[#d4d4d4]">
            {language || 'code'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSaveFile}
            type="button"
            title="Download file & save to Library"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-[#d4d4d4] hover:text-white bg-[#303030] hover:bg-[#3a3a3a] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Save File</span>
          </button>
          <button
            onClick={handleCopy}
            type="button"
            aria-label="Copy code to clipboard"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-[#d4d4d4] hover:text-white bg-[#303030] hover:bg-[#3a3a3a] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-[#f0f0f0] bg-[#191919]">
        <code className={className} {...props}>
          {children}
        </code>
      </div>
    </div>
  );
}

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Check if content has custom :::gallery block
  const hasGallery = content.includes(':::gallery');

  if (hasGallery) {
    const parts = content.split(/(:::gallery[\s\S]*?:::)/g);

    return (
      <div className="text-[#ededed] text-[15px] leading-relaxed break-words space-y-2 select-text font-normal">
        {parts.map((part, idx) => {
          if (part.startsWith(':::gallery') && part.endsWith(':::')) {
            try {
              const rawJson = part
                .replace(/^:::gallery\s*/, '')
                .replace(/\s*:::$/, '')
                .trim();
              const parsed = JSON.parse(rawJson);
              const photos: GalleryPhoto[] = (parsed.images || []).map(
                (url: string, pIdx: number) => ({
                  url,
                  title: parsed.captions?.[pIdx] || parsed.title || 'Photo',
                  caption: parsed.captions?.[pIdx],
                  source: parsed.source || 'Verified Photo',
                })
              );
              return (
                <PhotoGallery
                  key={`gallery_${idx}`}
                  photos={photos}
                  title={parsed.title}
                />
              );
            } catch (err) {
              console.error('Failed to parse gallery JSON:', err);
              return null;
            }
          }

          if (!part.trim()) return null;
          return <MarkdownChunk key={`chunk_${idx}`} text={part} />;
        })}
      </div>
    );
  }

  return (
    <div className="text-[#ededed] text-[15px] leading-relaxed break-words space-y-2 select-text font-normal">
      <MarkdownChunk text={content} />
    </div>
  );
}

function MarkdownChunk({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code: CodeBlock as any,
        h1: ({ children }) => (
          <h1 className="text-xl md:text-2xl font-bold mt-5 mb-2.5 text-white border-b border-[#2e2e2d] pb-1.5 tracking-tight">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg md:text-xl font-bold mt-4 mb-2 text-white tracking-tight">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base md:text-lg font-semibold mt-3 mb-1.5 text-white">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-sm md:text-base font-semibold mt-2.5 mb-1 text-white">
            {children}
          </h4>
        ),
        p: ({ children }) => (
          <p className="mb-3 last:mb-0 text-[#ededed] leading-relaxed text-[15px]">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-white">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-[#dcdcdc]">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-outside pl-5 mb-3 space-y-1.5 text-[#ededed] marker:text-[#20b8cd]">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-outside pl-5 mb-3 space-y-1.5 text-[#ededed] marker:text-[#20b8cd]">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="pl-1 text-[#ededed] leading-relaxed">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-[#20b8cd] pl-4 py-2 italic text-[#d4d4d4] bg-[#222222]/70 rounded-r-lg my-3">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-4 border border-[#2e2e2d] rounded-xl bg-[#202020]">
            <table className="min-w-full divide-y divide-[#2e2e2d] text-sm">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2.5 font-semibold bg-[#262626] text-left text-white border-b border-[#2e2e2d]">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 border-t border-[#2e2e2d] text-[#ededed]">
            {children}
          </td>
        ),
        hr: () => <hr className="my-4 border-[#2e2e2d]" />,
        img: ({ src, alt }) => <ChatImage src={src} alt={alt} />,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#20b8cd] hover:underline font-medium"
          >
            {children}
          </a>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
