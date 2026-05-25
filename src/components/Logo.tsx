import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  imgClassName?: string;
  variant?: 'dark' | 'light';
}

export default function Logo({ size = 60, showText = false, className = "", imgClassName = "", variant = 'dark' }: LogoProps) {
  return (
    <div className={`d-flex align-items-center gap-2 ${className}`}>
      <img 
        src="Logo_mooduit.png" 
        alt="Logo MOODUIT" 
        className={`logo-img ${imgClassName}`}
        style={{ width: size }}
      />

      {showText && (
        <div className="brand-text" style={{ fontSize: `${size * 0.55}px` }}>
          <span className={variant === 'light' ? 'text-white' : 'brand-moo'}>MOO</span>
          <span className="brand-duit">DUIT</span>
        </div>
      )}
    </div>
  );
}
