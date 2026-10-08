import React, { useState } from 'react';
import { Phone, Mail, MapPin, CheckCircle2, Clock, MessageSquare, Send } from 'lucide-react';
import { api } from '../lib/api.ts';
import type { HotelSettings } from '../types/hotel.ts';

interface ContactPageProps {
  settings: HotelSettings | null;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const hotelName = settings?.hotelName || 'ANABE HOTEL';
  const phone1 = settings?.phone1 || '0788 845 520';
  const phone2 = settings?.phone2 || '0783 218 170';
  const email = settings?.email || 'info@anabehotel.com';
  const address = settings?.address || 'KG 15 Avenue, Luxury Boulevard';
  const city = settings?.city || 'Kigali';
  const country = settings?.country || 'Rwanda';

  const [name, setName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Room Booking Inquiry');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.submitContact({
        name,
        email: guestEmail,
        phone,
        subject,
        message,
      });
      setSuccess(true);
      setName('');
      setGuestEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#B89667]">
          Connect With Our Team
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1A18]">
          Contact {hotelName}
        </h1>
        <p className="text-sm text-[#66655E] leading-relaxed">
          For reservation inquiries, group bookings, extended corporate stays, or special arrangements, our owner and front desk team are at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#E2DED4] shadow-xs space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1A1A18]">
              Owner Contact & Phone Lines
            </h3>
            <p className="text-xs text-[#66655E]">
              Direct telephone lines to hotel management for swift reservations and assistance:
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-[#FAF6EF] rounded text-[#B89667] border border-[#E6D4B7] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase text-[#7A7870] block">Primary Line</span>
                  <a
                    href={`tel:${phone1.replace(/\s+/g, '')}`}
                    className="font-medium text-sm text-[#1A1A18] hover:text-[#B89667] tabular-nums"
                  >
                    {phone1}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-[#FAF6EF] rounded text-[#B89667] border border-[#E6D4B7] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase text-[#7A7870] block">Secondary Line</span>
                  <a
                    href={`tel:${phone2.replace(/\s+/g, '')}`}
                    className="font-medium text-sm text-[#1A1A18] hover:text-[#B89667] tabular-nums"
                  >
                    {phone2}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E2DED4] shadow-xs space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1A1A18]">
              Location & Schedule
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#B89667] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1A1A18] block">Hotel Address</span>
                  <span className="text-[#66655E]">{address}, {city}, {country}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#B89667] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1A1A18] block">Email Inquiries</span>
                  <a href={`mailto:${email}`} className="text-[#66655E] hover:text-[#1A1A18]">{email}</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#B89667] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1A1A18] block">Hours</span>
                  <span className="text-[#66655E]">Front Desk: 24/7 · Check-in: {settings?.checkInTime || '14:00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-xl border border-[#E2DED4] shadow-xs">
          <h2 className="font-serif text-2xl font-bold text-[#1A1A18] mb-2">
            Send Us a Message
          </h2>
          <p className="text-xs text-[#66655E] mb-6">
            Complete the form below and our team will get back to you shortly.
          </p>

          {success ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-emerald-900">Message Received</h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Thank you for contacting ANABE HOTEL. Your message has been saved to our management system and we will respond promptly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 px-5 py-2 bg-emerald-800 text-white text-xs font-semibold rounded uppercase tracking-wider cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Jean Mugisha"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                    placeholder="e.g. j.mugisha@example.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +250 788 000 000"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
                  >
                    <option value="Room Booking Inquiry">Room Booking Inquiry</option>
                    <option value="Long-term Stay Rate">Long-term Stay Rate</option>
                    <option value="Corporate / Group Event">Corporate / Group Event</option>
                    <option value="Facility Question">Facility Question</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                  Message Details *
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="How can we assist you today? Please share any specific dates or room preferences..."
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-widest rounded transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Send Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
