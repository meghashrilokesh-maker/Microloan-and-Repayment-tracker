import React from 'react';

/**
 * NaturalVendorImage seamlessly integrates the vendor pictures
 * into the pastel UI without feeling like a boxed photo.
 */
export default function NaturalVendorImage({
  type = 'tea', // 'tea' | 'flowers' | 'farmer' | 'couple' | 'business'
  className = '',
  alt = 'Vendor Illustration',
  size = 'md', // 'sm' | 'md' | 'lg' | 'hero'
  blend = true
}) {
  const images = {
    tea: '/images/vendor-tea.jpg',
    flowers: '/images/vendor-flowers.jpg',
    farmer: '/images/vendor-farmer.jpg',
    couple: '/images/vendor-couple.jpg',
    business: '/images/vendor-business.jpg',
  };

  const src = images[type] || images.tea;

  const sizeClasses = {
    xs: 'w-10 h-10',
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-36 h-36 sm:w-44 sm:h-44',
    hero: 'w-48 h-48 sm:w-56 sm:h-56',
    full: 'w-full h-auto max-h-60'
  };

  return (
    <div className={`relative inline-flex items-center justify-center overflow-hidden select-none pointer-events-none ${className}`}>
      {/* Soft pastel aura background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-black/5 rounded-3xl" />
      
      <img
        src={src}
        alt={alt}
        className={`object-contain transition-transform duration-300 ${sizeClasses[size] || ''} ${
          blend ? 'vendor-photo-blend' : ''
        }`}
        loading="lazy"
      />
    </div>
  );
}
