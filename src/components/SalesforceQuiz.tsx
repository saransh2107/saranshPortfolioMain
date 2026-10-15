import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useState, useRef } from 'react'

const questions = [
  {
    q: 'What is the maximum number of SOQL queries allowed in a single Apex transaction?',
    options: ['50', '100', '150', '200'],
    answer: 1,
    explanation: '100 SOQL queries per transaction is a key Apex governor limit.',
  },
  {
    q: 'Which Salesforce feature allows you to build autonomous AI agents that take actions?',
    options: ['Einstein Bots', 'Agentforce', 'Flow Orchestrator', 'OmniStudio'],
    answer: 1,
    explanation: "Agentforce is Salesforce's platform for building autonomous AI agents.",
  },
  {
    q: 'What does LWC stand for in Salesforce development?',
    options: ['Lightweight Web Coding', 'Lightning Web Components', 'Live Web Constructor', 'Linked Web Container'],
    answer: 1,
    explanation: 'Lightning Web Components is the modern UI framework for Salesforce.',
  },
  {
    q: 'Which object in Salesforce unifies customer data from multiple sources in Data Cloud?',
    options: ['Contact', 'Lead', 'Unified Individual', 'Person Account'],
    answer: 2,
    explanation: 'The Unified Individual is the resolved, deduplicated customer profile in Data Cloud.',
  },
  {
    q: 'What is the correct order of trigger execution in Salesforce?',
    options: [
      'After triggers → Validation rules → Before triggers',
      'Before triggers → Validation rules → After triggers',
      'Validation rules → Before triggers → After triggers',
      'Before triggers → After triggers → Validation rules',
    ],
    answer: 1,
    explanation: 'Salesforce processes before triggers first, then validation rules, then after triggers.',
  },
]

const SCORE_MESSAGES = [
  { min: 0, max: 1, emoji: '😅', msg: 'Keep exploring Trailhead! Every expert started somewhere.' },
  { min: 2, max: 3, emoji: '💪', msg: 'Solid foundation! You know your Salesforce basics.' },
  { min: 4, max: 4, emoji: '🔥', msg: "Impressive! You clearly spend time on Trailhead." },
  { min: 5, max: 5, emoji: '🏆', msg: "Perfect score! You're a true Salesforce champion." },
]

