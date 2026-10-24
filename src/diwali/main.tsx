import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './diwali.css'
import Diwali from './Diwali'
import { isDiwaliOver } from './expiry'

if (isDiwaliOver()) {
  window.location.replace('/')
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Diwali />
      <Analytics />
    </StrictMode>,
  )
}
