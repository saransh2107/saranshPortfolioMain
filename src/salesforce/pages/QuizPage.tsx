import { useState } from 'react'
import { questions, SCORE_MESSAGES } from '../../data/quiz'
import { PageHeader } from '../ui'

export default function QuizPage() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const selected = answers[current] ?? null
  const [finished, setFinished] = useState(false)
  const score = answers.filter((a, i) => a === questions[i].answer).length
  const scoreMsg = SCORE_MESSAGES.find(m => score >= m.min && score <= m.max)!
  const q = questions[current]

  const pick = (idx: number) => { if (selected === null) setAnswers(a => [...a, idx]) }
  const next = () => current + 1 >= questions.length ? setFinished(true) : setCurrent(c => c + 1)
  const reset = () => { setCurrent(0); setAnswers([]); setFinished(false) }

  return (
    <>
      <PageHeader icon="quiz" eyebrow="Trailhead Quiz" title="Salesforce Knowledge Challenge"
        meta={`${questions.length} questions · Apex, Agentforce, LWC, Data Cloud & more`}
      />
      <div className="sf-card sf-card-body" style={{ maxWidth: 720 }}>
        {finished ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <span style={{ fontSize: 40 }}>{scoreMsg.emoji}</span>
              <div>
                <div style={{ fontSize: 28, fontWeight: 300 }}>{score} / {questions.length} correct</div>
                <p className="sf-help" style={{ fontSize: 13 }}>{scoreMsg.msg}</p>
              </div>
            </div>
            <table className="sf-table" style={{ border: '1px solid var(--sf-border)' }}>
              <thead><tr><th className="sf-num">#</th><th>Question</th><th>Result</th></tr></thead>
              <tbody>
                {questions.map((qq, i) => (
                  <tr key={qq.q}>
                    <td className="sf-num">{i + 1}</td>
                    <td>
                      {qq.q}
                      {answers[i] !== qq.answer && <div className="sf-help">Correct answer: {qq.options[qq.answer]}</div>}
                    </td>
                    <td>{answers[i] === qq.answer
                      ? <span className="sf-badge sf-badge-success">Correct</span>
                      : <span className="sf-badge sf-badge-error">Incorrect</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="sf-btn sf-btn-brand" style={{ marginTop: 16 }} onClick={reset}>Retake Quiz</button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--sf-weak)', marginBottom: 6 }}>
              <span>Question {current + 1} of {questions.length}</span>
              <span>{score} correct so far</span>
            </div>
            <div className="sf-progress"><i style={{ width: `${(current / questions.length) * 100}%` }} /></div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 18 }}>{q.q}</h2>
            <div className="sf-options" role="radiogroup">
              {q.options.map((opt, i) => {
                const state = selected === null ? '' : i === q.answer ? ' is-right' : i === selected ? ' is-wrong' : ''
                return (
                  <button key={opt} role="radio" aria-checked={selected === i} disabled={selected !== null}
                    className={`sf-option${selected === i ? ' is-picked' : ''}${state}`} onClick={() => pick(i)}
                  >
                    <span className="dot" />{opt}
                  </button>
                )
              })}
            </div>
            {selected !== null && (
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <p className="sf-help" style={{ fontSize: 13, flex: 1, minWidth: 200 }}>{q.explanation}</p>
                <button className="sf-btn sf-btn-brand" onClick={next}>{current + 1 >= questions.length ? 'See Results' : 'Next Question'}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
