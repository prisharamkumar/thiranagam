import React from 'react';
import { ThemePresetId } from '../types';

interface ThemeSceneThumbnailProps {
  themeId: ThemePresetId;
  className?: string;
}

/**
 * Compact handcrafted SVG scene preview for each of the 5 global world themes
 * used inside TopNav's quick Theme Switcher and Settings -> Theme Studio.
 */
export const ThemeSceneThumbnail: React.FC<ThemeSceneThumbnailProps> = ({
  themeId,
  className = '',
}) => {
  return (
    <svg
      viewBox="0 0 120 56"
      className={`w-full h-12 rounded-lg border border-black/10 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {themeId === 'cafe' && (
        <g>
          <rect width="120" height="56" fill="#FAF3E8" />
          <rect y="38" width="120" height="18" fill="#C99B6B" />
          <path d="M14 36 V14 C14 7 32 7 32 14 V36 Z" fill="#FBE2B4" stroke="#7A4828" strokeWidth="1.8" />
          <path d="M74 16 L90 16 L86 9 L78 9 Z" fill="#A65E32" />
          <circle cx="82" cy="18" r="2.5" fill="#FFF2BA" />
          <rect x="73" y="29" width="16" height="12" rx="2" fill="#FFFDF9" stroke="#7A4828" strokeWidth="1.4" />
          <path d="M89 32 C94 32 94 38 89 38" fill="none" stroke="#7A4828" strokeWidth="1.4" />
        </g>
      )}

      {themeId === 'rainforest' && (
        <g>
          <rect width="120" height="56" fill="#DDF0DC" />
          <path d="M0 39 Q60 33 120 39 V56 H0 Z" fill="#689B6D" />
          <path d="M8 50 C4 32 14 20 26 18 C22 30 16 40 8 50 Z" fill="#26533B" />
          <path d="M92 50 C96 30 108 22 116 26 C108 36 100 44 92 50 Z" fill="#366E4C" />
          <rect x="44" y="34" width="4" height="8" rx="1" fill="#F4EBD9" />
          <path d="M38 35 C38 26 54 26 54 35 Z" fill="#C95E45" />
          <circle cx="68" cy="18" r="2" fill="#F7DC79" />
          <circle cx="82" cy="24" r="1.6" fill="#F7DC79" />
        </g>
      )}

      {themeId === 'beach' && (
        <g>
          <rect width="120" height="56" fill="#CBEAF0" />
          <circle cx="96" cy="16" r="7" fill="#FFE394" />
          <rect y="26" width="120" height="16" fill="#4699AB" />
          <path d="M0 39 Q60 35 120 39 V56 H0 Z" fill="#F2DCB7" />
          <path d="M24 25 L36 25 L33 29 L27 29 Z" fill="#6F4C33" />
          <path d="M30 14 L30 24 L37 24 Z" fill="#FFFDF8" />
          <path d="M84 46 C84 40 94 40 94 46 Z" fill="#F8E8DA" stroke="#A67C5E" strokeWidth="1.2" />
        </g>
      )}

      {themeId === 'library' && (
        <g>
          <rect width="120" height="56" fill="#F4EBDC" />
          <rect y="40" width="120" height="16" fill="#B4885F" />
          <rect x="12" y="10" width="42" height="32" rx="2" fill="#6A442C" />
          <rect x="16" y="14" width="5" height="11" fill="#8C4838" />
          <rect x="22" y="15" width="5" height="10" fill="#466D55" />
          <rect x="28" y="13" width="6" height="12" fill="#C4924E" />
          <rect x="35" y="15" width="5" height="10" fill="#4F6682" />
          <circle cx="90" cy="26" r="11" fill="#FAD27B" opacity="0.45" />
          <path d="M83 25 L97 25 L94 18 L86 18 Z" fill="#3B694E" />
          <rect x="89" y="25" width="2.5" height="15" fill="#B68B46" />
        </g>
      )}

      {themeId === 'cabin' && (
        <g>
          <rect width="120" height="56" fill="#EFE0CE" />
          <rect y="40" width="120" height="16" fill="#C49368" />
          <rect x="16" y="12" width="26" height="22" rx="2" fill="#D5E7EA" stroke="#6C3E24" strokeWidth="2" />
          <path d="M22 33 L26 21 L30 33 Z" fill="#2F5943" />
          <path d="M30 33 L35 19 L40 33 Z" fill="#264937" />
          <path d="M74 42 V24 C74 16 102 16 102 24 V42 Z" fill="#785B4C" />
          <path d="M79 42 V27 C79 21 97 21 97 27 V42 Z" fill="#2A1D18" />
          <path d="M84 42 C84 31 92 31 92 42 Z" fill="#F39A38" />
          <ellipse cx="60" cy="48" rx="26" ry="5" fill="#B86446" stroke="#F1D5B5" strokeWidth="1.2" />
        </g>
      )}
    </svg>
  );
};
