'use client';

import React from 'react';

interface SasAiWordmarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SasAiWordmark({ className = '', size = 'md' }: SasAiWordmarkProps) {
  // Height presets
  const heightClasses = {
    sm: 'h-[14px]',
    md: 'h-[18px]',
    lg: 'h-6',
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/sas-ai-text.png"
        alt="SAS AI"
        className={`${heightClasses[size]} w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,163,255,0.2)]`}
        loading="eager"
      />
    </div>
  );
}
