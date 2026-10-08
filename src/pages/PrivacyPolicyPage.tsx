import React from 'react';
import { Shield, Lock, FileText, CheckCircle, Mail, Phone, ArrowLeft } from 'lucide-react';
import type { HotelSettings } from '../types/hotel.ts';

interface PrivacyPolicyPageProps {
  settings: HotelSettings | null;
  onNavigate: (route: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ settings, onNavigate }) => {
  const hotelName = settings?.hotelName || 'ANABE HOTEL';
  const phone1 = settings?.phone1 || '0788 845 520';
  const phone2 = settings?.phone2 || '0783 218 170';
  const email = settings?.email || 'info@anabehotel.com';
  const address = settings?.address || 'KG 15 Avenue, Luxury Boulevard, Kigali, Rwanda';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Breadcrumb / Back button */}
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
          <Shield className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#B89667]">
          Transparency & Trust
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1A18]">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#66655E] max-w-xl mx-auto">
          How {hotelName} collects, uses, and safeguards your guest information and reservation details.
        </p>
        <p className="text-[11px] text-[#8C8A82]">
          Effective Date: October 2026 · Last Updated: October 2026
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-10 text-xs sm:text-sm text-[#3E3D39] leading-relaxed">
        {/* 1. Introduction */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A18] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#B89667]" />
            1. Overview & Commitment
          </h2>
          <p>
            At {hotelName}, we consider the confidentiality and security of our guests to be paramount. This Privacy Policy outlines our practices regarding the collection, use, retention, and protection of personal data gathered through our direct online reservation platform, telephone communication, WhatsApp inquiries, and in-person front desk registration.
          </p>
          <p>
            We adhere to applicable data protection principles, ensuring that your details are treated with utmost discretion and utilized exclusively for legitimate hospitality operations.
          </p>
        </section>

        {/* 2. Information We Collect */}
        <section className="space-y-4">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A18] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#B89667]" />
            2. Personal Information We Collect
          </h2>
          <p>
            To facilitate guest room bookings and deliver personalized hospitality across our 65 accommodations, we collect the following information when provided by you:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="bg-white p-4 rounded-lg border border-[#E2DED4] space-y-2">
              <span className="font-semibold text-[#1A1A18] block text-xs uppercase tracking-wider text-[#B89667]">
                Guest Identity & Contact
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-[#52514B]">
                <li>Full guest name and title</li>
                <li>Telephone / mobile number</li>
                <li>Email address</li>
                <li>National ID or Passport number (presented at check-in per statutory regulations)</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E2DED4] space-y-2">
              <span className="font-semibold text-[#1A1A18] block text-xs uppercase tracking-wider text-[#B89667]">
                Reservation Details
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-[#52514B]">
                <li>Arrival (check-in) and departure (check-out) dates</li>
                <li>Selected room number, floor, and suite category</li>
                <li>Number of occupants (adults and children)</li>
                <li>Special stay requests (dietary, quiet room, late arrival)</li>
              </ul>
            </div>
          </div>

          <div className="bg-[#FAF9F5] p-4 rounded-lg border border-[#ECE8DE] space-y-2">
            <span className="font-semibold text-[#1A1A18] text-xs uppercase tracking-wider text-[#B89667] block">
              Payment & Transaction Information
            </span>
            <p className="text-xs text-[#52514B]">
              When settling reservations via Mobile Money (MTN MoMo, Airtel Money), Bank Transfer, or Payment Cards, transaction references and payment status are recorded. Sensitive payment credentials (such as PINs or card CVVs) are processed directly by authorized telecommunication and financial providers; {hotelName} never stores sensitive financial authentication credentials.
            </p>
          </div>
        </section>

        {/* 3. How We Use Your Information */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A18]">
            3. How We Use Your Information
          </h2>
          <p>We process your personal information strictly for the following purposes:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Reservation Management:</strong> Creating, confirming, modifying, and verifying your stay with unique booking references and preventing double-booking.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Guest Communication:</strong> Providing immediate booking references, check-in instructions, WhatsApp notifications, and direct customer support upon request.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Safety & Property Security:</strong> Maintaining front desk registry records and safeguarding hotel guests, personnel, and facilities.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Accounting & Statutory Obligations:</strong> Complying with hospitality tax laws, accounting standards, and local law enforcement requirements where applicable.
              </span>
            </li>
          </ul>
        </section>

        {/* 4. Data Retention */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A18]">
            4. Data Retention & Storage
          </h2>
          <p>
            Your reservation records are retained in our secure operational database for the duration necessary to satisfy hospitality accounting and statutory audit requirements. Once the retention period lapses, records are securely archived or expunged in accordance with standard hotel data management practices.
          </p>
        </section>

        {/* 5. Third-Party Services & Technology */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A18]">
            5. Third-Party Services & Technology
          </h2>
          <p>
            {hotelName} does not sell, trade, or rent guest information to external advertising or marketing entities. Third-party technology providers are engaged solely to support direct hotel operations:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-[#52514B]">
            <li>
              <strong>Messaging & Telecommunications:</strong> WhatsApp (Meta Platforms) and local cellular networks for direct guest messaging initiated by the user.
            </li>
            <li>
              <strong>Payment Providers:</strong> MTN Mobile Money, Airtel Money, and local banking gateways for secure payment authorization where applicable.
            </li>
            <li>
              <strong>Content & Media Delivery:</strong> Cloud-hosted media delivery for high-resolution property photography and room showcases.
            </li>
            <li>
              <strong>Local Storage & Cookies:</strong> Essential browser storage used exclusively to preserve active booking selections and authorized administrative staff login sessions. No third-party behavioral advertising cookies are deployed.
            </li>
          </ul>
        </section>

        {/* 6. Guest Rights */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A18]">
            6. Guest Rights & Requests
          </h2>
          <p>
            Where applicable under governing data protection legislation, you are entitled to:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs text-[#52514B]">
            <li>Request confirmation and a copy of the personal information we hold on your booking profile.</li>
            <li>Request correction of incomplete or outdated contact details.</li>
            <li>Request erasure of your contact details, subject to overriding statutory or accounting retention requirements.</li>
          </ul>
        </section>

        {/* 7. Contact Information */}
        <section className="p-6 bg-white rounded-xl border border-[#E2DED4] shadow-xs space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#1A1A18]">
            7. Contacting ANABE HOTEL About Privacy
          </h2>
          <p className="text-xs text-[#52514B]">
            If you have questions, inquiries, or requests regarding this Privacy Policy or your reservation records, please contact our management team directly:
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
