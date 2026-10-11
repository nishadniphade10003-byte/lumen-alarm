import { cn } from '@/lib/utils'

type Mood = 'calm' | 'active' | 'sunrise' | 'night'

const MOOD_COLORS: Record<Mood, [string, string, string]> = {
  calm: ['var(--g-ambient-a)', 'var(--g-ambient-b)', 'var(--g-ambient-c)'],
  active: ['rgba(122,44,250,0.55)', 'rgba(255,107,139,0.4)', 'rgba(193,58,232,0.45)'],
  sunrise: ['rgba(249,97,95,0.4)', 'rgba(255,214,132,0.32)', 'rgba(249,160,63,0.34)'],
  night: ['rgba(46,31,94,0.6)', 'rgba(27,27,75,0.5)', 'rgba(88,62,240,0.28)'],
}

/**
 * The atmospheric base layer: three very soft light fields that drift slowly
 * behind everything else. Pure CSS gradients — no filters — so it stays cheap
 * to composite, and it stands still entirely under reduced-motion.
 */
export function Ambient({ mood = 'calm', className }: { mood?: Mood; className?: string }) {
  const [a, b, c] = MOOD_COLORS[mood]

  return (
    <div aria-hidden className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden', className)}>
      <div className="absolute inset-0 bg-[color:var(--c-bg-deep)]" />

      {/* Base tonal wash so the "black" never reads as flat */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: `radial-gradient(120% 80% at 50% 0%, var(--c-bg-base) 0%, var(--c-bg-deep) 68%)`,
        }}
      />

      <div
        className="anim-float absolute -left-[22%] -top-[18%] size-[78vmax] rounded-full"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${a} 0%, transparent 62%)`,
          animationDuration: '30s',
        }}
      />
      <div
        className="anim-float absolute -bottom-[26%] -right-[20%] size-[70vmax] rounded-full"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${b} 0%, transparent 62%)`,
          animationDuration: '38s',
          animationDelay: '-12s',
        }}
      />
      <div
        className="anim-float absolute left-[38%] top-[26%] size-[46vmax] rounded-full"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${c} 0%, transparent 64%)`,
          animationDuration: '44s',
          animationDelay: '-22s',
        }}
      />

      {/* Fine grain keeps large gradients from banding on wide displays */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}
