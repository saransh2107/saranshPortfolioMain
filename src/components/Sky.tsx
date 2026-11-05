import { useEffect, useState } from 'react'
import { moonDirection, moonLitFraction, sunDirection, viewFrom } from '../lib/sky'

/* The Sun and Moon where they really are around the Earth right now, seen from above India: east is
   to the right, so the Sun crosses from right to left through the day. The Moon shows its true phase,
   lit on the side that really faces the Sun, with the rest faintly visible as it is on a clear night. */

/** The unlit part of a Moon whose lit side faces +x, in a viewBox from -50 to 50. */
function shadowPath(lit: number) {
  const bulge = Math.abs(1 - 2 * lit) * 50
  return `M0 -50A50 50 0 0 0 0 50A${bulge.toFixed(2)} 50 0 0 ${lit > 0.5 ? 1 : 0} 0 -50Z`
}

export default function Sky({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])

  const sun = viewFrom(sunDirection(now)), moon = viewFrom(moonDirection(now))
  const lit = moonLitFraction(now)
  // Which way the Sun lies from the Moon on screen; y is flipped because screen y runs downward
  const facing = (-Math.atan2(sun[1] - moon[1], sun[0] - moon[0]) * 180) / Math.PI
  const place = (x: number) => ({ '--x': x.toFixed(3) }) as React.CSSProperties

  return (
    <div ref={ref} className="hero-sky" aria-hidden>
      <div className="hero-sun" style={place(sun[0])}><span className="hero-sun-core" /></div>
      <div className="hero-moon" style={place(moon[0])}>
        <span className="hero-moon-disc">
          <svg viewBox="-50 -50 100 100"><path d={shadowPath(lit)} transform={`rotate(${facing.toFixed(1)})`} fill="#04050b" fillOpacity={0.84} /></svg>
        </span>
      </div>
    </div>
  )
}
