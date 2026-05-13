// All angles in "clockwise from south" convention (0°=south/top, clockwise positive)

export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

/** Solar noon in local time for given lat/lng */
export function calculateSolarNoon(date: Date, latitude: number, longitude: number): Date {
  const dayOfYear = getDayOfYear(date);
  const B = ((dayOfYear - 81) * 360 / 365) * Math.PI / 180;
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const solarNoonUTC = 12 - (eot + 4 * longitude) / 60;
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  d.setTime(d.getTime() + solarNoonUTC * 3600000);
  return d;
}

/** Days since March 21 of current or previous year */
export function getDaysSinceMar21(date: Date): number {
  const year = date.getFullYear();
  let mar21 = new Date(year, 2, 21);
  let days = Math.floor((date.getTime() - mar21.getTime()) / 86400000);
  if (days < 0) {
    mar21 = new Date(year - 1, 2, 21);
    days = Math.floor((date.getTime() - mar21.getTime()) / 86400000);
  }
  return days;
}

/** Sun hand angle — March 21 = day 1 = 1°, +1°/day clockwise */
export function getSunAngle(date: Date): number {
  return (getDaysSinceMar21(date) + 1) % 360;
}

// ─── Lunar core ───────────────────────────────────────────────────────────────

const SYNODIC_MONTH = 29.53058867; // days
const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z');

