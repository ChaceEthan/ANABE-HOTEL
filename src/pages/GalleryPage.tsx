import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.ts';
import type { GalleryItem } from '../types/hotel.ts';
import { Camera, Eye, X } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#B89667]">
          Photographic Showcase
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1A18]">
          ANABE HOTEL Gallery
        </h1>
        <p className="text-sm text-[#66655E] leading-relaxed">
          Glimpse into the serene ambiance of our 65 guest rooms, refreshing outdoor swimming pool, and grand interior atrium.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-xs font-medium rounded transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#1A1A18] text-white shadow-xs'
                : 'bg-[#F2EFE8] text-[#55544E] hover:bg-[#E5E1D5]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-[#EFECE4] animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-[#E2DED4] p-8">
          <Camera className="w-10 h-10 text-[#9E9C94] mx-auto mb-2" />
          <h3 className="font-serif text-lg font-bold text-[#1A1A18]">No Photographs in this Category</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="group bg-white rounded-lg overflow-hidden border border-[#E2DED4] cursor-pointer hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative h-64 overflow-hidden bg-neutral-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <div className="p-3 bg-white/20 backdrop-blur-xs rounded-full">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-[#1A1A18]/80 text-white text-[10px] uppercase font-semibold px-2 py-0.5 rounded">
                  {item.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-serif text-base font-bold text-[#1A1A18] line-clamp-1">
                  {item.title}
                </h3>
                {item.caption && (
                  <p className="text-xs text-[#66655E] line-clamp-2 mt-1">
                    {item.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="max-w-4xl w-full bg-[#1A1A18] text-white rounded-lg overflow-hidden relative border border-neutral-700">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[75vh] flex items-center justify-center bg-black">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="max-h-[75vh] w-auto max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6 bg-[#1A1A18]">
              <span className="text-[10px] uppercase tracking-wider text-[#D8BD90] font-semibold block mb-1">
                {selectedPhoto.category}
              </span>
              <h2 className="font-serif text-2xl font-bold">{selectedPhoto.title}</h2>
              {selectedPhoto.caption && (
                <p className="text-xs text-[#AAA8A0] mt-2">{selectedPhoto.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
