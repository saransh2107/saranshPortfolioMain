import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { calcExperience } from '../hooks/useExperience'

const COMMANDS: Record<string, () => string[]> = {
  help: () => [
    '┌─────────────────────────────────┐',
    '│   Available Commands            │',
    '├─────────────────────────────────┤',
    '│  whoami     → About Saransh     │',
    '│  skills     → List skills       │',
    '│  certs      → Certifications    │',
    '│  contact    → Get in touch      │',
    '│  blog       → Latest posts      │',
    '│  matrix     → 👀                │',
    '│  clear      → Clear terminal    │',
    '│  exit       → Close terminal    │',
    '└─────────────────────────────────┘',
  ],
  whoami: () => [
    '',
    '  ███████╗██████╗ ',
    '  ██╔════╝██╔══██╗',
    '  ███████╗██████╔╝',
    '  ╚════██║██╔══██╗',
    '  ███████║██████╔╝',
    '  ╚══════╝╚═════╝ ',
    '',
    '  Saransh Batham',
    '  ─────────────────────────────────',
    '  Role      → Salesforce Developer',
    `  XP        → ${calcExperience().decimal.toFixed(2)} years`,
    '  Location  → India 🇮🇳',
    '  Status    → Open to opportunities',
    '  Stack     → Apex · LWC · Flow · Data Cloud',
    '',
  ],
  skills: () => [
    '',
    '  ⚡ Core Salesforce',
    '     Apex ████████████ 95%',
    '     LWC  ███████████░ 90%',
    '     Flow ████████████ 95%',
    '     SOQL ████████████ 95%',
    '',
    '  ☁️  Cloud Products',
    '     Data Cloud   ████████░░ 80%',
    '     Agentforce   ███████░░░ 75%',
    '     Mktg Cloud   ████████░░ 80%',
    '     Exp Cloud    █████████░ 85%',
    '',
    '  🔧 Dev Tools',
    '     SFDX / CLI   ████████████ 95%',
    '     REST APIs    █████████░░ 90%',
    '     Git          ████████░░░ 85%',
    '',
  ],
  certs: () => [
    '',
    '  🏆 Salesforce Certifications',
    '  ────────────────────────────',
    '  ✓  Salesforce Administrator',
    '  ✓  Marketing Associate',
    '  ✓  Data Cloud Consultant',
    '  ✓  AI Associate',
    '  ✓  Platform Developer I',
    '  ✓  Agentforce Specialist',
    '',
    '  Total: 6 active certifications',
    '',
  ],
  contact: () => [
    '',
    '  📬 Get in Touch',
    '  ───────────────',
    '  LinkedIn  → linkedin.com/in/batham',
    '  GitHub    → github.com/saransh2107',
    '  Email     → Use the contact form ↓',
    '',
  ],
  blog: () => [
    '',
    '  📝 Blog',
    '  ───────',
    '  Writing about Salesforce, Apex, LWC,',
    '  Data Cloud, Agentforce, and more.',
    '',
    '  Visit /blog to read all posts.',
    '',
  ],
  matrix: () => ['__MATRIX__'],
  clear: () => ['__CLEAR__'],
  exit: () => ['__EXIT__'],
}

const MATRIX_CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ'

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = 300
    canvas.height = 160
    const cols = Math.floor(canvas.width / 14)
    const drops = Array(cols).fill(1)
    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#0f0'
      ctx.font = '12px monospace'
      drops.forEach((y, i) => {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
        ctx.fillText(char, i * 14, y * 14)
        if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      })
    }, 40)
    return () => clearInterval(interval)
  }, [])
  return <canvas ref={canvasRef} className="rounded-lg" style={{ width: '100%', height: 160 }} />
}

interface Line {
  type: 'input' | 'output' | 'matrix'
  text?: string
  content?: string[]
}

