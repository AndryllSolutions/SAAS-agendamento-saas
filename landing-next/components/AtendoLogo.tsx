"use client";

import React from 'react';

interface AtendoLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  textColor?: 'dark' | 'light';
}

export const AtendoLogo: React.FC<AtendoLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  textColor = 'dark',
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 16 },
    md: { icon: 40, text: 22 },
    lg: { icon: 56, text: 32 },
  };

  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rounded Square Background */}
        <rect
          x="4"
          y="4"
          width="56"
          height="56"
          rx="12"
          fill="#175EF0"
        />
        
        {/* Letter A - Maior e mais destacado */}
        <text
          x="32"
          y="48"
          textAnchor="middle"
          fontSize="36"
          fontWeight="bold"
          fill="white"
          fontFamily="Arial, sans-serif"
        >
          A
        </text>
      </svg>

      {/* Logo Text */}
      {showText && (
        <span
          className={`font-bold ${textColor === 'light' ? 'text-white' : 'text-foreground'}`}
          style={{ fontSize: `${text}px` }}
        >
          Atendo
        </span>
      )}
    </div>
  );
};

export default AtendoLogo;
