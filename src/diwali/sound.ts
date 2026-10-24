// All sounds are synthesized with Web Audio, so the page ships no audio files
type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }
type AudioSessionNavigator = Navigator & { audioSession?: { type: string } }

export class Sound {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noise: AudioBuffer | null = null
  private muted = false

  // Must run inside a user gesture, browsers keep audio locked until then
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as WebkitWindow).webkitAudioContext
      if (!AC) return
      // Lets iOS play through the silent switch, like a video would
      const nav = navigator as AudioSessionNavigator
      if (nav.audioSession) nav.audioSession.type = 'playback'

      const ctx = new AC()
      const comp = ctx.createDynamicsCompressor()
      comp.threshold.value = -14
      comp.ratio.value = 6
      comp.connect(ctx.destination)
      const master = ctx.createGain()
      master.gain.value = this.muted ? 0 : 0.9
      master.connect(comp)

      const len = ctx.sampleRate * 2
      const noise = ctx.createBuffer(1, len, ctx.sampleRate)
      const data = noise.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1

      this.ctx = ctx
      this.master = master
      this.noise = noise
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  }

  setMuted(muted: boolean) {
    this.muted = muted
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(muted ? 0 : 0.9, this.ctx.currentTime, 0.05)
  }

  private noiseSource() {
    const src = this.ctx!.createBufferSource()
    src.buffer = this.noise
    src.loop = true
    return src
  }

  private panner(pan: number) {
    const p = this.ctx!.createStereoPanner()
    p.pan.value = Math.max(-1, Math.min(1, pan))
    p.connect(this.master!)
    return p
  }

  // Sizzle of a burning fuse
  fuse(duration: number) {
    if (!this.ctx) return
    const ctx = this.ctx, t = ctx.currentTime
    const src = this.noiseSource()
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 4200
    bp.Q.value = 0.8
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    for (let s = 0; s < duration; s += 0.035) g.gain.setValueAtTime(0.05 + Math.random() * 0.12, t + s)
    g.gain.setValueAtTime(0, t + duration)
    src.connect(bp).connect(g).connect(this.master!)
    src.start(t, Math.random())
    src.stop(t + duration + 0.05)
  }

  // Rising whistle and hiss of a rocket climbing
  launch(duration: number, pan: number, whistle: boolean) {
    if (!this.ctx) return
    const ctx = this.ctx, t = ctx.currentTime
    const out = this.panner(pan)

    const src = this.noiseSource()
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.setValueAtTime(1200, t)
    bp.frequency.exponentialRampToValueAtTime(3200, t + duration)
    const hg = ctx.createGain()
    hg.gain.setValueAtTime(0.0001, t)
    hg.gain.exponentialRampToValueAtTime(0.12, t + 0.05)
    hg.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    src.connect(bp).connect(hg).connect(out)
    src.start(t, Math.random())
    src.stop(t + duration + 0.05)

    if (!whistle) return
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(700 + Math.random() * 300, t)
    osc.frequency.exponentialRampToValueAtTime(2000 + Math.random() * 600, t + duration)
    const wg = ctx.createGain()
    wg.gain.setValueAtTime(0.0001, t)
    wg.gain.exponentialRampToValueAtTime(0.045, t + 0.15)
    wg.gain.setValueAtTime(0.045, t + duration * 0.8)
    wg.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    osc.connect(wg).connect(out)
    osc.start(t)
    osc.stop(t + duration + 0.05)
  }

  // Burst: filtered noise blast plus a low thump, arriving slightly after the flash like real distance
  boom(intensity: number, pan: number, crackle: boolean) {
    if (!this.ctx) return
    const ctx = this.ctx
    const t = ctx.currentTime + 0.06 + Math.random() * 0.08
    const out = this.panner(pan)

    const src = this.noiseSource()
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(2400, t)
    lp.frequency.exponentialRampToValueAtTime(220, t + 0.9)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(intensity, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8)
    src.connect(lp).connect(g).connect(out)
    src.start(t, Math.random())
    src.stop(t + 1.9)

    const osc = ctx.createOscillator()
    osc.frequency.setValueAtTime(120, t)
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.35)
    const og = ctx.createGain()
    og.gain.setValueAtTime(0.0001, t)
    og.gain.exponentialRampToValueAtTime(intensity * 0.9, t + 0.01)
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
    osc.connect(og).connect(out)
    osc.start(t)
    osc.stop(t + 0.65)

    if (crackle) this.crackle(t + 0.35, 1.3, 28, out)
  }

  private crackle(start: number, duration: number, count: number, out: AudioNode) {
    const ctx = this.ctx!
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 2200
    hp.connect(out)
    for (let i = 0; i < count; i++) {
      const at = start + Math.random() * duration
      const src = this.noiseSource()
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, at)
      g.gain.exponentialRampToValueAtTime(0.08 + Math.random() * 0.2, at + 0.002)
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.03)
      src.connect(g).connect(hp)
      src.start(at, Math.random())
      src.stop(at + 0.04)
    }
  }
}
