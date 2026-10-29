import React from 'react';
import { Head } from '../components/Head.tsx';

export const TermsPage: React.FC = () => (
  <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-8 text-sm leading-7 text-[#55544E]">
    <Head title="Terms & Conditions | ANABE HOTEL" description="Terms for submitting and managing reservation requests with ANABE HOTEL." path="/terms" />
    <header className="space-y-3"><p className="text-xs font-semibold uppercase tracking-widest text-[#B89667]">Guest Information</p><h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1A1A18]">Terms &amp; Conditions</h1><p>Last updated: October 8, 2026</p></header>
    <section><h2 className="font-serif text-2xl font-semibold text-[#1A1A18]">Booking requests and confirmation</h2><p>Submitting a booking request records your selected room and stay details and generates a reference. A request may remain pending until ANABE HOTEL reviews and confirms it. Availability is checked by the booking system, and overlapping reservations are rejected. Keep your booking reference for any follow-up.</p></section>
    <section><h2 className="font-serif text-2xl font-semibold text-[#1A1A18]">Payment</h2><p>The website does not currently process payments. A payment preference recorded with a request is not a payment or confirmation of payment. Contact the hotel to confirm payment arrangements.</p></section>
    <section><h2 className="font-serif text-2xl font-semibold text-[#1A1A18]">Changes and cancellations</h2><p>Contact ANABE HOTEL with your booking reference to request a change or cancellation. The hotel will advise you about the request. No cancellation fee or other unconfirmed fee is stated by these terms.</p></section>
    <section><h2 className="font-serif text-2xl font-semibold text-[#1A1A18]">Guest responsibilities and contact</h2><p>Please provide accurate reservation and contact information, review the details in your booking record, and contact the hotel if they need correction. For assistance, use the Contact page or email <a className="underline text-[#80613D]" href="mailto:owneranabehotel@gmail.com">owneranabehotel@gmail.com</a>.</p></section>
  </article>
);