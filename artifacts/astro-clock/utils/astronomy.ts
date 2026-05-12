// All angles in "clockwise from south" convention (0=south/top)

export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

/** Solar noon in LOCAL time (Date object) for given lat/lng */
export function calculateSolarNoon(date: Date, latitude: number, longitude: number): Date {
  const dayOfYear = getDayOfYear(date);
  const B = ((dayOfYear - 81) * 360 / 365) * Math.PI / 180;
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); // minutes
  const timeCorrection = eot + 4 * longitude; // minutes
  const solarNoonUTC = 12 - timeCorrection / 60; // hours UTC

  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  d.setTime(d.getTime() + solarNoonUTC * 3600000);
  return d;
}

/** Days since March 21 of the current or previous year */
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

/** Sun hand angle (clockwise from south, 0° on March 21, +1°/day) */
export function getSunAngle(date: Date): number {
  const days = getDaysSinceMar21(date);
  return days % 360;
}

/** Moon hand angle — cycles through waypoints 66→210→354→138→282→66 (≈1 synodic month) */
export function getMoonHandAngle(date: Date): number {
  const synodicMonth = 29.53058867;
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const daysSince = (date.getTime() - knownNewMoon.getTime()) / 86400000;
  const cyclePos = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth / synodicMonth;
  return (66 + cyclePos * 720) % 360;
}

/** Current lunar phase 0–1 (0=new, 0.25=first quarter, 0.5=full, 0.75=last quarter) */
export function getLunarPhase(date: Date): number {
  const synodicMonth = 29.53058867;
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const daysSince = (date.getTime() - knownNewMoon.getTime()) / 86400000;
  return ((daysSince % synodicMonth) + synodicMonth) % synodicMonth / synodicMonth;
}

/** Moon phase day-of-month for a given year/month
 *  Searches for full moon day within the month; falls back to estimation. */
export function getMoonPhaseDays(year: number, month: number): {
  newMoon: number; firstQuarter: number; fullMoon: number; lastQuarter: number;
} {
  const synodicMonth = 29.53058867;
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const monthStart = new Date(year, month, 1);
  const daysSince = (monthStart.getTime() - knownNewMoon.getTime()) / 86400000;
  const baseLunation = Math.floor(daysSince / synodicMonth);

  let bestNewMoon: Date | null = null;
  for (let offset = -1; offset <= 2; offset++) {
    const candidate = new Date(knownNewMoon.getTime() + (baseLunation + offset) * synodicMonth * 86400000);
    if (candidate.getFullYear() === year && candidate.getMonth() === month) {
      bestNewMoon = candidate;
      break;
    }
  }

  if (!bestNewMoon) {
    // Fallback: estimate based on base lunation
    bestNewMoon = new Date(knownNewMoon.getTime() + baseLunation * synodicMonth * 86400000);
  }

  const newMoonDay = Math.max(1, Math.min(30, bestNewMoon.getDate()));
  const fqDay = Math.max(1, Math.min(30, new Date(bestNewMoon.getTime() + 7.38 * 86400000).getDate()));
  const fullDay = Math.max(1, Math.min(30, new Date(bestNewMoon.getTime() + 14.77 * 86400000).getDate()));
  const lqDay = Math.max(1, Math.min(30, new Date(bestNewMoon.getTime() + 22.15 * 86400000).getDate()));

  return { newMoon: newMoonDay, firstQuarter: fqDay, fullMoon: fullDay, lastQuarter: lqDay };
}

/** Zodiac sign index for a date (0=Aries … 11=Pisces) */
export function getZodiacIndex(date: Date): number {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if ((m === 3 && d >= 21) || (m === 4 && d <= 20)) return 0;  // Aries
  if ((m === 4 && d >= 21) || (m === 5 && d <= 21)) return 1;  // Taurus
  if ((m === 5 && d >= 22) || (m === 6 && d <= 21)) return 2;  // Gemini
  if ((m === 6 && d >= 22) || (m === 7 && d <= 22)) return 3;  // Cancer
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 4;  // Leo
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 5;  // Virgo
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 6; // Libra
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 7; // Scorpio
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 8; // Sagittarius
  if ((m === 12 && d >= 22) || (m === 1 && d <= 20)) return 9; // Capricorn
  if ((m === 1 && d >= 21) || (m === 2 && d <= 18)) return 10; // Aquarius
  return 11; // Pisces
}

/** Clockwise rotation (degrees) to apply to zodiac disc so previous sign is at south */
export function getZodiacRotation(date: Date): number {
  const currentIdx = getZodiacIndex(date);
  const prevIdx = (currentIdx - 1 + 12) % 12;
  // prevSign's disc center is at (345 - prevIdx*30)° clockwise.
  // To bring it to 0° (south), rotate clockwise by: (15 + prevIdx*30) % 360
  return (15 + prevIdx * 30) % 360;
}

/** Clockwise rotation (degrees) to apply to the lunar phase cross
 *  so the full-moon arm (0°) points to the full-moon day-field */
export function getCrossRotation(year: number, month: number): number {
  const { fullMoon } = getMoonPhaseDays(year, month);
  const day = ((fullMoon - 1) % 30) + 1;
  return ((day - 1) * 12 + 6);
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
