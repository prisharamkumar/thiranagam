import React from 'react';
import { AvatarId } from '../types';

interface StudentAvatarProps {
  avatarId: AvatarId;
  name: string;
  size?: number;
  className?: string;
}

export const AVATAR_OPTIONS: { id: AvatarId; label: string }[] = [
  { id: 'willow', label: 'Willow Branch' },
  { id: 'fox', label: 'Russet Fox' },
  { id: 'owl', label: 'Reading Owl' },
  { id: 'lotus', label: 'Morning Lotus' },
  { id: 'lantern', label: 'Warm Lantern' },
  { id: 'initials', label: 'Monogram' },
];

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  avatarId,
  name,
  size = 40,
  className = '',
}) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'T';

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full bg-[var(--sp-accent-soft)] border border-[var(--sp-border)] flex items-center justify-center overflow-hidden shrink-0 ${className}`}
      aria-hidden="true"
    >
      {avatarId === 'initials' ? (
        <span className="font-display font-semibold text-sm text-[var(--sp-accent)]">
          {initials}
        </span>
      ) : (
        <svg viewBox="0 0 48 48" className="w-full h-full">
          {avatarId === 'willow' && (
            <g>
              <circle cx="24" cy="24" r="24" fill="#E3EDE2" />
              <path d="M12 36 Q22 18 35 12" fill="none" stroke="#3B6B4D" strokeWidth="2.4" strokeLinecap="round" />
              <ellipse cx="20" cy="22" rx="3" ry="5" transform="rotate(-35 20 22)" fill="#5E916D" />
              <ellipse cx="29" cy="18" rx="3" ry="5" transform="rotate(20 29 18)" fill="#4D7F5D" />
              <ellipse cx="26" cy="28" rx="3" ry="5" transform="rotate(40 26 28)" fill="#6FA37E" />
            </g>
          )}
          {avatarId === 'fox' && (
            <g>
              <circle cx="24" cy="24" r="24" fill="#F6E5D6" />
              <path d="M13 22 L15 10 L22 17 Z" fill="#C96D44" />
              <path d="M35 22 L33 10 L26 17 Z" fill="#C96D44" />
              <ellipse cx="24" cy="26" rx="12" ry="10" fill="#C96D44" />
              <ellipse cx="24" cy="30" rx="7" ry="5" fill="#FAF2E6" />
              <circle cx="20" cy="24" r="1.4" fill="#462112" />
              <circle cx="28" cy="24" r="1.4" fill="#462112" />
            </g>
          )}
          {avatarId === 'owl' && (
            <g>
              <circle cx="24" cy="24" r="24" fill="#E5ECE3" />
              <circle cx="24" cy="26" r="12" fill="#7D9478" />
              <circle cx="19" cy="24" r="4.5" fill="#FAF6EA" stroke="#9B773D" strokeWidth="1.2" />
              <circle cx="29" cy="24" r="4.5" fill="#FAF6EA" stroke="#9B773D" strokeWidth="1.2" />
              <circle cx="19" cy="24" r="1.5" fill="#2A392C" />
              <circle cx="29" cy="24" r="1.5" fill="#2A392C" />
            </g>
          )}
          {avatarId === 'lotus' && (
            <g>
              <circle cx="24" cy="24" r="24" fill="#F7E8ED" />
              <path d="M24 12 C29 19 29 29 24 34 C19 29 19 19 24 12 Z" fill="#C9738F" />
              <path d="M13 21 C19 21 23 28 24 34 C17 33 13 28 13 21 Z" fill="#DE93AB" />
              <path d="M35 21 C29 21 25 28 24 34 C31 33 35 28 35 21 Z" fill="#DE93AB" />
            </g>
          )}
          {avatarId === 'lantern' && (
            <g>
              <circle cx="24" cy="24" r="24" fill="#F8EBD6" />
              <rect x="16" y="15" width="16" height="20" rx="3" fill="#FCE29C" stroke="#6B4624" strokeWidth="1.8" />
              <ellipse cx="24" cy="25" rx="4" ry="6" fill="#EB9C26" />
              <path d="M18 15 L30 15 L27 11 L21 11 Z" fill="#6B4624" />
            </g>
          )}
        </svg>
      )}
    </div>
  );
};
