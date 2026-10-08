import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Send,
  MessageCircle,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
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
  const address = settings?.address || 'KG 15 Avenue, Luxury Boulevard, Kigali, Rwanda';

  // WhatsApp international format numbers
  const primaryWaNumber = '250788845520';
  const secondaryWaNumber = '250783218170';

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
    if (!name.trim() || !guestEmail.trim() || !message.trim()) {
      setError('Please provide your name, email, and message details.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.submitContact({
        name: name.trim(),
        email: guestEmail.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      setSuccess(true);
      setName('');
      setGuestEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry. Please try again or reach us directly via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  // Build WhatsApp URL with inquiry text
  const getWhatsAppInquiryUrl = (targetNumber: string) => {
    const lines = [
      'Hello ANABE HOTEL,',
      '',
      `I am reaching out regarding: ${subject || 'Inquiry'}`,
      name ? `Name: ${name}` : '',
      phone ? `Phone: ${phone}` : '',
      guestEmail ? `Email: ${guestEmail}` : '',
      message ? `Message: ${message}` : 'I would like to inquire about room availability and reservations.',
    ].filter(Boolean).join('\n');

    return `https://wa.me/${targetNumber}?text=${encodeURIComponent(lines)}`;
  };

  // Build mailto URL with inquiry text
  const getMailtoUrl = () => {
    const subjectLine = `${subject || 'Guest Inquiry'} - ${name || 'Prospective Guest'}`;
    const bodyLines = [
      'Dear ANABE HOTEL Management & Front Desk,',
      '',
      name ? `Guest Name: ${name}` : '',
      phone ? `Phone Number: ${phone}` : '',
      guestEmail ? `Email: ${guestEmail}` : '',
      '',
      'INQUIRY DETAILS:',
      message || 'I would like to inquire about room reservations at ANABE HOTEL.',
      '',
      'Thank you,',
      name || 'Guest',
    ].filter(Boolean).join('\n');

    return `mailto:${email}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(bodyLines)}`;
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
          For room reservations across our 65 accommodations, long-stay bookings, event coordination, or general guest assistance, our team is at your service 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          {/* WhatsApp Direct Chat Card */}
          <div className="bg-emerald-50/80 p-6 rounded-xl border border-emerald-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#25D366] text-white rounded-full">
                <MessageCircle className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg font-bold text-emerald-950">
                Direct WhatsApp Chat
              </h3>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Message our reception desk directly for swift reservation checks and instant responses:
            </p>
            <div className="space-y-2 pt-1">
              <a
                href={getWhatsAppInquiryUrl(primaryWaNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider rounded flex items-center justify-between transition-colors shadow-xs"
              >
                <span>Primary WhatsApp (0788 845 520)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={getWhatsAppInquiryUrl(secondaryWaNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-white hover:bg-neutral-50 text-emerald-900 border border-emerald-300 text-xs font-semibold uppercase tracking-wider rounded flex items-center justify-between transition-colors"
              >
                <span>Secondary Line (0783 218 170)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-[11px] text-emerald-700 italic">
              Note: Clicking will open WhatsApp on your device. Please click Send to deliver your message.
            </p>
          </div>

          {/* Telephone & Voice Lines */}
          <div className="bg-white p-6 rounded-xl border border-[#E2DED4] shadow-xs space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1A1A18]">
              Telephone & Voice Lines
            </h3>
            <p className="text-xs text-[#66655E]">
              Direct telephone lines to hotel reception and management:
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

          {/* Location & Schedule */}
          <div className="bg-white p-6 rounded-xl border border-[#E2DED4] shadow-xs space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1A1A18]">
              Location & Schedule
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#B89667] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1A1A18] block">Hotel Address</span>
                  <span className="text-[#66655E]">{address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#B89667] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1A1A18] block">Email Inquiries</span>
                  <a
                    href={getMailtoUrl()}
                    className="text-[#B89667] hover:underline"
                    title="Click to open your email client"
                  >
                    {email}
                  </a>
                  <span className="text-[10px] text-[#8C8A82] block mt-0.5">
                    (Opens default email application)
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#B89667] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1A1A18] block">Hours</span>
                  <span className="text-[#66655E]">Front Desk: 24/7 · Check-in: 14:00 · Check-out: 11:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact / Online Inquiry Form */}
        <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-xl border border-[#E2DED4] shadow-xs space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1A1A18] mb-1">
              Send an Online Inquiry
            </h2>
            <p className="text-xs text-[#66655E]">
              Fill out the inquiry form below to record your message directly into our front desk management system.
            </p>
          </div>

          {success ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-emerald-900">
                Inquiry Recorded in Hotel Registry
              </h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                Thank you for contacting ANABE HOTEL. Your message has been saved to our management system. Our reception team will reach out via your provided phone number or email promptly.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setSuccess(false)}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded uppercase tracking-wider cursor-pointer"
                >
                  Send Another Inquiry
                </button>
                <a
                  href={getWhatsAppInquiryUrl(primaryWaNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded uppercase tracking-wider flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Also Message on WhatsApp</span>
                </a>
              </div>
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
                    Your Full Name *
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
                    Phone / WhatsApp Number
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
                    Inquiry Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
                  >
                    <option value="Room Booking Inquiry">Room Booking Inquiry</option>
                    <option value="Long-term Stay Rate">Long-term Stay Rate</option>
                    <option value="Corporate / Group Event">Corporate / Group Event</option>
                    <option value="Facility Question (Pool & Elevators)">Facility Question (Pool & Elevators)</option>
                    <option value="Airport Transfer or Direction Inquiry">Airport Transfer or Direction Inquiry</option>
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

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Submit Inquiry to Hotel</span>
                </button>

                <a
                  href={getWhatsAppInquiryUrl(primaryWaNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                </a>

                <a
                  href={getMailtoUrl()}
                  className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-neutral-50 text-[#1A1A18] border border-[#D5D0C5] text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4 text-[#B89667]" />
                  <span>Open Email Client</span>
                </a>
              </div>

              <p className="text-[11px] text-[#7A7870] italic pt-1">
                Note: Submitting this form saves your inquiry directly into the ANABE HOTEL database. The WhatsApp and Email buttons open their respective applications on your device.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
