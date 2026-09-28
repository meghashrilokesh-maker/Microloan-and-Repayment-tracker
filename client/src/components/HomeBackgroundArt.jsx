import React from 'react';

/**
 * HomeBackgroundArt
 * Subtle, hand-painted background illustration of a person reading a newspaper at a cafe table.
 * Designed as a faded lithograph watermarked into the cream paper background (#FAF7F2).
 * Completely non-interactive (pointer-events: none) and positioned behind all content.
 */
export default function HomeBackgroundArt() {
  return (
    <>
      {/* Desktop & Tablet Background Artwork:
          - Primarily along the LEFT side of the homepage
          - Occupies approx 20-30% of viewport width
          - Extends vertically from near top to near bottom of viewport
          - Behind all content with pointer-events: none
          - Subtle opacity (~0.22) with multiply blending and soft radial mask feathering
      */}
      <div 
        className="pointer-events-none absolute left-0 top-0 bottom-0 z-0 overflow-hidden select-none w-[28vw] min-w-[280px] max-w-[480px] h-[95vh] max-h-[960px] opacity-[0.22] hidden sm:block"
        aria-hidden="true"
      >
        <img 
          src="/images/reading-newspaper-bg.jpg"
          alt=""
          className="w-full h-full object-contain object-left-top mix-blend-multiply"
          style={{
            maskImage: 'radial-gradient(ellipse 95% 85% at 32% 45%, black 45%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse 95% 85% at 32% 45%, black 45%, transparent 85%)'
          }}
          loading="eager"
        />
      </div>

      {/* Mobile Subtle Watermark:
          - Automatically reduced in size and opacity (0.10)
          - Moved farther toward the left edge so it never covers content or text
      */}
      <div 
        className="pointer-events-none absolute -left-12 top-6 z-0 overflow-hidden select-none w-52 h-80 opacity-[0.10] sm:hidden"
        aria-hidden="true"
      >
        <img 
          src="/images/reading-newspaper-bg.jpg"
          alt=""
          className="w-full h-full object-contain object-left-top mix-blend-multiply"
          style={{
            maskImage: 'radial-gradient(ellipse 90% 80% at 35% 40%, black 35%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 35% 40%, black 35%, transparent 80%)'
          }}
          loading="eager"
        />
      </div>
    </>
  );
}
