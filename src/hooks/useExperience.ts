import { useEffect, useState } from 'react'

// Start of professional experience — update this one line to correct everything.
export const CAREER_START = new Date(2022, 3, 1) // 1 Apr 2022

export interface Experience {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  /** Total experience in fractional years, e.g. 4.53 */
  decimal: number
  /** Whole days elapsed since start, with remainder as hrs/min/sec below */
  totalDays: number
  remHours: number
  remMinutes: number
  remSeconds: number
}

export function calcExperience(now: Date = new Date(), start: Date = CAREER_START): Experience {
  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()
  let days = now.getDate() - start.getDate()
  let hours = now.getHours() - start.getHours()
  let minutes = now.getMinutes() - start.getMinutes()
  let seconds = now.getSeconds() - start.getSeconds()

  if (seconds < 0) { seconds += 60; minutes-- }
  if (minutes < 0) { minutes += 60; hours-- }
  if (hours < 0) { hours += 24; days-- }
  if (days < 0) {
    // borrow days from the month before `now`
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate()
    months--
  }
  if (months < 0) { months += 12; years-- }

  const decimal = (now.getTime() - start.getTime()) / (365.25 * 24 * 3600 * 1000)
  const diff = Math.max(0, now.getTime() - start.getTime())
  const totalSec = Math.floor(diff / 1000)
  return {
    years, months, days, hours, minutes, seconds, decimal,
    totalDays: Math.floor(totalSec / 86400),
    remHours: Math.floor((totalSec % 86400) / 3600),
    remMinutes: Math.floor((totalSec % 3600) / 60),
    remSeconds: totalSec % 60,
  }
}

/** Pass live = false for static copy, so the component isn't re-rendered every second. */
export function useExperience(live = true): Experience {
  const [exp, setExp] = useState(() => calcExperience())
  useEffect(() => {
    if (!live) return
    const t = setInterval(() => setExp(calcExperience()), 1000)
    return () => clearInterval(t)
  }, [live])
  return exp
}

/** "4.5" style label for static copy; floors to the nearest half year. */
export function experienceLabel(exp: Experience): string {
  return (Math.floor(exp.decimal * 2) / 2).toString()
}
