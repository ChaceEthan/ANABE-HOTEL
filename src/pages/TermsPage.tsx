import React from 'react';
import { Scale, FileCheck, AlertCircle, Clock, CheckCircle, Phone, Mail, ArrowLeft } from 'lucide-react';
import type { HotelSettings } from '../types/hotel.ts';

interface TermsPageProps {
  settings: HotelSettings | null;
  onNavigate: (route: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ settings, onNavigate }) => {
  const hotelName = settings?.hotelName || 'ANABE HOTEL';
  const phone1 = settings?.phone1 || '0788 845 520';
  const phone2 = settings?.phone2 || '0783 218 170';
  const email = settings?.email || 'info@anabehotel.com';
  const address = settings?.address || 'KG 15 Avenue, Luxury Boulevard, Kigali, Rwanda';
  const checkInTime = settings?.checkInTime || '14:00';
  const checkOutTime = settings?.checkOutTime || '11:00';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Back navigation */}
      <div>
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A7870] hover:text-[#B89667] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-3 pb-8 border-b border-[#E8E4DA]">
        <div className="w-12 h-12 bg-[#FAF6EF] border border-[#E6D4B7] rounded-full flex items-center justify-center mx-auto text-[#B89667]">
          <Scale className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#B89667]">
          Guest Agreement & Policies
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1A18]">
          Terms & Conditions
        </h1>
        <p className="text-xs sm:text-sm text-[#66655E] max-w-xl mx-auto">
          Please review the reservation terms, arrival guidelines, and stay conditions governing your visit to {hotelName}.
        </p>
        <p className="text-[11px] text-[#8C8A82]">
          Effective Date: October 2026 · General Hospitality Standard
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-10 text-xs sm:text-sm text-[#3E3D39] leading-relaxed">
        {/* 1. Reservations & Availability */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A18] flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#B89667]" />
            1. Room Reservations & Confirmation
          </h2>
          <p>
            All bookings completed online via the {hotelName} platform are recorded in our hotel database with an assigned unique booking reference code (e.g. <code>ANABE-...</code>). A reservation is considered confirmed once successfully registered and validated against room inventory.
          </p>
          <p>
            {hotelName} operates with an active real-time inventory management system across our 65 guest rooms to prevent double-booking. In the rare event of technical discrepancy or unforeseen room maintenance, {hotelName} reserves the right to reallocate the guest to an equal or superior room category at no additional charge.
          </p>
        </section>

        {/* 2. Check-in & Check-out */}
        <section className="space-y-4">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A18] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#B89667]" />
            2. Check-In & Check-Out Times
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-[#E2DED4] space-y-1">
              <span className="font-semibold text-[#1A1A18] text-xs uppercase tracking-wider text-[#B89667] block">
                Standard Check-In
              </span>
              <p className="font-serif text-2xl font-bold text-[#1A1A18] tabular-nums">{checkInTime}</p>
              <p className="text-xs text-[#66655E]">
                Guests arriving earlier may request early check-in subject to room availability, or securely store luggage at the 24/7 reception.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E2DED4] space-y-1">
              <span className="font-semibold text-[#1A1A18] text-xs uppercase tracking-wider text-[#B89667] block">
                Standard Check-Out
              </span>
              <p className="font-serif text-2xl font-bold text-[#1A1A18] tabular-nums">{checkOutTime}</p>
              <p className="text-xs text-[#66655E]">
                Late check-out must be arranged in advance with the front desk and may be subject to additional fees depending on departure time.
              </p>
            </div>
          </div>
          <p className="text-xs text-[#66655E]">
            All adult guests must present a valid government-issued photographic identification (National ID or Passport) upon registration at the front desk.
          </p>
        </section>

        {/* 3. Rates, Taxes & Payment */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A18]">
            3. Room Rates, Pricing & Payment
          </h2>
          <p>
            Rates displayed on the website are quoted in Rwandan Francs (RWF) per room, per night, inclusive of applicable standard hospitality taxes.
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs text-[#52514B]">
            <li>
              <strong>Payment Methods:</strong> We accept MTN Mobile Money, Airtel Money, Bank Transfer, Visa / Mastercard, and Cash settlement at the front desk.
            </li>
            <li>
              <strong>Incidental Expenses:</strong> Personal incidentals such as special room service or laundry are payable directly at the front desk upon ordering or check-out.
            </li>
          </ul>
        </section>

        {/* 4. Cancellations & Modifications */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A18]">
            4. Cancellations, Schedule Changes & No-Shows
          </h2>
          <p>
            We understand plans can change. To modify or cancel a reservation, guests are requested to notify hotel reception via WhatsApp (<code>{phone1.replace(/\s+/g, '')}</code>) or direct phone call at least 24 hours prior to the scheduled arrival date.
          </p>
          <p>
            In the event of an unnotified no-show, the hotel reserves the right to release the held room after 22:00 on the scheduled arrival date unless a late arrival has been explicitly communicated.
          </p>
        </section>

        {/* 5. Guest Conduct & Property Care */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A18]">
            5. Guest Conduct & Property Care
          </h2>
          <p>
            {hotelName} is dedicated to maintaining an atmosphere of calm elegance and tranquility for all visitors. Guests agree to:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#B89667] shrink-0 mt-0.5" />
              <span>
                Maintain respectful noise levels, especially during evening rest hours (22:00 to 07:00).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#B89667] shrink-0 mt-0.5" />
              <span>
                Adhere to safety rules around the outdoor swimming pool, elevators, and escalators. Children must be supervised by an adult at all times in pool and escalator areas.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#B89667] shrink-0 mt-0.5" />
              <span>
                Observe the strict <strong>No Smoking</strong> policy inside guest bedrooms and enclosed lobby corridors. Designated outdoor smoking zones are provided.
              </span>
            </li>
          </ul>
        </section>

        {/* 6. Prohibited Activities & Damages */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A18] flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            6. Prohibited Activities & Property Damage
          </h2>
          <p>
            Illegal substances, hazardous materials, firearms, and disruptive commercial filming without prior written permission from hotel management are strictly prohibited on property premises.
          </p>
          <p>
            Guests are liable for any physical damage caused to hotel furniture, fixtures, appliances, linens, or structures, beyond fair wear and tear. Repair or replacement costs will be charged to the registered guest.
          </p>
        </section>

        {/* 7. Hotel Rights & Force Majeure */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A18]">
            7. Hotel Rights & Force Majeure
          </h2>
          <p>
            {hotelName} reserves the right to refuse service or terminate the stay of any individual engaging in disorderly conduct, threatening behavior towards staff or fellow guests, or violating property regulations.
          </p>
          <p>
            Neither party shall be held liable for failure to perform reservation obligations when prevented by causes beyond reasonable control, including extreme weather events, utility disruptions, or government restrictions.
          </p>
        </section>

        {/* 8. Contact Information */}
        <section className="p-6 bg-white rounded-xl border border-[#E2DED4] shadow-xs space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#1A1A18]">
            8. Questions & Reservation Support
          </h2>
          <p className="text-xs text-[#52514B]">
            For questions regarding these Terms & Conditions or to coordinate special accommodations, please contact our front desk team:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#B89667] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#1A1A18] block">Telephone</span>
                <span>{phone1} · {phone2}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#B89667] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#1A1A18] block">Email</span>
                <a href={`mailto:${email}`} className="text-[#B89667] hover:underline">{email}</a>
              </div>
            </div>
          </div>
          <div className="text-xs text-[#7A7870] pt-2 border-t border-[#ECE8DE]">
            Property Location: {address}
          </div>
        </section>
      </div>
    </div>
  );
};
