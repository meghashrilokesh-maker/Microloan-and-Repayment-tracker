import React from 'react';

/**
 * NaturalVendorImage seamlessly integrates the 2D Indian vendor illustrations
 * directly into the background layout without any rectangular photo borders or boxes.
 */
export default function NaturalVendorImage({
  type = 'flowers', // 'flowers' | 'farmer' | 'cottoncandy' | 'tea' | 'couple' | 'business'
  className = '',
  alt = 'Vendor Illustration',
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'hero' | 'full'
  backdrop = 'none', // 'none' | 'arch' | 'blob' | 'circle' | 'pill'
  backdropColor = 'sage', // 'sage' | 'terracotta' | 'sand' | 'lavender' | 'blush'
  showBotanical = false
}) {
  // Map all types exclusively to the 3 approved 2D Indian illustrations
  const illustrationMap = {
    flowers: '/images/vendor-flowers.png',
    farmer: '/images/vendor-farmer.png',
    cottoncandy: '/images/vendor-cottoncandy.png',
    tea: '/images/vendor-cottoncandy.png',
    couple: '/images/vendor-flowers.png',
    business: '/images/vendor-farmer.png',
  };

  const src = illustrationMap[type] || illustrationMap.flowers;

  const sizeClasses = {
    xs: 'w-10 h-10',
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-36 h-36 sm:w-44 sm:h-44',
    hero: 'w-48 h-48 sm:w-60 sm:h-60',
    full: 'w-full h-auto max-h-72'
  };

  // Soft pastel backdrop colors matching the reference palettes
  const backdropColors = {
    sage: 'bg-[#EAF0E9] border-[#DCE5DC]',
    terracotta: 'bg-[#F9EDE7] border-[#F2DDD4]',
    sand: 'bg-[#F5EFE6] border-[#EAE1D4]',
    lavender: 'bg-[#F1EFF7] border-[#E3E0EE]',
    blush: 'bg-[#FAEEF1] border-[#F2DEE3]',
  };

  const currentBackdrop = backdropColors[backdropColor] || backdropColors.sand;

  return (
    <div className={`relative inline-flex items-center justify-center select-none pointer-events-none vendor-illustration-container ${className}`}>
      {/* Optional organic geometric backdrops inspired by reference designs */}
      {backdrop === 'arch' && (
        <div 
          className={`absolute -bottom-2 inset-x-2 h-[88%] ${currentBackdrop} pastel-arch-bg border opacity-90 -z-10`} 
        />
      )}

      {backdrop === 'blob' && (
        <div 
          className={`absolute inset-1 ${currentBackdrop} pastel-blob-bg border opacity-85 -z-10`} 
        />
      )}

      {backdrop === 'circle' && (
        <div 
          className={`absolute inset-2 ${currentBackdrop} rounded-full border opacity-85 -z-10`} 
        />
      )}

      {backdrop === 'pill' && (
        <div 
          className={`absolute inset-x-1 inset-y-2 ${currentBackdrop} rounded-3xl border opacity-85 -z-10`} 
        />
      )}

      {/* Delicate organic botanical leaf accent (inspired by Luna & Co reference) */}
      {showBotanical && (
        <svg 
          className="absolute -top-3 -right-3 w-8 h-8 text-[#8B9C88]/40 pointer-events-none -z-10" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M12 2C12 2 13 7 17 9C21 11 22 16 22 16C22 16 17 15 14 12C11 9 12 2 12 2Z" opacity="0.7"/>
          <path d="M12 2C12 2 11 7 7 9C3 11 2 16 2 16C2 16 7 15 10 12C13 9 12 2 12 2Z"/>
          <path d="M12 2V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )}

      {/* 2D Indian Vendor Character Cutout */}
      <img
        src={src}
        alt={alt}
        className={`object-contain vendor-illustration-native ${sizeClasses[size] || ''}`}
        loading="lazy"
      />
    </div>
  );
}
