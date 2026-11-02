/* A band of oversized type that slides sideways as the page scrolls.
   Words alternate between an outlined sans and a filled serif italic. */

export default function BigType({ words, reverse }: { words: string[]; reverse?: boolean }) {
  const row = [...words, ...words, ...words]

  return (
    <div className={`bt${reverse ? ' bt-rev' : ''}`} aria-hidden>
      <div className="bt-row">
        {row.map((w, i) => <span key={i} className={i % 2 ? 'bt-serif' : 'bt-line'}>{w}</span>)}
      </div>
      <style>{`
        .bt { overflow: clip; padding: clamp(6px, 1.5vw, 16px) 0; pointer-events: none; user-select: none; }
        .bt-row { display: flex; width: max-content; align-items: baseline; gap: .4em; font-size: clamp(48px, 9vw, 124px); line-height: 1.12; white-space: nowrap; transform: translate3d(-8%, 0, 0); }
        /* Slides with the page; clip above (not hidden) keeps the page as the scroll timeline */
        @supports (animation-timeline: view()) {
          @media (prefers-reduced-motion: no-preference) {
            .bt-row { animation: bt-slide linear both; animation-timeline: view(); will-change: transform; }
            .bt-rev .bt-row { animation-direction: reverse; }
          }
        }
        @keyframes bt-slide { from { transform: translate3d(-4%, 0, 0); } to { transform: translate3d(-24%, 0, 0); } }
        .bt-line { font-family: var(--font-display); font-weight: 800; letter-spacing: -0.04em; color: transparent; -webkit-text-stroke: 1.5px color-mix(in srgb, var(--fg) 26%, transparent); }
        .bt-serif { font-family: var(--font-accent); letter-spacing: -0.02em; color: var(--accent-2); }
      `}</style>
    </div>
  )
}
