import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useContactForm } from '../hooks/useContactForm'
import { links } from '../data/resume'
import SectionHead from './SectionHead'

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
  const { form, setForm, status, handleSubmit } = useContactForm()

  const v = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: inView ? { opacity: 1, y: 0 } : {}, transition: { duration: 0.5, delay: d } })

  return (
    <section id="contact" className="section" ref={ref}>
      <div className="container">
        <div className="split">
          <div>
            <SectionHead compact label="08 — Contact" title="Let's work *together*" />
            <motion.p {...v(0.1)} style={{ fontSize: 15.5, color: 'var(--fg-2)', marginBottom: 18, lineHeight: 1.7, maxWidth: 440 }}>
              Have a Salesforce project in mind or want to collaborate? Send me a message and I'll get back to you.
            </motion.p>
            <motion.div {...v(0.15)} style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, fontWeight: 600 }}>
              {[['LinkedIn', links.linkedin], ['GitHub', links.github], ['Trailhead', links.trailhead]].map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--fg-2)', textUnderlineOffset: 4 }}>{label} ↗</a>
              ))}
            </motion.div>
          </div>


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
