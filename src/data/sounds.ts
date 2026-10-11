import type { AlarmSound } from '@/types'

/**
 * Built-in tones. Each is synthesised at runtime by the audio engine (see
 * lib/audio.ts) so the app ships with real, previewable sound and no binary
 * assets. To swap in recorded audio later, give a sound a `src` and branch in
 * the engine — the rest of the app only ever refers to `id`.
 */
export const SOUNDS: AlarmSound[] = [
  { id: 'aurora', name: 'Aurora', description: 'Drifting pads, slow bloom', family: 'ambient' },
  { id: 'pulse', name: 'Pulse', description: 'Steady, insistent beat', family: 'rhythmic' },
  { id: 'morning-light', name: 'Morning Light', description: 'Warm rising arpeggio', family: 'melodic' },
  { id: 'horizon', name: 'Horizon', description: 'Low swell with shimmer', family: 'ambient' },
  { id: 'soft-rise', name: 'Soft Rise', description: 'Gentle ascending tones', family: 'melodic' },
  { id: 'digital-dawn', name: 'Digital Dawn', description: 'Crisp electronic motif', family: 'rhythmic' },
  { id: 'focus', name: 'Focus', description: 'Two-tone alternating call', family: 'rhythmic' },
  { id: 'classic-bell', name: 'Classic Bell', description: 'Struck bell with long tail', family: 'bell' },
]

export const DEFAULT_SOUND_ID = 'aurora'

export function getSound(id: string): AlarmSound {
  return SOUNDS.find((s) => s.id === id) ?? SOUNDS[0]
}

export function soundName(id: string): string {
  return getSound(id).name
}
