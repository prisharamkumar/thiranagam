import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface IllustratedFrameProps {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackTitle?: string;
  fallbackGradient?: string;
}

export const IllustratedFrame: React.FC<IllustratedFrameProps> = ({
  src,
  alt,
  className = '',
  imgClassName = 'w-full h-full object-cover',
  fallbackTitle,
  fallbackGradient = 'from-[#2D4739] via-[#516E57] to-[#D8C7A6]',
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${fallbackGradient} flex flex-col items-center justify-center p-6 text-white ${className}`}
        role="img"
        aria-label={alt}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.6) 0%, transparent 45%), radial-gradient(circle at 80% 75%, rgba(255,255,255,0.4) 0%, transparent 50%)',
          }}
        />
        <Sparkles className="w-7 h-7 mb-2 opacity-85 relative z-10" aria-hidden="true" />
        {fallbackTitle && (
          <span className="font-display text-lg font-medium text-center relative z-10">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={imgClassName}
      />
    </div>
  );
};
