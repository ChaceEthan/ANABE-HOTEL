import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, ArrowUpRight, Calendar, BedDouble } from 'lucide-react';
import type { HotelSettings } from '../types/hotel.ts';

interface FooterProps {
  settings: HotelSettings | null;
  onNavigate: (route: string) => void;
  onOpenLookup: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate, onOpenLookup }) => {
  const hotelName = settings?.hotelName || 'ANABE HOTEL';
  const phone1 = settings?.phone1 || '0788 845 520';
  const phone2 = settings?.phone2 || '0783 218 170';
  const email = settings?.email || 'info@anabehotel.com';
  const address = settings?.address || 'KG 15 Avenue, Luxury Boulevard';
  const city = settings?.city || 'Kigali';
  const country = settings?.country || 'Rwanda';

  return (
    <footer className="bg-[#141518] text-[#D8D7D2] pt-16 pb-12 border-t border-[#25272C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-14 border-b border-[#25272C]">
          {/* Brand & Identity */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl tracking-widest text-[#FFFFFF] font-semibold uppercase">
              {hotelName}
            </h3>
            <p className="text-sm text-[#A09F98] leading-relaxed">
              65 thoughtfully appointed guest rooms, serene swimming pool, high-speed escalators and elevators, offering unmatched hospitality and comfort in Rwanda.
            </p>
            <div className="pt-2 text-xs text-[#787770]">
              Check-in: <span className="text-[#E0DFD8]">{settings?.checkInTime || '14:00'}</span> · Check-out: <span className="text-[#E0DFD8]">{settings?.checkOutTime || '11:00'}</span>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/booking')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#B89667] hover:bg-[#A38355] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book a Stay</span>
              </button>
            </div>
          </div>

          {/* Direct Owner & Reception Contacts */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#B89667]">
              Direct Contact & Reservations
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#B89667] shrink-0 mt-0.5" />
                <div>
                  <a
                    href={`tel:${phone1.replace(/\s+/g, '')}`}
                    className="block text-[#FFFFFF] hover:text-[#B89667] transition-colors tabular-nums font-medium"
                  >
                    {phone1}
                  </a>
                  <a
                    href={`tel:${phone2.replace(/\s+/g, '')}`}
                    className="block text-[#FFFFFF] hover:text-[#B89667] transition-colors tabular-nums font-medium mt-1"
                  >
                    {phone2}
                  </a>
                  <span className="text-xs text-[#807F78] block mt-1">Available 24/7 for bookings & WhatsApp</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Mail className="w-4 h-4 text-[#B89667] shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="text-[#D8D7D2] hover:text-[#FFFFFF] transition-colors text-xs"
                >
                  {email}
                </a>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <MapPin className="w-4 h-4 text-[#B89667] shrink-0 mt-0.5" />
                <span className="text-xs text-[#A09F98] leading-snug">
                  {address}, {city}, {country}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#B89667]">
              Guest Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/rooms')}
                  className="hover:text-[#FFFFFF] transition-colors text-left text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <BedDouble className="w-3.5 h-3.5 text-[#B89667]" />
                  <span>Rooms & Suites (65 Units)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/booking')}
                  className="hover:text-[#FFFFFF] transition-colors text-left text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#B89667]" />
                  <span>Direct Online Reservation</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/facilities')}
                  className="hover:text-[#FFFFFF] transition-colors text-left text-xs cursor-pointer"
                >
                  Swimming Pool & Elevators
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/gallery')}
                  className="hover:text-[#FFFFFF] transition-colors text-left text-xs cursor-pointer"
                >
                  Photo Gallery Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-[#FFFFFF] transition-colors text-left text-xs cursor-pointer"
                >
                  About ANABE HOTEL
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-[#FFFFFF] transition-colors text-left text-xs cursor-pointer"
                >
                  Contact Us & Online Inquiries
                </button>
              </li>
            </ul>
          </div>

          {/* Booking Verification & Administration */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#B89667]">
              Guest Services & Portal
            </h4>
            <p className="text-xs text-[#8E8D86] leading-relaxed">
              Have an active reservation reference? Check your reservation status, room allocation, and check-in times.
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={onOpenLookup}
                className="w-full py-2.5 px-3 bg-[#202227] hover:bg-[#2C2E35] text-xs text-[#EAE9E4] font-medium rounded border border-[#32353E] transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Find Booking Confirmation</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#B89667]" />
              </button>
              <button
                onClick={() => onNavigate('/admin/login')}
                className="w-full py-2.5 px-3 bg-transparent hover:bg-[#1E2025] text-xs text-[#8E8D86] hover:text-[#D8D7D2] transition-colors text-left flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#B89667]" />
                Staff & Manager Login
              </button>
            </div>
          </div>
        </div>

        {/* Sub-footer with Legal, Privacy, Terms, and Contact */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#7E7D76]">
          <div>
            © {new Date().getFullYear()} {hotelName}. All rights reserved. Direct Reservations: {phone1} · {phone2}
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
            <button
              onClick={() => onNavigate('/privacy')}
              className="text-[#9E9D96] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigate('/terms')}
              className="text-[#9E9D96] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigate('/contact')}
              className="text-[#9E9D96] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            >
              Contact
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigate('/booking')}
              className="text-[#9E9D96] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            >
              Booking
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigate('/rooms')}
              className="text-[#9E9D96] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            >
              Rooms
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
