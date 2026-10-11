/**
 * Alarm audio engine.
 *
 * Every built-in tone is synthesised with the Web Audio API rather than shipped
 * as a binary, so previews and alarms produce real sound with no assets to
 * load. Each patch is a short loop of scheduled notes; a look-ahead scheduler
 * queues the next loop slightly before it is needed, which keeps timing sample
 * accurate without a JavaScript animation loop.
 *
 * To move to recorded audio later, only `startPatch`/`stopPatch` need to change
 * — the rest of the app addresses sounds by id alone.
 */

interface NoteSpec {
  /** Offset from the start of the loop, in seconds. */
  at: number
  freq: number
  /** Note length in seconds, including release. */
  dur: number
  type: OscillatorType
  /** Peak gain, 0–1, before the master volume is applied. */
  gain: number
  /** Attack time in seconds. Long attacks give pads their bloom. */
  attack: number
}

interface PatchSpec {
  /** Loop length in seconds. */
  period: number
  notes: NoteSpec[]
  /** Optional low-pass cutoff to soften bright waveforms. */
  cutoff?: number
}

const note = (
  at: number,
  freq: number,
  dur: number,
  gain: number,
  type: OscillatorType = 'sine',
  attack = 0.01,
): NoteSpec => ({ at, freq, dur, gain, type, attack })

/** A struck-bell voice: harmonic partials that decay at different rates. */
function bell(at: number, root: number, gain: number): NoteSpec[] {
  const partials: Array<[number, number, number]> = [
    [1, 1, 2.6],
    [2.76, 0.5, 1.8],
    [5.4, 0.28, 1.1],
    [8.93, 0.16, 0.6],
  ]
  return partials.map(([ratio, level, decay]) =>
    note(at, root * ratio, decay, gain * level, 'sine', 0.004),
  )
}

const PATCHES: Record<string, PatchSpec> = {
  // Drifting pad chord that blooms and recedes.
  aurora: {
    period: 6,
    notes: [
      note(0, 220, 5.6, 0.16, 'sine', 1.3),
      note(0.15, 277.18, 5.4, 0.13, 'sine', 1.5),
      note(0.3, 329.63, 5.2, 0.12, 'sine', 1.7),
      note(1.2, 659.25, 3.4, 0.05, 'sine', 1.1),
      note(3, 880, 2.6, 0.035, 'sine', 0.9),
    ],
  },
  // Insistent four-to-the-floor pulse with an accented downbeat.
  pulse: {
    period: 2,
    notes: [
      note(0, 440, 0.26, 0.34, 'sine', 0.004),
      note(0, 220, 0.3, 0.2, 'sine', 0.004),
      note(0.5, 660, 0.2, 0.22, 'sine', 0.004),
      note(1, 660, 0.2, 0.26, 'sine', 0.004),
      note(1.5, 660, 0.2, 0.22, 'sine', 0.004),
    ],
  },
  // Warm major arpeggio, played twice per loop.
  'morning-light': {
    period: 4,
    cutoff: 4200,
    notes: [
      note(0, 523.25, 1.1, 0.24, 'triangle', 0.02),
      note(0.28, 659.25, 1.1, 0.22, 'triangle', 0.02),
      note(0.56, 783.99, 1.1, 0.2, 'triangle', 0.02),
      note(0.84, 1046.5, 1.4, 0.18, 'triangle', 0.02),
      note(2, 523.25, 1.1, 0.2, 'triangle', 0.02),
      note(2.28, 659.25, 1.1, 0.18, 'triangle', 0.02),
      note(2.56, 783.99, 1.4, 0.16, 'triangle', 0.02),
    ],
  },
  // Low swell under a distant shimmer.
  horizon: {
    period: 8,
    notes: [
      note(0, 110, 7.4, 0.24, 'sine', 2.2),
      note(0.4, 164.81, 7, 0.15, 'sine', 2.4),
      note(2, 1318.51, 4, 0.03, 'sine', 1.6),
      note(4.5, 987.77, 3.2, 0.035, 'sine', 1.3),
    ],
  },
  // A calm ladder of tones, each a little brighter than the last.
  'soft-rise': {
    period: 5,
    notes: [
      note(0, 392, 1.5, 0.16, 'sine', 0.5),
      note(0.6, 440, 1.5, 0.18, 'sine', 0.5),
      note(1.2, 493.88, 1.5, 0.2, 'sine', 0.5),
      note(1.8, 587.33, 1.6, 0.22, 'sine', 0.5),
      note(2.4, 659.25, 2, 0.24, 'sine', 0.5),
    ],
  },
  // Crisp electronic motif with a sub underneath.
  'digital-dawn': {
    period: 2.4,
    cutoff: 2600,
    notes: [
      note(0, 880, 0.12, 0.2, 'square', 0.003),
      note(0.15, 1174.66, 0.12, 0.18, 'square', 0.003),
      note(0.3, 1567.98, 0.16, 0.16, 'square', 0.003),
      note(0.6, 1174.66, 0.12, 0.14, 'square', 0.003),
      note(0, 110, 0.5, 0.22, 'sine', 0.006),
      note(1.2, 110, 0.5, 0.18, 'sine', 0.006),
    ],
  },
  // Two-tone alternating call, the classic "attention" cadence.
  focus: {
    period: 1.6,
    notes: [
      note(0, 783.99, 0.34, 0.26, 'triangle', 0.008),
      note(0.5, 587.33, 0.34, 0.26, 'triangle', 0.008),
    ],
  },
  // Struck bell, twice per loop, with a long tail.
  'classic-bell': {
    period: 2.4,
    notes: [...bell(0, 523.25, 0.4), ...bell(1.2, 523.25, 0.3)],
  },
}

