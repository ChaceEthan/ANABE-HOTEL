import React, { useState } from 'react';
import {
  ChevronDown,
  HelpCircle,
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  Search,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '../components/Logo.tsx';
import type { HotelSettings } from '../types/hotel.ts';

interface FAQPageProps {
  settings: HotelSettings | null;
  onNavigate: (route: string) => void;
}

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string | React.ReactNode;
}

export const FAQPage: React.FC<FAQPageProps> = ({ settings, onNavigate }) => {
  const [openIds, setOpenIds] = useState<string[]>(['faq-1', 'faq-3']);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const checkIn = settings?.checkInTime || '14:00';
  const checkOut = settings?.checkOutTime || '11:00';
  const phone1 = settings?.phone1 || '0788 845 520';
  const phone2 = settings?.phone2 || '0783 218 170';
  const ownerEmail = 'owneranabehotel@gmail.com';
  const primaryWa = '250788845520';
  const secondaryWa = '250783218170';

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'booking',
      question: 'How can I book a room at ANABE HOTEL?',
      answer: (
        <div className="space-y-2">
          <p>
            Booking a room at ANABE HOTEL is simple and transparent through our online reservation portal:
          </p>
          <ol className="list-decimal list-inside space-y-1 pl-1 text-[#4A4A45]">
            <li>Explore our 65 thoughtfully appointed rooms under the <strong className="text-[#1A1A18]">Rooms</strong> tab.</li>
            <li>Select your preferred room type and choose your check-in and check-out dates.</li>
            <li>Provide your full guest details and select your party size.</li>
            <li>Submit your reservation to receive an instant, unique booking reference code (e.g., <code className="bg-[#EFECE4] px-1.5 py-0.5 rounded text-xs font-mono">ANABE-XXXXX</code>).</li>
          </ol>
        </div>
      ),
    },
    {
      id: 'faq-2',
      category: 'booking',
      question: 'How do I know whether a room is available?',
      answer: (
        <p>
          Our booking engine validates live room availability directly against the hotel database for your chosen calendar dates. Any conflicting or overlapping reservations are automatically detected and blocked to ensure zero double-booking.
        </p>
      ),
    },
    {
      id: 'faq-3',
      category: 'booking',
      question: 'What happens after I complete an online booking?',
      answer: (
        <div className="space-y-2">
          <p>
            Once you submit your booking, your reservation is securely stored in the ANABE HOTEL registry and assigned a verified booking reference code.
          </p>
          <p>
            The booking screen provides direct links to open WhatsApp with a pre-formatted reservation summary ready for our front desk. <em>Please note: WhatsApp opens on your device with your message prepared, and you press Send to deliver it to our staff.</em> An option to open your email client is also provided.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-4',
      category: 'contact',
      question: 'How can I contact ANABE HOTEL?',
      answer: (
        <div className="space-y-3">
          <p>You can reach our concierge and reservations team directly through:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-[#FAF8F5] border border-[#EAE6DC] rounded-lg">
              <span className="text-xs text-[#8A8880] uppercase tracking-wider block">Primary Direct Phone</span>
              <a href={`tel:${phone1.replace(/\s+/g, '')}`} className="font-semibold text-[#1A1A18] hover:text-[#B89667]">
                {phone1}
              </a>
            </div>
            <div className="p-3 bg-[#FAF8F5] border border-[#EAE6DC] rounded-lg">
              <span className="text-xs text-[#8A8880] uppercase tracking-wider block">Secondary Direct Phone</span>
              <a href={`tel:${phone2.replace(/\s+/g, '')}`} className="font-semibold text-[#1A1A18] hover:text-[#B89667]">
                {phone2}
              </a>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href={`https://wa.me/${primaryWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-xs font-semibold rounded hover:bg-[#1EBE5D] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp Primary (+{primaryWa})
            </a>
            <a
              href={`https://wa.me/${secondaryWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-xs font-semibold rounded hover:bg-[#1EBE5D] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp Fallback (+{secondaryWa})
            </a>
          </div>
        </div>
      ),
    },
    {
      id: 'faq-5',
      category: 'contact',
      question: 'How can I contact the hotel by email?',
      answer: (
        <div className="space-y-2">
          <p>
            You can reach hotel ownership and management directly via our confirmed contact email:
          </p>
          <a
            href={`mailto:${ownerEmail}?subject=Inquiry%20-%20ANABE%20HOTEL`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF8F5] border border-[#EAE6DC] text-[#1A1A18] hover:text-[#B89667] font-medium text-sm rounded-lg transition-colors"
          >
            <Mail className="w-4 h-4 text-[#B89667]" />
            <span>{ownerEmail}</span>
          </a>
          <p className="text-xs text-[#7A7870]">
            Clicking this link opens your preferred email client with the hotel address pre-filled.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-6',
      category: 'facilities',
      question: 'What facilities does ANABE HOTEL offer?',
      answer: (
        <div className="space-y-2">
          <p>
            ANABE HOTEL offers carefully designed facilities to make your stay memorable and comfortable:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-[#4A4A45]">
            <li><strong className="text-[#1A1A18]">Outdoor Swimming Pool:</strong> Pristine swimming pool and sun terrace.</li>
            <li><strong className="text-[#1A1A18]">Elevators & Modern Escalators:</strong> Fast, accessible vertical transit connecting all floors.</li>
            <li><strong className="text-[#1A1A18]">65 Luxury Rooms:</strong> Standard, Deluxe, Executive, and Presidential Suites.</li>
            <li><strong className="text-[#1A1A18]">24/7 Front Desk:</strong> Round-the-clock security and guest support.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'faq-7',
      category: 'facilities',
      question: 'Can I view photos and videos of the hotel?',
      answer: (
        <p>
          Yes! Visit our dedicated <button onClick={() => onNavigate('/gallery')} className="text-[#B89667] font-semibold underline hover:text-[#9F7F52] cursor-pointer">Gallery</button> page to view photographic showcases of our guest rooms, pool, lobby, elevators, escalators, and architectural highlights.
        </p>
      ),
    },
    {
      id: 'faq-8',
      category: 'booking',
      question: 'Can I change or cancel a reservation?',
      answer: (
        <p>
          To change dates, update guest details, or request a cancellation, please contact the hotel directly by phone (+{primaryWa} or +{secondaryWa}) or via WhatsApp with your booking reference code. Our front desk team will assist you personally.
        </p>
      ),
    },
    {
      id: 'faq-9',
      category: 'payment',
      question: 'What payment methods are available?',
      answer: (
        <div className="space-y-2">
          <p>
            Reservations can be finalized through front desk settlement upon arrival (Cash, Rwandan Francs / USD) or coordinated direct payment. For mobile money or electronic settlement arrangements, please confirm with our front desk team during booking verification.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-10',
      category: 'stay',
      question: 'What time can guests check in and check out?',
      answer: (
        <div className="space-y-1">
          <p>Standard hotel operating hours are:</p>
          <div className="p-3 bg-[#FAF8F5] border border-[#EAE6DC] rounded-lg text-sm space-y-1 max-w-sm">
            <div>Check-in: <strong className="text-[#1A1A18]">{checkIn}</strong> (afternoon)</div>
            <div>Check-out: <strong className="text-[#1A1A18]">{checkOut}</strong> (morning)</div>
          </div>
          <p className="text-xs text-[#7A7870] pt-1">
            Early check-in and late check-out requests are subject to availability and can be arranged with front desk management.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-11',
      category: 'contact',
      question: 'How can I contact the hotel if I need more information?',
      answer: (
        <div className="space-y-3">
          <p>We are always delighted to assist you with inquiries, group bookings, or special requests:</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => onNavigate('/contact')}
              className="px-4 py-2 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold rounded uppercase tracking-wider transition-colors cursor-pointer"
            >
              Contact Us Page
            </button>
            <button
              onClick={() => onNavigate('/rooms')}
              className="px-4 py-2 bg-[#FAF8F5] border border-[#EAE6DC] hover:border-[#B89667] text-[#1A1A18] text-xs font-semibold rounded uppercase tracking-wider transition-colors cursor-pointer"
            >
              Browse 65 Rooms
            </button>
            <button
              onClick={() => onNavigate('/booking')}
              className="px-4 py-2 bg-[#B89667] hover:bg-[#A38355] text-white text-xs font-semibold rounded uppercase tracking-wider transition-colors cursor-pointer"
            >
              Direct Booking
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'faq-12',
      category: 'privacy',
      question: 'How does ANABE HOTEL protect guest privacy?',
      answer: (
        <p>
          ANABE HOTEL treats all guest information with strict confidentiality. Contact details and reservation dates are retained solely for lodging records and front desk verification. We do not sell or share personal data. Please review our full <button onClick={() => onNavigate('/privacy')} className="text-[#B89667] font-semibold underline hover:text-[#9F7F52] cursor-pointer">Privacy Policy</button> and <button onClick={() => onNavigate('/terms')} className="text-[#B89667] font-semibold underline hover:text-[#9F7F52] cursor-pointer">Terms & Conditions</button> for comprehensive details.
        </p>
      ),
    },
  ];

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      faq.question.toLowerCase().includes(query) ||
      (typeof faq.answer === 'string' && faq.answer.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header with Luxury Brand Identity */}
        <div className="text-center space-y-4">
          <div className="mb-2">
            <Logo size="md" variant="badge" />
          </div>
          <span className="text-xs uppercase tracking-widest text-[#B89667] font-semibold block">
            Guest Assistance & Answers
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1A18] tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-[#6A6962] max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about reserving your luxury stay, check-in policies, amenities, and reaching ANABE HOTEL in Rwanda.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-[#9A9890] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions (booking, pool, check-in, contact)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#E4E0D6] rounded-xl text-sm text-[#1A1A18] placeholder-[#9A9890] focus:outline-none focus:ring-2 focus:ring-[#B89667] focus:border-transparent transition-all shadow-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'booking', label: 'Reservations' },
              { id: 'contact', label: 'Contact & WhatsApp' },
              { id: 'facilities', label: 'Hotel Facilities' },
              { id: 'stay', label: 'Check-In & Stay' },
              { id: 'payment', label: 'Payment' },
              { id: 'privacy', label: 'Privacy' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#1A1A18] text-white shadow-xs'
                    : 'bg-white text-[#5A5953] border border-[#E4E0D6] hover:border-[#B89667]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion FAQs */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-[#E4E0D6] p-8 space-y-3">
              <HelpCircle className="w-8 h-8 text-[#9A9890] mx-auto" />
              <p className="text-sm text-[#5A5953]">No matching questions found.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="text-xs text-[#B89667] font-semibold underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className="bg-white border border-[#E4E0D6] rounded-xl overflow-hidden transition-all shadow-xs hover:border-[#D6D0C2]"
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full text-left px-5 py-4 sm:py-5 flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B89667]"
                    aria-expanded={isOpen}
                  >
                    <span className="font-serif text-base sm:text-lg font-semibold text-[#1A1A18]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#B89667] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-[#4A4A45] leading-relaxed border-t border-[#F2EFE8]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Support Callout Footer Card */}
        <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A18]">
              Need direct assistance with your reservation?
            </h3>
            <p className="text-xs sm:text-sm text-[#6A6962]">
              Our guest concierge desk is available 24 hours a day to assist you.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('/contact')}
              className="px-5 py-2.5 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Contact Concierge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
