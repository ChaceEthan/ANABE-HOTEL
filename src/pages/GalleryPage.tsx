import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Head } from '../components/Head.tsx';
import { api } from '../lib/api.ts';
import type { GalleryItem } from '../types/hotel.ts';

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getGallery()
      .then(setItems)
      .catch(() => setError('The gallery is temporarily unavailable. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  const openItem = async (item: GalleryItem) => {
    try {
      setSelectedItem(await api.getGalleryItem(item.id));
    } catch {
      setSelectedItem(item);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <Head
        title="Gallery | ANABE HOTEL"
        description="Explore the rooms, facilities, and spaces at ANABE HOTEL."
        path="/gallery"
        image="/logo/anabe-hotel-logo.svg"
      />
      <header className="max-w-3xl mb-10 sm:mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#B89667]">A closer look</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1A1A18] mt-3">Hotel Gallery</h1>
        <p className="text-[#69685F] mt-4">Discover the rooms and welcoming spaces of ANABE HOTEL.</p>
      </header>

      {loading && <p className="text-sm text-[#69685F]">Loading gallery...</p>}
      {error && <p role="status" className="text-sm text-red-700">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-[#69685F]">Gallery images will be available soon.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openItem(item)}
            className="group text-left overflow-hidden rounded border border-[#E2DED4] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B89667]"
          >
            {item.mediaType === 'VIDEO' ? (
              <video src={item.imageUrl} className="w-full aspect-[4/3] object-cover" muted />
            ) : (
              <img
                src={item.imageUrl}
                alt={item.altText || item.title}
                loading="lazy"
                className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            )}
            <span className="block p-4">
              <span className="block text-xs uppercase tracking-wider text-[#8A7660]">{item.category}</span>
              <span className="block mt-1 font-serif text-xl text-[#1A1A18]">{item.title}</span>
              <span className="block mt-2 text-sm text-[#69685F] line-clamp-2">{item.caption}</span>
            </span>
          </button>
        ))}
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/75 p-4 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-item-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedItem(null);
          }}
        >
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-auto rounded">
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              aria-label="Close gallery details"
              className="absolute top-3 right-3 z-10 p-2 bg-white/90 text-[#1A1A18] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            {selectedItem.mediaType === 'VIDEO' ? (
              <video src={selectedItem.imageUrl} controls className="w-full max-h-[65vh] bg-black" />
            ) : (
              <img src={selectedItem.imageUrl} alt={selectedItem.altText || selectedItem.title} className="w-full max-h-[65vh] object-contain bg-black" />
            )}
            <div className="p-5 sm:p-7">
              <p className="text-xs uppercase tracking-wider text-[#8A7660]">{selectedItem.category}</p>
              <h2 id="gallery-item-title" className="font-serif text-2xl text-[#1A1A18] mt-2">{selectedItem.title}</h2>
              <p className="text-sm text-[#69685F] mt-3">{selectedItem.description || selectedItem.caption}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};