import React from 'react';
import { CompanionId } from '../types';

interface CompanionPortraitBadgeProps {
  companionId: CompanionId;
  size?: number;
  className?: string;
}

/**
 * Lightweight static SVG species emblem used in companion picker grids
 * so only one living AnimatedCompanion instance lives on screen inside the
 * permanent bottom-left Companion Room.
 */
export const CompanionPortraitBadge: React.FC<CompanionPortraitBadgeProps> = ({
  companionId,
  size = 44,
  className = '',
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full border border-[var(--sp-border)] overflow-hidden shrink-0 flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" className="w-full h-full">
        {companionId === 'pattu' && (
          <g>
            <circle cx="24" cy="24" r="24" fill="#FBEBD9" />
            <path d="M13 21 L15 10 L22 17 Z" fill="#DF9B64" stroke="#5C3A21" strokeWidth="1.3" />
            <path d="M35 21 L33 10 L26 17 Z" fill="#DF9B64" stroke="#5C3A21" strokeWidth="1.3" />
            <ellipse cx="24" cy="27" rx="12" ry="10" fill="#DF9B64" stroke="#5C3A21" strokeWidth="1.3" />
            <ellipse cx="24" cy="30" rx="7" ry="4.5" fill="#FDF5EC" />
            <circle cx="19.5" cy="25" r="1.6" fill="#5C3A21" />
            <circle cx="28.5" cy="25" r="1.6" fill="#5C3A21" />
            <ellipse cx="24" cy="29" rx="1.8" ry="1.2" fill="#5C3A21" />
          </g>
        )}

        {companionId === 'then' && (
          <g>
            <circle cx="24" cy="24" r="24" fill="#F6E9D7" />
            <circle cx="14" cy="17" r="4.5" fill="#A87449" stroke="#4B301B" strokeWidth="1.3" />
            <circle cx="34" cy="17" r="4.5" fill="#A87449" stroke="#4B301B" strokeWidth="1.3" />
            <ellipse cx="24" cy="27" rx="12.5" ry="10.5" fill="#A87449" stroke="#4B301B" strokeWidth="1.3" />
            <ellipse cx="24" cy="30" rx="6.5" ry="4.8" fill="#F3E0C6" />
            <circle cx="19.5" cy="25" r="1.5" fill="#4B301B" />
            <circle cx="28.5" cy="25" r="1.5" fill="#4B301B" />
            <ellipse cx="24" cy="28.5" rx="2" ry="1.4" fill="#4B301B" />
          </g>
        )}

        {companionId === 'sembu' && (
          <g>
            <circle cx="24" cy="24" r="24" fill="#F9E5D8" />
            <path d="M12 22 L15 9 L22 17 Z" fill="#C96D44" stroke="#5E301D" strokeWidth="1.3" />
            <path d="M36 22 L33 9 L26 17 Z" fill="#C96D44" stroke="#5E301D" strokeWidth="1.3" />
            <ellipse cx="24" cy="27" rx="12" ry="9.5" fill="#C96D44" stroke="#5E301D" strokeWidth="1.3" />
            <ellipse cx="24" cy="30.5" rx="7.5" ry="5" fill="#FAF2E6" />
            <circle cx="19.5" cy="25" r="1.5" fill="#5E301D" />
            <circle cx="28.5" cy="25" r="1.5" fill="#5E301D" />
            <ellipse cx="24" cy="29" rx="1.8" ry="1.3" fill="#5E301D" />
          </g>
        )}

        {companionId === 'malli' && (
          <g>
            <circle cx="24" cy="24" r="24" fill="#F3EBF5" />
            <ellipse cx="18" cy="14" rx="3.4" ry="8.5" transform="rotate(-10 18 14)" fill="#EAE2EC" stroke="#51445D" strokeWidth="1.3" />
            <ellipse cx="30" cy="14" rx="3.4" ry="8.5" transform="rotate(10 30 14)" fill="#EAE2EC" stroke="#51445D" strokeWidth="1.3" />
            <ellipse cx="24" cy="28" rx="11.5" ry="9.5" fill="#EAE2EC" stroke="#51445D" strokeWidth="1.3" />
            <circle cx="19.5" cy="26" r="1.5" fill="#51445D" />
            <circle cx="28.5" cy="26" r="1.5" fill="#51445D" />
            <ellipse cx="24" cy="29.5" rx="1.7" ry="1.2" fill="#C47A92" />
          </g>
        )}

        {companionId === 'owl' && (
          <g>
            <circle cx="24" cy="24" r="24" fill="#E5EDE4" />
            <circle cx="24" cy="26" r="12" fill="#879B80" stroke="#2F4232" strokeWidth="1.3" />
            <circle cx="19" cy="24" r="4.6" fill="#F4F1E4" stroke="#9B773D" strokeWidth="1.2" />
            <circle cx="29" cy="24" r="4.6" fill="#F4F1E4" stroke="#9B773D" strokeWidth="1.2" />
            <circle cx="19" cy="24" r="1.5" fill="#2F4232" />
            <circle cx="29" cy="24" r="1.5" fill="#2F4232" />
            <path d="M22.5 27 L25.5 27 L24 30 Z" fill="#C48248" />
          </g>
        )}

        {companionId === 'otter' && (
          <g>
            <circle cx="24" cy="24" r="24" fill="#E8ECEC" />
            <circle cx="15" cy="18" r="3.2" fill="#8D6E59" stroke="#433126" strokeWidth="1.2" />
            <circle cx="33" cy="18" r="3.2" fill="#8D6E59" stroke="#433126" strokeWidth="1.2" />
            <ellipse cx="24" cy="27" rx="12" ry="9.5" fill="#8D6E59" stroke="#433126" strokeWidth="1.3" />
            <ellipse cx="24" cy="30" rx="6.8" ry="4.5" fill="#EFE3D5" />
            <circle cx="19.5" cy="25" r="1.5" fill="#433126" />
            <circle cx="28.5" cy="25" r="1.5" fill="#433126" />
            <ellipse cx="24" cy="28.2" rx="1.8" ry="1.3" fill="#433126" />
          </g>
        )}
      </svg>
    </div>
  );
};
