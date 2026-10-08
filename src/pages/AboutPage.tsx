import React from 'react';
import { BedDouble, Waves, Building, ArrowUpRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import type { HotelSettings } from '../types/hotel.ts';

interface AboutPageProps {
  settings: HotelSettings | null;
  onBookClick: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, onBookClick }) => {
  const hotelName = settings?.hotelName || 'ANABE HOTEL';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#B89667]">
          Our Story & Philosophy
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1A18]">
          About {hotelName}
        </h1>
        <p className="text-sm text-[#66655E] leading-relaxed">
          Rooted in personalized service, architectural grace, and peaceful comfort in the vibrant heart of Kigali.
        </p>
      </div>

      {/* Main Story & Image */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18] leading-tight">
            A Sanctuary of Comfort and Modern Infrastructure
          </h2>
          <p className="text-sm text-[#5C5B55] leading-relaxed">
            {hotelName} was established to provide an exceptional standard of hospitality. Featuring approximately 65 guest accommodation units spread thoughtfully across four accessible floors, our hotel combines serene private quarters with state-of-the-art building infrastructure.
          </p>
          <p className="text-sm text-[#5C5B55] leading-relaxed">
            Guests move effortlessly between our welcoming ground atrium and their rooms via modern escalators and high-speed elevators. After a productive day in the city, our outdoor swimming pool offers a refreshing retreat surrounded by lush landscaping and tranquil evening lights.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E8E4DA]">
            <div className="p-4 bg-white rounded-lg border border-[#E2DED4]">
              <span className="block font-serif text-3xl font-bold text-[#1A1A18] tabular-nums">65</span>
              <span className="text-xs text-[#7A7870] font-medium">Guest Accommodation Rooms</span>
            </div>
            <div className="p-4 bg-white rounded-lg border border-[#E2DED4]">
              <span className="block font-serif text-3xl font-bold text-[#1A1A18] tabular-nums">24/7</span>
              <span className="text-xs text-[#7A7870] font-medium">Front Desk & Security</span>
            </div>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-[#E2DED4] shadow-md">
          <img
            src="/src/assets/images/hero_hotel_exterior_1791471883513.jpg"
            alt={hotelName}
            className="w-full h-[450px] object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Pillars */}
      <div className="bg-[#FAF9F5] p-8 sm:p-12 rounded-xl border border-[#E2DED4]">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h3 className="font-serif text-2xl font-bold text-[#1A1A18]">
            Core Hospitality Values
          </h3>
          <p className="text-xs text-[#66655E] mt-1">
            Every guest experience at {hotelName} is guided by our commitment to excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-[#EDE9DF] space-y-3">
            <HeartHandshake className="w-6 h-6 text-[#B89667]" />
            <h4 className="font-serif text-lg font-bold text-[#1A1A18]">Attentive Guest Service</h4>
            <p className="text-xs text-[#66655E] leading-relaxed">
              Warm, respectful, and proactive assistance from our reception and concierge teams from arrival to departure.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#EDE9DF] space-y-3">
            <ShieldCheck className="w-6 h-6 text-[#B89667]" />
            <h4 className="font-serif text-lg font-bold text-[#1A1A18]">Impeccable Cleanliness</h4>
            <p className="text-xs text-[#66655E] leading-relaxed">
              Strict housekeeping protocols and daily sanitization across all 65 rooms, elevators, and pool facilities.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#EDE9DF] space-y-3">
            <Building className="w-6 h-6 text-[#B89667]" />
            <h4 className="font-serif text-lg font-bold text-[#1A1A18]">Seamless Mobility</h4>
            <p className="text-xs text-[#66655E] leading-relaxed">
              Integrated escalator and elevator networks guaranteeing full accessibility for guests, luggage, and families.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
