import type { CountdownSound } from '../data/types'

export type SoundCue = 'tick' | 'go' | 'switchSides' | 'rest' | 'finish'
const CUES: SoundCue[] = ['tick', 'go', 'switchSides', 'rest', 'finish']

/**
 * Timer cues for the web — a port of the native `ToneSynth` (additive synthesis of struck-metal
 * partials) played through Web Audio.
 *
 * Mixing with other audio: where the Audio Session API exists (Safari 16.4+), the session type is
 * set to `transient`, which asks iOS to *duck* other audio (Spotify, Music) instead of stopping it.
 * Elsewhere, Web Audio simply mixes over whatever is playing.
 */

const SAMPLE_RATE = 44_100

interface Overtone {
  ratio: number
  amp: number
  decay: number
}

const gongPartials: Overtone[] = [
  { ratio: 1.0, amp: 1.0, decay: 1.5 },
  { ratio: 1.52, amp: 0.55, decay: 1.1 },
  { ratio: 2.0, amp: 0.42, decay: 0.95 },
  { ratio: 2.63, amp: 0.3, decay: 0.7 },
  { ratio: 3.21, amp: 0.22, decay: 0.5 },
  { ratio: 4.15, amp: 0.14, decay: 0.34 },
  { ratio: 5.43, amp: 0.08, decay: 0.22 },
]
const bowlPartials: Overtone[] = [
  { ratio: 1.0, amp: 1.0, decay: 0.26 },
  { ratio: 2.76, amp: 0.38, decay: 0.14 },
  { ratio: 5.4, amp: 0.16, decay: 0.07 },
]
const bellPartials: Overtone[] = [
  { ratio: 1.0, amp: 1.0, decay: 0.45 },
  { ratio: 2.0, amp: 0.45, decay: 0.32 },
  { ratio: 2.99, amp: 0.3, decay: 0.22 },
  { ratio: 4.2, amp: 0.16, decay: 0.12 },
  { ratio: 5.43, amp: 0.09, decay: 0.08 },
]
const sinePartials: Overtone[] = [
  { ratio: 1.0, amp: 1.0, decay: 0.3 },
  { ratio: 2.0, amp: 0.1, decay: 0.16 },
  { ratio: 3.0, amp: 0.03, decay: 0.08 },
]

const scaled = (partials: Overtone[], factor: number) => partials.map((p) => ({ ...p, decay: p.decay * factor }))
const buffer = (seconds: number) => new Float32Array(Math.floor(seconds * SAMPLE_RATE))

function strike(out: Float32Array, start: number, freq: number, partials: Overtone[], gain: number, attack = 0.003, shimmer = 0) {
  const startIndex = Math.floor(start * SAMPLE_RATE)
  if (startIndex >= out.length) return
  const longest = Math.max(...partials.map((p) => p.decay))
  const length = Math.min(out.length - startIndex, Math.floor(longest * 7 * SAMPLE_RATE))
  const twoPi = Math.PI * 2
  for (let n = 0; n < length; n++) {
    const t = n / SAMPLE_RATE
    const envelope = Math.min(1, t / attack)
    let value = 0
    for (const p of partials) {
      const f = freq * p.ratio
      const decay = Math.exp(-t / p.decay)
      value += p.amp * decay * Math.sin(twoPi * f * t)
      if (shimmer > 0) value += p.amp * 0.35 * decay * Math.sin(twoPi * (f + shimmer) * t)
    }
    out[startIndex + n] += value * envelope * gain
  }
}

function finalize(samples: Float32Array, peak: number): Float32Array {
  let max = 0
  for (let i = 0; i < samples.length; i++) max = Math.max(max, Math.abs(samples[i]))
  if (max > 0) for (let i = 0; i < samples.length; i++) samples[i] *= peak / max
  const fade = Math.min(samples.length, Math.floor(0.03 * SAMPLE_RATE))
  for (let i = 0; i < fade; i++) samples[samples.length - fade + i] *= (fade - i) / fade
  return samples
}

