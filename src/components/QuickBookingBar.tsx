import React, { useState } from 'react';
import { Calendar, Users, Search, ArrowRight } from 'lucide-react';

interface QuickBookingBarProps {
  onSearch: (params: { checkIn: string; checkOut: string; guests: number }) => void;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: number;
  className?: string;
}

export const QuickBookingBar: React.FC<QuickBookingBarProps> = ({
  onSearch,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests = 2,
  className = '',
}) => {
  const getToday = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState(defaultCheckIn || getToday());
  const [checkOut, setCheckOut] = useState(defaultCheckOut || getTomorrow());
  const [guests, setGuests] = useState(defaultGuests);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ checkIn, checkOut, guests });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-lg shadow-lg border border-[#E4DFD3] p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center ${className}`}
    >
      {/* Check-in */}
      <div className="flex flex-col px-3 py-2 bg-[#FBFBFA] rounded border border-[#EDE9DF]">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#75736B] flex items-center gap-1.5 mb-1">
          <Calendar className="w-3.5 h-3.5 text-[#B89667]" />
          Check-In
        </label>
        <input
          type="date"
          value={checkIn}
          min={getToday()}
          onChange={(e) => {
            setCheckIn(e.target.value);
            if (e.target.value >= checkOut) {
              const next = new Date(e.target.value);
              next.setDate(next.getDate() + 1);
              setCheckOut(next.toISOString().split('T')[0]);
            }
          }}
          className="text-sm font-medium text-[#1A1A18] bg-transparent focus:outline-none cursor-pointer"
          required
        />
      </div>

      {/* Check-out */}
      <div className="flex flex-col px-3 py-2 bg-[#FBFBFA] rounded border border-[#EDE9DF]">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#75736B] flex items-center gap-1.5 mb-1">
          <Calendar className="w-3.5 h-3.5 text-[#B89667]" />
          Check-Out
        </label>
        <input
          type="date"
          value={checkOut}
          min={checkIn}
          onChange={(e) => setCheckOut(e.target.value)}
          className="text-sm font-medium text-[#1A1A18] bg-transparent focus:outline-none cursor-pointer"
          required
        />
      </div>

      {/* Guests */}
      <div className="flex flex-col px-3 py-2 bg-[#FBFBFA] rounded border border-[#EDE9DF]">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#75736B] flex items-center gap-1.5 mb-1">
          <Users className="w-3.5 h-3.5 text-[#B89667]" />
          Guests
        </label>
        <select
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="text-sm font-medium text-[#1A1A18] bg-transparent focus:outline-none cursor-pointer"
        >
          <option value={1}>1 Adult</option>
          <option value={2}>2 Adults</option>
          <option value={3}>3 Adults</option>
          <option value={4}>4 Adults</option>
        </select>
      </div>

      {/* Submit CTA */}
      <div className="h-full flex items-end">
        <button
          type="submit"
          className="w-full h-[52px] px-6 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <span>Find Available Rooms</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
