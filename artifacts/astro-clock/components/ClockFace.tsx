import React, { useMemo } from 'react';
import { Dimensions } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect, Text as SvgText, ClipPath } from 'react-native-svg';

import { ZODIAC_SIGNS, elementColor } from '@/utils/astronomy';

// ─── Geometry constants ────────────────────────────────────────────────────────
const CX = 500, CY = 500;

// Layer 1 – fixed degree ring
const L1_OUTER = 430;
const L1_INNER = 348;
const L1_MID   = (L1_OUTER + L1_INNER) / 2; // 389

// Layer 2 – 24-hour ring
const L2_OUTER = 334;
const L2_INNER = 282;
const L2_MID   = (L2_OUTER + L2_INNER) / 2; // 308

// Layer 3 – zodiac ring
const L3_OUTER = 268;
const L3_INNER = 178;
const L3_MID   = (L3_OUTER + L3_INNER) / 2; // 223

const CENTER_R  = 32;
const HAND_LEN  = L1_OUTER;   // hands reach L1 outer
const CROSS_TIP = 392;        // phase-circle centres in L1 ring
const PHASE_R   = 24;         // radius of moon-phase circles

// ─── SVG helpers ──────────────────────────────────────────────────────────────
/** Convert (r, deg) in clockwise-from-south to SVG (x,y) */
const P = (r: number, deg: number) => {
  const a = (deg - 90) * Math.PI / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
};

