import React, { useState } from 'react';
import { Menu, X, Calendar, UserCheck, PhoneCall } from 'lucide-react';
import type { HotelSettings } from '../types/hotel.ts';

interface NavbarProps {
  settings: HotelSettings | null;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenLookup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  currentRoute,
  onNavigate,
  onOpenLookup,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Rooms', route: '/rooms' },
    { label: 'Facilities', route: '/facilities' },
    { label: 'Gallery', route: '/gallery' },
    { label: 'FAQ', route: '/faq' },
    { label: 'About', route: '/about' },
    { label: 'Contact', route: '/contact' },
  ];

  const handleLinkClick = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  const hotelName = settings?.hotelName || 'ANABE HOTEL';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[#E8E4DA] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Zone 1: Luxury Brand Identity Logo linking to Homepage */}
        <button
          onClick={() => handleLinkClick('/')}
          className="flex items-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B89667] rounded-sm py-1"
          aria-label="ANABE HOTEL - Return to Homepage"
        >
          <img
            src="/anabe-hotel-logo.png"
            alt="ANABE HOTEL Logo"
            className="h-11 sm:h-13 w-auto object-contain transition-transform duration-200 group-hover:scale-102"
            width={120}
            height={48}
          />
        </button>

        {/* Zone 2: 4-6 clean text navigation links with subtle underlines */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4A4A45]">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route;
            return (
              <button
                key={link.route}
                onClick={() => handleLinkClick(link.route)}
                className={`py-1 relative transition-colors cursor-pointer hover:text-[#1A1A18] ${
                  isActive ? 'text-[#1A1A18] font-semibold' : 'text-[#5A5A54]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B89667] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={onOpenLookup}
            className="text-xs font-medium text-[#5A5A54] hover:text-[#1A1A18] transition-colors flex items-center gap-1.5 cursor-pointer py-2 px-2"
          >
            <Calendar className="w-3.5 h-3.5 text-[#B89667]" />
            Find Booking
          </button>
          <button
            onClick={() => handleLinkClick('/booking')}
            className="px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-white bg-[#1A1A18] hover:bg-[#B89667] transition-all duration-200 rounded shadow-xs cursor-pointer"
          >
            Book Your Stay
          </button>
          <button
            onClick={() => handleLinkClick('/admin/login')}
            className="p-2 text-[#7A7A73] hover:text-[#1A1A18] transition-colors cursor-pointer rounded"
            title="Staff & Management Portal"
          >
            <UserCheck className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => handleLinkClick('/booking')}
            className="px-3 py-1.5 text-xs font-medium text-white bg-[#1A1A18] rounded"
          >
            Book
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#1A1A18] hover:text-[#B89667] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF9F5] border-b border-[#E8E4DA] px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.route}
                onClick={() => handleLinkClick(link.route)}
                className={`block w-full text-left py-2 px-3 text-base rounded ${
                  currentRoute === link.route
                    ? 'bg-[#EFECE4] text-[#1A1A18] font-semibold'
                    : 'text-[#4A4A45]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E8E4DA] flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenLookup();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 text-sm text-[#4A4A45] flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#B89667]" />
              Find Existing Booking
            </button>
            <button
              onClick={() => handleLinkClick('/admin/login')}
              className="w-full text-left py-2 px-3 text-sm text-[#4A4A45] flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-[#B89667]" />
              Staff & Admin Portal
            </button>
            {settings?.phone1 && (
              <a
                href={`tel:${settings.phone1.replace(/\s+/g, '')}`}
                className="py-2 px-3 text-sm text-[#B89667] font-medium flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                Direct: {settings.phone1}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
