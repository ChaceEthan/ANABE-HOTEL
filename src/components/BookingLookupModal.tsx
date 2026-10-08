import React, { useState } from 'react';
import { X, Search, CheckCircle, Clock, Calendar, User, Phone, BedDouble } from 'lucide-react';
import { api } from '../lib/api.ts';
import type { Booking } from '../types/hotel.ts';

interface BookingLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingLookupModal: React.FC<BookingLookupModalProps> = ({ isOpen, onClose }) => {
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) return;

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      const result = await api.getBookingByReference(reference.trim());
      setBooking(result);
    } catch (err: any) {
      setError(err.message || 'No reservation found for this reference.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FAF9F5] rounded-lg max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E2DED4] relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-[#66655E] hover:text-[#1A1A18] transition-colors rounded"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-serif text-2xl text-[#1A1A18] font-semibold mb-2">
          Find Your Reservation
        </h3>
        <p className="text-xs text-[#6B6A64] mb-6">
          Enter your ANABE HOTEL booking reference (e.g. <span className="font-mono text-[#1A1A18]">ANB-2026-8812</span>) to view reservation details.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value.toUpperCase())}
            placeholder="e.g. ANB-2026-XXXX"
            className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667] uppercase font-mono tracking-wider"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Lookup
          </button>
        </form>

        {error && (
          <div className="p-3 mb-4 bg-red-50 text-red-700 text-xs rounded border border-red-200">
            {error}
          </div>
        )}

        {booking && (
          <div className="border border-[#E2DED4] bg-white rounded-md p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DE]">
              <div>
                <span className="text-[10px] text-[#7A7870] uppercase tracking-wider block">Reference</span>
                <span className="font-mono text-sm font-bold text-[#1A1A18]">{booking.bookingReference}</span>
              </div>
              <span className={`px-2.5 py-1 rounded text-[11px] font-medium tracking-wide uppercase ${
                booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-[#7A7870] uppercase block">Room</span>
                <div className="font-medium text-[#1A1A18] flex items-center gap-1 mt-0.5">
                  <BedDouble className="w-3.5 h-3.5 text-[#B89667]" />
                  <span>Room {booking.roomNumber} ({booking.typeName})</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-[#7A7870] uppercase block">Guests</span>
                <div className="font-medium text-[#1A1A18] flex items-center gap-1 mt-0.5">
                  <User className="w-3.5 h-3.5 text-[#B89667]" />
                  <span>{booking.guestsCount} Guest(s)</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-[#7A7870] uppercase block">Check-in</span>
                <div className="font-medium text-[#1A1A18] tabular-nums mt-0.5">{booking.checkIn}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#7A7870] uppercase block">Check-out</span>
                <div className="font-medium text-[#1A1A18] tabular-nums mt-0.5">{booking.checkOut} ({booking.nights} nights)</div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#ECE8DE] flex justify-between items-center">
              <div>
                <span className="text-[10px] text-[#7A7870] uppercase block">Total Price</span>
                <span className="text-base font-serif font-bold text-[#1A1A18] tabular-nums">
                  {booking.totalPrice.toLocaleString()} RWF
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#7A7870] uppercase block">Payment Status</span>
                <span className="font-medium text-[#B89667]">{booking.paymentStatus}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
