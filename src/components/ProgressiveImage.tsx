import React, { useState, useEffect, useRef } from 'react';
import { Camera, ImageOff } from 'lucide-react';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  placeholderClassName?: string;
  blurDataUrl?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  onClick?: () => void;
  onLoad?: () => void;
  zoomOnHover?: boolean;
}

/**
 * ProgressiveImage provides lazy loading with a luxury blur-up placeholder,
 * graceful fallback handling, and instantaneous cache recognition to eliminate layout shifts.
 */
export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  placeholderClassName = '',
  blurDataUrl,
  loading = 'lazy',
  decoding = 'async',
  referrerPolicy = 'no-referrer',
  onClick,
  onLoad,
  zoomOnHover = false,
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Check if image is already cached by browser on mount or when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);

    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setIsLoaded(true);
        if (onLoad) onLoad();
      } else {
        setHasError(true);
      }
    }
  }, [src, onLoad]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-[#ECE8DE] ${containerClassName}`}
    >
      {/* Blur-up placeholder layer */}
      {!isLoaded && !hasError && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none transition-opacity duration-700 ease-out ${placeholderClassName}`}
          style={{
            background: blurDataUrl
              ? `url("${blurDataUrl}") center/cover no-repeat`
              : 'radial-gradient(ellipse at center, #F4F1EA 0%, #E6E1D5 100%)',
          }}
        >
          {/* Subtle warm shimmer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          
          {/* Delicate luxury branding watermark placeholder icon */}
          <div className="text-[#B89667]/40 flex flex-col items-center gap-1.5 transform scale-90">
            <Camera className="w-6 h-6 stroke-[1.5]" />
          </div>
        </div>
      )}

      {/* Main Image with progressive blur-to-sharp transition */}
      {!hasError ? (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={loading}
          decoding={decoding}
          referrerPolicy={referrerPolicy}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            isLoaded
              ? 'opacity-100 blur-0 scale-100 filter-none'
              : 'opacity-0 blur-md scale-105'
          } ${zoomOnHover ? 'group-hover:scale-105' : ''} ${className}`}
        />
      ) : (
        /* Error fallback */
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F2EFE8] text-[#8C8980] p-4 text-center">
          <ImageOff className="w-8 h-8 text-[#A8A59C] mb-2 stroke-[1.5]" />
          <span className="text-xs font-medium text-[#66655E]">Photograph Unavailable</span>
          <span className="text-[10px] text-[#A8A59C] mt-0.5 max-w-[200px] truncate">{alt}</span>
        </div>
      )}
    </div>
  );
};
