import type { Sound } from './sound'

const TAU = Math.PI * 2
// Gold, saffron, rose, magenta, sky, emerald, red
const HUES = [42, 28, 340, 300, 200, 145, 0]

export type Kind = 'peony' | 'double' | 'ring' | 'willow' | 'strobe' | 'palm' | 'heart'
const KINDS: Kind[] = ['peony', 'peony', 'double', 'ring', 'willow', 'strobe', 'palm']

interface Spark {
  x: number; y: number; px: number; py: number
  vx: number; vy: number
  hue: number; sat: number; light: number
  life: number; ttl: number
  width: number
  friction: number; gravity: number
  strobe: boolean
}

interface Rocket {
  x: number; y: number; px: number; py: number
  vx: number; vy: number
  kind: Kind; hue: number; big: boolean
}

export interface LaunchOptions {
  x?: number
  y?: number
  targetY?: number
  kind?: Kind
  hue?: number
  big?: boolean
  whistle?: boolean
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

export class Fireworks {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private sound: Sound
  private sparks: Spark[] = []
  private rockets: Rocket[] = []
  private w = 0
  private h = 0
  private scale = 1
  private density = 1
  private flash = 0
  private flashHue = 40
  private raf = 0
  private last = 0

  constructor(canvas: HTMLCanvasElement, sound: Sound) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.sound = sound
    this.resize()
    window.addEventListener('resize', this.resize)
    this.raf = requestAnimationFrame(this.frame)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.resize)
  }

  private resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.w = window.innerWidth
    this.h = window.innerHeight
    this.canvas.width = Math.round(this.w * dpr)
    this.canvas.height = Math.round(this.h * dpr)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.scale = Math.max(0.6, Math.min(1.5, Math.min(this.w, this.h * 0.8) / 700))
    this.density = Math.max(0.55, Math.min(1, (this.w * this.h) / (1280 * 720)))
  }

  launch(opts: LaunchOptions = {}) {
    if (this.rockets.length > 14) return
    const g = this.gravity()
    const x = opts.x ?? rand(this.w * 0.15, this.w * 0.85)
    const y = opts.y ?? this.h + 10
    const targetY = opts.targetY ?? rand(this.h * 0.12, this.h * 0.42)
    const vy = -Math.sqrt(2 * g * Math.max(80, y - targetY))
    this.rockets.push({
      x, y, px: x, py: y,
      vx: rand(-0.3, 0.3) * this.scale, vy,
      kind: opts.kind ?? pick(KINDS),
      hue: opts.hue ?? pick(HUES),
      big: !!opts.big,
    })
    const seconds = -vy / g / 60
    this.sound.launch(seconds, (x / this.w) * 2 - 1, opts.whistle ?? Math.random() < 0.45)
  }

  // Tiny sparks thrown off by a burning fuse
  sparkle(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      const a = rand(0, TAU), s = rand(0.5, 2.2)
      this.add(x, y, Math.cos(a) * s, Math.sin(a) * s - 1, 45, 100, 70, rand(12, 26), 1.2, 0.94, 0.08)
    }
  }

  private gravity() {
    return 0.1 * Math.max(this.scale, 0.8)
  }

  private add(x: number, y: number, vx: number, vy: number, hue: number, sat: number, light: number,
    ttl: number, width: number, friction: number, gravity: number, strobe = false) {
    if (this.sparks.length > 3000) return
    this.sparks.push({ x, y, px: x, py: y, vx, vy, hue, sat, light, life: 0, ttl, width, friction, gravity, strobe })
  }

  private burst(r: Rocket) {
    const { x, y, hue, big } = r
    const s = (big ? 7.6 : 6.2) * this.scale
    const n = Math.round((big ? 230 : 130) * this.density)
    const grav = 0.05 * this.scale
    const jitter = () => hue + rand(-8, 8)

    switch (r.kind) {
      case 'peony':
      case 'double': {
        const inner = r.kind === 'double' ? pick(HUES.filter(h => h !== hue)) : hue
        for (let i = 0; i < n; i++) {
          // Uniform points on a sphere, projected, read as a round shell
          const a = rand(0, TAU), u = rand(-1, 1), sp = s * Math.sqrt(1 - u * u) * rand(0.92, 1.05)
          this.add(x, y, Math.cos(a) * sp, Math.sin(a) * sp, jitter(), 100, 62, rand(55, 80), 2.2, 0.962, grav)
        }
        for (let i = 0; i < n * 0.35; i++) {
          const a = rand(0, TAU), sp = s * rand(0.2, 0.5)
          this.add(x, y, Math.cos(a) * sp, Math.sin(a) * sp, inner + rand(-6, 6), 100, 72, rand(40, 60), 1.8, 0.955, grav)
        }
        break
      }
      case 'ring': {
        const tilt = rand(0.35, 0.8), rot = rand(0, TAU)
        for (let i = 0; i < n * 0.7; i++) {
          const a = (i / (n * 0.7)) * TAU
          const ex = Math.cos(a) * s * 0.9, ey = Math.sin(a) * s * 0.9 * tilt
          const vx = ex * Math.cos(rot) - ey * Math.sin(rot)
          const vy = ex * Math.sin(rot) + ey * Math.cos(rot)
          this.add(x, y, vx, vy, jitter(), 100, 64, rand(60, 75), 2.2, 0.962, grav * 0.7)
        }
        break
      }
      case 'willow':
        for (let i = 0; i < n; i++) {
          const a = rand(0, TAU), u = rand(-1, 1), sp = s * 0.8 * Math.sqrt(1 - u * u)
          this.add(x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(36, 46), 95, 58, rand(120, 170), 1.6, 0.972, grav * 0.75)
        }
        break
      case 'strobe':
        for (let i = 0; i < n; i++) {
          const a = rand(0, TAU), u = rand(-1, 1), sp = s * Math.sqrt(1 - u * u)
          this.add(x, y, Math.cos(a) * sp, Math.sin(a) * sp, jitter(), 40, 88, rand(70, 100), 2, 0.96, grav, true)
        }
        break
      case 'palm': {
        const arms = 9
        for (let k = 0; k < arms; k++) {
          const a = (k / arms) * TAU + rand(-0.15, 0.15)
          for (let i = 0; i < 14; i++) {
            const sp = s * rand(0.45, 1.05)
            this.add(x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(34, 48), 100, 60, rand(70, 100), 2.6, 0.965, grav)
          }
        }
        break
      }
      case 'heart':
        for (let i = 0; i < n; i++) {
          const t = (i / n) * TAU
          const hx = 16 * Math.sin(t) ** 3
          const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
          const sp = (s * 0.95) / 16
          this.add(x, y, hx * sp, hy * sp, hue + rand(-5, 5), 100, 64, rand(70, 85), 2.2, 0.958, grav * 0.35)
        }
        break
    }

    this.flash = Math.max(this.flash, big ? 1 : 0.55)
    this.flashHue = hue
    const loud = big ? 1 : rand(0.5, 0.8)
    this.sound.boom(loud, (x / this.w) * 2 - 1, big || r.kind === 'strobe' || r.kind === 'willow')
    if (big) navigator.vibrate?.(40)
  }

  private frame = (now: number) => {
    const dt = Math.min((now - (this.last || now)) / 16.67, 3)
    this.last = now
    this.update(dt)
    this.draw()
    this.raf = requestAnimationFrame(this.frame)
  }

  private update(dt: number) {
    const g = this.gravity()
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i]
      r.px = r.x; r.py = r.y
      r.vy += g * dt
      r.x += r.vx * dt
      r.y += r.vy * dt
      this.add(r.x, r.y, rand(-0.4, 0.4), rand(0.5, 1.5), 38, 100, 65, rand(14, 26), 1.4, 0.92, 0.04)
      if (r.vy >= -0.6) {
        this.rockets.splice(i, 1)
        this.burst(r)
      }
    }

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const p = this.sparks[i]
      const f = Math.pow(p.friction, dt)
      p.px = p.x; p.py = p.y
      p.vx *= f
      p.vy = p.vy * f + p.gravity * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.life += dt
      if (p.life >= p.ttl) {
        this.sparks[i] = this.sparks[this.sparks.length - 1]
        this.sparks.pop()
      }
    }
  }

  private draw() {
    const ctx = this.ctx
    // Fade previous frames to transparent so trails linger over the CSS sky
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = 'rgba(0,0,0,0.22)'
    ctx.fillRect(0, 0, this.w, this.h)

    ctx.globalCompositeOperation = 'lighter'
    if (this.flash > 0.02) {
      ctx.fillStyle = `hsla(${this.flashHue},90%,60%,${this.flash * 0.1})`
      ctx.fillRect(0, 0, this.w, this.h)
      this.flash *= 0.86
    }

    ctx.lineCap = 'round'
    for (const p of this.sparks) {
      const t = p.life / p.ttl
      if (p.strobe && t > 0.35 && Math.random() < 0.55) continue
      const alpha = 1 - t * t
      ctx.strokeStyle = `hsla(${p.hue},${p.sat}%,${p.light + (1 - t) * 18}%,${alpha})`
      ctx.lineWidth = p.width * (1 - t * 0.5)
      ctx.beginPath()
      ctx.moveTo(p.px, p.py)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
    }

    ctx.fillStyle = 'rgba(255,240,200,0.95)'
    for (const r of this.rockets) {
      ctx.beginPath()
      ctx.arc(r.x, r.y, 2.4, 0, TAU)
      ctx.fill()
    }
  }
}
