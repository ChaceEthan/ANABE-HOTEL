import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface CookieConsentBannerProps {
  onOpenPrivacy: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('anabe_cookie_consent');
      if (!consent) {
        // Small delay so it doesn't flicker immediately on initial page mount
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('anabe_cookie_consent', 'accepted');
    } catch {}
    setIsVisible(false);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('anabe_cookie_consent', 'dismissed');
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Privacy and Cookie Notice"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-[#1A1A18]/95 backdrop-blur-md text-[#E8E7E3] p-4 sm:p-5 rounded-xl border border-[#3A3830] shadow-2xl transition-all duration-300 animate-fade-in-up"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-[#FAF6EF]/10 border border-[#B89667]/30 text-[#B89667] rounded-lg shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#FFFFFF]">
              Privacy & Essential Storage
            </h4>
            <button
              onClick={handleDismiss}
              className="text-[#999890] hover:text-[#FFFFFF] p-1 -mr-1 transition-colors cursor-pointer"
              aria-label="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-[#B8B7B0] leading-relaxed">
            ANABE HOTEL uses essential local storage and session cookies to maintain your booking selections, room reservations, and staff portal security. We do not use third-party advertising trackers.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleAccept}
              className="px-3.5 py-1.5 bg-[#B89667] hover:bg-[#A38355] text-white text-[11px] font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
            >
              Accept & Continue
            </button>
            <button
              onClick={() => {
                setIsVisible(false);
                onOpenPrivacy();
              }}
              className="text-[11px] text-[#E0DFD8] hover:text-[#B89667] underline underline-offset-2 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
