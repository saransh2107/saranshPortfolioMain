import { useState } from 'react'

export type ContactStatus = 'idle' | 'sending' | 'sent' | 'error'

/** Form state + submit for /api/contact, shared by both site views. */
export function useContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<ContactStatus>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setStatus(r.ok ? 'sent' : 'error')
      if (r.ok) setForm({ name: '', email: '', message: '' })
    } catch { setStatus('error') }
  }

  return { form, setForm, status, setStatus, handleSubmit }
}