export default function SalesforceQuiz() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])

  const v = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: inView ? { opacity: 1, y: 0 } : {}, transition: { duration: 0.5, delay: d } })

  const q = questions[current]
  const progress = (current / questions.length) * 100

  const handleSelect = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    if (idx === q.answer) setScore(s => s + 1)
    setAnswers(a => [...a, idx])
  }

  const handleNext = () => {
    if (current + 1 >= questions.length) { setDone(true) }
    else { setCurrent(c => c + 1); setSelected(null) }
  }

  const reset = () => { setCurrent(0); setSelected(null); setScore(0); setDone(false); setAnswers([]) }

  const scoreMsg = SCORE_MESSAGES.find(m => score >= m.min && score <= m.max)!

  return (
    <section id="quiz" className="section" ref={ref}>
      <div className="container">
        <motion.p {...v(0)} className="section-label">05 — Interactive</motion.p>
        <motion.h2 {...v(0.05)} style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--fg)', marginBottom: 8 }}>
          Salesforce Quiz
        </motion.h2>
        <motion.p {...v(0.08)} style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 40 }}>
          Think you know Salesforce? Test yourself with {questions.length} quick questions.
        </motion.p>

        <motion.div {...v(0.12)} style={{ maxWidth: 600, border: '1px solid var(--border)', borderRadius: 16, background: 'var(--bg-2)', overflow: 'hidden' }}>
          {!started ? (
            <div style={{ padding: '48px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 20 }}>⚡</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', marginBottom: 10 }}>
                Salesforce Knowledge Challenge
              </h3>
              <p style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.7, marginBottom: 32, maxWidth: 340, margin: '0 auto 32px' }}>
                {questions.length} questions covering Apex, Agentforce, LWC, Data Cloud & more. No pressure — it's just for fun!
              </p>
              <motion.button
                onClick={() => setStarted(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                style={{ padding: '10px 28px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 4px 20px rgba(139,92,246,0.3)' }}
              >
                Start Quiz →
              </motion.button>
            </div>
          ) : done ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '48px 40px', textAlign: 'center' }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }} style={{ fontSize: 64, marginBottom: 16 }}>
                {scoreMsg.emoji}
              </motion.div>
              <div style={{ fontSize: 52, fontWeight: 900, marginBottom: 8, background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {score}/{questions.length}
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', marginBottom: 28 }}>{scoreMsg.msg}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', marginBottom: 28 }}>
                {questions.map((qq, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, fontSize: 12, background: answers[i] === qq.answer ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${answers[i] === qq.answer ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                    <span style={{ color: answers[i] === qq.answer ? '#22c55e' : '#ef4444', flexShrink: 0, fontWeight: 700 }}>{answers[i] === qq.answer ? '✓' : '✗'}</span>
                    <div>
                      <p style={{ color: 'var(--fg-2)', lineHeight: 1.5 }}>{qq.q}</p>
                      {answers[i] !== qq.answer && <p style={{ marginTop: 4, color: '#22c55e' }}>Correct: {qq.options[qq.answer]}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <motion.button onClick={reset} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{ padding: '9px 24px', borderRadius: 10, border: '1px solid var(--border-2)', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                Try Again
              </motion.button>
            </motion.div>
          ) : (
            <div style={{ padding: '32px 36px' }}>
              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)' }}>Question {current + 1} of {questions.length}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>Score: {score}</span>
              </div>
              <div style={{ height: 3, borderRadius: 99, background: 'var(--border)', marginBottom: 28, overflow: 'hidden' }}>
                <motion.div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)' }}
                  initial={{ width: `${progress}%` }}
                  animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.28 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)', lineHeight: 1.6, marginBottom: 20 }}>{q.q}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {q.options.map((opt, i) => {
                      const isSelected = selected === i
                      const isCorrect = i === q.answer
                      const revealed = selected !== null

                      let bg = 'var(--bg-3)'
                      let border = 'var(--border)'
                      let color = 'var(--fg-2)'

                      if (revealed) {
                        if (isCorrect) { bg = 'rgba(34,197,94,0.08)'; border = '#22c55e'; color = '#22c55e' }
                        else if (isSelected) { bg = 'rgba(239,68,68,0.08)'; border = '#ef4444'; color = '#ef4444' }
                      }

                      return (
                        <motion.button key={i} onClick={() => handleSelect(i)}
                          whileHover={selected === null ? { scale: 1.01 } : {}}
                          whileTap={selected === null ? { scale: 0.99 } : {}}
                          style={{ width: '100%', textAlign: 'left', padding: '11px 14px', borderRadius: 10, border: `1px solid ${border}`, background: bg, color, cursor: selected !== null ? 'default' : 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10, transition: 'background .15s, border-color .15s' }}
                        >
                          <span style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, color }}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                          {revealed && isCorrect && <span style={{ marginLeft: 'auto' }}>✓</span>}
                          {revealed && isSelected && !isCorrect && <span style={{ marginLeft: 'auto' }}>✗</span>}
                        </motion.button>
                      )
                    })}
                  </div>

                  <AnimatePresence>
                    {selected !== null && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, fontSize: 13, color: 'var(--fg-2)', background: 'rgba(139,92,246,0.07)', border: '1px solid var(--border)', lineHeight: 1.6 }}>
                        💡 {q.explanation}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {selected !== null && (
                    <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={handleNext}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      style={{ marginTop: 20, width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 4px 20px rgba(139,92,246,0.25)' }}
                    >
                      {current + 1 >= questions.length ? 'See Results' : 'Next Question →'}
                    </motion.button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
