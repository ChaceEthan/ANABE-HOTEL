import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.ts';
import type { Room, Booking, PaymentMethod, HotelSettings } from '../types/hotel.ts';
import { BookingSuccessAnimation } from '../components/BookingSuccessAnimation.tsx';
import {
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  BedDouble,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Printer,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

interface BookingPageProps {
  initialRoom?: Room | null;
  initialDates?: { checkIn: string; checkOut: string; guests: number };
  settings: HotelSettings | null;
  onNavigateHome: () => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  initialRoom,
  initialDates,
  settings,
  onNavigateHome,
}) => {
  const getToday = () => new Date().toISOString().split('T')[0];
  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  // Flow State (Steps 1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(initialRoom ? 2 : 1);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(initialRoom || null);

  // Dates & Guests
  const [checkIn, setCheckIn] = useState<string>(initialDates?.checkIn || getToday());
  const [checkOut, setCheckOut] = useState<string>(initialDates?.checkOut || getTomorrow());
  const [guestsCount, setGuestsCount] = useState<number>(initialDates?.guests || 1);

  // Guest Information
  const [guestName, setGuestName] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Payment Selection (Future-ready architecture: MTN MoMo, Airtel Money, Bank / Card, Cash at Front Desk)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MTN MoMo');

  // Submission State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [whatsAppNotice, setWhatsAppNotice] = useState<string | null>(null);

  // Hotel contact numbers for WhatsApp (international format: 250788845520, 250783218170)
  const primaryWhatsAppNumber = '250788845520';
  const secondaryWhatsAppNumber = '250783218170';

  useEffect(() => {
    async function loadRooms() {
      try {
        const rooms = await api.getRooms();
        setAllRooms(rooms);
        if (initialRoom) {
          const match = rooms.find((r) => r.id === initialRoom.id);
          if (match) setSelectedRoom(match);
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
      }
    }
    loadRooms();
  }, [initialRoom]);

  // Format date helper: YYYY-MM-DD -> DD/MM/YYYY
  const formatDisplayDate = (isoDate: string) => {
    try {
      const parts = isoDate.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return isoDate;
    } catch {
      return isoDate;
    }
  };

  // Generate official pre-filled WhatsApp message
  const buildWhatsAppMessage = (b: Booking) => {
    const lines = [
      'Hello ANABE HOTEL,',
      '',
      'I would like to confirm my booking.',
      '',
      `Booking Reference: ${b.bookingReference}`,
      '',
      `Guest Name: ${b.guestName}`,
      `Phone: ${b.guestPhone}`,
      `Room: ${b.roomName || 'Room ' + b.roomNumber} (Room ${b.roomNumber})`,
      `Check-in: ${formatDisplayDate(b.checkIn)}`,
      `Check-out: ${formatDisplayDate(b.checkOut)}`,
      `Number of Guests: ${b.guestsCount}`,
      `Number of Nights: ${b.nights}`,
      `Price per Night: RWF ${b.pricePerNight.toLocaleString()}`,
      `Total Amount: RWF ${b.totalPrice.toLocaleString()}`,
      '',
      `Booking Status: ${b.status}`,
    ];

    if (b.specialRequests && b.specialRequests.trim()) {
      lines.push(`Special Requests: ${b.specialRequests.trim()}`);
    }

    lines.push('');
    lines.push('Thank you.');
    lines.push('');
    lines.push('ANABE HOTEL');

    return lines.join('\n');
  };

  // Generate click-to-chat URL
  const getWhatsAppUrl = (b: Booking, phoneNumber: string) => {
    const text = buildWhatsAppMessage(b);
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
  };

  // Calculate nights and price
  const calculateNights = () => {
    if (!checkIn || !checkOut || checkIn >= checkOut) return 0;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const totalPrice = selectedRoom ? selectedRoom.pricePerNight * nights : 0;

  // Step 5: Confirm booking handler
  const handleConfirmBooking = async () => {
    if (!selectedRoom) {
      setErrorMessage('Please select a room.');
      setCurrentStep(1);
      return;
    }
    if (nights <= 0) {
      setErrorMessage('Check-out date must be strictly after check-in date.');
      setCurrentStep(2);
      return;
    }
    if (!guestName || !guestPhone) {
      setErrorMessage('Please enter your full name and phone number.');
      setCurrentStep(3);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.createBooking({
        roomId: selectedRoom.id,
        checkIn,
        checkOut,
        guestsCount,
        guestName,
        guestEmail: guestEmail.trim() || `${guestPhone.replace(/[^0-9]/g, '')}@guest.anabehotel.com`,
        guestPhone,
        specialRequests,
        paymentMethod,
      });

      const savedBooking = res.booking;
      setConfirmedBooking(savedBooking);

      // Inform user and trigger WhatsApp
      setWhatsAppNotice(
        'Booking created successfully. WhatsApp is opening so you can send the booking details to ANABE HOTEL.'
      );

      const waUrl = getWhatsAppUrl(savedBooking, primaryWhatsAppNumber);
      try {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      } catch {
        // Popups might be blocked in some iframe contexts
      }
    } catch (err: any) {
      // Real server-side double-booking rejection message will show clearly here
      setErrorMessage(
        err.message || 'This room is no longer available for the selected dates.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // If already confirmed, show confirmation receipt
  if (confirmedBooking) {
    const primaryWaUrl = getWhatsAppUrl(confirmedBooking, primaryWhatsAppNumber);
    const secondaryWaUrl = getWhatsAppUrl(confirmedBooking, secondaryWhatsAppNumber);

    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl border border-[#E2DED4] p-8 sm:p-12 shadow-lg space-y-8">
          <div className="text-center space-y-3 pb-8 border-b border-[#ECE8DE]">
            {/* Celebratory Success Animation */}
            <BookingSuccessAnimation
              guestName={confirmedBooking.guestName}
              roomNumber={confirmedBooking.roomNumber}
            />

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A18]">
              Thank You, {confirmedBooking.guestName}!
            </h1>
            <p className="text-xs sm:text-sm text-[#66655E] max-w-lg mx-auto">
              Your reservation has been created and recorded in the ANABE HOTEL registry.
            </p>
          </div>

          {/* WhatsApp Action Callout Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-full shrink-0 mt-0.5">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-emerald-950">
                  Send Booking Confirmation via WhatsApp
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {whatsAppNotice ||
                    'Booking created successfully. WhatsApp is opening so you can send the booking details to ANABE HOTEL.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={primaryWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 shadow-sm transition-all duration-150"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Continue to WhatsApp (0788 845 520)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={secondaryWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-white hover:bg-neutral-50 text-emerald-900 border border-emerald-300 text-xs font-semibold uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-all duration-150"
              >
                <span>Secondary Line (0783 218 170)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-[11px] text-emerald-700 italic">
              Note: WhatsApp will open with your pre-filled reservation details. Please press <strong>Send</strong> in WhatsApp to deliver the message to hotel reception.
            </p>
          </div>

          {/* Reference Banner */}
          <div className="bg-[#FAF6EF] p-5 rounded-lg border border-[#E6D4B7] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7870] block">
                Booking Reference
              </span>
              <span className="font-mono text-2xl font-bold text-[#1A1A18] tracking-wider">
                {confirmedBooking.bookingReference}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#7A7870] uppercase block">Booking Status</span>
              <span className="inline-flex px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded">
                {confirmedBooking.status}
              </span>
            </div>
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <h3 className="font-serif text-base font-bold text-[#1A1A18] border-b border-[#ECE8DE] pb-2">
                Stay Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#7A7870]">Room:</span>
                  <span className="font-semibold text-[#1A1A18]">
                    Room {confirmedBooking.roomNumber} ({confirmedBooking.typeName})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7870]">Check-in Date:</span>
                  <span className="font-medium text-[#1A1A18] tabular-nums">
                    {formatDisplayDate(confirmedBooking.checkIn)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7870]">Check-out Date:</span>
                  <span className="font-medium text-[#1A1A18] tabular-nums">
                    {formatDisplayDate(confirmedBooking.checkOut)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7870]">Length of Stay:</span>
                  <span className="font-medium text-[#1A1A18]">{confirmedBooking.nights} night(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7870]">Guests:</span>
                  <span className="font-medium text-[#1A1A18]">{confirmedBooking.guestsCount} Guest(s)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-base font-bold text-[#1A1A18] border-b border-[#ECE8DE] pb-2">
                Guest Contact
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#7A7870]">Full Name:</span>
                  <span className="font-medium text-[#1A1A18]">{confirmedBooking.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7870]">Phone:</span>
                  <span className="font-medium text-[#1A1A18] tabular-nums">{confirmedBooking.guestPhone}</span>
                </div>
                {confirmedBooking.guestEmail && (
                  <div className="flex justify-between">
                    <span className="text-[#7A7870]">Email:</span>
                    <span className="font-medium text-[#1A1A18]">{confirmedBooking.guestEmail}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#7A7870]">Payment Option:</span>
                  <span className="font-medium text-[#1A1A18]">{confirmedBooking.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7870]">Payment Status:</span>
                  <span className="font-medium text-amber-700">{confirmedBooking.paymentStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="p-4 bg-[#FAF9F5] rounded-lg border border-[#ECE8DE] space-y-2 text-xs">
            <div className="flex justify-between text-[#66655E]">
              <span>Rate per night:</span>
              <span className="tabular-nums">{confirmedBooking.pricePerNight.toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between text-[#66655E]">
              <span>Nights ({confirmedBooking.nights}):</span>
              <span className="tabular-nums">{(confirmedBooking.pricePerNight * confirmedBooking.nights).toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#E2DED4] text-base font-serif font-bold text-[#1A1A18]">
              <span>Total Amount:</span>
              <span className="tabular-nums text-[#B89667]">{confirmedBooking.totalPrice.toLocaleString()} RWF</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-5 py-2.5 border border-[#D5D0C5] hover:bg-neutral-100 text-xs font-semibold uppercase tracking-wider rounded flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>

            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-7 py-2.5 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
            >
              Back to ANABE HOTEL
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Step Indicator */}
      <div className="text-center space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#B89667]">
          Online Reservations
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A18]">
          Book Your Stay at ANABE HOTEL
        </h1>
      </div>

      {/* 5-Step Progress Tabs */}
      <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-4 overflow-x-auto text-xs">
        {[
          { step: 1, title: '1. Select Room' },
          { step: 2, title: '2. Dates & Guests' },
          { step: 3, title: '3. Guest Details' },
          { step: 4, title: '4. Summary' },
          { step: 5, title: '5. Confirmation' },
        ].map((item) => (
          <button
            key={item.step}
            onClick={() => {
              if (item.step < currentStep) setCurrentStep(item.step);
            }}
            disabled={item.step > currentStep}
            className={`py-1.5 px-3 whitespace-nowrap transition-colors font-medium cursor-pointer ${
              currentStep === item.step
                ? 'text-[#1A1A18] font-bold border-b-2 border-[#B89667]'
                : item.step < currentStep
                ? 'text-[#66655E] hover:text-[#1A1A18]'
                : 'text-[#BBB9B0] cursor-not-allowed'
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Availability / Reservation Alert</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* STEP 1: SELECT ROOM */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-[#1A1A18]">
              Step 1: Choose Your Accommodation
            </h2>
            <span className="text-xs text-[#7A7870]">{allRooms.length} rooms in property</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allRooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id;
              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all flex gap-4 ${
                    isSelected
                      ? 'border-[#B89667] bg-[#FAF6EF] shadow-sm'
                      : 'border-[#E2DED4] bg-white hover:border-[#C4BFB2]'
                  }`}
                >
                  <img
                    src={room.images[0] || '/src/assets/images/hotel_deluxe_room_1791471905013.jpg'}
                    alt={room.name}
                    className="w-24 h-24 object-cover rounded shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono text-[#7A7870]">
                          Room {room.roomNumber} · Floor {room.floor}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-[#B89667] uppercase">Selected</span>
                        )}
                      </div>
                      <h3 className="font-serif text-base font-bold text-[#1A1A18] line-clamp-1">
                        {room.name}
                      </h3>
                      <span className="text-xs text-[#66655E]">{room.typeName}</span>
                    </div>
                    <div className="text-sm font-serif font-bold text-[#1A1A18] tabular-nums mt-2">
                      {room.pricePerNight.toLocaleString()} RWF <span className="text-[10px] font-sans font-normal text-[#7A7870]">/ night</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                if (!selectedRoom) {
                  setErrorMessage('Please select a room before continuing.');
                  return;
                }
                setErrorMessage(null);
                setCurrentStep(2);
              }}
              className="px-6 py-2.5 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to Dates</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DATES & GUESTS */}
      {currentStep === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#E2DED4] space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-[#1A1A18]">
              Step 2: Stay Dates & Number of Guests
            </h2>
            {selectedRoom && (
              <span className="text-xs font-medium text-[#B89667]">
                Room {selectedRoom.roomNumber}: {selectedRoom.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                Check-In Date
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
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                Check-Out Date
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                Total Guests
              </label>
              <select
                value={guestsCount}
                onChange={(e) => setGuestsCount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4 Guests</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-[#FAF6EF] rounded border border-[#E6D4B7] flex justify-between items-center text-xs">
            <div>
              <span className="text-[#7A7870] block">Calculated Nights:</span>
              <span className="font-bold text-[#1A1A18] text-sm">{nights} Night(s)</span>
            </div>
            <div className="text-right">
              <span className="text-[#7A7870] block">Total Room Charge:</span>
              <span className="font-serif font-bold text-lg text-[#1A1A18] tabular-nums">
                {totalPrice.toLocaleString()} RWF
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#ECE8DE]">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 border border-[#D5D0C5] hover:bg-neutral-100 text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Change Room
            </button>
            <button
              onClick={() => {
                if (nights <= 0) {
                  setErrorMessage('Check-out date must be after check-in date.');
                  return;
                }
                setErrorMessage(null);
                setCurrentStep(3);
              }}
              className="px-6 py-2.5 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to Guest Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: GUEST INFORMATION */}
      {currentStep === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#E2DED4] space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1A1A18]">
              Step 3: Primary Guest Information
            </h2>
            <p className="text-xs text-[#66655E] mt-1">
              Please enter your contact details for check-in verification and WhatsApp confirmation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Marie Claire Uwase"
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                Phone Number (WhatsApp) *
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="e.g. +250 788 123 456"
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="e.g. m.uwase@example.com (optional)"
              className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
              Special Requests (Optional)
            </label>
            <textarea
              rows={2}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. High floor preference, late arrival, extra pillow..."
              className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
            />
          </div>

          <div className="flex justify-between pt-4 border-t border-[#ECE8DE]">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 border border-[#D5D0C5] hover:bg-neutral-100 text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dates
            </button>
            <button
              onClick={() => {
                if (!guestName.trim() || !guestPhone.trim()) {
                  setErrorMessage('Please fill in your full name and phone number.');
                  return;
                }
                setErrorMessage(null);
                setCurrentStep(4);
              }}
              className="px-6 py-2.5 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-2 cursor-pointer"
            >
              <span>Review Summary</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUMMARY & PAYMENT OPTION */}
      {currentStep === 4 && selectedRoom && (
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#E2DED4] space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1A1A18]">
              Step 4: Reservation Summary & Payment Preference
            </h2>
            <p className="text-xs text-[#66655E] mt-1">
              Verify your booking details prior to final confirmation.
            </p>
          </div>

          <div className="bg-[#FAF9F5] p-5 rounded-lg border border-[#ECE8DE] space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-[#7A7870] uppercase block">Hotel</span>
                <span className="font-bold text-sm text-[#1A1A18]">{settings?.hotelName || 'ANABE HOTEL'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#7A7870] uppercase block">Room</span>
                <span className="font-bold text-sm text-[#1A1A18]">
                  Room {selectedRoom.roomNumber} ({selectedRoom.name})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#7A7870] uppercase block">Stay Dates</span>
                <span className="font-medium text-[#1A1A18] tabular-nums">
                  {formatDisplayDate(checkIn)} to {formatDisplayDate(checkOut)} ({nights} nights)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#7A7870] uppercase block">Guest</span>
                <span className="font-medium text-[#1A1A18]">
                  {guestName} ({guestsCount} Guest{guestsCount > 1 ? 's' : ''})
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2DED4] flex justify-between items-center text-sm font-bold">
              <span>Total Price Due:</span>
              <span className="font-serif text-xl text-[#B89667] tabular-nums">
                {totalPrice.toLocaleString()} RWF
              </span>
            </div>
          </div>

          {/* Payment Architecture */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A18] block">
              Payment Method Preference
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'MTN MoMo', label: 'MTN MoMo', icon: '📱' },
                { id: 'Airtel Money', label: 'Airtel Money', icon: '📲' },
                { id: 'Bank / Card', label: 'Bank / Card', icon: '💳' },
                { id: 'Cash at Front Desk', label: 'Cash at Front Desk', icon: '🏨' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id as PaymentMethod)}
                  className={`p-3 rounded border text-left transition-all cursor-pointer ${
                    paymentMethod === opt.id
                      ? 'border-[#B89667] bg-[#FAF6EF] shadow-xs'
                      : 'border-[#E2DED4] bg-white hover:border-[#C4BFB2]'
                  }`}
                >
                  <span className="text-base block mb-1">{opt.icon}</span>
                  <span className="text-xs font-semibold text-[#1A1A18] block">{opt.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#7A7870]">
              * Note: Your reservation will be created with status <strong className="text-[#1A1A18]">PENDING</strong> and WhatsApp will open so you can transmit your booking details directly to ANABE HOTEL reception.
            </p>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#ECE8DE]">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 border border-[#D5D0C5] hover:bg-neutral-100 text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={submitting}
              className="px-8 py-3 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-bold uppercase tracking-widest rounded transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Verifying Room Availability & Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Booking & Open WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
