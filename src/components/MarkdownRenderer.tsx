'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Check, Copy, Terminal, Download, Maximize2, X, FileCode } from 'lucide-react';
import { saveLibraryItem } from '@/lib/libraryStorage';
import { downloadTextFile } from '@/lib/fileExport';
import 'highlight.js/styles/atom-one-dark.css';

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function ChatImage({ src, alt }: { src?: string; alt?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="my-4 rounded-2xl overflow-hidden border border-[#2e2e2d] shadow-xl bg-[#1c1c1c] group relative max-w-lg">
        <div className="relative overflow-hidden cursor-pointer" onClick={() => setIsOpen(true)}>
          <img
            src={src}
            alt={alt || 'AI Generated Image'}
            className="w-full h-auto object-cover rounded-t-xl transition-transform duration-200 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-medium border border-white/20 flex items-center gap-1.5 shadow-lg">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Preview</span>
            </span>
          </div>
        </div>
        <div className="p-3 bg-[#222222] border-t border-[#2e2e2d] flex items-center justify-between text-xs text-[#d4d4d4]">
          <span className="truncate mr-2 font-medium text-white">{alt || 'AI Generated Image'}</span>
          {src && (
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#20b8cd] hover:bg-[#1da3b5] text-[#191919] font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {isOpen && src && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[92vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-10 right-0 p-1 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={src} alt={alt || ''} className="max-h-[82vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/10" />
            {alt && <p className="mt-2 text-xs text-white/80 text-center max-w-xl">"{alt}"</p>}
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
      {/* Code Header Bar */}
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

      {/* Syntax Highlighted Code Content */}
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-[#f0f0f0] bg-[#191919]">
        <pre className="!bg-transparent !p-0 !m-0">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
}

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="text-[#ededed] text-[15px] leading-relaxed break-words space-y-2 select-text font-normal">
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
            <strong className="font-bold text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[#dcdcdc]">
              {children}
            </em>
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
          hr: () => (
            <hr className="my-4 border-[#2e2e2d]" />
          ),
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
        {content}
      </ReactMarkdown>
    </div>
  );
}