export const PREVIEW_SECONDS = 4

export interface PlayOptions {
  /** 0–1 target volume. */
  volume: number
  /** Ramp from near-silence up to `volume` instead of starting there. */
  gradual?: boolean
  gradualSeconds?: number
  /** Stop automatically after this many seconds (used by previews). */
  duration?: number
}

export type AudioFailure = 'blocked' | 'unsupported' | 'error'

type ContextCtor = typeof AudioContext

function getContextCtor(): ContextCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { AudioContext?: ContextCtor; webkitAudioContext?: ContextCtor }
  return w.AudioContext ?? w.webkitAudioContext ?? null
}

const SCHEDULE_INTERVAL_MS = 120
const LOOKAHEAD_S = 0.5
const MIN_GAIN = 0.0001

class AlarmAudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private voices: Array<{ osc: OscillatorNode; gain: GainNode }> = []
  private timer: number | null = null
  private stopTimer: number | null = null
  private patch: PatchSpec | null = null
  private nextLoopAt = 0
  private targetVolume = 0.7
  private currentSoundId: string | null = null

  /** Which sound is sounding right now, or null when silent. */
  get playingId(): string | null {
    return this.currentSoundId
  }

  /** True when the browser has no Web Audio support at all. */
  get supported(): boolean {
    return getContextCtor() !== null
  }

  /**
   * Browsers start an AudioContext suspended until a user gesture. Call this
   * from any early interaction so the first alarm is not silent.
   */
  async unlock(): Promise<boolean> {
    const ctx = this.ensureContext()
    if (!ctx) return false
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch {
        return false
      }
    }
    return ctx.state === 'running'
  }

  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx
    const Ctor = getContextCtor()
    if (!Ctor) return null
    try {
      const ctx = new Ctor()
      const master = ctx.createGain()
      master.gain.value = MIN_GAIN
      // A gentle limiter keeps stacked partials from clipping at high volume.
      const comp = ctx.createDynamicsCompressor()
      comp.threshold.value = -12
      comp.ratio.value = 8
      master.connect(comp).connect(ctx.destination)
      this.ctx = ctx
      this.master = master
      return ctx
    } catch {
      return null
    }
  }

  private scheduleLoop(startAt: number): void {
    const ctx = this.ctx
    const master = this.master
    const patch = this.patch
    if (!ctx || !master || !patch) return

    let destination: AudioNode = master
    if (patch.cutoff) {
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = patch.cutoff
      filter.connect(master)
      destination = filter
    }

    for (const spec of patch.notes) {
      const start = startAt + spec.at
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = spec.type
      osc.frequency.setValueAtTime(spec.freq, start)

      const attack = Math.min(spec.attack, spec.dur * 0.5)
      gain.gain.setValueAtTime(MIN_GAIN, start)
      gain.gain.linearRampToValueAtTime(spec.gain, start + attack)
      gain.gain.exponentialRampToValueAtTime(MIN_GAIN, start + spec.dur)

      osc.connect(gain).connect(destination)
      osc.start(start)
      osc.stop(start + spec.dur + 0.05)

      const voice = { osc, gain }
      this.voices.push(voice)
      osc.onended = () => {
        try {
          gain.disconnect()
          osc.disconnect()
        } catch {
          /* already torn down */
        }
        this.voices = this.voices.filter((v) => v !== voice)
      }
    }
  }

  private tick = (): void => {
    const ctx = this.ctx
    if (!ctx || !this.patch) return
    while (this.nextLoopAt < ctx.currentTime + LOOKAHEAD_S) {
      this.scheduleLoop(this.nextLoopAt)
      this.nextLoopAt += this.patch.period
    }
  }

  /**
   * Start a looping tone. Resolves to `true` on success, or an
   * {@link AudioFailure} describing why nothing is audible — the caller is
   * expected to surface that rather than let the alarm fail silently.
   */
  async play(soundId: string, options: PlayOptions): Promise<true | AudioFailure> {
    const patch = PATCHES[soundId] ?? PATCHES.aurora
    const ctx = this.ensureContext()
    if (!ctx || !this.master) return 'unsupported'

    this.stop({ immediate: true })

    try {
      if (ctx.state === 'suspended') await ctx.resume()
    } catch {
      return 'blocked'
    }
    if (ctx.state !== 'running') return 'blocked'

    try {
      this.patch = patch
      this.currentSoundId = soundId
      this.targetVolume = Math.max(0.02, Math.min(1, options.volume))

      const now = ctx.currentTime
      const gain = this.master.gain
      gain.cancelScheduledValues(now)

      if (options.gradual && (options.gradualSeconds ?? 0) > 0) {
        // Start close to silence and climb — a wake-up, not a jolt.
        gain.setValueAtTime(Math.max(MIN_GAIN, this.targetVolume * 0.05), now)
        gain.exponentialRampToValueAtTime(
          this.targetVolume,
          now + (options.gradualSeconds ?? 30),
        )
      } else {
        gain.setValueAtTime(MIN_GAIN, now)
        gain.linearRampToValueAtTime(this.targetVolume, now + 0.06)
      }

      this.nextLoopAt = now + 0.06
      this.tick()
      this.timer = window.setInterval(this.tick, SCHEDULE_INTERVAL_MS)

      if (options.duration) {
        this.stopTimer = window.setTimeout(() => this.stop(), options.duration * 1000)
      }
      return true
    } catch {
      this.stop({ immediate: true })
      return 'error'
    }
  }

  /** Retarget the volume of an in-flight tone (live slider feedback). */
  setVolume(volume: number): void {
    this.targetVolume = Math.max(0.02, Math.min(1, volume))
    if (!this.ctx || !this.master || !this.currentSoundId) return
    this.master.gain.cancelScheduledValues(this.ctx.currentTime)
    this.master.gain.setTargetAtTime(this.targetVolume, this.ctx.currentTime, 0.05)
  }

  /** Fade out and tear down. `immediate` cuts the tail for instant restarts. */
  stop(options: { immediate?: boolean } = {}): void {
    if (this.timer !== null) {
      window.clearInterval(this.timer)
      this.timer = null
    }
    if (this.stopTimer !== null) {
      window.clearTimeout(this.stopTimer)
      this.stopTimer = null
    }
    this.patch = null
    this.currentSoundId = null

    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return

    const now = ctx.currentTime
    const release = options.immediate ? 0.01 : 0.22
    try {
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(Math.max(MIN_GAIN, master.gain.value), now)
      master.gain.exponentialRampToValueAtTime(MIN_GAIN, now + release)
    } catch {
      /* context may already be closed */
    }

    const voices = this.voices
    this.voices = []
    window.setTimeout(() => {
      for (const { osc } of voices) {
        try {
          osc.stop()
        } catch {
          /* already stopped */
        }
      }
    }, release * 1000 + 20)
  }
}

/** Single shared engine — only one alarm or preview sounds at a time. */
export const audioEngine = new AlarmAudioEngine()

export function describeAudioFailure(failure: AudioFailure): string {
  switch (failure) {
    case 'blocked':
      return 'Sound is blocked until you interact with the page'
    case 'unsupported':
      return 'Audio is not supported in this browser'
    default:
      return 'Could not play the alarm sound'
  }
}
