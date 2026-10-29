import { useEffect, useRef } from 'react'

/* A soft light and a trailing ring that follow the mouse across the whole site. The ring swells over
   anything clickable and over the Earth. Mouse/trackpad only; the loop sleeps once the ring catches up. */

const HOT = 'a, button, [role="button"], input, textarea, select, label, .pl-planet'

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const enabled = typeof window !== 'undefined'
    && window.matchMedia('(pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const glow = glowRef.current, ring = ringRef.current
    if (!enabled || !glow || !ring) return
    let tx = -200, ty = -200, rx = tx, ry = ty, raf = 0

    const step = () => {
      rx += (tx - rx) * 0.2; ry += (ty - ry) * 0.2
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = Math.abs(tx - rx) + Math.abs(ty - ry) > 0.2 ? requestAnimationFrame(step) : 0
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      tx = e.clientX; ty = e.clientY
      glow.style.transform = `translate3d(${tx}px, ${ty}px, 0)`
      document.documentElement.classList.add('has-cursor')
      if (!raf) raf = requestAnimationFrame(step)
    }
    const onOver = (e: PointerEvent) => {
      ring.classList.toggle('is-hot', !!(e.target as Element | null)?.closest?.(HOT))
    }
    const onDown = () => ring.classList.add('is-down')
    const onUp = () => ring.classList.remove('is-down')
    const onLeave = () => document.documentElement.classList.remove('has-cursor')

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <>
      <div ref={glowRef} className="cg-glow" aria-hidden />
      <div ref={ringRef} className="cg-ring" aria-hidden><i /></div>
      <style>{`
        .cg-glow, .cg-ring { position: fixed; left: 0; top: 0; pointer-events: none; opacity: 0; transition: opacity .3s; will-change: transform; }
        .has-cursor .cg-glow, .has-cursor .cg-ring { opacity: 1; }
        .cg-glow { z-index: 0; width: 0; height: 0; }
        .cg-glow::before { content: ''; position: absolute; left: -260px; top: -260px; width: 520px; height: 520px; border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,.10) 0%, rgba(14,165,233,.05) 40%, transparent 70%); }
        .cg-ring { z-index: 9998; width: 0; height: 0; }
        .cg-ring i { position: absolute; left: -15px; top: -15px; width: 30px; height: 30px; border-radius: 50%; border: 1.5px solid rgba(139,92,246,.7);
          transition: transform .25s cubic-bezier(.2,.8,.2,1), background .25s, border-color .25s; }
        .cg-ring.is-hot i { transform: scale(1.7); background: rgba(139,92,246,.1); border-color: rgba(139,92,246,.4); }
        .cg-ring.is-down i { transform: scale(.75); }
        .cg-ring.is-hot.is-down i { transform: scale(1.35); }
      `}</style>
    </>
  )
}