export default function FloatingTerminal({ onClose }: { onClose: () => void }) {
  const [lines, setLines] = useState<Line[]>([
    { type: 'output', content: ['Welcome to Saransh\'s terminal 👋', 'Type "help" to see available commands.', ''] },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const histIdx = useRef(-1)
  const setShowMatrix = (_: boolean) => {} // matrix display handled via lines state
  const [isMobile, setIsMobile] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 })
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const runCommand = useCallback((raw: string) => {
    const cmd = raw.trim().toLowerCase()
    if (!cmd) return
    setHistory(h => [cmd, ...h])
    histIdx.current = -1

    const handler = COMMANDS[cmd]
    if (!handler) {
      setLines(l => [...l,
        { type: 'input', text: cmd },
        { type: 'output', content: [`bash: ${cmd}: command not found`, 'Type "help" for available commands.', ''] },
      ])
      return
    }

    const result = handler()

    if (result[0] === '__CLEAR__') {
      setLines([])
      setShowMatrix(false)
      return
    }
    if (result[0] === '__EXIT__') {
      onClose()
      return
    }
    if (result[0] === '__MATRIX__') {
      setShowMatrix(true)
      setLines(l => [...l, { type: 'input', text: cmd }, { type: 'matrix' }])
      setTimeout(() => setShowMatrix(false), 5000)
      return
    }

    setLines(l => [...l, { type: 'input', text: cmd }, { type: 'output', content: result }])
  }, [onClose])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      runCommand(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(histIdx.current + 1, history.length - 1)
      histIdx.current = next
      setInput(history[next] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(histIdx.current - 1, -1)
      histIdx.current = next
      setInput(next === -1 ? '' : history[next])
    }
  }

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging) return
      setPos({
        x: dragStart.current.px + e.clientX - dragStart.current.mx,
        y: dragStart.current.py + e.clientY - dragStart.current.my,
      })
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 40 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="fixed z-[9998] rounded-2xl overflow-hidden shadow-2xl"
      style={{
        ...(isMobile
          ? { left: 16, right: 16, maxWidth: 380 }
          : { width: 380, right: `calc(1.5rem + ${-pos.x}px)` }
        ),
        bottom: `calc(5rem + ${-pos.y}px)`,
        background: '#0d0d1a',
        border: '1px solid #1e1e3f',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.15), 0 0 40px rgba(99,102,241,0.1)',
        fontFamily: 'var(--font-mono)',
        cursor: dragging ? 'grabbing' : 'auto',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-3 select-none cursor-grab active:cursor-grabbing"
        style={{ background: '#12122a', borderBottom: '1px solid #1e1e3f' }}
        onMouseDown={onMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <button onClick={onClose} className="w-3 h-3 rounded-full transition-opacity hover:opacity-80" style={{ background: '#ff5f56' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#27c93f' }} />
          </div>
          <span className="text-xs ml-2" style={{ color: '#6366f1' }}>saransh@portfolio</span>
        </div>
        <span className="text-xs" style={{ color: '#475569' }}>⌨ terminal</span>
      </div>

      {/* Output */}
      <div
        className="p-4 overflow-y-auto text-xs space-y-1 leading-relaxed"
        style={{ height: isMobile ? 220 : 280, color: '#94a3b8' }}
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, i) =>
          line.type === 'input' ? (
            <div key={i} className="flex items-start gap-2">
              <span style={{ color: '#6366f1' }}>saransh@portfolio:~$</span>
              <span style={{ color: '#e2e8f0' }}>{line.text}</span>
            </div>
          ) : line.type === 'matrix' ? (
            <div key={i} className="my-2"><MatrixRain /></div>
          ) : (
            <div key={i}>
              {line.content?.map((l, j) => (
                <div
                  key={j}
                  style={{
                    color: l.startsWith('  ✓') ? '#10b981'
                      : l.startsWith('  🏆') || l.startsWith('  ⚡') || l.startsWith('  ☁️') || l.startsWith('  🔧') || l.startsWith('  📬') || l.startsWith('  📝') ? '#6366f1'
                      : l.startsWith('  ─') || l.startsWith('  ───') ? '#1e1e3f'
                      : l.startsWith('┌') || l.startsWith('│') || l.startsWith('├') || l.startsWith('└') ? '#6366f1'
                      : l.startsWith('  ███') || l.includes('████') ? '#10b981'
                      : '#94a3b8',
                    whiteSpace: 'pre',
                  }}
                >
                  {l || ' '}
                </div>
              ))}
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderTop: '1px solid #1e1e3f', background: '#0a0a16' }}
      >
        <span className="text-xs flex-shrink-0" style={{ color: '#6366f1' }}>$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          className="flex-1 bg-transparent outline-none text-xs"
          style={{ color: '#e2e8f0', caretColor: '#6366f1' }}
          placeholder="type a command..."
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </motion.div>
  )
}
