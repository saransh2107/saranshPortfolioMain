import { useEffect, useState } from 'react'
import { formatIstClock, istTheme } from '../lib/ist'

/** Tiny live clock showing the time in India. On its own so only this re-renders every second. */
export default function IstClock() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <time title="Time in India (IST). The site turns light at sunrise and dark at sunset over India."
      style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, lineHeight: 1.2, fontWeight: 500, color: 'var(--fg-3)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', contain: 'layout' }}
    >
      <span aria-hidden style={{ color: istTheme(now) === 'light' ? '#f59e0b' : '#a5b4fc' }}>{istTheme(now) === 'light' ? '☀' : '☾'}</span> {formatIstClock(now)} IST
    </time>
  )
}
