import { useEffect, useRef, useState } from 'react'

// "Hello" rises in letter by letter, then flashes through greetings in other languages
const FIRST_WORD = 'Hello'
const GREETINGS = ['Ciao', 'Hola', 'Salut', 'नमस्ते', '你好', 'Привет', 'Hallo', 'Olá', 'こんにちは', 'مرحبا']

const LETTER_STAGGER = 70    // ms between "Hello" letters
const HOLD_HELLO     = 650   // ms before the greetings start
const GREETING_EVERY = 85    // ms per greeting
const FADE_OUT       = 400   // ms

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [greeting, setGreeting] = useState<number>(-1)   // -1 = animated "Hello"
  const [hidden, setHidden] = useState(false)
  const done = useRef(onComplete)
  useEffect(() => { done.current = onComplete }, [onComplete])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timers: ReturnType<typeof setTimeout>[] = []
    let interval: ReturnType<typeof setInterval> | undefined

    const hide = () => {
      setHidden(true)
      timers.push(setTimeout(() => done.current(), FADE_OUT))
    }

    if (reduced) {
      timers.push(setTimeout(hide, 600))
    } else {
      timers.push(setTimeout(() => {
        let i = 0
        interval = setInterval(() => {
          if (i >= GREETINGS.length) { clearInterval(interval); hide(); return }
          setGreeting(i++)
        }, GREETING_EVERY)
      }, HOLD_HELLO))
    }

    return () => { timers.forEach(clearTimeout); clearInterval(interval) }
  }, [])

  return (
    <div className={`pl-hello${hidden ? ' is-hidden' : ''}`} aria-hidden="true">
      <span className="pl-hello-text">
        {greeting < 0
          ? FIRST_WORD.split('').map((ch, i) => (
              <span key={i} className="pl-hello-letter" style={{ animationDelay: `${i * LETTER_STAGGER}ms` }}>{ch}</span>
            ))
          : GREETINGS[greeting]}
      </span>

      <style>{`
        .pl-hello {
          position: fixed; inset: 0; height: 100dvh; min-height: 100vh;
          z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          background: #000; color: #fff;
          opacity: 1; transition: opacity ${FADE_OUT}ms ease;
          pointer-events: all;
        }
        .pl-hello.is-hidden { opacity: 0; pointer-events: none; }
        .pl-hello-text {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: clamp(2.25rem, 9vw, 3rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.2;
          white-space: nowrap;
        }
        .pl-hello-letter {
          display: inline-block;
          opacity: 0;
          transform: translateY(20px);
          animation: pl-rise 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes pl-rise {
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pl-hello-letter { animation: none; opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  )
}
