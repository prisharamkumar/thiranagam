import React from 'react';
import { CollectibleVisualType } from '../types';

interface CollectibleIllustrationProps {
  type: CollectibleVisualType;
  size?: number;
  className?: string;
}

/**
 * Illustrated SVG identity for every collectible reward & Habitat keepsake.
 * Used in both the Reward Catalogue and directly inside the Whispering Willow Grove world.
 */
export const CollectibleIllustration: React.FC<CollectibleIllustrationProps> = ({
  type,
  size = 44,
  className = '',
}) => {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {type === 'coffee-mug' && (
        <g>
          <path d="M24 14 Q26 9 23 5 M34 14 Q36 9 33 5" stroke="#9B6B46" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M16 24 H44 V41 C44 48 38 53 30 53 C22 53 16 48 16 41 Z" fill="#E8D2B5" stroke="#5A3923" strokeWidth="2.2" />
          <path d="M44 28 C51 28 53 39 44 41" fill="none" stroke="#5A3923" strokeWidth="2.6" strokeLinecap="round" />
          <ellipse cx="30" cy="24" rx="14" ry="3.5" fill="#7D4928" />
          <ellipse cx="30" cy="54" rx="17" ry="3.2" fill="#C9A882" stroke="#5A3923" strokeWidth="1.6" />
        </g>
      )}

      {type === 'mini-books' && (
        <g>
          <rect x="12" y="38" width="40" height="11" rx="2.5" fill="#6F4C38" stroke="#3B2418" strokeWidth="2" />
          <rect x="16" y="27" width="34" height="10" rx="2.5" fill="#3C6B53" stroke="#234031" strokeWidth="2" />
          <rect x="19" y="17" width="27" height="9" rx="2.5" fill="#B57941" stroke="#4D3017" strokeWidth="2" />
          <line x1="18" y1="43" x2="46" y2="43" stroke="#EFE2C9" strokeWidth="1.5" />
          <path d="M35 17 V28 L38 25 L41 28 V17 Z" fill="#C74B4B" />
        </g>
      )}

      {type === 'tiny-mushrooms' && (
        <g>
          <ellipse cx="32" cy="54" rx="20" ry="4" fill="#6B8E6E" opacity="0.55" />
          <rect x="21" y="34" width="7" height="18" rx="3" fill="#F2E5CF" stroke="#574636" strokeWidth="1.8" />
          <path d="M12 36 C12 21 37 21 37 36 Z" fill="#C95E45" stroke="#574636" strokeWidth="2" />
          <circle cx="21" cy="28" r="2.2" fill="#FFF7EB" />
          <circle cx="29" cy="31" r="1.7" fill="#FFF7EB" />
          <rect x="40" y="40" width="5.5" height="13" rx="2.5" fill="#F2E5CF" stroke="#574636" strokeWidth="1.6" />
          <path d="M34 42 C34 32 51 32 51 42 Z" fill="#DF8F4F" stroke="#574636" strokeWidth="1.8" />
        </g>
      )}

      {type === 'hanging-lantern' && (
        <g>
          <line x1="32" y1="5" x2="32" y2="16" stroke="#5A422C" strokeWidth="2.4" />
          <path d="M22 20 L42 20 L37 15 L27 15 Z" fill="#5A422C" />
          <rect x="21" y="20" width="22" height="27" rx="4" fill="#FBE3A4" stroke="#5A422C" strokeWidth="2.2" />
          <ellipse cx="32" cy="34" rx="5.5" ry="8" fill="#F7B33D" />
          <path d="M24 47 L40 47 L37 52 L27 52 Z" fill="#5A422C" />
        </g>
      )}

      {type === 'flower-pot' && (
        <g>
          <path d="M20 34 H44 L40 53 H24 Z" fill="#BE6C46" stroke="#5C3220" strokeWidth="2" strokeLinejoin="round" />
          <rect x="18" y="30" width="28" height="6" rx="2" fill="#CF7C55" stroke="#5C3220" strokeWidth="2" />
          <path d="M32 30 V16 M32 26 L22 19 M32 23 L42 17" stroke="#3D6B4B" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="32" cy="14" r="5" fill="#F6D0DE" stroke="#7A4458" strokeWidth="1.6" />
          <circle cx="32" cy="14" r="2" fill="#F2B84B" />
          <circle cx="21" cy="18" r="3.6" fill="#FAF0E4" stroke="#7A4458" strokeWidth="1.4" />
          <circle cx="43" cy="17" r="3.6" fill="#F6D0DE" stroke="#7A4458" strokeWidth="1.4" />
        </g>
      )}

      {type === 'seashell' && (
        <g>
          <path
            d="M12 41 C12 22 52 22 52 41 C52 47 43 51 32 51 C21 51 12 47 12 41 Z"
            fill="#F4E2CC"
            stroke="#6C523E"
            strokeWidth="2"
          />
          <path d="M32 51 V26 M32 51 L22 28 M32 51 L42 28 M32 51 L15 35 M32 51 L49 35" stroke="#B69374" strokeWidth="1.6" />
        </g>
      )}

      {type === 'butterfly' && (
        <g>
          <path d="M31 32 C16 14 9 25 18 35 C12 42 20 50 31 38 Z" fill="#E39754" stroke="#4D301D" strokeWidth="1.8" />
          <path d="M33 32 C48 14 55 25 46 35 C52 42 44 50 33 38 Z" fill="#E39754" stroke="#4D301D" strokeWidth="1.8" />
          <line x1="32" y1="22" x2="32" y2="46" stroke="#3E281B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="22" cy="27" r="2" fill="#FFF8EC" />
          <circle cx="42" cy="27" r="2" fill="#FFF8EC" />
        </g>
      )}

      {type === 'fairy-lights' && (
        <g>
          <path d="M8 20 Q32 38 56 20" fill="none" stroke="#4F4438" strokeWidth="2.2" />
          {[14, 26, 38, 50].map((cx, i) => {
            const cy = i === 1 || i === 2 ? 29 : 24;
            return (
              <g key={cx}>
                <circle cx={cx} cy={cy + 4} r="5.5" fill="#FCE594" opacity="0.5" />
                <circle cx={cx} cy={cy + 4} r="3.4" fill="#F8C846" stroke="#6E521C" strokeWidth="1.3" />
              </g>
            );
          })}
        </g>
      )}

      {type === 'tiny-chair' && (
        <g>
          <rect x="20" y="16" width="24" height="19" rx="5" fill="#9D6841" stroke="#472B17" strokeWidth="2" />
          <rect x="16" y="34" width="32" height="9" rx="3" fill="#B57E53" stroke="#472B17" strokeWidth="2" />
          <line x1="20" y1="43" x2="20" y2="54" stroke="#472B17" strokeWidth="3" strokeLinecap="round" />
          <line x1="44" y1="43" x2="44" y2="54" stroke="#472B17" strokeWidth="3" strokeLinecap="round" />
          <rect x="23" y="29" width="18" height="6" rx="2.5" fill="#E8D8C2" />
        </g>
      )}

      {type === 'cushion' && (
        <g>
          <path
            d="M14 34 C14 23 50 23 50 34 C53 45 45 49 32 49 C19 49 11 45 14 34 Z"
            fill="#81A68D"
            stroke="#314F3B"
            strokeWidth="2"
          />
          <circle cx="32" cy="36" r="2.6" fill="#F4EDE1" />
        </g>
      )}

      {type === 'fern-plant' && (
        <g>
          <path d="M22 39 H42 L39 53 H25 Z" fill="#C49A6C" stroke="#5A4024" strokeWidth="2" />
          <path d="M32 39 C28 24 20 18 13 21 C20 26 26 32 32 39 Z" fill="#3B724E" stroke="#22442E" strokeWidth="1.5" />
          <path d="M32 39 C36 24 44 18 51 21 C44 26 38 32 32 39 Z" fill="#4C8A61" stroke="#22442E" strokeWidth="1.5" />
          <path d="M32 39 C30 22 31 12 32 10 C34 15 35 24 32 39 Z" fill="#316141" />
        </g>
      )}

      {type === 'wooden-sign' && (
        <g>
          <rect x="30" y="34" width="5" height="20" rx="1.5" fill="#6E4A2E" />
          <path d="M13 18 H46 L52 26 L46 34 H13 Z" fill="#BA8654" stroke="#4E3119" strokeWidth="2" strokeLinejoin="round" />
          <line x1="19" y1="24" x2="38" y2="24" stroke="#4E3119" strokeWidth="2" strokeLinecap="round" />
          <line x1="19" y1="29" x2="33" y2="29" stroke="#4E3119" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {type === 'woven-rug' && (
        <g>
          <rect x="11" y="22" width="42" height="24" rx="4" fill="#D99B72" stroke="#5E3824" strokeWidth="2" />
          <rect x="17" y="27" width="30" height="14" rx="2" fill="#EFE0C6" stroke="#8C593B" strokeWidth="1.6" />
          <path d="M24 34 L32 29 L40 34 L32 39 Z" fill="#467058" />
        </g>
      )}

      {type === 'reading-window' && (
        <g>
          <path
            d="M16 50 V28 C16 14 48 14 48 28 V50 Z"
            fill="#DCECF2"
            stroke="#593C28"
            strokeWidth="2.5"
          />
          <line x1="32" y1="18" x2="32" y2="50" stroke="#593C28" strokeWidth="2" />
          <line x1="16" y1="34" x2="48" y2="34" stroke="#593C28" strokeWidth="2" />
          <circle cx="24" cy="24" r="3.5" fill="#FBE094" />
        </g>
      )}
    </svg>
  );
};
