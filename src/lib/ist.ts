// India Standard Time helpers. IST is always UTC+5:30 with no daylight saving, so plain arithmetic is
// enough, and every visitor gets the same answer whatever their own time zone is.

import { sunAltitude } from './sky'

const IST_OFFSET_MS = 5.5 * 3_600_000
const DAY_MS = 86_400_000
const SUNRISE_ALTITUDE = -0.83 // degrees: the Sun's rim touches the horizon, allowing for the air bending its light

export type DayTheme = 'light' | 'dark'

/** Milliseconds since midnight in India. */
const istMs = (now: number) => (now + IST_OFFSET_MS) % DAY_MS

/** Light while the Sun is really up over India, dark otherwise. */
export function istTheme(now = Date.now()): DayTheme {
  return sunAltitude(now) > SUNRISE_ALTITUDE ? 'light' : 'dark'
}

/** The moment of the next sunrise or sunset in India, to the nearest second. */
export function nextIstSwitch(now = Date.now()): number {
  const current = istTheme(now)
  let t = now
  while (istTheme(t) === current && t - now < DAY_MS) t += 60_000
  let low = t - 60_000
  while (t - low > 1000) {
    const mid = (low + t) / 2
    if (istTheme(mid) === current) low = mid
    else t = mid
  }
  return Math.ceil(t)
}

/** "9:05:07 PM" */
export function formatIstClock(now = Date.now()): string {
  const total = Math.floor(istMs(now) / 1000)
  const h = Math.floor(total / 3600), m = Math.floor(total / 60) % 60, s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${h % 12 || 12}:${pad(m)}:${pad(s)} ${h < 12 ? 'AM' : 'PM'}`
}