/** Ring-sector arc path (clockwise from south) */
function arc(R: number, ri: number, start: number, end: number): string {
  const p1 = P(R, start), p2 = P(R, end);
  const p3 = P(ri, end),  p4 = P(ri, start);
  const span = ((end - start) % 360 + 360) % 360;
  const lg = span > 180 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${R} ${R} 0 ${lg} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${ri} ${ri} 0 ${lg} 0 ${p4.x} ${p4.y} Z`;
}

/** Tangential text group: rotate around clock center, then optionally flip */
function TangentialText({
  angleDeg, r, children, fontSize, fill, dy = 0,
}: { angleDeg: number; r: number; children: string; fontSize: number; fill: string; dy?: number }) {
  const flip = angleDeg > 90 && angleDeg < 270;
  const pos = P(r, angleDeg);
  return (
    <G>
      <G transform={`rotate(${angleDeg}, ${CX}, ${CY})`}>
        <SvgText
          x={CX} y={CY - r + dy}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          fill={fill}
          fontWeight="500"
          transform={flip ? `rotate(180, ${CX}, ${CY - r + dy})` : undefined}
        >
          {children}
        </SvgText>
      </G>
    </G>
  );
}

// ─── Layer 1: Fixed compass square + degree ring ──────────────────────────────
function Layer1Fixed() {
  const fieldColors = ['#cc3333', '#cc3333', '#cc3333', '#cc3333', '#cc3333',
                       '#cc3333', '#cc3333', '#cc3333', '#cc3333', '#cc3333',
                       '#339933', '#339933', '#339933', '#339933', '#339933',
                       '#339933', '#339933', '#339933', '#339933', '#339933',
                       '#aaaaaa', '#aaaaaa', '#aaaaaa', '#aaaaaa', '#aaaaaa',
                       '#aaaaaa', '#aaaaaa', '#aaaaaa', '#aaaaaa', '#aaaaaa'];

  const elementFields = [
    { field: 6, name: 'fire' }, { field: 12, name: 'wind' },
    { field: 18, name: 'earth' }, { field: 24, name: 'water' },
    { field: 30, name: 'eather' },
  ];

  const ticks = useMemo(() => Array.from({ length: 360 }, (_, i) => {
    const major = i % 12 === 0;
    const start = P(L1_OUTER, i);
    const end   = P(L1_OUTER - (major ? 20 : 8), i);
    return { i, start, end, major };
  }), []);

  return (
    <G>
      {/* Diamond compass square */}
      <Path
        d={`M ${CX} ${CY - 458} L ${CX + 458} ${CY} L ${CX} ${CY + 458} L ${CX - 458} ${CY} Z`}
        fill="none" stroke="#c9a227" strokeWidth={3} opacity={0.6}
      />

      {/* Compass letters */}
      <SvgText x={CX} y={CY - 462} textAnchor="middle" dominantBaseline="auto" fontSize={58} fill="#c9a227" fontWeight="700">S</SvgText>
      <SvgText x={CX} y={CY + 500} textAnchor="middle" dominantBaseline="hanging" fontSize={58} fill="#c9a227" fontWeight="700">N</SvgText>
      <SvgText x={CX - 462} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize={58} fill="#c9a227" fontWeight="700">E</SvgText>
      <SvgText x={CX + 462} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize={58} fill="#c9a227" fontWeight="700">W</SvgText>

      {/* Ring background */}
      <Path d={arc(L1_OUTER, L1_INNER, 0, 359.99)} fill="#0f1520" />

      {/* Highlighted element fields (light grey) */}
      {elementFields.map(({ field }) => (
        <Path
          key={field}
          d={arc(L1_OUTER, L1_INNER, (field - 1) * 12, field * 12)}
          fill="rgba(140,140,140,0.18)"
        />
      ))}

      {/* 30 field divider lines to center */}
      {Array.from({ length: 30 }, (_, i) => {
        const start = P(L1_OUTER, i * 12);
        return (
          <Line key={i}
            x1={start.x} y1={start.y} x2={CX} y2={CY}
            stroke="#334455" strokeWidth={0.8}
          />
        );
      })}

      {/* 360 tick marks */}
      {ticks.map(({ i, start, end, major }) => (
        <Line key={i}
          x1={start.x} y1={start.y} x2={end.x} y2={end.y}
          stroke={major ? '#8899aa' : '#3a4a5a'} strokeWidth={major ? 1.8 : 0.7}
        />
      ))}

      {/* Degree labels: 6, 18, 30 … 354 */}
      {Array.from({ length: 30 }, (_, i) => {
        const deg = i * 12 + 6;
        return (
          <TangentialText key={i} angleDeg={deg} r={L1_OUTER - 14} fontSize={15} fill="#667788">
            {String(deg)}
          </TangentialText>
        );
      })}

      {/* Element names */}
      {elementFields.map(({ field, name }) => (
        <TangentialText key={field} angleDeg={(field - 1) * 12 + 6} r={L1_MID - 4} fontSize={17} fill="#8899aa" dy={-2}>
          {name}
        </TangentialText>
      ))}

      {/* Field numbers 1–30 */}
      {Array.from({ length: 30 }, (_, i) => {
        const fieldNum = i + 1;
        const deg = i * 12 + 6;
        return (
          <TangentialText key={i} angleDeg={deg} r={L1_MID + 14} fontSize={20} fill={fieldColors[i]} dy={8}>
            {String(fieldNum)}
          </TangentialText>
        );
      })}
    </G>
  );
}

// ─── Layer 2: 24-hour ring ────────────────────────────────────────────────────
function Layer2Hours({ rotationDeg }: { rotationDeg: number }) {
  return (
    <G transform={`rotate(${rotationDeg}, ${CX}, ${CY})`}>
      {/* Ring */}
      <Path d={arc(L2_OUTER, L2_INNER, 0, 359.99)} fill="#080f1c" stroke="#2a3a52" strokeWidth={1.5} />

      {/* 24 dividers */}
      {Array.from({ length: 24 }, (_, i) => {
        // Anticlockwise: divider i at -i*(360/24) = -i*15
        const deg = ((-i * 15) % 360 + 360) % 360;
        const start = P(L2_OUTER, deg);
        return <Line key={i} x1={start.x} y1={start.y} x2={CX} y2={CY} stroke="#1e2e42" strokeWidth={0.8} />;
      })}

      {/* Hour numbers 1–24 anticlockwise */}
      {Array.from({ length: 24 }, (_, i) => {
        const hour = i + 1;
        // Hour 1 at 0° (south/disc-top), going anticlockwise
        const deg = ((-i * 15) % 360 + 360) % 360; // hour i+1 center anticlockwise
        const isOdd = hour % 2 === 1;
        const color = isOdd ? '#cc4444' : '#4488cc';
        return (
          <TangentialText key={i} angleDeg={deg} r={L2_MID} fontSize={21} fill={color}>
            {String(hour)}
          </TangentialText>
        );
      })}
    </G>
  );
}

// ─── Layer 3: Zodiac ring ─────────────────────────────────────────────────────
function Layer3Zodiac({
  rotationDeg, currentIdx, prevIdx,
}: { rotationDeg: number; currentIdx: number; prevIdx: number }) {
  return (
    <G transform={`rotate(${rotationDeg}, ${CX}, ${CY})`}>
      {/* Ring */}
      <Path d={arc(L3_OUTER, L3_INNER, 0, 359.99)} fill="#060c14" stroke="#1e2e42" strokeWidth={1.5} />

      {/* 12 sector dividers */}
      {Array.from({ length: 12 }, (_, i) => {
        // Anticlockwise sectors: divider i at -i*30°
        const deg = ((-i * 30) % 360 + 360) % 360;
        const start = P(L3_OUTER, deg);
        return <Line key={i} x1={start.x} y1={start.y} x2={CX} y2={CY} stroke="#1e2e42" strokeWidth={0.8} />;
      })}

      {/* Zodiac signs */}
      {ZODIAC_SIGNS.map((sign, i) => {
        // Anticlockwise placement: sector i center at -(i*30 + 15)°
        const deg = ((-(i * 30 + 15)) % 360 + 360) % 360;
        const color = elementColor(sign.element);
        const isCurrentSign = i === currentIdx;
        const isPrevSign = i === prevIdx;

        return (
          <G key={i}>
            {/* Sign name */}
            <TangentialText angleDeg={deg} r={L3_MID + 14} fontSize={19} fill={isCurrentSign ? '#555566' : isPrevSign ? '#cc3333' : color}>
              {sign.abbr}
            </TangentialText>
            {/* Dates */}
            <TangentialText angleDeg={deg} r={L3_MID - 10} fontSize={13} fill={isCurrentSign ? '#444455' : isPrevSign ? '#993333' : color} dy={6}>
              {sign.dates}
            </TangentialText>
            {/* Special labels */}
            {isPrevSign && (
              <TangentialText angleDeg={deg} r={L3_MID + 32} fontSize={14} fill="#cc3333">
                radiance
              </TangentialText>
            )}
            {isCurrentSign && (
              <TangentialText angleDeg={deg} r={L3_MID + 32} fontSize={14} fill="#555566">
                empty room
              </TangentialText>
            )}
          </G>
        );
      })}
    </G>
  );
}

// ─── Layer 4: Sun hand ────────────────────────────────────────────────────────
function Layer4Sun({ angleDeg }: { angleDeg: number }) {
  const tip = P(HAND_LEN, angleDeg);
  const base = P(CENTER_R + 5, angleDeg);
  return (
    <G transform={`rotate(${angleDeg}, ${CX}, ${CY})`}>
      <Line x1={CX} y1={CY} x2={CX} y2={CY - HAND_LEN} stroke="#c9a227" strokeWidth={1.8} />
      {/* Sun */}
      <Circle cx={CX} cy={CY - HAND_LEN} r={16} fill="#f5c518" opacity={0.95} />
      {/* Sun rays */}
      {Array.from({ length: 8 }, (_, i) => {
        const ra = (i * 45) * Math.PI / 180;
        return (
          <Line key={i}
            x1={CX + 19 * Math.cos(ra)} y1={CY - HAND_LEN + 19 * Math.sin(ra)}
            x2={CX + 25 * Math.cos(ra)} y2={CY - HAND_LEN + 25 * Math.sin(ra)}
            stroke="#f5c518" strokeWidth={2}
          />
        );
      })}
    </G>
  );
}

// ─── Layer 5: Moon hand ───────────────────────────────────────────────────────
function Layer5Moon({ angleDeg }: { angleDeg: number }) {
  const moonR = 16;
  return (
    <G transform={`rotate(${angleDeg}, ${CX}, ${CY})`}>
      <Line x1={CX} y1={CY} x2={CX} y2={CY - HAND_LEN} stroke="#8899aa" strokeWidth={1.5} />
      {/* Crescent: grey circle with dark circle offset to create crescent */}
      <Defs>
        <ClipPath id="crescentMask">
          <Circle cx={CX} cy={CY - HAND_LEN} r={moonR + 1} />
        </ClipPath>
      </Defs>
      <Circle cx={CX} cy={CY - HAND_LEN} r={moonR} fill="#b0b8c8" />
      <Circle cx={CX + moonR * 0.55} cy={CY - HAND_LEN} r={moonR * 0.88} fill="#060c14" clipPath="url(#crescentMask)" />
    </G>
  );
}

// ─── Layer 6: Lunar phase cross ───────────────────────────────────────────────
//
//  Arm layout (clockwise from full-moon arm at 0°):
//    0°  = full moon      (white circle)
//   90°  = last quarter   (left half bright / right half dark)
//  180°  = new moon       (black circle)
//  270°  = first quarter  (left half dark / right half bright)
//
//  The whole cross rotates so arm 0° aligns with the full-moon day-field.
//  Each 90° ≈ 7.4 days × 12°/day → the other arms land on the correct dates.

interface PhaseArm {
  arm: number;
  label: string;
  dayNum: number | null;
}

function HalfMoon({
  cx, cy, r, leftFill, rightFill,
}: { cx: number; cy: number; r: number; leftFill: string; rightFill: string }) {
  const topY = cy - r, botY = cy + r;
  const leftPath  = `M ${cx} ${topY} A ${r} ${r} 0 0 0 ${cx} ${botY} Z`;
  const rightPath = `M ${cx} ${topY} A ${r} ${r} 0 0 1 ${cx} ${botY} Z`;
  return (
    <G>
      <Path d={leftPath}  fill={leftFill} />
      <Path d={rightPath} fill={rightFill} />
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke="#7788aa" strokeWidth={1.5} />
    </G>
  );
}

function Layer6Cross({
  rotationDeg, fullMoonDay, firstQuarterDay, newMoonDay, lastQuarterDay,
}: {
  rotationDeg: number;
  fullMoonDay: number | null;
  firstQuarterDay: number | null;
  newMoonDay: number | null;
  lastQuarterDay: number | null;
}) {
  const arms: PhaseArm[] = [
    { arm: 0,   label: 'full',    dayNum: fullMoonDay    },
    { arm: 90,  label: 'last-q',  dayNum: lastQuarterDay },
    { arm: 180, label: 'new',     dayNum: newMoonDay     },
    { arm: 270, label: 'first-q', dayNum: firstQuarterDay },
  ];

  const r = PHASE_R;

  return (
    <G transform={`rotate(${rotationDeg}, ${CX}, ${CY})`}>
      {/* Cross arms */}
      {arms.map(({ arm }) => {
        const tip = P(CROSS_TIP, arm);
        return (
          <Line key={arm}
            x1={CX} y1={CY} x2={tip.x} y2={tip.y}
            stroke="#2a3d55" strokeWidth={1.5}
          />
        );
      })}

      {/* Phase circles + day labels */}
      {arms.map(({ arm, label, dayNum }) => {
        const tip = P(CROSS_TIP, arm);
        const cx = tip.x, cy = tip.y;

        let moon: React.ReactNode;
        if (label === 'full') {
          moon = <Circle cx={cx} cy={cy} r={r} fill="#e8dfc8" stroke="#aaaaaa" strokeWidth={1.5} />;
        } else if (label === 'new') {
          moon = <Circle cx={cx} cy={cy} r={r} fill="#060c14" stroke="#445566" strokeWidth={1.5} />;
        } else if (label === 'last-q') {
          // Last quarter: left half bright (waning, lit on east/left side)
          moon = <HalfMoon cx={cx} cy={cy} r={r} leftFill="#e8dfc8" rightFill="#060c14" />;
        } else {
          // First quarter: right half bright (waxing, lit on west/right side)
          moon = <HalfMoon cx={cx} cy={cy} r={r} leftFill="#060c14" rightFill="#e8dfc8" />;
        }

        // Day number label — placed between circle and ring inner edge, rotated
        // so it reads tangentially (text points toward the arm direction).
        // We counter-rotate the text by -rotationDeg via the parent G so it
        // stays legible, then rotate again by arm to position.
        const labelR = CROSS_TIP + r + 18;
        const labelPos = P(labelR, arm);

        return (
          <G key={arm}>
            {moon}
            {dayNum != null && (
              <G transform={`rotate(${arm}, ${CX}, ${CY})`}>
                <SvgText
                  x={CX} y={CY - labelR}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={20} fill="#8899bb" fontWeight="600"
                  transform={(arm > 90 && arm < 270)
                    ? `rotate(180, ${CX}, ${CY - labelR})`
                    : undefined}
                >
                  {String(dayNum)}
                </SvgText>
              </G>
            )}
          </G>
        );
      })}
    </G>
  );
}

// ─── Main clock face ──────────────────────────────────────────────────────────
interface Props {
  size: number;
  layer2RotationDeg: number;
  layer3RotationDeg: number;
  sunAngleDeg: number;
  moonHandAngleDeg: number;
  crossRotationDeg: number;
  zodiacCurrentIndex: number;
  zodiacPrevIndex: number;
  fullMoonDay: number | null;
  firstQuarterDay: number | null;
  newMoonDay: number | null;
  lastQuarterDay: number | null;
}

export default function ClockFace({
  size,
  layer2RotationDeg,
  layer3RotationDeg,
  sunAngleDeg,
  moonHandAngleDeg,
  crossRotationDeg,
  zodiacCurrentIndex,
  zodiacPrevIndex,
  fullMoonDay,
  firstQuarterDay,
  newMoonDay,
  lastQuarterDay,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1000 1000">
      {/* Background */}
      <Circle cx={CX} cy={CY} r={460} fill="#06080f" />

      {/* Layer 1 – fixed ring */}
      <Layer1Fixed />

      {/* Inner disc background */}
      <Circle cx={CX} cy={CY} r={L1_INNER - 1} fill="#06080f" />

      {/* Layer 2 – 24h rotating */}
      <Layer2Hours rotationDeg={layer2RotationDeg} />

      {/* Inner disc */}
      <Circle cx={CX} cy={CY} r={L2_INNER - 1} fill="#06080f" />

      {/* Layer 3 – zodiac rotating */}
      <Layer3Zodiac
        rotationDeg={layer3RotationDeg}
        currentIdx={zodiacCurrentIndex}
        prevIdx={zodiacPrevIndex}
      />

      {/* Inner disc */}
      <Circle cx={CX} cy={CY} r={L3_INNER - 1} fill="#06080f" />

      {/* Layer 6 – cross (under hands) */}
      <Layer6Cross
        rotationDeg={crossRotationDeg}
        fullMoonDay={fullMoonDay}
        firstQuarterDay={firstQuarterDay}
        newMoonDay={newMoonDay}
        lastQuarterDay={lastQuarterDay}
      />

      {/* Layer 4 – sun hand */}
      <Layer4Sun angleDeg={sunAngleDeg} />

      {/* Layer 5 – moon hand */}
      <Layer5Moon angleDeg={moonHandAngleDeg} />

      {/* Center jewel */}
      <Circle cx={CX} cy={CY} r={CENTER_R} fill="#0f1a28" stroke="#c9a227" strokeWidth={2} />
      <Circle cx={CX} cy={CY} r={CENTER_R * 0.5} fill="#c9a227" opacity={0.7} />
    </Svg>
  );
}
