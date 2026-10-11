import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/icons/Icon'
import type { IconName } from '@/components/icons/Icon'
import { Sheet } from '@/components/ui/Sheet'
import { SOUNDS } from '@/data/sounds'
import { audioEngine, describeAudioFailure, PREVIEW_SECONDS } from '@/lib/audio'
import { cn } from '@/lib/utils'
import { useToast } from '@/state/ToastContext'
import type { AlarmSound } from '@/types'

const FAMILY_ICON: Record<AlarmSound['family'], IconName> = {
  ambient: 'waves',
  rhythmic: 'bolt',
  melodic: 'sparkle',
  bell: 'bell',
}

interface SoundSelectorProps {
  open: boolean
  onClose: () => void
  value: string
  onSelect: (id: string) => void
  /** Previews use the alarm's own volume so the choice is representative. */
  volume: number
}

export function SoundSelector({ open, onClose, value, onSelect, volume }: SoundSelectorProps) {
  const [previewing, setPreviewing] = useState<string | null>(null)
  const timer = useRef<number | null>(null)
  const { notify } = useToast()

  const stopPreview = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    audioEngine.stop()
    setPreviewing(null)
  }

  // Never leave a preview sounding after the sheet goes away.
  useEffect(() => {
    if (!open) stopPreview()
    return () => stopPreview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const togglePreview = async (id: string) => {
    if (previewing === id) {
      stopPreview()
      return
    }
    stopPreview()
    setPreviewing(id)
    const result = await audioEngine.play(id, { volume, duration: PREVIEW_SECONDS })
    if (result !== true) {
      setPreviewing(null)
      notify(describeAudioFailure(result), { tone: 'danger' })
      return
    }
    timer.current = window.setTimeout(() => setPreviewing(null), PREVIEW_SECONDS * 1000)
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Alarm sound"
      description="Preview a tone, then choose the one you want to wake to."
    >
      <ul className="flex flex-col gap-2" role="radiogroup" aria-label="Alarm sound">
        {SOUNDS.map((sound) => {
          const selected = sound.id === value
          const isPreviewing = previewing === sound.id
          return (
            <li key={sound.id}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-[var(--r-md)] border px-3 py-2.5 transition-colors',
                  selected
                    ? 'border-[color:var(--c-border-active)] bg-[color:var(--c-surface-active)]'
                    : 'border-[color:var(--c-border)] bg-[color:var(--c-surface-input)] hover:bg-[color:var(--c-surface-hover)]',
                )}
              >
                <button
                  type="button"
                  onClick={() => void togglePreview(sound.id)}
                  aria-label={isPreviewing ? `Stop preview of ${sound.name}` : `Preview ${sound.name}`}
                  className={cn(
                    'press grid size-10 shrink-0 place-items-center rounded-full transition-colors',
                    isPreviewing
                      ? 'grad-primary text-white'
                      : 'border border-[color:var(--c-border)] text-ink-2 hover:text-ink',
                  )}
                >
                  <Icon name={isPreviewing ? 'pause' : 'play'} size={16} />
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onSelect(sound.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="type-title flex items-center gap-2">
                    {sound.name}
                    {isPreviewing && (
                      <span aria-hidden className="flex items-end gap-[2px]">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-[2px] origin-bottom rounded-full bg-accent"
                            style={{
                              height: 11,
                              animation: `bar-wave ${520 + i * 130}ms var(--ease-in-out) infinite`,
                            }}
                          />
                        ))}
                      </span>
                    )}
                  </span>
                  <span className="type-caption mt-0.5 flex items-center gap-1.5 text-ink-3">
                    <Icon name={FAMILY_ICON[sound.family]} size={13} />
                    {sound.description}
                  </span>
                </button>

                <span
                  className={cn(
                    'grid size-6 shrink-0 place-items-center rounded-full transition-all',
                    selected ? 'grad-primary text-white' : 'border border-[color:var(--c-border)]',
                  )}
                >
                  {selected && <Icon name="check" size={13} strokeWidth={2.4} />}
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="type-caption mt-4 text-ink-3">
        Tones are generated on the fly, so they work offline with nothing to download.
      </p>
    </Sheet>
  )
}
