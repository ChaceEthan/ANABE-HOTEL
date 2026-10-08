import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api.ts';
import type { GalleryItem } from '../types/hotel.ts';
import { Camera, Eye, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { ProgressiveImage } from '../components/ProgressiveImage.tsx';

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        const data = await api.getGallery();
        setItems(data);
      } catch (err) {
        console.error('Error fetching gallery:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  const categories = ['ALL', 'Exterior', 'Swimming Pool', 'Rooms', 'Lobby', 'Facilities'];

  const filteredItems = activeCategory === 'ALL'
    ? items
    : items.filter((i) => i.category.toLowerCase() === activeCategory.toLowerCase());

  const selectedPhoto = selectedPhotoIndex !== null && filteredItems[selectedPhotoIndex]
    ? filteredItems[selectedPhotoIndex]
    : null;

  const handleNextPhoto = useCallback(() => {
    if (selectedPhotoIndex === null || filteredItems.length === 0) return;
    setSelectedPhotoIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : 0));
  }, [selectedPhotoIndex, filteredItems.length]);

  const handlePrevPhoto = useCallback(() => {
    if (selectedPhotoIndex === null || filteredItems.length === 0) return;
    setSelectedPhotoIndex((prev) =>
      prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
    );
  }, [selectedPhotoIndex, filteredItems.length]);

  const handleCloseLightbox = useCallback(() => {
    setSelectedPhotoIndex(null);
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedPhotoIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseLightbox();
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, handleCloseLightbox, handleNextPhoto, handlePrevPhoto]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6EF] border border-[#E6D4B7] text-[#9E7D50] text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Photographic Showcase</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1A18] tracking-tight">
          ANABE HOTEL Gallery
        </h1>
        <p className="text-sm text-[#66655E] leading-relaxed max-w-2xl mx-auto">
          Glimpse into the serene ambiance of our 65 guest rooms, crystal-clear outdoor swimming pool, grand interior escalators, and welcoming architecture.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => {
          const count = cat === 'ALL'
            ? items.length
            : items.filter((i) => i.category.toLowerCase() === cat.toLowerCase()).length;

          return (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedPhotoIndex(null);
              }}
              className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer flex items-center gap-2 ${
                activeCategory === cat
                  ? 'bg-[#1A1A18] text-white shadow-sm ring-1 ring-[#1A1A18]'
                  : 'bg-[#F4F1EA] text-[#55544E] hover:bg-[#EAE5D8] hover:text-[#1A1A18]'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === cat
                    ? 'bg-white/20 text-white'
                    : 'bg-[#E2DDD0] text-[#73716A]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden border border-[#E2DED4] shadow-xs"
            >
              <div className="h-64 bg-[#EFECE4] animate-pulse relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-[#EFECE4] rounded w-2/3 animate-pulse" />
                <div className="h-3 bg-[#EFECE4] rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-[#E2DED4] p-8 max-w-md mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#F4F1EA] flex items-center justify-center mx-auto mb-3">
            <Camera className="w-7 h-7 text-[#9E7D50]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#1A1A18]">
            No Photographs in this Category
          </h3>
          <p className="text-xs text-[#73716A] mt-1">
            Try choosing another category or return to the complete showcase.
          </p>
          <button
            onClick={() => setActiveCategory('ALL')}
            className="mt-4 px-4 py-2 text-xs font-semibold bg-[#1A1A18] text-white rounded hover:bg-[#333] transition-colors cursor-pointer"
          >
            Show All Photographs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <article
              key={item.id}
              onClick={() => setSelectedPhotoIndex(index)}
              className="group bg-white rounded-xl overflow-hidden border border-[#E2DED4] cursor-pointer hover:shadow-lg transition-all duration-300 flex flex-col hover:-translate-y-0.5"
            >
              {/* Progressive Image Container */}
              <div className="relative h-64 overflow-hidden bg-[#ECE8DE]">
                <ProgressiveImage
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  zoomOnHover={true}
                  containerClassName="w-full h-full"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white pointer-events-none z-10">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-md transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Category Pill */}
                <div className="absolute top-3 left-3 bg-[#1A1A18]/85 backdrop-blur-xs text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded shadow-xs z-10">
                  {item.category}
                </div>
              </div>

              {/* Caption details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#1A1A18] group-hover:text-[#9E7D50] transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  {item.caption && (
                    <p className="text-xs text-[#66655E] line-clamp-2 mt-1.5 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-[#F2EFE8] flex items-center justify-between text-[11px] text-[#8C8980]">
                  <span>Click to view full photo</span>
                  <span className="font-medium text-[#B89667]">Expand &rarr;</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Lightbox Modal with Progressive Loading & Navigation */}
      {selectedPhoto && selectedPhotoIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedPhoto.title}
          onClick={handleCloseLightbox}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl w-full bg-[#18191B] text-white rounded-2xl overflow-hidden relative border border-neutral-800 shadow-2xl flex flex-col max-h-[92vh]"
          >
            {/* Top Bar Controls */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#121315] border-b border-neutral-800 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-[11px] uppercase tracking-widest text-[#D8BD90] font-semibold bg-[#2A2318] px-2.5 py-0.5 rounded">
                  {selectedPhoto.category}
                </span>
                <span className="text-neutral-400 font-mono text-[11px]">
                  {selectedPhotoIndex + 1} / {filteredItems.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCloseLightbox}
                  aria-label="Close photo preview"
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progressive Image View Area with Carousel Arrows */}
            <div className="relative flex-1 min-h-[350px] sm:min-h-[460px] max-h-[70vh] flex items-center justify-center bg-black overflow-hidden select-none">
              <ProgressiveImage
                key={selectedPhoto.imageUrl}
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                loading="eager"
                decoding="async"
                containerClassName="w-full h-full max-h-[70vh] flex items-center justify-center bg-black"
                className="max-h-[70vh] w-auto max-w-full object-contain mx-auto"
              />

              {/* Previous Photo Button */}
              {filteredItems.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevPhoto();
                  }}
                  aria-label="Previous photograph"
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all cursor-pointer backdrop-blur-xs border border-white/10 hover:scale-105 z-20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Next Photo Button */}
              {filteredItems.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextPhoto();
                  }}
                  aria-label="Next photograph"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all cursor-pointer backdrop-blur-xs border border-white/10 hover:scale-105 z-20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Caption & Details Footer */}
            <div className="p-5 sm:p-6 bg-[#18191B] border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                  {selectedPhoto.title}
                </h2>
                {selectedPhoto.caption && (
                  <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl leading-relaxed">
                    {selectedPhoto.caption}
                  </p>
                )}
              </div>
              <div className="text-[11px] text-neutral-400 self-end sm:self-center shrink-0">
                Use <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-300 border border-neutral-700">←</kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-300 border border-neutral-700">→</kbd> to navigate,{' '}
                <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-300 border border-neutral-700">ESC</kbd> to exit
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
