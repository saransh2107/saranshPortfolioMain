import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  background: 'var(--bg-2)', border: '1px solid var(--border)',
  color: 'var(--fg)', fontSize: 14, outline: 'none',
  transition: 'border-color .15s',
  fontFamily: 'var(--font-sans)',
}

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle')

  const v = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: inView ? { opacity: 1, y: 0 } : {}, transition: { duration: 0.5, delay: d } })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setStatus(r.ok ? 'sent' : 'error')
      if (r.ok) setForm({ name: '', email: '', message: '' })
    } catch { setStatus('error') }
  }

  return (
    <section id="contact" className="section" ref={ref}>
      <div className="container">
        <div style={{ maxWidth: 560 }}>
          <motion.p {...v(0)} className="section-label">07 — Contact</motion.p>
          <motion.h2 {...v(0.05)} style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--fg)', marginBottom: 12 }}>
            Let's work together
          </motion.h2>
          <motion.p {...v(0.1)} style={{ fontSize: 15, color: 'var(--fg-2)', marginBottom: 36, lineHeight: 1.7 }}>
            Have a Salesforce project in mind or want to collaborate? Send me a message — I'll get back to you.
          </motion.p>

          {status === 'sent' ? (
            <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ padding: '36px', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--bg-2)', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✉️</div>
              <p style={{ fontWeight: 600, color: 'var(--fg)', marginBottom: 4 }}>Message sent!</p>
              <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>I'll respond as soon as possible.</p>
            </motion.div>
          ) : (
            <motion.form {...v(0.15)} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="form-grid">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--fg-3)', marginBottom: 6 }}>Name</label>
                  <input type="text" required placeholder="Your name" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--fg-3)', marginBottom: 6 }}>Email</label>
                  <input type="email" required placeholder="you@example.com" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--fg-3)', marginBottom: 6 }}>Message</label>
                <textarea required rows={5} placeholder="Tell me about your project..." value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
              </div>
              {status === 'error' && <p style={{ fontSize: 13, color: '#ef4444' }}>Something went wrong. Please try again.</p>}
              <button type="submit" disabled={status === 'sending'}
                style={{ padding: '12px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', opacity: status === 'sending' ? 0.6 : 1, transition: 'opacity .15s' }}
                onMouseEnter={e => { if (status !== 'sending') (e.currentTarget as HTMLElement).style.opacity = '.88' }}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = status === 'sending' ? '0.6' : '1'}
              >
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>
            </motion.form>
          )}
        </div>
      </div>
      <style>{`@media(max-width:480px){.form-grid{grid-template-columns:1fr!important;}}`}</style>
    </section>
  )
}
