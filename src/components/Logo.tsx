import React from 'react';

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LogoVariant = 'default' | 'badge' | 'monogram';

export interface LogoProps {
  /**
   * Preset sizing:
   * 'xs': h-7 (topbars, minimal compact spaces)
   * 'sm': h-9 (compact mobile headers, sidebars)
   * 'md': h-12 (standard navigation bar, footers)
   * 'lg': h-16 (auth cards, receipts, hero badges)
   * 'xl': h-20 (prominent display, showcase sections)
   */
  size?: LogoSize;
  /**
   * Presentation variant:
   * 'default': crisp image with transparent/natural background
   * 'badge': light ivory contrast tile with subtle border, ideal for dark footers and hero scrims
   * 'monogram': square gold 'A' monogram badge derived from the emblem
   */
  variant?: LogoVariant;
  /**
   * Enable luxury hover interaction (smooth scale and sheen transition)
   */
  interactive?: boolean;
  /**
   * Custom alt text, defaults to "ANABE HOTEL Logo"
   */
  alt?: string;
  /**
   * Optional extra container or image classes
   */
  className?: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
  /**
   * High priority loading (e.g. for above-the-fold navbar and hero)
   */
  priority?: boolean;
}

const sizeClasses: Record<LogoSize, { img: string; width: number; height: number }> = {
  xs: { img: 'h-7 w-auto', width: 70, height: 28 },
  sm: { img: 'h-9 w-auto', width: 90, height: 36 },
  md: { img: 'h-11 sm:h-12 w-auto', width: 120, height: 48 },
  lg: { img: 'h-14 sm:h-16 w-auto', width: 160, height: 64 },
  xl: { img: 'h-16 sm:h-20 w-auto', width: 200, height: 80 },
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'default',
  interactive = true,
  alt = 'ANABE HOTEL Logo',
  className = '',
  onClick,
  priority = false,
}) => {
  const { img: sizeClass, width, height } = sizeClasses[size];

  const imageSrc =
    variant === 'monogram'
      ? '/favicon.png'
      : '/anabe-hotel-logo.png';

  const hoverEffect = interactive
    ? 'transition-transform duration-200 ease-out hover:scale-103 group-hover:scale-103 active:scale-98'
    : '';

  const imgElement = (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`object-contain ${sizeClass} ${hoverEffect} ${variant !== 'badge' ? className : ''}`}
    />
  );

  if (variant === 'badge') {
    const badgePadding =
      size === 'xs' || size === 'sm' ? 'p-1.5' : 'p-2.5 sm:p-3';

    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center bg-[#FAF8F5] border border-[#2D3039]/20 rounded-xl shadow-xs transition-all duration-200 ${badgePadding} ${
          interactive ? 'hover:border-[#B89667] hover:shadow-md' : ''
        } ${className}`}
      >
        {imgElement}
      </div>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick} className={`inline-block cursor-pointer ${className}`}>
        {imgElement}
      </div>
    );
  }

  return imgElement;
};
