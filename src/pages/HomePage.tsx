import React, { useEffect, useState } from 'react';
import { QuickBookingBar } from '../components/QuickBookingBar.tsx';
import { Logo } from '../components/Logo.tsx';
import { api } from '../lib/api.ts';
import type { Room, Facility, GalleryItem, HotelSettings } from '../types/hotel.ts';
import {
  ArrowRight,
  BedDouble,
  Users,
  Waves,
  Building,
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface HomePageProps {
  settings: HotelSettings | null;
  onNavigate: (route: string, state?: any) => void;
  onSelectRoom: (room: Room) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ settings, onNavigate, onSelectRoom }) => {
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [roomsData, facsData, galData] = await Promise.all([
          api.getRooms(),
          api.getFacilities(),
          api.getGallery(),
        ]);
        const featured = roomsData.filter((r) => r.featured).slice(0, 4);
        setFeaturedRooms(featured.length > 0 ? featured : roomsData.slice(0, 4));
        setFacilities(facsData.slice(0, 4));
        setGallery(galData.slice(0, 4));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (params: { checkIn: string; checkOut: string; guests: number }) => {
    onNavigate('/rooms', params);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);
    try {
      await api.submitContact({
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        message: contactMessage,
      });
      setContactSent(true);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMessage('');
    } catch (err: any) {
      setContactError(err.message || 'Failed to send message.');
    }
  };

  const hotelName = settings?.hotelName || 'ANABE HOTEL';
  const phone1 = settings?.phone1 || '0788 845 520';
  const phone2 = settings?.phone2 || '0783 218 170';

  const getFacilityIcon = (iconName: string) => {
    switch (iconName) {
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
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-[#121316] text-white overflow-hidden">
        {/* Background Image with Measured Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_hotel_exterior_1791471883513.jpg"
            alt="ANABE HOTEL Grand Exterior Architecture"
            className="w-full h-full object-cover object-center filter brightness-90 transform scale-100 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-[#121316]/60 to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-36">
          <div className="mb-6">
            <Logo size="xl" variant="badge" priority={true} />
          </div>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-[#D8BD90] mb-4">
            Welcome to Kigali's Premier Destination
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto">
            {hotelName}
          </h1>
          <p className="text-base sm:text-lg text-[#E4DFD3] max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            Experience refined tranquility across 65 bespoke rooms, sparkling outdoor swimming pool, and modern architectural elegance tailored for your comfort.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/booking')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#B89667] hover:bg-[#A38354] text-white text-xs font-semibold uppercase tracking-widest rounded transition-all duration-200 shadow-md cursor-pointer"
            >
              Book Your Stay
            </button>
            <button
              onClick={() => onNavigate('/rooms')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs text-xs font-semibold uppercase tracking-widest rounded border border-white/30 transition-all duration-200 cursor-pointer"
            >
              Explore 65 Rooms
            </button>
          </div>
        </div>

        {/* Floating Quick Booking Bar */}
        <div className="absolute bottom-6 left-0 right-0 z-20 max-w-5xl mx-auto px-4">
          <QuickBookingBar onSearch={handleSearch} />
        </div>
      </section>

      {/* 2. PROPOSITION & TRUST BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-[#E8E4DA] text-center md:text-left">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#FAF6EF] rounded border border-[#E6D4B7] text-[#B89667] shrink-0">
              <BedDouble className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-[#1A1A18]">65 Appointed Rooms</h4>
              <p className="text-xs text-[#6B6A64] mt-1 leading-relaxed">
                Spanning four quiet floors, from Standard Singles to expansive Executive Suites with panoramic city views.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#FAF6EF] rounded border border-[#E6D4B7] text-[#B89667] shrink-0">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-[#1A1A18]">Swimming Pool & Solarium</h4>
              <p className="text-xs text-[#6B6A64] mt-1 leading-relaxed">
                Pristine outdoor pool with sun terrace loungers and ambient evening lighting for complete relaxation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#FAF6EF] rounded border border-[#E6D4B7] text-[#B89667] shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-[#1A1A18]">Modern Infrastructure</h4>
              <p className="text-xs text-[#6B6A64] mt-1 leading-relaxed">
                Equipped with central escalators and glass elevators ensuring effortless accessibility and contemporary comfort.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED ROOMS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#B89667] mb-2">
              Curated Accommodations
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A18]">
              Featured Rooms & Suites
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/rooms')}
            className="mt-4 md:mt-0 text-xs font-semibold uppercase tracking-wider text-[#1A1A18] hover:text-[#B89667] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View All 65 Rooms</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-[#EFECE4] animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRooms.map((room) => (
              <div
                key={room.id}
                className="group bg-white rounded-lg border border-[#E6E2D8] overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200"
              >
                <div className="relative h-48 overflow-hidden bg-neutral-100">
                  <img
                    src={room.images[0] || '/src/assets/images/hotel_deluxe_room_1791471905013.jpg'}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-[#1A1A18]/85 text-white text-[11px] px-2.5 py-1 rounded font-mono">
                    Room {room.roomNumber}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-[#7D7A72] block mb-1">
                      {room.typeName} · Floor {room.floor}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#1A1A18] line-clamp-1 mb-2">
                      {room.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-[#5C5B55] mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#B89667]" />
                        Up to {room.maxGuests} guests
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#F0ECE2] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#7D7A72] uppercase block">Per Night</span>
                      <span className="text-base font-serif font-bold text-[#1A1A18] tabular-nums">
                        {room.pricePerNight.toLocaleString()} RWF
                      </span>
                    </div>
                    <button
                      onClick={() => onSelectRoom(room)}
                      className="px-3.5 py-2 bg-[#1A1A18] hover:bg-[#B89667] text-white text-[11px] font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
                    >
                      Book Room
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. HOTEL FACILITIES */}
      <section className="bg-[#F4F1EA] py-20 border-y border-[#E5E1D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#B89667] mb-2">
              Exceptional Amenities
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A18] mb-4">
              Hotel Facilities & Comfort
            </h2>
            <p className="text-sm text-[#5C5B55]">
              Designed with modern architectural convenience and leisure spaces for an unforgettable stay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((fac) => (
              <div
                key={fac.id}
                className="bg-white rounded-lg border border-[#E2DED4] overflow-hidden flex flex-col group hover:border-[#B89667] transition-colors"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={fac.image}
                    alt={fac.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-xs rounded-full shadow-xs">
                    {getFacilityIcon(fac.icon)}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1A1A18] mb-2">
                      {fac.name}
                    </h3>
                    <p className="text-xs text-[#66655E] leading-relaxed">
                      {fac.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. GALLERY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#B89667] mb-2">
              Visual Journey
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A18]">
              Life at ANABE HOTEL
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/gallery')}
            className="mt-4 md:mt-0 text-xs font-semibold uppercase tracking-wider text-[#1A1A18] hover:text-[#B89667] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Explore Full Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="relative h-64 rounded-lg overflow-hidden group cursor-pointer border border-[#E2DED4]"
              onClick={() => onNavigate('/gallery')}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] uppercase tracking-wider text-[#D8BD90] font-semibold block mb-1">
                  {item.category}
                </span>
                <h4 className="font-serif text-base font-bold line-clamp-1">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. ABOUT OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF9F5] rounded-xl border border-[#E6E2D8] p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#B89667]">
              About ANABE HOTEL
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A18] leading-tight">
              Hospitality Rooted in Refined Comfort & Service
            </h2>
            <p className="text-sm text-[#5C5B55] leading-relaxed">
              ANABE HOTEL operates 65 individual guest rooms and suites thoughtfully curated to serve leisure travelers, visiting executives, and families seeking authentic serenity in Kigali.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#ECE8DE]">
              <div>
                <span className="block font-serif text-3xl font-bold text-[#1A1A18] tabular-nums">65</span>
                <span className="text-xs text-[#7A7870]">Guest Accommodation Units</span>
              </div>
              <div>
                <span className="block font-serif text-3xl font-bold text-[#1A1A18] tabular-nums">4</span>
                <span className="text-xs text-[#7A7870]">Accessible Floors via Elevator & Escalator</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/about')}
                className="px-6 py-3 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                Read More About Us
              </button>
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden border border-[#E0DCD2] shadow-md">
            <img
              src="/src/assets/images/hotel_lobby_escalator_1791471914533.jpg"
              alt="ANABE HOTEL Escalators and Glass Elevators"
              className="w-full h-96 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* 7. DIRECT CONTACT & INQUIRIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 bg-white p-8 sm:p-12 rounded-xl border border-[#E6E2D8] shadow-xs">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#B89667] mb-2">
                Direct Contact
              </p>
              <h2 className="font-serif text-3xl font-bold text-[#1A1A18]">
                Get in Touch
              </h2>
            </div>
            <p className="text-xs text-[#5C5B55] leading-relaxed">
              Have questions regarding corporate rates, extended stays, or special arrangements? Reach out to the owner directly or submit an inquiry.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-[#FAF6EF] rounded border border-[#E6D4B7] text-[#B89667] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7870] block">Owner Numbers</span>
                  <a href={`tel:${phone1.replace(/\s+/g, '')}`} className="font-medium text-sm text-[#1A1A18] hover:text-[#B89667] tabular-nums block">
                    {phone1}
                  </a>
                  <a href={`tel:${phone2.replace(/\s+/g, '')}`} className="font-medium text-sm text-[#1A1A18] hover:text-[#B89667] tabular-nums block">
                    {phone2}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-[#FAF6EF] rounded border border-[#E6D4B7] text-[#B89667] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7870] block">Email</span>
                  <a href={`mailto:${settings?.email || 'info@anabehotel.com'}`} className="font-medium text-xs text-[#1A1A18] hover:text-[#B89667]">
                    {settings?.email || 'info@anabehotel.com'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-[#FAF6EF] rounded border border-[#E6D4B7] text-[#B89667] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7870] block">Location</span>
                  <span className="text-xs text-[#5C5B55]">
                    {settings?.address || 'KG 15 Avenue, Luxury Boulevard'}, {settings?.city || 'Kigali'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#FBFBFA] p-6 sm:p-8 rounded-lg border border-[#EDE9DF]">
            <h3 className="font-serif text-xl font-bold text-[#1A1A18] mb-4">
              Send an Inquiry
            </h3>

            {contactSent ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-serif text-lg font-bold text-emerald-900">Message Received</h4>
                <p className="text-xs text-emerald-700">
                  Thank you for reaching out to ANABE HOTEL. Our front desk and management will respond promptly.
                </p>
                <button
                  onClick={() => setContactSent(false)}
                  className="mt-3 text-xs text-emerald-800 underline font-medium cursor-pointer"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                {contactError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                    {contactError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold uppercase text-[#66655E] block mb-1">Your Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                      placeholder="e.g. Jean Damascene"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase text-[#66655E] block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                      placeholder="e.g. guest@example.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-[#66655E] block mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +250 788 000 000"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-[#66655E] block mb-1">Message</label>
                  <textarea
                    rows={3}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                    placeholder="Tell us about your dates, inquiries, or special requirements..."
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
                >
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
