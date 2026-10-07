'use client';

import React, { useState } from 'react';
import { Bookmark, ArrowDown, Maximize2, X, Check, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { saveLibraryItem } from '@/lib/libraryStorage';

export interface GalleryPhoto {
  url: string;
  title: string;
  caption?: string;
  source?: string;
}

interface PhotoGalleryProps {
  photos: GalleryPhoto[];
  title?: string;
}

export default function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [savedIndexes, setSavedIndexes] = useState<Record<number, boolean>>({});
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  if (!photos || photos.length === 0) return null;

  const mainPhoto = photos[0];
  const sidePhotos = photos.slice(1, 3);

  const handleSaveToLibrary = (photo: GalleryPhoto, index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    saveLibraryItem({
      title: photo.title || title || 'Saved Photo',
      type: 'image',
      url: photo.url,
      prompt: photo.title,
      model: photo.source || 'Photo Search',
    });
    setSavedIndexes((prev) => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setSavedIndexes((prev) => ({ ...prev, [index]: false }));
    }, 2500);
  };

  const handleDownload = async (photo: GalleryPhoto, index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDownloadingIndex(index);

    // Also auto-save to library
    handleSaveToLibrary(photo, index);

    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const cleanName = (photo.title || title || 'photo')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .slice(0, 30);
      a.download = `${cleanName}-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback
      window.open(photo.url, '_blank');
    } finally {
      setDownloadingIndex(null);
    }
  };

  return (
    <div className="my-4 max-w-3xl w-full animate-fade-in">
      {title && (
        <div className="mb-2.5 flex items-center justify-between text-xs text-[#a0a0a0]">
          <span className="font-semibold text-[#e5e5e5]">{title}</span>
          <span className="text-[11px] text-[#737373]">
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
          </span>
        </div>
      )}

      {/* 3-Photo Grid Layout matching the screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 rounded-2xl overflow-hidden">
        {/* Main Prominent Photo (Left) */}
        <div
          onClick={() => setActivePhotoIndex(0)}
          className={`group relative overflow-hidden rounded-2xl bg-[#141824] border border-white/10 cursor-pointer transition-all hover:border-white/20 shadow-xl ${
            sidePhotos.length > 0 ? 'sm:col-span-7 md:col-span-8 min-h-[280px] sm:min-h-[360px]' : 'sm:col-span-12 min-h-[300px]'
          }`}
        >
          <img
            src={mainPhoto.url}
            alt={mainPhoto.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />

          {/* Top-Right: Bookmark Icon Button (Matching Screenshot) */}
          <button
            onClick={(e) => handleSaveToLibrary(mainPhoto, 0, e)}
            type="button"
            title={savedIndexes[0] ? 'Saved to Library!' : 'Bookmark / Save to Library'}
            className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/85 backdrop-blur-md text-white/90 hover:text-white border border-white/15 transition-all shadow-lg active:scale-95"
          >
            {savedIndexes[0] ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>

          {/* Bottom-Right: Circular Downward Arrow Download Button (Matching Screenshot) */}
          <button
            onClick={(e) => handleDownload(mainPhoto, 0, e)}
            type="button"
            title="Download Photo"
            className="absolute bottom-3 right-3 p-2.5 rounded-full bg-black/65 hover:bg-black/90 backdrop-blur-md text-white border border-white/15 transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            {downloadingIndex === 0 ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )}
          </button>

          {/* Bottom title pill on hover */}
          <div className="absolute bottom-3 left-3 max-w-[70%] px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-[#e0e0e0] truncate opacity-0 group-hover:opacity-100 transition-opacity">
            {mainPhoto.title}
          </div>
        </div>

        {/* Right Column: 2 Stacked Photos (Matching Screenshot) */}
        {sidePhotos.length > 0 && (
          <div className="sm:col-span-5 md:col-span-4 flex flex-col gap-2.5">
            {sidePhotos.map((photo, i) => {
              const photoIdx = i + 1;
              return (
                <div
                  key={photo.url + photoIdx}
                  onClick={() => setActivePhotoIndex(photoIdx)}
                  className="group relative flex-1 min-h-[140px] sm:min-h-[174px] rounded-2xl overflow-hidden bg-[#141824] border border-white/10 cursor-pointer transition-all hover:border-white/20 shadow-md"
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />

                  {/* Top-Right: Bookmark Icon Button */}
                  <button
                    onClick={(e) => handleSaveToLibrary(photo, photoIdx, e)}
                    type="button"
                    title={savedIndexes[photoIdx] ? 'Saved to Library!' : 'Save to Library'}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-black/85 backdrop-blur-md text-white/90 hover:text-white border border-white/15 transition-all opacity-0 group-hover:opacity-100"
                  >
                    {savedIndexes[photoIdx] ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Bottom-Right: Download Button */}
                  <button
                    onClick={(e) => handleDownload(photo, photoIdx, e)}
                    type="button"
                    title="Download Photo"
                    className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-black/65 hover:bg-black/90 backdrop-blur-md text-white border border-white/15 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Caption on hover */}
                  <div className="absolute bottom-2.5 left-2.5 max-w-[65%] px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] text-[#e0e0e0] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.title}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activePhotoIndex !== null && photos[activePhotoIndex] && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/92 backdrop-blur-lg animate-fade-in"
          onClick={() => setActivePhotoIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {photos[activePhotoIndex].title}
                </span>
                <span className="text-xs text-[#8f8f8f]">
                  ({activePhotoIndex + 1} / {photos.length})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleSaveToLibrary(photos[activePhotoIndex], activePhotoIndex)
                  }
                  type="button"
                  title="Bookmark to Library"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-medium text-white transition-colors border border-white/10"
                >
                  {savedIndexes[activePhotoIndex] ? (
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
                  onClick={() =>
                    handleDownload(photos[activePhotoIndex], activePhotoIndex)
                  }
                  type="button"
                  title="Download full image"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#20b8cd] hover:bg-[#1ca4b7] text-xs font-semibold text-black transition-colors"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => setActivePhotoIndex(null)}
                  type="button"
                  className="p-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-[#a0a0a0] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Lightbox Image View */}
            <div className="relative w-full flex items-center justify-center max-h-[75vh] overflow-hidden rounded-2xl bg-black/50 border border-white/10">
              <img
                src={photos[activePhotoIndex].url}
                alt={photos[activePhotoIndex].title}
                className="max-h-[75vh] max-w-full w-auto object-contain rounded-2xl shadow-2xl"
              />

              {/* Prev / Next Navigation */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActivePhotoIndex((prev) =>
                        prev === null ? 0 : (prev - 1 + photos.length) % photos.length
                      )
                    }
                    type="button"
                    className="absolute left-3 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/15 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActivePhotoIndex((prev) =>
                        prev === null ? 0 : (prev + 1) % photos.length
                      )
                    }
                    type="button"
                    className="absolute right-3 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/15 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Source attribution / caption */}
            {photos[activePhotoIndex].source && (
              <p className="mt-2 text-[11px] text-[#737373]">
                Source: {photos[activePhotoIndex].source}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
