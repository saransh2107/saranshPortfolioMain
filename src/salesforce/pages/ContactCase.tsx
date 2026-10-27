import { useContactForm } from '../../hooks/useContactForm'
import { PageHeader } from '../ui'

export default function ContactCase() {
  const { form, setForm, status, setStatus, handleSubmit } = useContactForm()

  return (
    <>
      <PageHeader icon="case" eyebrow="Cases" title="New Case"
        meta="Have a Salesforce project in mind or want to collaborate? Log a case and I'll get back to you."
      />

      {status === 'sent' ? (
        <div className="sf-toast" role="status" style={{ maxWidth: 720 }}>
          <span style={{ fontSize: 18 }}>✓</span>
          <span style={{ flex: 1 }}>Case logged — thanks for reaching out! I'll respond as soon as possible.</span>
          <button className="sf-btn" onClick={() => setStatus('idle')}>Log another</button>
        </div>
      ) : (
        <form className="sf-card" style={{ maxWidth: 720 }} onSubmit={handleSubmit}>
          <div className="sf-card-head"><h2 className="sf-card-title">Case Information</h2></div>
          <div className="sf-form" style={{ padding: 16 }}>
            <div>
              <label htmlFor="sf-name"><abbr title="required">*</abbr>Contact Name</label>
              <input id="sf-name" type="text" required placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="sf-email"><abbr title="required">*</abbr>Email</label>
              <input id="sf-email" type="email" required placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="sf-origin">Case Origin</label>
              <input id="sf-origin" type="text" readOnly value="Web" />
            </div>
            <div>
              <label htmlFor="sf-owner">Case Owner</label>
              <input id="sf-owner" type="text" readOnly value="Saransh Batham" />
            </div>
            <div className="sf-span-2">
              <label htmlFor="sf-desc"><abbr title="required">*</abbr>Description</label>
              <textarea id="sf-desc" required rows={6} placeholder="Tell me about your project..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
          </div>
          {status === 'error' && <div className="sf-toast sf-toast-error" role="alert" style={{ margin: '0 16px 16px' }}>Something went wrong. Please try again.</div>}
          <div className="sf-form-footer">
            <button type="submit" className="sf-btn sf-btn-brand" disabled={status === 'sending'}>{status === 'sending' ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      )}
    </>
  )
}
