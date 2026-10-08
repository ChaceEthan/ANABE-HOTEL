import React, { useEffect, useState } from 'react';

interface BookingSuccessAnimationProps {
  onComplete?: () => void;
  guestName?: string;
  roomNumber?: string;
}

export const BookingSuccessAnimation: React.FC<BookingSuccessAnimationProps> = ({
  onComplete,
  guestName,
  roomNumber,
}) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    rotation: number;
    delay: number;
    shape: 'circle' | 'rect' | 'star';
  }>>([]);

  useEffect(() => {
    // Generate celebratory golden and emerald confetti
    const colors = ['#D4AF37', '#10B981', '#059669', '#F59E0B', '#34D399', '#E5E7EB', '#B45309'];
    const generated = Array.from({ length: 42 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 360,
      y: (Math.random() - 0.5) * 320 - 40,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 6,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.35,
      shape: (['circle', 'rect', 'star'] as const)[Math.floor(Math.random() * 3)],
    }));
    setParticles(generated);

    const timer = setTimeout(() => {
      onComplete?.();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative flex flex-col items-center justify-center my-6 select-none overflow-visible">
      {/* Confetti particles */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute animate-confetti-burst opacity-0"
            style={{
              '--target-x': `${p.x}px`,
              '--target-y': `${p.y}px`,
              '--target-rot': `${p.rotation}deg`,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties}
          >
            {p.shape === 'circle' && (
              <div
                className="rounded-full shadow-sm"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                }}
              />
            )}
            {p.shape === 'rect' && (
              <div
                className="rounded-sm shadow-sm"
                style={{
                  width: `${p.size * 1.4}px`,
                  height: `${p.size * 0.7}px`,
                  backgroundColor: p.color,
                }}
              />
            )}
            {p.shape === 'star' && (
              <div
                className="text-xs font-bold leading-none"
                style={{ color: p.color, fontSize: `${p.size * 1.2}px` }}
              >
                ✦
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SVG Animated Checkmark & Expanding Rings */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />

        {/* Pulse ring 1 */}
        <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping opacity-75" />

        {/* Pulse ring 2 - delayed */}
        <div
          className="absolute -inset-3 rounded-full border border-amber-300/50 animate-pulse"
          style={{ animationDuration: '2s' }}
        />

        {/* Main Badge Container */}
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-[3px] shadow-xl shadow-emerald-900/15 animate-success-scale">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            {/* SVG Checkmark with path drawing animation */}
            <svg
              className="w-14 h-14 text-emerald-600"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Checkmark circle outline */}
              <circle
                cx="26"
                cy="26"
                r="23"
                className="stroke-emerald-200"
                strokeWidth="2.5"
                fill="none"
              />
              <circle
                cx="26"
                cy="26"
                r="23"
                className="stroke-emerald-500 animate-circle-draw"
                strokeWidth="2.5"
                strokeDasharray="166"
                strokeDashoffset="166"
                strokeLinecap="round"
                fill="none"
              />
              {/* Checkmark tick */}
              <path
                className="stroke-emerald-600 animate-check-draw"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="48"
                strokeDashoffset="48"
                d="M14 27l8 8 16-18"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Ribbon / Status Badge */}
      <div className="mt-4 flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-emerald-800 text-[11px] font-bold tracking-wider uppercase animate-fade-in-up">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        <span>Reservation Confirmed</span>
        {roomNumber && <span className="text-emerald-600 font-medium">• Room {roomNumber}</span>}
      </div>
    </div>
  );
};