function render(theme: CountdownSound, cue: SoundCue): Float32Array {
  switch (theme) {
    case 'gong': {
      switch (cue) {
        case 'tick': { const b = buffer(0.55); strike(b, 0, 587.3, bowlPartials, 1); return finalize(b, 0.5) }
        case 'go': { const b = buffer(2.6); strike(b, 0, 220, gongPartials, 1, 0.006, 0.9); return finalize(b, 0.85) }
        case 'switchSides': { const b = buffer(0.8); strike(b, 0, 698.5, bowlPartials, 1); strike(b, 0.18, 698.5, bowlPartials, 0.8); return finalize(b, 0.55) }
        case 'rest': { const b = buffer(1.4); strike(b, 0, 392, scaled(bowlPartials, 3), 1, 0.01); return finalize(b, 0.45) }
        case 'finish': { const b = buffer(3.4); strike(b, 0, 220, gongPartials, 1, 0.006, 0.9); strike(b, 0.5, 293.7, gongPartials, 0.8, 0.006, 1.1); return finalize(b, 0.9) }
      }
      break
    }
    case 'jingle': {
      const short = scaled(bellPartials, 0.4)
      switch (cue) {
        case 'tick': { const b = buffer(0.35); strike(b, 0, 1318.5, short, 1); return finalize(b, 0.42) }
        case 'go': { const b = buffer(1.3); [1046.5, 1318.5, 1568].forEach((f, i) => strike(b, i * 0.075, f, bellPartials, 1 - i * 0.1)); return finalize(b, 0.7) }
        case 'switchSides': { const b = buffer(0.7); strike(b, 0, 1568, short, 1); strike(b, 0.12, 1318.5, short, 0.9); return finalize(b, 0.5) }
        case 'rest': { const b = buffer(1.0); strike(b, 0, 784, bellPartials, 1); strike(b, 0.15, 659.3, bellPartials, 0.85); return finalize(b, 0.45) }
        case 'finish': { const b = buffer(2.0); [1046.5, 1318.5, 1568, 2093].forEach((f, i) => strike(b, i * 0.1, f, scaled(bellPartials, 1.6), 1, 0.003, 2.5)); return finalize(b, 0.8) }
      }
      break
    }
    case 'smooth': {
      switch (cue) {
        case 'tick': { const b = buffer(0.3); strike(b, 0, 880, scaled(sinePartials, 0.35), 1, 0.008); return finalize(b, 0.45) }
        case 'go': { const b = buffer(1.1); strike(b, 0, 880, sinePartials, 0.9, 0.01); strike(b, 0.11, 1318.5, scaled(sinePartials, 1.6), 1, 0.01); return finalize(b, 0.65) }
        case 'switchSides': { const b = buffer(0.6); const p = scaled(sinePartials, 0.5); strike(b, 0, 1046.5, p, 1, 0.008); strike(b, 0.16, 1046.5, p, 1, 0.008); return finalize(b, 0.5) }
        case 'rest': { const b = buffer(0.9); strike(b, 0, 659.3, sinePartials, 1, 0.012); strike(b, 0.14, 523.3, scaled(sinePartials, 1.5), 1, 0.012); return finalize(b, 0.42) }
        case 'finish': {
          const b = buffer(2.2)
          const chord = scaled(sinePartials, 3)
          strike(b, 0, 523.3, chord, 0.8, 0.015)
          strike(b, 0.07, 659.3, chord, 0.8, 0.015)
          strike(b, 0.14, 784, chord, 0.8, 0.015)
          strike(b, 0.32, 1046.5, chord, 1, 0.015)
          return finalize(b, 0.7)
        }
      }
      break
    }
  }
  return buffer(0.05)
}

type AudioSessionNavigator = Navigator & { audioSession?: { type: string } }

class AudioEngine {
  private context: AudioContext | null = null
  private buffers = new Map<string, AudioBuffer>()
  private rendering = new Set<string>()

  /** Must be called from a user gesture (tap) — required by iOS/Chrome autoplay policies. */
  unlock() {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    if (!this.context) this.context = new Ctor({ latencyHint: 'interactive' })
    if (this.context.state === 'suspended') void this.context.resume()
    // Play one silent sample so iOS fully unlocks output inside this gesture.
    const silent = this.context.createBuffer(1, 1, this.context.sampleRate)
    const source = this.context.createBufferSource()
    source.buffer = silent
    source.connect(this.context.destination)
    source.start()
  }

  /** Ask the OS to duck (not stop) other audio while Kiai cues play. */
  setWorkoutSession(active: boolean) {
    const session = (navigator as AudioSessionNavigator).audioSession
    if (!session) return
    try {
      session.type = active ? 'transient' : 'auto'
    } catch {
      /* unsupported */
    }
  }

  /** Renders a theme's cues in small idle chunks so the UI never drops a frame. */
  prepare(theme: CountdownSound) {
    CUES.forEach((cue, index) => {
      const key = `${theme}_${cue}`
      if (this.buffers.has(key) || this.rendering.has(key)) return
      this.rendering.add(key)
      window.setTimeout(() => {
        this.ensure(theme, cue)
        this.rendering.delete(key)
      }, 60 + index * 40)
    })
  }

  private ensure(theme: CountdownSound, cue: SoundCue): AudioBuffer | null {
    const key = `${theme}_${cue}`
    const cached = this.buffers.get(key)
    if (cached) return cached
    if (!this.context) return null
    const samples = render(theme, cue)
    const audioBuffer = this.context.createBuffer(1, samples.length, SAMPLE_RATE)
    audioBuffer.getChannelData(0).set(samples)
    this.buffers.set(key, audioBuffer)
    return audioBuffer
  }

  play(cue: SoundCue, theme: CountdownSound) {
    if (!this.context) return
    if (this.context.state === 'suspended') void this.context.resume()
    const audioBuffer = this.ensure(theme, cue)
    if (!audioBuffer) return
    const source = this.context.createBufferSource()
    source.buffer = audioBuffer
    source.connect(this.context.destination)
    source.start()
  }
}

export const audio = new AudioEngine()
