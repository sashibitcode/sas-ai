'use client';

import React, { useState, useEffect } from 'react';
import {
  Images,
  FileText,
  Code2,
  Files,
  X,
  Search,
  Download,
  Trash2,
  Copy,
  Check,
  Maximize2,
  Sparkles,
  Calendar,
  Eye,
  FileDown,
  Terminal,
} from 'lucide-react';
import {
  LibraryItem,
  LibraryItemType,
  getLibraryItems,
  deleteLibraryItem,
  clearLibrary,
  LIBRARY_UPDATE_EVENT,
} from '@/lib/libraryStorage';
import { downloadTextFile, exportDocumentAsPdf } from '@/lib/fileExport';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

export default function LibraryModal({
  isOpen,
  onClose,
  onSelectPrompt,
}: LibraryModalProps) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'pdf' | 'code'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreview, setSelectedPreview] = useState<LibraryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const loadItems = () => {
    setItems(getLibraryItems());
  };

  useEffect(() => {
    if (isOpen) {
      loadItems();
      setSearchQuery('');
      setConfirmClear(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => {
      loadItems();
    };
    window.addEventListener(LIBRARY_UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(LIBRARY_UPDATE_EVENT, handleUpdate);
  }, []);

  if (!isOpen) return null;

  // Filter items by tab and search
  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === 'all' ? true : item.type === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (item.title || '').toLowerCase().includes(q) ||
      (item.fileName || '').toLowerCase().includes(q) ||
      (item.prompt || '').toLowerCase().includes(q) ||
      (item.language || '').toLowerCase().includes(q) ||
      (item.content || '').toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  const countByType = {
    all: items.length,
    image: items.filter((i) => i.type === 'image').length,
    pdf: items.filter((i) => i.type === 'pdf').length,
    code: items.filter((i) => i.type === 'code' || i.type === 'file').length,
  };

  const handleCopy = async (item: LibraryItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const textToCopy = item.content || item.prompt || item.title;
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadItem = async (item: LibraryItem, e?: React.MouseEvent) => {
    e?.stopPropagation();

    // 1. Image Download
    if (item.type === 'image' && item.url) {
      try {
        const response = await fetch(item.url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        const safeName = (item.title || 'sas-ai-image')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .slice(0, 30);
        a.download = `${safeName}-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      } catch {
        window.open(item.url, '_blank');
      }
      return;
    }

    // 2. PDF Download
    if (item.type === 'pdf' && item.content) {
      exportDocumentAsPdf(item.title || 'Document Report', item.content);
      return;
    }

    // 3. Code & Data File Download
    if (item.content) {
      const fileName = item.fileName || `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.txt`;
      downloadTextFile(fileName, item.content);
    }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    deleteLibraryItem(id);
    if (selectedPreview?.id === id) {
      setSelectedPreview(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative flex flex-col w-full max-w-5xl h-[94dvh] sm:h-[88vh] max-h-[850px] bg-[#090d19]/95 border border-white/[0.08] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-[#ececec]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 sm:py-4 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#20b8cd]/20 to-[#3b82f6]/20 border border-[#20b8cd]/30 text-[#20b8cd] shrink-0">
              <Files className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-semibold text-white truncate">Universal Library</h2>
                <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-[#20b8cd]/15 text-[#20b8cd] font-semibold border border-[#20b8cd]/25 shrink-0">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#8f8f8f] truncate max-w-xs sm:max-w-none">
                Images, PDFs, Documents, Code files — auto saved
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {items.length > 0 && (
              <>
                {confirmClear ? (
                  <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/30 px-2 py-1 rounded-lg text-xs">
                    <span className="text-red-300 text-[11px]">Clear all?</span>
                    <button
                      onClick={() => {
                        clearLibrary();
                        setConfirmClear(false);
                      }}
                      className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-medium text-[11px] active:scale-95"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-1.5 py-0.5 text-[#8f8f8f] hover:text-white text-[11px]"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClear(true)}
                    type="button"
                    title="Clear Library"
                    className="p-2 sm:p-1.5 rounded-lg text-[#737373] hover:text-red-400 hover:bg-white/[0.04] transition-colors active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClose}
              type="button"
              className="p-2 sm:p-1.5 rounded-lg text-[#8f8f8f] hover:text-white hover:bg-white/[0.06] transition-colors active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Row */}
        <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-white/[0.04] bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
          {/* Category Tabs (Horizontal Scroll on Mobile) */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar shrink-0 pb-0.5 sm:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 active:scale-95 ${
                activeTab === 'all'
                  ? 'bg-white/[0.1] text-white border border-white/[0.12] shadow-sm'
                  : 'text-[#8f8f8f] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>All Items</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.06] font-mono">
                {countByType.all}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('image')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 active:scale-95 ${
                activeTab === 'image'
                  ? 'bg-pink-500/15 text-pink-300 border border-pink-500/30 shadow-sm'
                  : 'text-[#8f8f8f] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Images className="w-3.5 h-3.5 text-pink-400" />
              <span>Images</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.06] font-mono">
                {countByType.image}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pdf')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 active:scale-95 ${
                activeTab === 'pdf'
                  ? 'bg-red-500/15 text-red-300 border border-red-500/30 shadow-sm'
                  : 'text-[#8f8f8f] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-red-400" />
              <span>PDFs</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.06] font-mono">
                {countByType.pdf}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 active:scale-95 ${
                activeTab === 'code'
                  ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-sm'
                  : 'text-[#8f8f8f] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Code</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.06] font-mono">
                {countByType.code}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library..."
              className="w-full pl-8 pr-4 py-1.5 text-[15px] sm:text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#737373] focus:outline-none focus:border-[#20b8cd]/60 focus:ring-1 focus:ring-[#20b8cd]/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 scrollbar-thin pb-safe">
          {items.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#20b8cd]/20 to-[#3b82f6]/20 border border-[#20b8cd]/30 flex items-center justify-center text-[#20b8cd] mb-4 shadow-lg shadow-[#20b8cd]/5">
                <Files className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1.5">
                Library abhi khali hai
              </h3>
              <p className="text-xs text-[#8f8f8f] leading-relaxed mb-4">
                Chat mein aap jo bhi generate karwayenge — chahe <strong>AI Images</strong> hon, <strong>PDFs & Reports</strong> hon, ya <strong>Python / HTML / JSON code files</strong> hon — wo sab automatically is Library mein save ho jayengi!
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            /* Empty Filter */
            <div className="flex flex-col items-center justify-center py-16 text-center text-[#8f8f8f]">
              <Search className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Koi item nahi mila matching "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-[#20b8cd] hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            /* Unified Grid of Images, PDFs, and Code */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                // 1. IMAGE CARD
                if (item.type === 'image') {
                  return (
                    <div
                      key={item.id}
                      className="group relative flex flex-col rounded-xl overflow-hidden border border-white/[0.08] bg-[#0c1222]/80 hover:border-[#20b8cd]/40 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-[#20b8cd]/5"
                    >
                      <div
                        className="relative w-full aspect-square bg-[#121829] overflow-hidden cursor-pointer"
                        onClick={() => setSelectedPreview(item)}
                      >
                        <img
                          src={item.url}
                          alt={item.title || 'AI Image'}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-pink-300 border border-pink-500/20 flex items-center gap-1">
                          <Images className="w-3 h-3" />
                          <span>Image</span>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2.5">
                          <button
                            onClick={() => setSelectedPreview(item)}
                            type="button"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/20 hover:bg-black/90"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>Preview</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleCopy(item, e)}
                              type="button"
                              title="Copy prompt"
                              className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/20 hover:text-[#20b8cd]"
                            >
                              {copiedId === item.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={(e) => handleDownloadItem(item, e)}
                              type="button"
                              title="Download HD photo"
                              className="p-1.5 rounded-lg bg-[#20b8cd] hover:bg-[#1da3b5] text-black font-semibold shadow-md"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(item.id, e)}
                              type="button"
                              title="Delete"
                              className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/20 hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 flex flex-col justify-between flex-1 bg-white/[0.01]">
                        <p className="text-xs text-[#e5e5e5] font-medium line-clamp-2" title={item.title}>
                          {item.title}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04] text-[10px] text-[#737373]">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-2.5 h-2.5" />
                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="text-[#20b8cd]">{item.model || 'FLUX.1'}</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // 2. PDF & DOCUMENT CARD
                if (item.type === 'pdf') {
                  return (
                    <div
                      key={item.id}
                      className="group relative flex flex-col justify-between rounded-xl p-4 border border-red-500/20 bg-gradient-to-b from-[#160c12]/90 to-[#0e0e18] hover:border-red-500/40 transition-all duration-200 shadow-md hover:shadow-xl"
                    >
                      <div>
                        {/* Header Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-[11px] font-semibold">
                            <FileText className="w-3.5 h-3.5 text-red-400" />
                            <span>PDF Document</span>
                          </span>
                          <span className="text-[10px] text-[#8f8f8f] font-mono">
                            {item.fileSize || 'PDF'}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-semibold text-white line-clamp-2 mb-2 leading-snug">
                          {item.title}
                        </h4>

                        {/* Document Content Excerpt */}
                        <p className="text-xs text-[#a0a0a0] line-clamp-4 leading-relaxed font-normal bg-black/30 p-2.5 rounded-lg border border-white/[0.04]">
                          {(item.content || '').replace(/[#*`_]/g, '').slice(0, 160)}...
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedPreview(item)}
                            type="button"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Read</span>
                          </button>

                          <button
                            onClick={(e) => handleDownloadItem(item, e)}
                            type="button"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white shadow-md transition-colors"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleCopy(item, e)}
                            type="button"
                            title="Copy text"
                            className="p-1.5 text-[#8f8f8f] hover:text-white transition-colors"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            type="button"
                            title="Delete"
                            className="p-1.5 text-[#8f8f8f] hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                // 3. CODE & DATA FILE CARD
                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col justify-between rounded-xl p-4 border border-blue-500/20 bg-gradient-to-b from-[#0c152a]/90 to-[#0a0f1d] hover:border-blue-500/40 transition-all duration-200 shadow-md hover:shadow-xl font-sans"
                  >
                    <div>
                      {/* Header Badge */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-semibold uppercase font-mono">
                          <Terminal className="w-3.5 h-3.5 text-blue-400" />
                          <span>{item.language || 'Code'}</span>
                        </span>
                        <span className="text-[10px] text-[#8f8f8f] font-mono">
                          {item.fileSize || 'Code'}
                        </span>
                      </div>

                      {/* File Name Title */}
                      <h4 className="text-xs font-semibold text-white truncate font-mono text-[#38bdf8] mb-2">
                        {item.fileName || item.title}
                      </h4>

                      {/* Code Block Snippet Preview */}
                      <div className="bg-[#050914] p-2.5 rounded-lg border border-white/[0.06] overflow-hidden text-[11px] font-mono text-[#94a3b8] max-h-24 leading-snug">
                        <pre className="overflow-hidden truncate">
                          <code>{item.content?.slice(0, 150)}</code>
                        </pre>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedPreview(item)}
                          type="button"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={(e) => handleDownloadItem(item, e)}
                          type="button"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleCopy(item, e)}
                          type="button"
                          title="Copy code"
                          className="p-1.5 text-[#8f8f8f] hover:text-white transition-colors"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          type="button"
                          title="Delete"
                          className="p-1.5 text-[#8f8f8f] hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Document Reader / Code Inspector */}
      {selectedPreview && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in"
          onClick={() => setSelectedPreview(null)}
        >
          <div
            className="relative flex flex-col max-w-4xl w-full max-h-[92vh] bg-[#0c1222] border border-white/15 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-2 max-w-xl">
                <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold uppercase bg-white/10 text-[#38bdf8]">
                  {selectedPreview.type}
                </span>
                <span className="text-sm font-semibold text-white truncate">
                  {selectedPreview.title || selectedPreview.fileName}
                </span>
              </div>
              <button
                onClick={() => setSelectedPreview(null)}
                className="p-1.5 text-[#8f8f8f] hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin bg-[#060a14]">
              {selectedPreview.type === 'image' && (
                <div className="flex items-center justify-center min-h-[350px]">
                  <img
                    src={selectedPreview.url}
                    alt={selectedPreview.title}
                    className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                  />
                </div>
              )}

              {selectedPreview.type === 'pdf' && (
                <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-white text-slate-800 shadow-xl font-serif leading-relaxed text-sm">
                  <h1 className="text-2xl font-bold font-sans text-slate-900 border-b pb-3 mb-4">
                    {selectedPreview.title}
                  </h1>
                  <div className="whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed text-slate-700">
                    {selectedPreview.content}
                  </div>
                </div>
              )}

              {selectedPreview.type === 'code' && (
                <div className="rounded-xl overflow-hidden border border-white/10 bg-[#02050e] p-4 font-mono text-xs text-[#e2e8f0]">
                  <pre className="overflow-x-auto">
                    <code>{selectedPreview.content}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-black/50 border-t border-white/10 flex items-center justify-between gap-3">
              <span className="text-xs text-[#8f8f8f] font-mono">
                {selectedPreview.fileSize || selectedPreview.model || 'SAS AI'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(selectedPreview)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-medium text-white transition-colors"
                >
                  {copiedId === selectedPreview.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownloadItem(selectedPreview)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#20b8cd] hover:bg-[#1da3b5] text-xs font-semibold text-black transition-colors shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {selectedPreview.type === 'pdf'
                      ? 'Download PDF'
                      : selectedPreview.type === 'image'
                      ? 'Download Image'
                      : 'Download File'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
