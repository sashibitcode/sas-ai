'use client';

import React, { useState } from 'react';
import { Message } from '@/lib/types';
import MarkdownRenderer from './MarkdownRenderer';
import SasAiWordmark from './SasAiWordmark';
import {
  Copy,
  Check,
  Share2,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Edit2,
  MoreHorizontal,
  Sparkles,
  FileText,
  FileDown,
} from 'lucide-react';
import { saveLibraryItem } from '@/lib/libraryStorage';
import { exportDocumentAsPdf } from '@/lib/fileExport';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onRewrite?: (content: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
}

export default function ChatMessage({
  message,
  isStreaming = false,
  onRewrite,
  onEdit,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [savedAsPdf, setSavedAsPdf] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SAS AI Chat',
          text: message.content,
        });
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      handleCopy();
    }
  };

  const handleSaveEdit = () => {
    if (editText.trim() && onEdit) {
      onEdit(message.id, editText.trim());
      setIsEditing(false);
    }
  };

  // ==========================================
  // 1. USER MESSAGE (RIGHT SIDE, COMPACT BLUE BUBBLE)
  // ==========================================
  if (isUser) {
    return (
      <div className="flex flex-col items-end w-full group animate-fade-in">
        {/* User image thumbnail if attached */}
        {message.image && (
          <div className="mb-2 rounded-xl overflow-hidden border border-white/10 max-w-xs shadow-md">
            <img
              src={message.image}
              alt="Uploaded file"
              className="w-full h-auto max-h-56 object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => window.open(message.image, '_blank')}
              title="Click to view full image"
            />
          </div>
        )}

        {isEditing ? (
          /* Inline edit mode */
          <div className="w-full max-w-[85%] sm:max-w-[70%] bg-[#0c162d] border border-blue-500/40 rounded-2xl p-3 shadow-lg">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full bg-transparent text-white text-[15px] resize-none focus:outline-none leading-relaxed"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setEditText(message.content);
                  setIsEditing(false);
                }}
                type="button"
                className="px-3 py-1 rounded-lg text-xs font-medium text-[#a0a0a0] hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                type="button"
                className="px-3 py-1 rounded-lg text-xs font-medium bg-[#1d4ed8] hover:bg-blue-600 text-white transition-colors"
              >
                Save & Submit
              </button>
            </div>
          </div>
        ) : (
          /* Standard User Message Bubble */
          <div className="relative max-w-[85%] sm:max-w-[70%] bg-[#1d4ed8]/90 hover:bg-[#1d4ed8] text-white px-4 py-2.5 rounded-2xl rounded-br-sm shadow-sm border border-blue-400/20 text-[15px] leading-relaxed break-words transition-colors">
            <p className="whitespace-pre-wrap select-text">{message.content}</p>
          </div>
        )}

        {/* User Message Action Toolbar (Subtle, Right-Aligned) */}
        {!isEditing && (
          <div className="flex items-center gap-1 mt-1 text-[#737373] select-none opacity-80 group-hover:opacity-100 transition-opacity">
            {/* Copy */}
            <button
              onClick={handleCopy}
              type="button"
              title={copied ? 'Copied' : 'Copy'}
              className="p-1 rounded hover:text-[#e5e5e5] hover:bg-white/[0.06] transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              type="button"
              title="Share"
              className="p-1 rounded hover:text-[#e5e5e5] hover:bg-white/[0.06] transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Edit */}
            {onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                type="button"
                title="Edit message"
                className="p-1 rounded hover:text-[#e5e5e5] hover:bg-white/[0.06] transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. AI MESSAGE (LEFT SIDE, PURE NATURAL TEXT)
  // ==========================================
  return (
    <div className="flex flex-col items-start w-full group animate-fade-in">
      {/* Small subtle Model / Attribution Label above response */}
      <div className="flex items-center gap-1.5 text-[11px] text-[#737373] mb-1.5 select-none font-medium">
        <img
          src="/logo.png"
          alt="SAS AI"
          className="w-3.5 h-3.5 object-contain"
        />
        <span className="text-[#a0a0a0] font-semibold">SAS AI</span>
        <span>·</span>
        <span>Synthesis</span>
        <span>·</span>
        <span className="text-[#808080]">NVIDIA NIM</span>
      </div>

      {/* Error State */}
      {message.error ? (
        <div className="p-3.5 rounded-xl bg-red-950/25 border border-red-900/50 text-red-300 text-sm flex items-start gap-2.5 max-w-[850px]">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-200 text-xs">Error</p>
            <p className="text-xs mt-0.5 text-red-300/90">{message.content}</p>
          </div>
        </div>
      ) : (
        /* Natural AI Markdown Content (No enclosing box, No card) */
        <div className="max-w-[850px] w-full text-[#EDEDED] text-[15px] sm:text-[16px] leading-[1.65] font-normal">
          {message.content ? (
            <MarkdownRenderer content={message.content} />
          ) : isStreaming ? (
            /* Subtle typing indicator */
            <div className="flex items-center gap-2 py-2 text-xs text-[#8f8f8f]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#20b8cd] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#20b8cd] animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#20b8cd] animate-bounce [animation-delay:0.4s]" />
              <span className="text-[12px] text-[#737373] ml-1">SAS AI is thinking...</span>
            </div>
          ) : null}

          {/* Streaming Cursor */}
          {isStreaming && message.content && (
            <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-[#20b8cd] animate-pulse" />
          )}
        </div>
      )}

      {/* Subtle Action Toolbar below AI Response (Left-Aligned) */}
      {!message.error && message.content && !isStreaming && (
        <div className="relative flex items-center gap-1 mt-2 text-[#737373] text-xs select-none opacity-80 group-hover:opacity-100 transition-opacity">
          {/* Copy */}
          <button
            onClick={handleCopy}
            type="button"
            title={copied ? 'Copied' : 'Copy'}
            className="p-1.5 rounded-md hover:text-[#e5e5e5] hover:bg-white/[0.06] transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Export / Save PDF to Library */}
          <button
            onClick={() => {
              const firstHeading = (message.content.match(/^#{1,3}\s+(.*$)/m)?.[1] || message.content.slice(0, 35))
                .replace(/[#*`_]/g, '')
                .trim() || 'AI Document Report';
              saveLibraryItem({
                title: firstHeading,
                type: 'pdf',
                content: message.content,
                fileName: `${firstHeading.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 25)}.pdf`,
              });
              exportDocumentAsPdf(firstHeading, message.content);
              setSavedAsPdf(true);
              setTimeout(() => setSavedAsPdf(false), 2500);
            }}
            type="button"
            title="Download as PDF & Save to Library"
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-[#a0a0a0] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            {savedAsPdf ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Saved PDF!</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-red-400" />
                <span>PDF</span>
              </>
            )}
          </button>

          {/* Like */}
          <button
            onClick={() => setLiked(liked === true ? null : true)}
            type="button"
            title="Good response"
            className={`p-1.5 rounded-md transition-colors ${
              liked === true
                ? 'text-emerald-400 bg-emerald-950/30'
                : 'hover:text-[#e5e5e5] hover:bg-white/[0.06]'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>

          {/* Dislike */}
          <button
            onClick={() => setLiked(liked === false ? null : false)}
            type="button"
            title="Bad response"
            className={`p-1.5 rounded-md transition-colors ${
              liked === false
                ? 'text-red-400 bg-red-950/30'
                : 'hover:text-[#e5e5e5] hover:bg-white/[0.06]'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            type="button"
            title="Share"
            className="p-1.5 rounded-md hover:text-[#e5e5e5] hover:bg-white/[0.06] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Regenerate */}
          {onRewrite && (
            <button
              onClick={() => onRewrite(message.content)}
              type="button"
              title="Regenerate response"
              className="p-1.5 rounded-md hover:text-[#e5e5e5] hover:bg-white/[0.06] transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* More (...) */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              type="button"
              title="More options"
              className="p-1.5 rounded-md hover:text-[#e5e5e5] hover:bg-white/[0.06] transition-colors"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {showMoreMenu && (
              <div
                onMouseLeave={() => setShowMoreMenu(false)}
                className="absolute left-0 bottom-full mb-1.5 w-44 rounded-xl border border-white/[0.08] bg-[#0c101a]/95 backdrop-blur-2xl shadow-xl p-1 z-30 text-xs text-[#d4d4d4] animate-slide-up"
              >
                <button
                  onClick={() => {
                    handleCopy();
                    setShowMoreMenu(false);
                  }}
                  type="button"
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  Copy Markdown
                </button>
                <div className="my-1 border-t border-white/[0.06]" />
                <div className="px-2.5 py-1 text-[10px] text-[#737373]">
                  Model: Llama 3.2 NIM
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
