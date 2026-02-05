"use client";

import React from "react";

interface AtendoLogoProps {
  width?: number;
  height?: number;
  className?: string;
  variant?: "full" | "icon" | "wordmark";
  color?: string;
}

export function AtendoLogo({
  width = 160,
  height,
  className = "",
  variant = "full",
  color = "#6366f1",
}: AtendoLogoProps) {
  const aspectRatio = variant === "icon" ? 1 : variant === "wordmark" ? 3.5 : 3;
  const calculatedHeight = height || width / aspectRatio;

  if (variant === "icon") {
    return (
      <svg
        width={width}
        height={calculatedHeight}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Main circle */}
        <circle cx="32" cy="32" r="28" fill="url(#iconGradient)" />
        
        {/* Clock hands */}
        <line
          x1="32"
          y1="32"
          x2="32"
          y2="16"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="32"
          y1="32"
          x2="44"
          y2="38"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Center dot */}
        <circle cx="32" cy="32" r="4" fill="white" />
        
        {/* Tick marks */}
        {[0, 90, 180, 270].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 32 + Math.cos(rad) * 20;
          const y1 = 32 + Math.sin(rad) * 20;
          const x2 = 32 + Math.cos(rad) * 23;
          const y2 = 32 + Math.sin(rad) * 23;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
          );
        })}
      </svg>
    );
  }

  if (variant === "wordmark") {
    return (
      <svg
        width={width}
        height={calculatedHeight}
        viewBox="0 0 280 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        
        {/* aTendo text */}
        <text
          x="10"
          y="58"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="56"
          fontWeight="700"
          fill="url(#textGradient)"
          letterSpacing="-1"
        >
          aTendo
        </text>
        
        {/* Decorative underline */}
        <rect x="10" y="65" width="120" height="4" rx="2" fill="#6366f1" opacity="0.3" />
      </svg>
    );
  }

  // Full logo (icon + text)
  return (
    <svg
      width={width}
      height={calculatedHeight}
      viewBox="0 0 240 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="textGradientFull" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      
      {/* Icon */}
      <g transform="translate(0, 0)">
        <circle cx="32" cy="32" r="28" fill="url(#logoGradient)" />
        <line
          x1="32"
          y1="32"
          x2="32"
          y2="16"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="32"
          y1="32"
          x2="44"
          y2="38"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="32" cy="32" r="4" fill="white" />
        {[0, 90, 180, 270].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 32 + Math.cos(rad) * 20;
          const y1 = 32 + Math.sin(rad) * 20;
          const x2 = 32 + Math.cos(rad) * 23;
          const y2 = 32 + Math.sin(rad) * 23;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
          );
        })}
      </g>
      
      {/* Text */}
      <text
        x="76"
        y="45"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="40"
        fontWeight="700"
        fill="url(#textGradientFull)"
        letterSpacing="-0.5"
      >
        aTendo
      </text>
      
      {/* Tagline */}
      <text
        x="76"
        y="58"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="10"
        fontWeight="500"
        fill="#6b7280"
        letterSpacing="0.5"
      >
        Sistema de Agendamento
      </text>
    </svg>
  );
}

export default AtendoLogo;