/** Lunar phase 0–1  (0=new moon, 0.5=full moon) */
export function getLunarPhase(date: Date): number {
  const daysSince = (date.getTime() - KNOWN_NEW_MOON.getTime()) / 86400000;
  return ((daysSince % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH / SYNODIC_MONTH;
}

/**
 * Moon hand — snaps to one of five discrete field-centres every day.
 * The cycle restarts every 5 days from March 21 (day 1).
 *
 * Day 1 (Mar 21) → field  6 →  66°
 * Day 2          → field 18 → 210°
 * Day 3          → field 30 → 354°
 * Day 4          → field 12 → 138°
 * Day 5          → field 24 → 282°
 * Day 6          → field  6 →  66°  (repeats)
 */
export function getMoonHandAngle(date: Date): number {
  const POSITIONS = [66, 210, 354, 138, 282]; // field-centre degrees (clockwise from south)
  const dayCount  = getDaysSinceMar21(date) + 1; // March 21 = day 1
  const idx       = (dayCount - 1) % 5;
  return POSITIONS[idx];
}

/**
 * Find the actual calendar dates of all four lunar phases for a given month.
 *
 * Strategy: iterate nearby lunations and find the new moon whose full moon
 * (new + 14.77 days) lands inside [year, month].  Then derive FQ, LQ, and
 * whether the new moon itself is in this month.
 *
 * Returns null for a phase date that falls outside the target month.
 */
export function getMoonPhaseDays(year: number, month: number): {
  newMoon: number | null;
  firstQuarter: number | null;
  fullMoon: number | null;
  lastQuarter: number | null;
} {
  const monthStart = new Date(Date.UTC(year, month, 1));
  const daysSinceRef = (monthStart.getTime() - KNOWN_NEW_MOON.getTime()) / 86400000;
  const approxLunation = daysSinceRef / SYNODIC_MONTH;

  /** Date from a decimal day-offset from KNOWN_NEW_MOON */
  const nmAt = (lunationIndex: number): Date =>
    new Date(KNOWN_NEW_MOON.getTime() + lunationIndex * SYNODIC_MONTH * 86400000);

  /** Is a UTC date in [year, month]? */
  const inMonth = (d: Date) =>
    d.getUTCFullYear() === year && d.getUTCMonth() === month;

  const utcDay = (d: Date): number | null =>
    inMonth(d) ? Math.max(1, Math.min(31, d.getUTCDate())) : null;

  // Search for the lunation whose FULL moon (new + 14.77 d) is in this month
  let baseNewMoon: Date | null = null;
  for (let offset = -2; offset <= 3; offset++) {
    const lunation = Math.floor(approxLunation) + offset;
    const nm = nmAt(lunation);
    const fm = new Date(nm.getTime() + 14.77 * 86400000);
    if (inMonth(fm)) {
      baseNewMoon = nm;
      break;
    }
  }

  // Fallback — no full moon in this month (very rare, e.g. short February)
  if (!baseNewMoon) {
    baseNewMoon = nmAt(Math.round(approxLunation));
  }

  const fmDate = new Date(baseNewMoon.getTime() + 14.77 * 86400000);
  const fqDate = new Date(baseNewMoon.getTime() +  7.38 * 86400000);
  const lqDate = new Date(fmDate.getTime()      +  7.38 * 86400000);

  // Independently find a new moon that itself falls within this month
  let newMoonInMonth: Date | null = null;
  for (let offset = -2; offset <= 3; offset++) {
    const lunation = Math.floor(approxLunation) + offset;
    const nm = nmAt(lunation);
    if (inMonth(nm)) {
      newMoonInMonth = nm;
      break;
    }
  }

  return {
    newMoon:      utcDay(newMoonInMonth),
    firstQuarter: utcDay(fqDate),
    fullMoon:     utcDay(fmDate),
    lastQuarter:  utcDay(lqDate),
  };
}

/**
 * Cross rotation so the full-moon arm (arm 0°) points to the full-moon
 * day-field.  Arm layout clockwise: full(0°) → lastQ(90°) → new(180°) → firstQ(270°).
 * Each 90° ≈ 7.5 fields × 12°/field, matching the ~7.4-day quarter spacing.
 */
export function getCrossRotation(year: number, month: number): number {
  const { fullMoon } = getMoonPhaseDays(year, month);
  const day = fullMoon ?? 15; // sensible fallback: mid-month
  return (day - 1) * 12 + 6; // centre of that day's field
}

/** Zodiac sign index 0=Aries … 11=Pisces */
export function getZodiacIndex(date: Date): number {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if ((m === 3 && d >= 21) || (m === 4 && d <= 20)) return 0;
  if ((m === 4 && d >= 21) || (m === 5 && d <= 21)) return 1;
  if ((m === 5 && d >= 22) || (m === 6 && d <= 21)) return 2;
  if ((m === 6 && d >= 22) || (m === 7 && d <= 22)) return 3;
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 4;
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 5;
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 6;
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 7;
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 8;
  if ((m === 12 && d >= 22) || (m === 1 && d <= 20)) return 9;
  if ((m === 1 && d >= 21) || (m === 2 && d <= 18)) return 10;
  return 11;
}

/** Clockwise rotation to bring the previous zodiac sign to south */
export function getZodiacRotation(date: Date): number {
  const currentIdx = getZodiacIndex(date);
  const prevIdx = (currentIdx - 1 + 12) % 12;
  return (15 + prevIdx * 30) % 360;
}

export const ZODIAC_SIGNS = [
  { name: 'Aries',       abbr: 'Ari', dates: '21.03-20.04', element: 'fire'  },
  { name: 'Taurus',      abbr: 'Tau', dates: '21.04-21.05', element: 'earth' },
  { name: 'Gemini',      abbr: 'Gem', dates: '22.05-21.06', element: 'air'   },
  { name: 'Cancer',      abbr: 'Cnc', dates: '22.06-22.07', element: 'water' },
  { name: 'Leo',         abbr: 'Leo', dates: '23.07-22.08', element: 'fire'  },
  { name: 'Virgo',       abbr: 'Vir', dates: '23.08-22.09', element: 'earth' },
  { name: 'Libra',       abbr: 'Lib', dates: '23.09-22.10', element: 'air'   },
  { name: 'Scorpio',     abbr: 'Sco', dates: '23.10-21.11', element: 'water' },
  { name: 'Sagittarius', abbr: 'Sgr', dates: '22.11-21.12', element: 'fire'  },
  { name: 'Capricorn',   abbr: 'Cap', dates: '22.12-20.01', element: 'earth' },
  { name: 'Aquarius',    abbr: 'Aqr', dates: '21.01-18.02', element: 'air'   },
  { name: 'Pisces',      abbr: 'Psc', dates: '19.02-20.03', element: 'water' },
];

export function elementColor(element: string): string {
  switch (element) {
    case 'fire':  return '#e07040';
    case 'earth': return '#c8a030';
    case 'air':   return '#cc3333';
    case 'water': return '#8899aa';
    default:      return '#aaaaaa';
  }
}
