import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.ts';
import type { Facility } from '../types/hotel.ts';
import { Waves, Building, ArrowUpRight, BedDouble, Sparkles, CheckCircle2 } from 'lucide-react';

interface FacilitiesPageProps {
  onBookClick: () => void;
}

export const FacilitiesPage: React.FC<FacilitiesPageProps> = ({ onBookClick }) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFacilities() {
      try {
        const data = await api.getFacilities();
        setFacilities(data);
      } catch (err) {
        console.error('Error fetching facilities:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFacilities();
  }, []);

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'Waves':
        return <Waves className="w-5 h-5 text-[#B89667]" />;
      case 'Building':
        return <Building className="w-5 h-5 text-[#B89667]" />;
      case 'ArrowUpRight':
        return <ArrowUpRight className="w-5 h-5 text-[#B89667]" />;
      case 'BedDouble':
        return <BedDouble className="w-5 h-5 text-[#B89667]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#B89667]" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#B89667]">
          Hotel Amenities & Infrastructure
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1A18]">
          Signature Facilities
        </h1>
        <p className="text-sm text-[#66655E] leading-relaxed">
          From our outdoor azure swimming pool to smooth escalators and high-speed elevators, ANABE HOTEL provides modern convenience and comfort.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-[#EFECE4] animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-white rounded-xl border border-[#E2DED4] overflow-hidden flex flex-col sm:flex-row group hover:shadow-md transition-all"
            >
              <div className="sm:w-1/2 h-64 sm:h-auto overflow-hidden relative">
                <img
                  src={fac.image}
                  alt={fac.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs p-2 rounded-full shadow-xs">
                  {getIcon(fac.icon)}
                </div>
              </div>
              <div className="p-6 sm:w-1/2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-semibold text-[#B89667] tracking-wider">
                      Featured Facility
                    </span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {fac.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#1A1A18] mb-3">
                    {fac.name}
                  </h3>
                  <p className="text-xs text-[#5C5B55] leading-relaxed">
                    {fac.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#F0ECE2] flex items-center gap-2 text-xs text-[#7A7870]">
                  <CheckCircle2 className="w-4 h-4 text-[#B89667]" />
                  <span>Available to all registered hotel guests</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA Box */}
      <div className="bg-[#FAF6EF] rounded-xl border border-[#E6D4B7] p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-4">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18]">
          Ready to Experience ANABE HOTEL?
        </h3>
        <p className="text-xs sm:text-sm text-[#66655E]">
          Reserve your room today and enjoy full access to our swimming pool, leisure facilities, and personalized service.
        </p>
        <div className="pt-2">
          <button
            onClick={onBookClick}
            className="px-8 py-3 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
          >
            Book Your Stay Now
          </button>
        </div>
      </div>
    </div>
  );
};
