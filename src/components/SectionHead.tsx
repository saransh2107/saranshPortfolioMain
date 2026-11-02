import { motion, useReducedMotion, type Variants } from 'framer-motion'

/* Section heading: big display type whose words rise into place. Wrap a word in *asterisks* to set it
   in the accent serif. An optional aside sits opposite the title on wide screens. */

const line: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const word: Variants = {
  hidden: { y: '110%' },
  show: { y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

interface Props {
  label: string
  title: string
  aside?: React.ReactNode
  /** Smaller type for headings that share the row with content */
  compact?: boolean
}

export default function SectionHead({ label, title, aside, compact }: Props) {
  const still = useReducedMotion()
  return (
    <header className={`sh${compact ? ' sh-compact' : ''}`}>
      <div className="sh-main">
        <p className="section-label">{label}</p>
        <motion.h2 className="sh-title" variants={line} initial={still ? false : 'hidden'} whileInView="show" viewport={{ once: true, margin: '-40px' }}>
          {title.split(' ').map((w, i) => {
            const accent = w.startsWith('*')
            return (
              <span key={i} className="sh-mask">
                <motion.span variants={word} className={accent ? 'sh-word sh-accent' : 'sh-word'}>{w.replaceAll('*', '')}</motion.span>{' '}
              </span>
            )
          })}
        </motion.h2>
      </div>
      {aside && <div className="sh-aside">{aside}</div>}

      <style>{`
        .sh { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 14px 40px; margin-bottom: clamp(20px, 3vw, 32px); }
        .sh-compact { margin-bottom: 18px; }
        .sh-main { min-width: 0; flex: 1 1 520px; }
        .sh-compact .sh-main { flex-basis: 100%; }
        .sh .section-label { margin-bottom: 8px; }
        .sh-title { font-family: var(--font-display); font-size: clamp(38px, 6.6vw, 80px); font-weight: 800; letter-spacing: -0.045em; line-height: 1.02; color: var(--fg); }
        .sh-compact .sh-title { font-size: clamp(36px, 4.8vw, 60px); }
        /* The mask clips each word while it rises; padding keeps descenders and italics from being cut */
        .sh-mask { display: inline-block; overflow: hidden; vertical-align: top; padding: 0 .1em .14em 0; margin: 0 .08em -.14em 0; }
        .sh-word { display: inline-block; }
        .sh-accent { font-family: var(--font-accent); font-weight: 400; letter-spacing: -0.02em; color: var(--accent-2); }
        .sh-aside { flex: 0 1 340px; font-size: 14.5px; line-height: 1.6; color: var(--fg-2); padding-bottom: 6px; }
      `}</style>
    </header>
  )
}
