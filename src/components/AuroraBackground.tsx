'use client';

import React from 'react';

export default function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none bg-[#080b12]"
    >
      {/* Deep Navy/Obsidian Radial Base Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_-15%,rgba(18,34,64,0.45),rgba(8,11,18,1))]" />

      {/* Faint Cyber Tech Grid Pattern with Vignette */}
      <div className="absolute inset-0 bg-ai-grid opacity-30" />

      {/* Floating Aurora Glow Orbs (GPU-accelerated, lightweight CSS transforms) */}
      
      {/* 1. Cyan/Teal Ambient Orb (Top-Left / Center Drift) */}
      <div className="absolute top-[-8%] left-[10%] w-[550px] h-[550px] md:w-[750px] md:h-[750px] rounded-full bg-gradient-to-tr from-[#20b8cd]/16 via-[#0284c7]/12 to-transparent blur-[140px] animate-aurora-1 will-change-transform" />

      {/* 2. Violet/Purple Ambient Orb (Bottom-Right / Center Drift) */}
      <div className="absolute bottom-[-10%] right-[8%] w-[550px] h-[550px] md:w-[750px] md:h-[750px] rounded-full bg-gradient-to-tr from-[#8b5cf6]/14 via-[#6366f1]/10 to-transparent blur-[140px] animate-aurora-2 will-change-transform" />

      {/* 3. Deep Indigo/Cyan Core Atmosphere Orb */}
      <div className="absolute top-[30%] left-[25%] w-[450px] h-[450px] md:w-[650px] md:h-[650px] rounded-full bg-gradient-to-r from-[#3b82f6]/10 via-[#8b5cf6]/8 to-[#20b8cd]/8 blur-[130px] animate-aurora-3 will-change-transform" />

      {/* Outer Soft Vignette to keep focus on UI center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_40%,rgba(8,11,18,0.65)_100%)]" />
    </div>
  );
}
