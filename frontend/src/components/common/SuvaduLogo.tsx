import React from 'react';

interface SuvaduLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SuvaduLogo: React.FC<SuvaduLogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: { width: 110, height: 32 },
    md: { width: 140, height: 40 },
    lg: { width: 180, height: 52 },
  };

  const { width, height } = sizes[size];

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 140 40" 
      width={width} 
      height={height}
      className={className}
    >
      <defs>
        <linearGradient id="footGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4DB6AC"/>
          <stop offset="50%" stopColor="#26A69A"/>
          <stop offset="100%" stopColor="#00897B"/>
        </linearGradient>
      </defs>
      
      {/* Text: Su - Bold rounded style */}
      <text 
        x="0" 
        y="30" 
        fontFamily="'Segoe UI', 'SF Pro Display', Arial, sans-serif" 
        fontSize="28" 
        fontWeight="800" 
        fill="#37474F"
        letterSpacing="-0.5"
      >Su</text>
      
      {/* Left footprint */}
      <g transform="translate(36, 3) scale(0.18)">
        <ellipse cx="25" cy="12" rx="9" ry="9" fill="url(#footGradient)"/>
        <ellipse cx="45" cy="6" rx="8" ry="8" fill="url(#footGradient)"/>
        <ellipse cx="65" cy="3" rx="8" ry="8" fill="url(#footGradient)"/>
        <ellipse cx="85" cy="6" rx="8" ry="8" fill="url(#footGradient)"/>
        <ellipse cx="102" cy="15" rx="7" ry="7" fill="url(#footGradient)"/>
        <path d="M20,32 C10,55 15,115 42,138 C58,152 92,148 108,125 C120,100 118,55 100,35 C82,20 40,20 20,32Z" fill="url(#footGradient)"/>
        <path d="M52,50 L52,88 M52,70 L72,70 L72,95" stroke="white" strokeWidth="4" fill="none" opacity="0.4" strokeLinecap="round"/>
        <circle cx="52" cy="50" r="4" fill="white" opacity="0.5"/>
        <circle cx="72" cy="95" r="4" fill="white" opacity="0.5"/>
        <circle cx="52" cy="88" r="4" fill="white" opacity="0.5"/>
      </g>
      
      {/* Right footprint (mirrored) */}
      <g transform="translate(82, 3) scale(-0.18, 0.18)">
        <ellipse cx="25" cy="12" rx="9" ry="9" fill="url(#footGradient)"/>
        <ellipse cx="45" cy="6" rx="8" ry="8" fill="url(#footGradient)"/>
        <ellipse cx="65" cy="3" rx="8" ry="8" fill="url(#footGradient)"/>
        <ellipse cx="85" cy="6" rx="8" ry="8" fill="url(#footGradient)"/>
        <ellipse cx="102" cy="15" rx="7" ry="7" fill="url(#footGradient)"/>
        <path d="M20,32 C10,55 15,115 42,138 C58,152 92,148 108,125 C120,100 118,55 100,35 C82,20 40,20 20,32Z" fill="url(#footGradient)"/>
        <path d="M52,50 L52,88 M52,70 L72,70 L72,95" stroke="white" strokeWidth="4" fill="none" opacity="0.4" strokeLinecap="round"/>
        <circle cx="52" cy="50" r="4" fill="white" opacity="0.5"/>
        <circle cx="72" cy="95" r="4" fill="white" opacity="0.5"/>
        <circle cx="52" cy="88" r="4" fill="white" opacity="0.5"/>
      </g>
      
      {/* Text: adu - Bold rounded style */}
      <text 
        x="82" 
        y="30" 
        fontFamily="'Segoe UI', 'SF Pro Display', Arial, sans-serif" 
        fontSize="28" 
        fontWeight="800" 
        fill="#37474F"
        letterSpacing="-0.5"
      >adu</text>
    </svg>
  );
};

export default SuvaduLogo;
