import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { CompanionId, CompanionMood, ThemePresetId } from '../types';
import { AnimatedCompanion } from './AnimatedCompanion';

interface MiniatureCompanionRoomProps {
  companionId: CompanionId;
  mood: CompanionMood;
  themeOverride?: ThemePresetId;
  size?: 'dock' | 'preview';
  onPat?: () => void;
}

/**
 * Handcrafted theme-responsive miniature habitat room where the companion
 * lives naturally on the floor/rug/sand rather than inside a plain box.
 * Responsive sizing ensures a large, cozy room on desktop, balanced proportions on laptop,
 * and a clear, recognizable companion-to-room ratio on mobile.
 */
export const MiniatureCompanionRoom: React.FC<MiniatureCompanionRoomProps> = ({
  companionId,
  mood,
  themeOverride,
  size = 'dock',
  onPat,
}) => {
  const { themeSettings, profile, resolvedColorMode } = useAppState();
  const activeTheme = themeOverride ?? themeSettings.preset;
  const isDark = resolvedColorMode === 'dark';

  const motionAllowed =
    !profile.lowStimulationMode &&
    !profile.reducedMotion &&
    themeSettings.animationIntensity !== 'off';

  const petSizeClass =
    size === 'dock'
      ? 'w-[90px] h-[82px] lg:w-[104px] lg:h-[96px] xl:w-[118px] xl:h-[108px]'
      : 'w-[84px] h-[78px]';

  const roomAspectClass = 'aspect-[4/3]';

  return (
    <div
      onClick={onPat}
      role={onPat ? 'button' : undefined}
      tabIndex={onPat ? 0 : undefined}
      onKeyDown={
        onPat
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPat();
              }
            }
          : undefined
      }
      title={onPat ? 'Click to gently pat your companion' : undefined}
      className={`relative w-full ${roomAspectClass} overflow-hidden select-none ${
        onPat ? 'cursor-pointer group' : ''
      }`}
    >
      {/* Back Diorama Scene SVG */}
      <svg
        viewBox="0 0 240 180"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        {/* ================= 1. COZY CAFÉ ================= */}
        {activeTheme === 'cafe' && (
          <g>
            {/* Warm plaster wall + ceiling beam + timber wainscoting */}
            <rect width="240" height="132" fill={isDark ? '#2B1F18' : '#FBF3E6'} />
            <rect width="240" height="11" fill={isDark ? '#3E2B1F' : '#8C5935'} />
            <rect y="94" width="240" height="38" fill={isDark ? '#3B2A1F' : '#E7D1B7'} />
            <line x1="0" y1="94" x2="240" y2="94" stroke={isDark ? '#583F2D' : '#C59E75'} strokeWidth="2.2" />

            {/* Cozy arched café window (warm amber sun or starry dusk) */}
            <path
              d="M18 86 V42 C18 20 66 20 66 42 V86 Z"
              fill={isDark ? '#1D2936' : '#FBE2B4'}
              stroke={isDark ? '#6D4B33' : '#8A5A36'}
              strokeWidth="3"
            />
            <line x1="42" y1="24" x2="42" y2="86" stroke={isDark ? '#6D4B33' : '#8A5A36'} strokeWidth="2" />
            <line x1="18" y1="58" x2="66" y2="58" stroke={isDark ? '#6D4B33' : '#8A5A36'} strokeWidth="2" />
            {motionAllowed && (
              <>
                <line x1="30" y1="36" x2="28" y2="44" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.55" className="anim-float-slow" />
                <line x1="54" y1="42" x2="52" y2="50" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.45" className="anim-float-slow" />
              </>
            )}

            {/* Hanging warm pendant lamp */}
            <line x1="154" y1="11" x2="154" y2="27" stroke={isDark ? '#B98D5A' : '#5E3A22'} strokeWidth="2" />
            <ellipse
              cx="154"
              cy="52"
              rx="36"
              ry="28"
              fill={isDark ? '#F5B962' : '#FFE09E'}
              opacity={isDark ? 0.17 : 0.3}
              className={motionAllowed ? 'anim-lamp-glow' : ''}
            />
            <path d="M139 34 L169 34 L162 23 L146 23 Z" fill="#A65E32" stroke="#4D2A15" strokeWidth="1.5" />
            <circle cx="154" cy="36" r="4" fill="#FFF2BA" />

            {/* Wall menu board & ceramic mug shelf */}
            <rect x="186" y="28" width="42" height="34" rx="3" fill="#2F3D34" stroke="#8C5935" strokeWidth="2.5" />
            <line x1="193" y1="38" x2="220" y2="38" stroke="#E9DFCE" strokeWidth="1.6" opacity="0.8" />
            <line x1="193" y1="45" x2="216" y2="45" stroke="#E9DFCE" strokeWidth="1.6" opacity="0.65" />
            <line x1="193" y1="52" x2="210" y2="52" stroke="#F0C78A" strokeWidth="1.6" opacity="0.7" />

            <rect x="80" y="42" width="52" height="5" rx="2" fill="#8C5935" />
            <rect x="85" y="29" width="7" height="13" rx="1" fill="#3E5E4B" />
            <rect x="94" y="27" width="8" height="15" rx="1" fill="#B56C32" />
            <circle cx="114" cy="34" r="5.5" fill="#7D9F86" />
            <rect x="122" y="33" width="6" height="9" rx="1.5" fill="#FAF2E5" />

            {/* Left corner pastry counter ledge & glass dome */}
            <rect x="8" y="102" width="48" height="28" rx="3" fill={isDark ? '#583A26' : '#A97349'} stroke="#4D2E18" strokeWidth="1.5" />
            <path d="M16 102 C16 86 42 86 42 102 Z" fill="#FFF8EE" opacity="0.55" stroke="#8A5A36" strokeWidth="1.2" />
            <ellipse cx="29" cy="100" rx="8" ry="3.5" fill="#D49256" />

            {/* Warm wooden oak floorboards */}
            <rect y="128" width="240" height="52" fill={isDark ? '#4E3524' : '#C99B6B'} />
            <line x1="0" y1="142" x2="240" y2="142" stroke={isDark ? '#382518' : '#A97B4C'} strokeWidth="1.2" />
            <line x1="0" y1="158" x2="240" y2="158" stroke={isDark ? '#382518' : '#A97B4C'} strokeWidth="1.2" />

            {/* Braided café floor mat where companion lives */}
            <ellipse cx="120" cy="155" rx="74" ry="15" fill={isDark ? '#6D4329' : '#DFC3A0'} stroke="#7A4828" strokeWidth="1.8" />
            <ellipse cx="120" cy="155" rx="60" ry="10.5" fill="none" stroke={isDark ? '#9B6B46' : '#C49A6C'} strokeWidth="1.2" strokeDasharray="4 3" />

            {/* Small wooden bistro side table + steaming mug */}
            <rect x="195" y="106" width="6" height="30" fill="#6E4325" />
            <ellipse cx="198" cy="105" rx="22" ry="6" fill="#8D5834" stroke="#4D2E18" strokeWidth="1.5" />
            <rect x="191" y="93" width="11" height="10" rx="2" fill="#FFFDF8" stroke="#6E4325" strokeWidth="1.4" />
            {motionAllowed && (
              <path
                d="M196 90 Q199 84 195 79"
                fill="none"
                stroke="#F5D9B5"
                strokeWidth="1.6"
                strokeLinecap="round"
                className="anim-steam"
              />
            )}
          </g>
        )}

        {/* ================= 2. RAINFOREST ================= */}
        {activeTheme === 'rainforest' && (
          <g>
            {/* Misty canopy sky & warm dappled sunshaft */}
            <rect width="240" height="180" fill={isDark ? '#122219' : '#D9EAD8'} />
            <polygon
              points="36,0 112,0 152,146 8,146"
              fill={isDark ? '#6EB083' : '#FFF9D6'}
              opacity={isDark ? 0.08 : 0.42}
            />
            {/* Distant layered misty hills */}
            <path d="M0 114 Q48 76 102 104 T198 94 T240 108 L240 140 L0 140 Z" fill={isDark ? '#1B3325' : '#B5D3B3'} />
            <path d="M0 122 Q54 92 114 114 T210 106 T240 120 L240 142 L0 142 Z" fill={isDark ? '#213D2C' : '#96BF97'} />

            {/* Natural tree trunk & overhead vine branch */}
            <path d="M0 0 H30 C26 60 33 105 40 146 H0 Z" fill={isDark ? '#3D2E22' : '#7C5A3E'} />
            <path d="M214 0 H240 V142 H222 C226 98 220 52 214 0 Z" fill={isDark ? '#35281D' : '#6F5036'} opacity="0.88" />
            <path d="M22 22 Q118 42 220 18" fill="none" stroke={isDark ? '#3D2E22' : '#7C5A3E'} strokeWidth="8" strokeLinecap="round" />

            {/* Hanging canopy leaves & moss tendrils */}
            <path d="M84 31 Q82 48 86 58" fill="none" stroke="#4D8A5E" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M168 27 Q172 44 167 54" fill="none" stroke="#3B734B" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="62" cy="30" rx="13" ry="6.5" transform="rotate(24 62 30)" fill="#4D8A5E" />
            <ellipse cx="104" cy="37" rx="14" ry="6.5" transform="rotate(-15 104 37)" fill="#3B734B" />
            <ellipse cx="148" cy="32" rx="13" ry="6.5" transform="rotate(18 148 32)" fill="#589869" />
            <ellipse cx="196" cy="24" rx="15" ry="7" transform="rotate(-20 196 24)" fill="#4D8A5E" />

            {/* Mossy forest floor */}
            <path d="M0 128 Q120 116 240 128 L240 180 L0 180 Z" fill={isDark ? '#24422E' : '#6A9C6F'} />
            <ellipse cx="120" cy="155" rx="74" ry="15" fill={isDark ? '#2F553C' : '#85B682'} />

            {/* Smooth river stones & woodland ferns */}
            <ellipse cx="182" cy="152" rx="11" ry="6" fill={isDark ? '#54665E' : '#8E9C94'} />
            <ellipse cx="195" cy="154" rx="7" ry="4" fill={isDark ? '#43534C' : '#A6B2AB'} />
            <path d="M22 142 C10 120 18 104 34 102 C29 118 29 130 24 142 Z" fill="#2E6442" />
            <path d="M204 140 C214 114 230 108 236 118 C222 128 214 136 204 140 Z" fill="#3B7850" />
            <rect x="44" y="136" width="5" height="10" rx="2" fill="#F4EBD9" />
            <path d="M36 138 C36 125 57 125 57 138 Z" fill="#C95E45" />
            <circle cx="43" cy="133" r="1.5" fill="#FFF7EB" />
            <circle cx="50" cy="134" r="1.3" fill="#FFF7EB" />

            {/* Forest blossom */}
            <circle cx="192" cy="141" r="4.5" fill="#F9E0E7" />
            <circle cx="192" cy="141" r="1.7" fill="#F0B542" />

            {/* Subtle drifting fireflies */}
            {motionAllowed && (
              <>
                <circle cx="72" cy="72" r="2.4" fill="#F7DC79" className="anim-float-slow" />
                <circle cx="178" cy="60" r="2.1" fill="#F7DC79" className="anim-float-slow" />
                <circle cx="144" cy="84" r="1.9" fill="#C9F49B" className="anim-float-slow" />
              </>
            )}
          </g>
        )}

        {/* ================= 3. BEACH ================= */}
        {activeTheme === 'beach' && (
          <g>
            {/* Sky & soft sun / moon + fluffy clouds */}
            <rect width="240" height="105" fill={isDark ? '#11252C' : '#CBEAF0'} />
            <ellipse cx="64" cy="30" rx="20" ry="8" fill={isDark ? '#203E47' : '#FFFFFF'} opacity="0.72" />
            <ellipse cx="78" cy="28" rx="14" ry="6" fill={isDark ? '#203E47' : '#FFFFFF'} opacity="0.72" />
            <circle
              cx="192"
              cy="32"
              r="14"
              fill={isDark ? '#F0E9C9' : '#FFE394'}
              className={motionAllowed ? 'anim-lamp-glow' : ''}
            />

            {/* Calm sea & gentle wave horizon */}
            <rect y="78" width="240" height="54" fill={isDark ? '#1A4552' : '#4E9FB0'} />
            {/* Tiny horizon sailboat */}
            <path d="M44 76 L64 76 L60 82 L48 82 Z" fill="#6F4C33" />
            <path d="M54 58 L54 75 L64 75 Z" fill="#FFFDF8" />
            <path d="M52 62 L52 75 L44 75 Z" fill="#F6D198" />

            {/* Wave foam */}
            <path
              d="M0 118 Q60 110 120 118 T240 116 L240 132 L0 132 Z"
              fill={isDark ? '#70BAC5' : '#E7F8FA'}
              opacity="0.72"
              className={motionAllowed ? 'anim-float-slow' : ''}
            />

            {/* Warm sandy floor & woven beach mat */}
            <path d="M0 124 Q120 114 240 126 L240 180 L0 180 Z" fill={isDark ? '#756249' : '#F2DCB7'} />
            <ellipse cx="120" cy="155" rx="74" ry="14" fill={isDark ? '#8B7456' : '#E5C697'} />
            <ellipse cx="120" cy="155" rx="62" ry="10" fill={isDark ? '#3B6A75' : '#7BC0C9'} opacity="0.65" />

            {/* Driftwood post & striped beach umbrella */}
            <path d="M18 140 L34 110" stroke="#8C6747" strokeWidth="5" strokeLinecap="round" />
            <path d="M4 114 Q32 90 62 114 Z" fill="#D9735B" stroke="#7D3B2B" strokeWidth="1.4" />
            <path d="M21 112 Q32 95 45 112 Z" fill="#FFF8EE" />

            {/* Palm fronds framing right corner + seashells & starfish */}
            <path d="M236 144 C228 96 226 60 238 22" fill="none" stroke="#7D5C3E" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M234 26 Q210 20 198 36 Q216 34 234 26 Z" fill="#4C865E" />
            <path d="M235 28 Q214 40 204 54 Q220 44 235 28 Z" fill="#3B6E4B" />
            <path d="M184 148 C184 138 200 138 200 148 Z" fill="#F8E8DA" stroke="#A67C5E" strokeWidth="1.3" />
            <circle cx="52" cy="152" r="4.5" fill="#E39072" stroke="#8C4B36" strokeWidth="1.2" />
            <path d="M212 146 Q216 126 224 118 M216 146 Q224 130 232 124" fill="none" stroke="#5E8F6E" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* ================= 4. LIBRARY ================= */}
        {activeTheme === 'library' && (
          <g>
            {/* Warm study wall + upper timber cornice */}
            <rect width="240" height="132" fill={isDark ? '#1F1813' : '#F4EBDC'} />
            <rect width="240" height="10" fill={isDark ? '#3A281D' : '#6A442C'} />

            {/* Miniature mahogany bookshelf */}
            <rect x="14" y="18" width="98" height="108" rx="3" fill={isDark ? '#3A281D' : '#6A442C'} stroke="#3E2516" strokeWidth="2" />
            <rect x="20" y="25" width="86" height="28" fill={isDark ? '#241912' : '#4B301E'} />
            <rect x="20" y="59" width="86" height="28" fill={isDark ? '#241912' : '#4B301E'} />
            <rect x="20" y="93" width="86" height="26" fill={isDark ? '#241912' : '#4B301E'} />
            {/* Tiny colourful book spines + globe */}
            <rect x="24" y="31" width="8" height="22" rx="1" fill="#8C4838" />
            <rect x="33" y="33" width="7" height="20" rx="1" fill="#466D55" />
            <rect x="41" y="29" width="9" height="24" rx="1" fill="#C4924E" />
            <rect x="51" y="32" width="7" height="21" rx="1" fill="#4F6682" />
            <rect x="59" y="30" width="8" height="23" rx="1" fill="#9E6240" />
            <circle cx="88" cy="40" r="8" fill="#5D8490" stroke="#C4924E" strokeWidth="1.4" />

            <rect x="24" y="65" width="9" height="22" rx="1" fill="#4F6682" />
            <rect x="34" y="67" width="7" height="20" rx="1" fill="#B57B48" />
            <rect x="42" y="63" width="8" height="24" rx="1" fill="#6D4B5E" />
            <rect x="74" y="66" width="26" height="20" rx="2" fill="#D8C8B0" opacity="0.25" />
            <rect x="25" y="100" width="24" height="6" rx="1" fill="#8C4838" />
            <rect x="27" y="94" width="20" height="6" rx="1" fill="#466D55" />
            <rect x="64" y="96" width="8" height="22" rx="1" fill="#9E6240" />
            <rect x="73" y="98" width="7" height="20" rx="1" fill="#466D55" />

            {/* Arched study window */}
            <path
              d="M134 84 V42 C134 25 170 25 170 42 V84 Z"
              fill={isDark ? '#1A2430' : '#DCE9EE'}
              stroke="#6A442C"
              strokeWidth="2.5"
            />
            <line x1="152" y1="28" x2="152" y2="84" stroke="#6A442C" strokeWidth="1.6" />
            <line x1="134" y1="58" x2="170" y2="58" stroke="#6A442C" strokeWidth="1.6" />

            {/* Framed botanical study print */}
            <rect x="184" y="24" width="38" height="30" rx="2" fill={isDark ? '#2B221A' : '#FFFDF8'} stroke="#8C5B38" strokeWidth="2" />
            <path d="M203 48 Q203 34 210 30 Q201 32 203 48 Z" fill="#466D55" />

            {/* Warm brass desk lamp casting golden glow */}
            <ellipse
              cx="206"
              cy="98"
              rx="36"
              ry="30"
              fill="#FAD27B"
              opacity={isDark ? 0.18 : 0.32}
              className={motionAllowed ? 'anim-lamp-glow' : ''}
            />
            <rect x="190" y="108" width="36" height="24" rx="2" fill="#7D5234" />
            <path d="M208 108 V86 Q208 78 198 78" fill="none" stroke="#B68B46" strokeWidth="2.5" />
            <path d="M188 83 L206 83 L201 73 L193 73 Z" fill="#3B694E" stroke="#B68B46" strokeWidth="1.4" />

            {/* Polished library floorboards & woven reading rug */}
            <rect y="128" width="240" height="52" fill={isDark ? '#38271B' : '#B4885F'} />
            <ellipse cx="120" cy="155" rx="74" ry="15" fill={isDark ? '#66342C' : '#964C3F'} stroke="#D7B47E" strokeWidth="2" />
            <ellipse cx="120" cy="155" rx="58" ry="10.5" fill="none" stroke="#E8CCA0" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
          </g>
        )}

        {/* ================= 5. COZY CABIN ================= */}
        {activeTheme === 'cabin' && (
          <g>
            {/* Cedar log cabin wall + warm timber ceiling rafters */}
            <rect width="240" height="132" fill={isDark ? '#2B1D17' : '#EFE0CE'} />
            <rect width="240" height="12" fill={isDark ? '#422B20' : '#7E4E31'} />
            <line x1="0" y1="30" x2="240" y2="30" stroke={isDark ? '#3F2B21' : '#D8C0A6'} strokeWidth="1.5" />
            <line x1="0" y1="56" x2="240" y2="56" stroke={isDark ? '#3F2B21' : '#D8C0A6'} strokeWidth="1.5" />
            <line x1="0" y1="84" x2="240" y2="84" stroke={isDark ? '#3F2B21' : '#D8C0A6'} strokeWidth="1.5" />

            {/* Cabin window with pine forest silhouette */}
            <rect x="20" y="30" width="56" height="48" rx="3" fill={isDark ? '#18242D' : '#D5E7EA'} stroke="#6C3E24" strokeWidth="3.2" />
            <path d="M33 76 L41 50 L49 76 Z" fill="#2F5943" />
            <path d="M49 76 L59 44 L69 76 Z" fill="#264937" />
            <line x1="48" y1="30" x2="48" y2="78" stroke="#6C3E24" strokeWidth="2" />
            <line x1="20" y1="54" x2="76" y2="54" stroke="#6C3E24" strokeWidth="2" />

            {/* Hanging pine garland & cabin lantern */}
            <path d="M84 14 Q118 28 154 14" fill="none" stroke="#345E45" strokeWidth="4" strokeLinecap="round" />
            <rect x="111" y="26" width="14" height="18" rx="3" fill="#FCE29C" stroke="#5A3A24" strokeWidth="1.6" />
            <line x1="118" y1="12" x2="118" y2="26" stroke="#5A3A24" strokeWidth="1.6" />
            <circle cx="118" cy="35" r="3.5" fill="#F5A623" />

            {/* Stone hearth & mantel */}
            <ellipse
              cx="194"
              cy="94"
              rx="40"
              ry="34"
              fill="#F7A94B"
              opacity={isDark ? 0.22 : 0.28}
              className={motionAllowed ? 'anim-lamp-glow' : ''}
            />
            <rect x="158" y="64" width="68" height="7" rx="2" fill="#6C3E24" />
            <rect x="174" y="54" width="10" height="10" rx="2" fill="#E39D63" />
            <circle cx="204" cy="57" r="6" fill="#345E45" />
            <path d="M164 130 V71 H220 V130 Z" fill="#785B4C" stroke="#4D372D" strokeWidth="2" />
            <path d="M174 130 V94 C174 79 210 79 210 94 V130 Z" fill="#2A1D18" />
            <path
              d="M184 130 C184 106 202 106 202 130 Z"
              fill="#F39A38"
              className={motionAllowed ? 'anim-breathe' : ''}
            />
            <path d="M189 130 C189 116 198 116 198 130 Z" fill="#FFE08C" />

            {/* Pine floorboards & cozy braided rug */}
            <rect y="128" width="240" height="52" fill={isDark ? '#432D20' : '#C7966B'} />
            <ellipse cx="120" cy="155" rx="74" ry="15" fill={isDark ? '#6F3B2A' : '#B86446'} stroke="#F1D5B5" strokeWidth="2" />
            <ellipse cx="120" cy="155" rx="58" ry="10" fill="none" stroke="#F8E2C6" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.7" />
            {/* Folded wool blanket corner */}
            <rect x="18" y="138" width="26" height="11" rx="3" fill="#3B624E" stroke="#223B2E" strokeWidth="1.2" />
          </g>
        )}
      </svg>

      {/* Living Animated Companion positioned organically on the room floor/rug */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-[3%] z-10 pointer-events-none transition-transform duration-300 group-hover:scale-[1.03]"
        aria-hidden="true"
      >
        <AnimatedCompanion
          companionId={companionId}
          mood={mood}
          sizeClassName={petSizeClass}
          frameless
        />
      </div>

      {/* Subtle foreground depth vignette (soft corner props/edges so pet sits inside the room) */}
      <div
        className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-black/15 to-transparent pointer-events-none z-20"
        aria-hidden="true"
      />
    </div>
  );
};
