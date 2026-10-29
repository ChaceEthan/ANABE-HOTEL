import React from 'react';
import { Head } from '../components/Head.tsx';

interface FaqPageProps {
  checkInTime?: string;
  checkOutTime?: string;
  onNavigate: (route: string) => void;
}

export const FaqPage: React.FC<FaqPageProps> = ({ checkInTime, checkOutTime, onNavigate }) => {
  const questions = [
    ['How can I book a room at ANABE HOTEL?', 'Choose your room, select your check-in and check-out dates, and provide your guest details in the online booking form. When the request is saved, you will receive a booking reference to use when contacting the hotel.'],
    ['How do I know whether a room is available?', 'Availability is checked for the dates you select. The booking system checks existing reservations and rejects a request when another active reservation overlaps those dates.'],
    ['What happens after I complete an online booking?', 'Your reservation request is saved and a booking reference is generated. WhatsApp may open with a prepared message containing your reservation details; you must review and send that message yourself. Opening WhatsApp does not send it automatically.'],
    ['How can I contact ANABE HOTEL?', 'Call 0788 845 520 or 0783 218 170. You can also contact the hotel on WhatsApp using either number.'],
    ['How can I contact the hotel by email?', 'Email owneranabehotel@gmail.com.'],
    ['What facilities does ANABE HOTEL offer?', 'The facilities represented on this website include a swimming pool, elevators, escalators, and guest rooms.'],
    ['Can I view photos and videos of the hotel?', 'Visit the Gallery to browse published hotel media. Select an item to open its individual page with its title, description, and category.'],
    ['Can I change or cancel a reservation?', 'Contact the hotel with your booking reference to request a change or cancellation. The hotel will respond about the request; no cancellation fee is stated here.'],
    ['What payment methods are available?', 'The website records a payment preference but does not process online payments. Contact the hotel to confirm payment arrangements for your reservation.'],
    ['What time can guests check in and check out?', `The times currently configured on the hotel website are check-in ${checkInTime || '14:00'} and check-out ${checkOutTime || '11:00'}. Please confirm the applicable times with the hotel when arranging your stay.`],
    ['How can I contact the hotel if I need more information?', 'Use the Contact page, browse available Rooms, start a Booking request, or message the hotel on WhatsApp.'],
    ['How does ANABE HOTEL protect guest information?', 'Booking and inquiry information is stored in the hotel application for reservation and service operations. The site does not claim a security certification or fixed retention period. Read the Privacy Policy or email owneranabehotel@gmail.com with a privacy request.'],
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(([name, text]) => ({
      '@type': 'Question',
      name,
      acceptedAnswer: { '@type': 'Answer', text },
    })),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <Head title="Frequently Asked Questions | ANABE HOTEL" description="Answers about ANABE HOTEL reservations, facilities, guest contact, gallery, and privacy." path="/faq" structuredData={structuredData} />
      <header className="max-w-3xl mb-10 sm:mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#B89667]">Guest Information</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1A1A18]">Frequently Asked Questions</h1>
        <p className="text-sm sm:text-base text-[#66655E] leading-relaxed mt-4">Find practical information about booking, your stay, and contacting ANABE HOTEL. For anything not covered here, our team can help directly.</p>
      </header>
      <section className="border-t border-[#DCD7CB]" aria-label="Frequently asked questions">
        {questions.map(([question, answer], index) => (
          <details key={question} className="group border-b border-[#DCD7CB]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B89667]">
              <span className="flex gap-4"><span className="font-mono text-xs text-[#B89667] pt-1">{String(index + 1).padStart(2, '0')}</span><span className="font-serif text-lg sm:text-xl font-semibold text-[#24241F]">{question}</span></span>
              <span aria-hidden="true" className="text-2xl text-[#B89667] transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="max-w-3xl pl-10 sm:pl-12 pb-6 text-sm leading-7 text-[#66655E]">{answer}</p>
            {index === 10 && (
              <div className="pl-10 sm:pl-12 pb-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-wider text-[#80613D]">
                <button onClick={() => onNavigate('/contact')} className="hover:underline">Contact</button>
                <button onClick={() => onNavigate('/rooms')} className="hover:underline">Rooms</button>
                <button onClick={() => onNavigate('/booking')} className="hover:underline">Booking</button>
                <a href="https://wa.me/250788845520" target="_blank" rel="noopener noreferrer" className="hover:underline">WhatsApp</a>
              </div>
            )}
          </details>
        ))}
      </section>
    </div>
  );
};