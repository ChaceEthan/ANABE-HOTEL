import React from 'react';

export type LogoVariant = 'header' | 'primary' | 'monogram';

interface LogoProps {
  variant?: LogoVariant;
  tone?: 'dark' | 'light';
  className?: string;
  alt?: string;
}

const logoAssets: Record<LogoVariant, { src: string; width: number; height: number }> = {
  header: { src: '/logo/anabe-hotel-header.svg', width: 1000, height: 220 },
  primary: { src: '/logo/anabe-hotel-logo.svg', width: 940, height: 735 },
  monogram: { src: '/logo/anabe-hotel-monogram.svg', width: 560, height: 560 },
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'header',
  tone = 'dark',
  className = '',
  alt = 'ANABE HOTEL',
}) => {
  const asset = logoAssets[variant];

  return (
    <img
      src={asset.src}
      alt={alt}
      width={asset.width}
      height={asset.height}
      loading="eager"
      decoding="async"
      className={`block object-contain ${tone === 'light' ? 'brightness-0 invert' : ''} ${className}`}
    />
  );
};