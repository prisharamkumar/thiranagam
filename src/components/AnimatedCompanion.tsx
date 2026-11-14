import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { CompanionId, CompanionMood } from '../types';

interface AnimatedCompanionProps {
  companionId: CompanionId;
  mood?: CompanionMood;
  size?: number;
  sizeClassName?: string;
  className?: string;
  showStateChip?: boolean;
  frameless?: boolean;
}

type PattuPhase = 'sleeping' | 'stretching' | 'walking' | 'idle' | 'celebrate';

/**
 * Full-body articulated SVG animated companions.
 * - Pattu (Cat): sleeps & breathes during focus -> wakes, arches back/yawns/stretches, walks
 *   a few steps on break start -> looks toward student with cursor-tracking eyes, blinks & wags tail.
 * - Sembu (Fox), Then (Bear), Malli (Bunny), Barn Owl, River Otter: each with distinct
 *   focus / break / idle / celebration SVG animation states.
 * Strictly respects Reduced Motion, Low-Stimulation Mode, animationIntensity === 'off', and touch devices.
 */
export const AnimatedCompanion: React.FC<AnimatedCompanionProps> = ({
  companionId,
  mood = 'idle',
  size = 136,
  sizeClassName,
  className = '',
  showStateChip = false,
  frameless = false,
}) => {
  const { profile, themeSettings, adhdPreferences } = useAppState();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [pupilOffset, setPupilOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [pattuPhase, setPattuPhase] = useState<PattuPhase>('idle');

  const isTouchDevice =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(pointer: coarse)').matches;

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const motionAllowed =
    !prefersReducedMotion &&
    !profile.lowStimulationMode &&
    !profile.reducedMotion &&
    themeSettings.animationIntensity !== 'off';

  const trackingAllowed = motionAllowed && !isTouchDevice && adhdPreferences.cursorFollowingEyes;

  // Orchestrate Pattu's multi-step wake -> stretch/yawn -> walk -> settle choreography on break
  useEffect(() => {
    if (companionId !== 'pattu') return;
    if (mood === 'focus') {
      setPattuPhase('sleeping');
      return;
    }
    if (mood === 'celebrate') {
      setPattuPhase('celebrate');
      return;
    }
    if (mood === 'break' || mood === 'waking') {
      if (!motionAllowed) {
        setPattuPhase('idle');
        return;
      }
      setPattuPhase('stretching');
      const walkTimer = window.setTimeout(() => setPattuPhase('walking'), 2100);
      const settleTimer = window.setTimeout(() => setPattuPhase('idle'), 4600);
      return () => {
        window.clearTimeout(walkTimer);
        window.clearTimeout(settleTimer);
      };
    }
    setPattuPhase('idle');
  }, [companionId, mood, motionAllowed]);

  // Desktop cursor-following pupils bounded cleanly within eye whites
  useEffect(() => {
    if (!trackingAllowed) {
      setPupilOffset({ x: 0, y: 0 });
      return;
    }

    let rafId: number | null = null;
    const onMove = (e: MouseEvent) => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const el = stageRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const maxMove = themeSettings.animationIntensity === 'minimal' ? 1.5 : 2.6;
        const factor = Math.min(1, dist / 240) * maxMove;
        setPupilOffset({ x: (dx / dist) * factor, y: (dy / dist) * factor });
      });
    };

    const onLeave = () => setPupilOffset({ x: 0, y: 0 });
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('blur', onLeave);
    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
    };
  }, [trackingAllowed, themeSettings.animationIntensity]);

  // Natural blinking rhythm
  useEffect(() => {
    if (!motionAllowed) return;
    let blinkTimeout: number;
    const interval = window.setInterval(() => {
      setIsBlinking(true);
      blinkTimeout = window.setTimeout(() => setIsBlinking(false), 150);
    }, 4400);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(blinkTimeout);
    };
  }, [motionAllowed]);

  const eyesClosed =
    isBlinking || (companionId === 'pattu' && pattuPhase === 'sleeping');

  const phaseLabel =
    companionId === 'pattu'
      ? pattuPhase === 'sleeping'
        ? 'Sleeping · Focus'
        : pattuPhase === 'stretching'
          ? 'Stretching & Yawning'
          : pattuPhase === 'walking'
            ? 'Stepping'
            : pattuPhase === 'celebrate'
              ? 'Celebrating'
              : 'Relaxed'
      : mood === 'focus'
        ? 'Studying'
        : mood === 'break' || mood === 'waking'
          ? 'Break Stretch'
          : mood === 'celebrate'
            ? 'Celebrating'
            : 'Ready';

  const renderEyes = (lx: number, rx: number, y: number, stroke = '#3B281B') => {
    if (eyesClosed) {
      return (
        <>
          <path d={`M${lx - 4} ${y} Q${lx} ${y + 3.5} ${lx + 4} ${y}`} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d={`M${rx - 4} ${y} Q${rx} ${y + 3.5} ${rx + 4} ${y}`} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </>
      );
    }
    return (
      <>
        <circle cx={lx} cy={y} r="4.8" fill="#FFFFFF" stroke={stroke} strokeWidth="1.4" />
        <circle cx={rx} cy={y} r="4.8" fill="#FFFFFF" stroke={stroke} strokeWidth="1.4" />
        <circle cx={lx + pupilOffset.x} cy={y + pupilOffset.y} r="2.5" fill={stroke} />
        <circle cx={rx + pupilOffset.x} cy={y + pupilOffset.y} r="2.5" fill={stroke} />
        <circle cx={lx + 0.9 + pupilOffset.x * 0.6} cy={y - 1 + pupilOffset.y * 0.6} r="0.9" fill="#FFFFFF" />
        <circle cx={rx + 0.9 + pupilOffset.x * 0.6} cy={y - 1 + pupilOffset.y * 0.6} r="0.9" fill="#FFFFFF" />
      </>
    );
  };

  return (
    <div
      ref={stageRef}
      style={sizeClassName ? undefined : { width: size, height: size }}
      className={`relative flex items-center justify-center shrink-0 ${
        sizeClassName ?? ''
      } ${
        frameless
          ? 'bg-transparent overflow-visible'
          : 'rounded-2xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] overflow-hidden'
      } ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 140 128" className="w-full h-full overflow-visible">
        {/* Soft grounded contact shadow on room floor/rug */}
        <ellipse
          cx="70"
          cy="110"
          rx={frameless ? 36 : 46}
          ry={frameless ? 6.5 : 8}
          fill={frameless ? 'rgba(20, 14, 10, 0.22)' : 'var(--sp-accent)'}
          opacity={frameless ? 1 : 0.14}
        />

        {/* === PATTU (CAT) === */}
        {companionId === 'pattu' && (
          <g
            className={
              !motionAllowed
                ? ''
                : pattuPhase === 'stretching'
                  ? 'anim-cat-stretch'
                  : pattuPhase === 'walking'
                    ? 'anim-walk-steps'
                    : pattuPhase === 'sleeping'
                      ? 'anim-breathe'
                      : pattuPhase === 'celebrate'
                        ? 'anim-hop'
                        : 'anim-idle-settle'
            }
          >
            {/* Sage Rest Cushion */}
            <ellipse cx="70" cy="105" rx="40" ry="10" fill="#7D9F86" stroke="#365440" strokeWidth="1.8" />

            {pattuPhase === 'sleeping' ? (
              /* Curled Sleeping Pose */
              <g>
                <ellipse cx="69" cy="91" rx="28" ry="15" fill="#DF9B64" stroke="#5C3A21" strokeWidth="2" />
                {/* Tail curled over cushion */}
                <path
                  d="M92 93 C108 93 111 79 97 80"
                  fill="none"
                  stroke="#DF9B64"
                  strokeWidth="7"
                  strokeLinecap="round"
                  className={motionAllowed ? 'anim-tail-sway' : ''}
                />
                <circle cx="52" cy="84" r="15" fill="#DF9B64" stroke="#5C3A21" strokeWidth="2" />
                <path d="M40 74 L42 61 L51 70 Z" fill="#DF9B64" stroke="#5C3A21" strokeWidth="1.8" />
                <path d="M55 70 L64 61 L65 75 Z" fill="#DF9B64" stroke="#5C3A21" strokeWidth="1.8" />
                <ellipse cx="52" cy="88" rx="9" ry="6.5" fill="#FDF5EC" />
                <path d="M44 83 Q47 86 50 83" fill="none" stroke="#5C3A21" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M54 83 Q57 86 60 83" fill="none" stroke="#5C3A21" strokeWidth="1.8" strokeLinecap="round" />
                {/* Gentle breathing arc above sleeping Pattu */}
                {motionAllowed && (
                  <path
                    d="M84 62 Q88 57 92 62"
                    fill="none"
                    stroke="var(--sp-ink-muted)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    className="anim-float-slow"
                  />
                )}
              </g>
            ) : pattuPhase === 'stretching' ? (
              /* Back Arch, Yawn & Forward Paw Stretch */
              <g>
                <path
                  d="M95 88 Q112 68 106 52"
                  fill="none"
                  stroke="#DF9B64"
                  strokeWidth="7.5"
                  strokeLinecap="round"
                />
                <path
                  d="M44 98 C44 68 88 64 96 98 Z"
                  fill="#DF9B64"
                  stroke="#5C3A21"
                  strokeWidth="2"
                />
                {/* Stretched front paws */}
                <ellipse cx="38" cy="100" rx="11" ry="4.5" fill="#FDF5EC" stroke="#5C3A21" strokeWidth="1.8" />
                <circle cx="54" cy="70" r="15" fill="#DF9B64" stroke="#5C3A21" strokeWidth="2" />
                <path d="M41 60 L44 47 L53 56 Z" fill="#DF9B64" stroke="#5C3A21" strokeWidth="1.8" />
                <path d="M56 56 L66 47 L67 60 Z" fill="#DF9B64" stroke="#5C3A21" strokeWidth="1.8" />
                <ellipse cx="54" cy="75" rx="9.5" ry="6.5" fill="#FDF5EC" />
                {/* Squinted yawn expression */}
                <path d="M46 68 Q49 65 52 68" fill="none" stroke="#5C3A21" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M56 68 Q59 65 62 68" fill="none" stroke="#5C3A21" strokeWidth="1.8" strokeLinecap="round" />
                <ellipse cx="54" cy="77" rx="3.2" ry="3.8" fill="#B85C5C" />
              </g>
            ) : (
              /* Alert Upright Seated / Stepping Pose looking at Student */
              <g>
                {/* Swaying Tail */}
                <path
                  d="M88 94 C108 90 112 68 101 63"
                  fill="none"
                  stroke="#DF9B64"
                  strokeWidth="7.5"
                  strokeLinecap="round"
                  className={motionAllowed ? 'anim-tail-sway' : ''}
                />
                <ellipse cx="70" cy="84" rx="20" ry="20" fill="#DF9B64" stroke="#5C3A21" strokeWidth="2" />
                <ellipse cx="70" cy="87" rx="11" ry="13" fill="#FDF5EC" />
                <ellipse cx="61" cy="103" rx="6.5" ry="4.5" fill="#FDF5EC" stroke="#5C3A21" strokeWidth="1.8" />
                <ellipse cx="79" cy="103" rx="6.5" ry="4.5" fill="#FDF5EC" stroke="#5C3A21" strokeWidth="1.8" />
                {/* Ears & Head */}
                <path d="M48 48 L51 25 L65 38 Z" fill="#DF9B64" stroke="#5C3A21" strokeWidth="2" />
                <path d="M52 44 L54 31 L62 39 Z" fill="#F9DFC9" />
                <path d="M92 48 L89 25 L75 38 Z" fill="#DF9B64" stroke="#5C3A21" strokeWidth="2" />
                <path d="M88 44 L86 31 L78 39 Z" fill="#F9DFC9" />
                <ellipse cx="70" cy="54" rx="23" ry="19" fill="#DF9B64" stroke="#5C3A21" strokeWidth="2" />
                <ellipse cx="70" cy="61" rx="13" ry="9" fill="#FDF5EC" />
                {renderEyes(61, 79, 52, '#5C3A21')}
                <ellipse cx="70" cy="59" rx="2.8" ry="2" fill="#5C3A21" />
                <path d="M65 63 Q70 67 75 63" fill="none" stroke="#5C3A21" strokeWidth="1.6" strokeLinecap="round" />
              </g>
            )}
          </g>
        )}

        {/* === SEMBU (FOX) === */}
        {companionId === 'sembu' && (
          <g
            className={
              !motionAllowed
                ? ''
                : mood === 'celebrate'
                  ? 'anim-hop'
                  : mood === 'break' || mood === 'waking'
                    ? 'anim-walk-steps'
                    : 'anim-breathe'
            }
          >
            {/* Fluffy Fox Tail */}
            <path
              d="M84 95 C112 94 118 68 103 60 C92 64 90 80 84 95 Z"
              fill="#C96D44"
              stroke="#5E301D"
              strokeWidth="2"
              className={motionAllowed ? 'anim-tail-sway' : ''}
            />
            <ellipse cx="105" cy="64" rx="5.5" ry="6.5" fill="#FAF2E6" />
            <ellipse cx="68" cy="85" rx="19" ry="20" fill="#C96D44" stroke="#5E301D" strokeWidth="2" />
            <ellipse cx="68" cy="88" rx="11" ry="13" fill="#FAF2E6" />
            {/* Pointed Fox Ears */}
            <path d="M46 47 L49 21 L64 36 Z" fill="#C96D44" stroke="#5E301D" strokeWidth="2" />
            <path d="M50 43 L52 28 L61 37 Z" fill="#F6DFC9" />
            <path d="M90 47 L87 21 L72 36 Z" fill="#C96D44" stroke="#5E301D" strokeWidth="2" />
            <path d="M86 43 L84 28 L75 37 Z" fill="#F6DFC9" />
            <ellipse cx="68" cy="52" rx="23" ry="18" fill="#C96D44" stroke="#5E301D" strokeWidth="2" />
            <ellipse cx="68" cy="59" rx="14" ry="10" fill="#FAF2E6" />
            {renderEyes(59, 77, 50, '#5E301D')}
            <ellipse cx="68" cy="57" rx="3" ry="2.2" fill="#5E301D" />
            <path d="M63 62 Q68 65 73 62" fill="none" stroke="#5E301D" strokeWidth="1.6" strokeLinecap="round" />
            {/* Open little study book during focus or tea mug during break */}
            {mood === 'focus' ? (
              <path d="M49 95 L68 92 L87 95 L87 107 L68 104 L49 107 Z" fill="#FAF2E6" stroke="#5E301D" strokeWidth="1.8" />
            ) : mood === 'break' || mood === 'waking' ? (
              <g>
                <rect x="38" y="88" width="13" height="14" rx="3" fill="#E8D2B5" stroke="#5E301D" strokeWidth="1.6" />
                <path d="M44 84 Q46 79 43 75" stroke="#8C6239" strokeWidth="1.6" fill="none" />
              </g>
            ) : null}
          </g>
        )}

        {/* === THEN (BEAR) === */}
        {companionId === 'then' && (
          <g
            className={
              !motionAllowed
                ? ''
                : mood === 'celebrate'
                  ? 'anim-hop'
                  : mood === 'break' || mood === 'waking'
                    ? 'anim-cat-stretch'
                    : 'anim-breathe'
            }
          >
            <ellipse cx="70" cy="84" rx="24" ry="23" fill="#A87449" stroke="#4B301B" strokeWidth="2" />
            <ellipse cx="70" cy="88" rx="14" ry="14" fill="#F3E0C6" />
            <circle cx="49" cy="34" r="8.5" fill="#A87449" stroke="#4B301B" strokeWidth="2" />
            <circle cx="49" cy="34" r="4" fill="#E8C9A4" />
            <circle cx="91" cy="34" r="8.5" fill="#A87449" stroke="#4B301B" strokeWidth="2" />
            <circle cx="91" cy="34" r="4" fill="#E8C9A4" />
            <ellipse cx="70" cy="52" rx="24" ry="20" fill="#A87449" stroke="#4B301B" strokeWidth="2" />
            <ellipse cx="70" cy="58" rx="12" ry="9" fill="#F3E0C6" />
            {renderEyes(60, 80, 49, '#4B301B')}
            <ellipse cx="70" cy="55" rx="3.4" ry="2.4" fill="#4B301B" />
            <path d="M64 60 Q70 64 76 60" fill="none" stroke="#4B301B" strokeWidth="1.6" strokeLinecap="round" />
            {/* Honey Pot held in paws */}
            <rect x="59" y="88" width="22" height="20" rx="5" fill="#F2B84B" stroke="#4B301B" strokeWidth="1.8" />
            <rect x="57" y="84" width="26" height="5" rx="2" fill="#6E4423" />
          </g>
        )}

        {/* === MALLI (BUNNY) === */}
        {companionId === 'malli' && (
          <g
            className={
              !motionAllowed
                ? ''
                : mood === 'celebrate' || mood === 'break' || mood === 'waking'
                  ? 'anim-hop'
                  : 'anim-breathe'
            }
          >
            {/* Floppy & tall ears */}
            <ellipse cx="56" cy="27" rx="7" ry="18" transform="rotate(-12 56 27)" fill="#EAE2EC" stroke="#51445D" strokeWidth="2" />
            <ellipse cx="56" cy="28" rx="3.5" ry="12" transform="rotate(-12 56 28)" fill="#D5BFE0" />
            <ellipse cx="84" cy="27" rx="7" ry="18" transform="rotate(12 84 27)" fill="#EAE2EC" stroke="#51445D" strokeWidth="2" />
            <ellipse cx="84" cy="28" rx="3.5" ry="12" transform="rotate(12 84 28)" fill="#D5BFE0" />
            <circle cx="90" cy="96" r="6" fill="#FAF6FA" stroke="#51445D" strokeWidth="1.6" />
            <ellipse cx="70" cy="86" rx="19" ry="20" fill="#EAE2EC" stroke="#51445D" strokeWidth="2" />
            <ellipse cx="70" cy="55" rx="22" ry="18" fill="#EAE2EC" stroke="#51445D" strokeWidth="2" />
            <ellipse cx="70" cy="61" rx="11" ry="8" fill="#FAF6FA" />
            {renderEyes(61, 79, 52, '#51445D')}
            <ellipse cx="70" cy="58" rx="2.6" ry="1.9" fill="#C47A92" />
            <path d="M65 62 Q70 65 75 62" fill="none" stroke="#51445D" strokeWidth="1.6" strokeLinecap="round" />
            {/* Tiny Jasmine Pot */}
            <path d="M36 93 H48 L46 105 H38 Z" fill="#C47451" stroke="#51445D" strokeWidth="1.6" />
            <circle cx="42" cy="87" r="4.5" fill="#FFFFFF" stroke="#51445D" strokeWidth="1.3" />
            <circle cx="42" cy="87" r="1.6" fill="#F0B542" />
          </g>
        )}

        {/* === BARN OWL === */}
        {companionId === 'owl' && (
          <g
            className={
              !motionAllowed
                ? ''
                : mood === 'celebrate'
                  ? 'anim-hop'
                  : 'anim-breathe'
            }
          >
            {/* Left & Right Wings (wing-flap on break/celebrate) */}
            <ellipse
              cx="45"
              cy="82"
              rx="9"
              ry="20"
              transform="rotate(12 45 82)"
              fill="#6C8265"
              stroke="#2F4232"
              strokeWidth="2"
              className={
                motionAllowed && (mood === 'break' || mood === 'waking' || mood === 'celebrate')
                  ? 'anim-wing-flap'
                  : ''
              }
            />
            <ellipse cx="95" cy="82" rx="9" ry="20" transform="rotate(-12 95 82)" fill="#6C8265" stroke="#2F4232" strokeWidth="2" />
            <ellipse cx="70" cy="80" rx="22" ry="25" fill="#879B80" stroke="#2F4232" strokeWidth="2" />
            <ellipse cx="70" cy="85" rx="14" ry="17" fill="#F4F1E4" />
            <circle cx="70" cy="48" r="22" fill="#879B80" stroke="#2F4232" strokeWidth="2" />
            <circle cx="61" cy="48" r="9.5" fill="#F4F1E4" stroke="#9B773D" strokeWidth="1.8" />
            <circle cx="79" cy="48" r="9.5" fill="#F4F1E4" stroke="#9B773D" strokeWidth="1.8" />
            <line x1="70.5" y1="48" x2="69.5" y2="48" stroke="#9B773D" strokeWidth="1.8" />
            {renderEyes(61, 79, 48, '#2F4232')}
            <path d="M67 52 L73 52 L70 58 Z" fill="#C48248" stroke="#2F4232" strokeWidth="1.2" />
          </g>
        )}

        {/* === RIVER OTTER === */}
        {companionId === 'otter' && (
          <g
            className={
              !motionAllowed
                ? ''
                : mood === 'celebrate'
                  ? 'anim-hop'
                  : mood === 'break' || mood === 'waking'
                    ? 'anim-walk-steps'
                    : 'anim-breathe'
            }
          >
            {/* Long Otter Tail */}
            <path
              d="M84 98 C108 102 115 92 106 84"
              fill="none"
              stroke="#8D6E59"
              strokeWidth="8"
              strokeLinecap="round"
              className={motionAllowed ? 'anim-tail-sway' : ''}
            />
            <ellipse cx="70" cy="84" rx="20" ry="22" fill="#8D6E59" stroke="#433126" strokeWidth="2" />
            <ellipse cx="70" cy="87" rx="12" ry="15" fill="#EFE3D5" />
            <circle cx="51" cy="36" r="6" fill="#8D6E59" stroke="#433126" strokeWidth="2" />
            <circle cx="89" cy="36" r="6" fill="#8D6E59" stroke="#433126" strokeWidth="2" />
            <ellipse cx="70" cy="51" rx="22" ry="18" fill="#8D6E59" stroke="#433126" strokeWidth="2" />
            <ellipse cx="70" cy="57" rx="12" ry="8.5" fill="#EFE3D5" />
            {renderEyes(61, 79, 48, '#433126')}
            <ellipse cx="70" cy="54" rx="3" ry="2.2" fill="#433126" />
            <path d="M65 59 Q70 62 75 59" fill="none" stroke="#433126" strokeWidth="1.6" strokeLinecap="round" />
            {/* Smooth River Pebble held safely */}
            <ellipse cx="70" cy="88" rx="8" ry="5.5" fill="#829BA0" stroke="#364D52" strokeWidth="1.6" />
          </g>
        )}
      </svg>

      {showStateChip && (
        <span className="absolute bottom-1.5 right-2 text-[10px] font-medium text-[var(--sp-ink-muted)] bg-[var(--sp-surface)]/85 px-1.5 py-0.5 rounded-md border border-[var(--sp-border)]">
          {phaseLabel}
        </span>
      )}
    </div>
  );
};
