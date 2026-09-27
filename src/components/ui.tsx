import { type CSSProperties, type ReactNode, useId } from 'react'
import { difficultyMeta, tintColor } from '../data/meta'
import type { Rank } from '../data/levels'
import { haptic } from '../lib/haptics'
import { Icon } from './Icon'

type Tinted = { tint?: string }
const tintStyle = (tint: string | undefined, extra?: CSSProperties): CSSProperties =>
  ({ ...(tint ? { '--tint': tint } : null), ...extra }) as CSSProperties

// Brand --------------------------------------------------------------------------------------------

/**
 * The Kiai mark: a single tapered brushstroke swept most of the way around a circle, like an
 * ensō painted in one confident stroke that lifts off toward the end, plus the spark it left
 * behind. A fixed path (not a uniform stroked circle) — the taper is what makes it read as ink
 * rather than a progress ring. Mirrors DesignSystem/KiaiLogo.swift's `BrushstrokeRing` exactly.
 */
export function KiaiMark({ size = 32, tint, className }: { size?: number; tint?: string; className?: string }) {
  return (
    <svg className={`kiai-mark ${className ?? ''}`} viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" style={tintStyle(tint)}>
      <path
        className="kiai-mark-stroke"
        d="M14.49 5.23 L15.54 4.83 L16.67 4.15 L17.88 3.96 L19.06 4.18 L20.21 4.52 L21.32 4.97 L22.39 5.52 L23.39 6.19 L24.33 6.95 L25.19 7.80 L25.96 8.73 L26.64 9.73 L27.22 10.80 L27.68 11.92 L28.04 13.08 L28.27 14.27 L28.39 15.49 L28.39 16.70 L28.27 17.92 L28.02 19.11 L27.66 20.27 L27.19 21.40 L26.60 22.47 L25.92 23.47 L25.13 24.41 L24.26 25.26 L23.31 26.02 L22.29 26.68 L21.21 27.23 L20.08 27.68 L18.91 28.01 L17.72 28.22 L16.51 28.32 L15.30 28.30 L14.10 28.15 L12.94 27.85 L11.82 27.40 L10.78 26.83 L9.81 26.14 L8.94 25.37 L8.16 24.52 L7.48 23.60 L6.89 22.65 L6.40 21.66 L5.99 20.64 L5.66 19.61 L5.41 18.57 L5.23 17.51 L5.38 17.49 L5.60 18.52 L5.95 19.51 L6.42 20.44 L6.99 21.31 L7.66 22.09 L8.40 22.78 L9.21 23.38 L10.06 23.88 L10.94 24.30 L11.84 24.63 L12.75 24.88 L13.66 25.07 L14.56 25.19 L15.47 25.27 L16.38 25.26 L17.29 25.16 L18.18 24.98 L19.04 24.71 L19.88 24.36 L20.67 23.93 L21.42 23.43 L22.12 22.86 L22.76 22.22 L23.33 21.53 L23.84 20.78 L24.27 19.99 L24.62 19.16 L24.89 18.30 L25.08 17.42 L25.18 16.52 L25.19 15.62 L25.12 14.72 L24.96 13.83 L24.71 12.96 L24.38 12.11 L23.97 11.31 L23.48 10.54 L22.92 9.82 L22.29 9.16 L21.60 8.56 L20.86 8.03 L20.06 7.58 L19.22 7.20 L18.35 6.91 L17.45 6.70 L16.55 6.28 L15.57 5.58 L14.51 5.38 Z"
      />
      <circle className="kiai-mark-dot" cx="16" cy="16" r="2.3" />
    </svg>
  )
}

/**
 * Hand-drawn flame (two nested teardrops, warm gradient, soft glow) standing in for a plain flame
 * icon wherever the streak is the hero of the moment. Mirrors DesignSystem/EmberBadge.swift.
 */
export function EmberBadge({ lit, size = 20 }: { lit: boolean; size?: number }) {
  return (
    <svg
      className={`ember-badge ${lit ? 'lit' : ''}`}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ember-outer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold)" />
          <stop offset="100%" stopColor="var(--ember)" />
        </linearGradient>
        <linearGradient id="ember-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <path
        className="ember-outer"
        d="M12.00 0.48 C19.20 3.84 22.56 9.12 20.88 14.40 C19.20 20.64 15.84 23.52 12.00 23.52 C7.68 23.52 3.36 20.40 3.12 15.36 C3.84 12.00 7.92 12.00 8.40 9.60 C9.60 6.24 6.72 3.12 12.00 0.48 Z"
      />
      <path
        className="ember-inner"
        d="M12.00 14.17 C15.74 15.92 17.49 18.66 16.62 21.41 C15.74 24.65 14.00 26.15 12.00 26.15 C9.75 26.15 7.51 24.53 7.38 21.91 C7.76 20.16 9.88 20.16 10.13 18.91 C10.75 17.16 9.25 15.54 12.00 14.17 Z"
      />
    </svg>
  )
}

export function KiaiLogo({ size = 28 }: { size?: number }) {
  return (
    <div className="kiai-logo" aria-label="Kiai" role="img">
      <KiaiMark size={size} />
      <span className="kiai-wordmark" style={{ fontSize: size * 0.62 }}>KIAI</span>
    </div>
  )
}

// Buttons ------------------------------------------------------------------------------------------

interface ButtonProps extends Tinted {
  children: ReactNode
  onClick?: () => void
  icon?: string
  disabled?: boolean
  full?: boolean
  className?: string
  type?: 'button' | 'submit'
  ariaLabel?: string
}

export function PrimaryButton({ children, onClick, icon, disabled, full = true, tint, className, ariaLabel }: ButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn-primary ${full ? 'btn-full' : ''} ${className ?? ''}`}
      style={tintStyle(tint)}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={() => {
        haptic('medium')
        onClick?.()
      }}
    >
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
    </button>
  )
}

export function SecondaryButton({ children, onClick, icon, disabled, full = true, tint, className, ariaLabel }: ButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn-secondary ${full ? 'btn-full' : ''} ${className ?? ''}`}
      style={tintStyle(tint)}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={() => {
        haptic('light')
        onClick?.()
      }}
    >
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
    </button>
  )
}

/** Circular Liquid Glass control (player, nav bars). */
export function GlassIconButton({
  icon, label, onClick, size = 44, iconSize = 18, className, disabled,
}: { icon: string; label: string; onClick: () => void; size?: number; iconSize?: number; className?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      className={`glass glass-icon-btn pressable ${className ?? ''}`}
      style={{ width: size, height: size }}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={() => {
        haptic('light')
        onClick()
      }}
    >
      <Icon name={icon} size={iconSize} strokeWidth={2.4} />
    </button>
  )
}

export function TextButton({ children, onClick, tint, className }: { children: ReactNode; onClick: () => void; tint?: string; className?: string }) {
  return (
    <button type="button" className={`text-btn ${className ?? ''}`} style={tintStyle(tint)} onClick={onClick}>
      {children}
    </button>
  )
}

// Surfaces -----------------------------------------------------------------------------------------

export function Card({ children, className, style, padding }: { children: ReactNode; className?: string; style?: CSSProperties; padding?: number }) {
  return (
    <div className={`card ${className ?? ''}`} style={{ ...(padding !== undefined ? { padding } : null), ...style }}>
      {children}
    </div>
  )
}

export function SectionHeader({ title, trailing }: { title: string; trailing?: ReactNode }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {trailing && <div className="section-header-trailing">{trailing}</div>}
    </div>
  )
}

export function Eyebrow({ children, tint }: { children: ReactNode; tint?: string }) {
  return (
    <span className="eyebrow" style={tint ? { color: tint } : undefined}>
      {children}
    </span>
  )
}

// Indicators ---------------------------------------------------------------------------------------

export function ProgressBar({ value, tint, height = 8, label }: { value: number; tint?: string; height?: number; label?: string }) {
  const clamped = Math.min(Math.max(value, 0), 1)
  return (
    <div
      className="progress"
      style={tintStyle(tint, { height })}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
    >
      <div className="progress-fill" style={{ transform: `scaleX(${clamped})`, opacity: clamped > 0 ? 1 : 0 }} />
    </div>
  )
}

export function TagChip({ text, icon, tint, filled }: { text: string; icon?: string; tint?: string; filled?: boolean }) {
  return (
    <span className={`chip ${filled ? 'chip-filled' : ''}`} style={tintStyle(tint)}>
      {icon && <Icon name={icon} size={12} strokeWidth={2.6} />}
      {text}
    </span>
  )
}

export function DifficultyBadge({ difficulty, pill }: { difficulty: string; pill?: boolean }) {
  const meta = difficultyMeta(difficulty)
  return (
    <span className={`difficulty ${pill ? 'difficulty-pill' : ''}`} style={tintStyle(meta.tint)} aria-label={meta.title}>
      <span className="difficulty-bars" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <i key={i} className={i < meta.level ? 'on' : ''} />
        ))}
      </span>
      {meta.title}
    </span>
  )
}

export function SymbolTile({ icon, tint, size = 48 }: { icon: string; tint?: string; size?: number }) {
  return (
    <span className="symbol-tile" style={tintStyle(tint, { width: size, height: size, borderRadius: size * 0.3 })}>
      <Icon name={icon} size={Math.round(size * 0.5)} strokeWidth={size >= 56 ? 1.8 : 2} />
    </span>
  )
}

export function StatTile({
  title,
  value,
  caption,
  icon,
  tint,
  onClick,
}: {
  title: string
  value: string
  caption?: string
  icon: string
  tint?: string
  onClick?: () => void
}) {
  if (onClick) {
    return (
      <button
        type="button"
        className="card stat-tile pressable"
        style={{ ...tintStyle(tint), cursor: 'pointer', textAlign: 'left', border: 'none' }}
        onClick={onClick}
      >
        <span className="stat-icon">
          <Icon name={icon} size={15} />
        </span>
        <span className={`stat-value ${value.length > 7 && !/^[\d:+%.,\s]+$/.test(value) ? 'text-value' : ''}`}>{value}</span>
        <span className="stat-title">{title}</span>
        {caption && <span className="stat-caption">{caption}</span>}
      </button>
    )
  }
  return (
    <div className="card stat-tile" style={tintStyle(tint)}>
      <span className="stat-icon">
        <Icon name={icon} size={15} />
      </span>
      <span className={`stat-value ${value.length > 7 && !/^[\d:+%.,\s]+$/.test(value) ? 'text-value' : ''}`}>{value}</span>
      <span className="stat-title">{title}</span>
      {caption && <span className="stat-caption">{caption}</span>}
    </div>
  )
}

export function RankEmblem({ rank, size = 48 }: { rank: Rank; size?: number }) {
  return (
    <span className="rank-emblem" style={tintStyle(rank.color, { width: size, height: size })} aria-hidden="true">
      {rank.id === 'literalGod' ? (
        <Icon name="sparkles" size={size * 0.46} />
      ) : (
        <span style={{ fontSize: size * 0.42 }}>{rank.level}</span>
      )}
    </span>
  )
}

export function Avatar({
  name, src, symbol, tint, size = 44,
}: { name: string; src: string | null; symbol?: string | null; tint?: string | null; size?: number }) {
  const letters = name.trim() ? name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase() : 'K'
  // 1.15: real photo > generated icon (from onboarding) > initials.
  return (
    <span className="avatar" style={tintStyle(tint ? tintColor(tint) : undefined, { width: size, height: size, fontSize: size * 0.38 })}>
      {src ? (
        <img src={src} alt="" />
      ) : symbol && tint ? (
        <span className="avatar-generated">
          <Icon name={symbol} size={size * 0.44} strokeWidth={2.4} />
        </span>
      ) : (
        letters
      )}
    </span>
  )
}

// Content blocks -----------------------------------------------------------------------------------

export function NumberedSteps({ steps, tint }: { steps: string[]; tint?: string }) {
  return (
    <ol className="numbered-steps" style={tintStyle(tint)}>
      {steps.map((step, index) => (
        <li key={index}>
          <span className="step-number">{index + 1}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  )
}

export function BulletList({ items, icon = 'checkmark.circle.fill', tint }: { items: string[]; icon?: string; tint?: string }) {
  return (
    <ul className="bullet-list" style={tintStyle(tint)}>
      {items.map((item) => (
        <li key={item}>
          <Icon name={icon} size={17} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      {icon}
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}

// Controls -----------------------------------------------------------------------------------------

export function FilterPill({ title, icon, selected, onClick }: { title: string; icon?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`filter-pill pressable ${selected ? 'selected' : ''}`}
      aria-pressed={selected}
      onClick={() => {
        haptic('selection')
        onClick()
      }}
    >
      {icon && <Icon name={icon} size={13} strokeWidth={2.4} />}
      {title}
    </button>
  )
}

/** iOS segmented control with a sliding glass thumb. */
export function Segmented<T extends string>({
  value, options, onChange, ariaLabel,
}: { value: T; options: { value: T; title: string }[]; onChange: (value: T) => void; ariaLabel: string }) {
  const index = Math.max(0, options.findIndex((o) => o.value === value))
  return (
    <div className="segmented" role="radiogroup" aria-label={ariaLabel} style={{ '--count': options.length, '--index': index } as CSSProperties}>
      <span className="segmented-thumb" aria-hidden="true" />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={option.value === value ? 'active' : ''}
          onClick={() => {
            if (option.value !== value) haptic('selection')
            onChange(option.value)
          }}
        >
          {option.title}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`toggle ${checked ? 'on' : ''}`}
      onClick={() => {
        haptic('selection')
        onChange(!checked)
      }}
    >
      <span className="toggle-knob" />
    </button>
  )
}

export function Stepper({
  value, onChange, min, max, step = 1, label,
}: { value: number; onChange: (value: number) => void; min: number; max: number; step?: number; label: string }) {
  const change = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta))
    if (next !== value) {
      haptic('selection')
      onChange(next)
    }
  }
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => change(-step)} disabled={value <= min} aria-label={`Decrease ${label}`}>
        <svg viewBox="0 0 24 24" className="icon" aria-hidden="true"><path d="M6 12h12" /></svg>
      </button>
      <span className="stepper-divider" />
      <button type="button" onClick={() => change(step)} disabled={value >= max} aria-label={`Increase ${label}`}>
        <svg viewBox="0 0 24 24" className="icon" aria-hidden="true"><path d="M12 6v12M6 12h12" /></svg>
      </button>
    </div>
  )
}

/**
 * A row that opens the platform's native picker (the iOS wheel on iPhone) — the web analogue of a
 * SwiftUI menu/navigation Picker.
 */
export function NativeSelect<T extends string | number>({
  value, options, onChange, label,
}: { value: T; options: { value: T; title: string }[]; onChange: (value: T) => void; label: string }) {
  const id = useId()
  const current = options.find((o) => o.value === value)
  return (
    <span className="native-select">
      <label htmlFor={id} className="native-select-value">
        {current?.title}
        <Icon name="chevron.up.chevron.down" size={13} strokeWidth={2.4} />
      </label>
      <select
        id={id}
        aria-label={label}
        value={String(value)}
        onChange={(event) => {
          const raw = event.target.value
          const next = options.find((o) => String(o.value) === raw)
          if (next) {
            haptic('selection')
            onChange(next.value)
          }
        }}
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.title}
          </option>
        ))}
      </select>
    </span>
  )
}

/** iOS Settings-style row with a coloured icon square. */
export function SettingsRow({
  icon, tint, title, trailing, onClick, destructive, chevron,
}: { icon: string; tint: string; title: string; trailing?: ReactNode; onClick?: () => void; destructive?: boolean; chevron?: boolean }) {
  const content = (
    <>
      <span className="settings-icon" style={{ background: tint }}>
        <Icon name={icon} size={16} strokeWidth={2.2} />
      </span>
      <span className={`settings-title ${destructive ? 'destructive' : ''}`}>{title}</span>
      <span className="settings-trailing">
        {trailing}
        {chevron && <Icon name="chevron.right" size={14} strokeWidth={2.6} className="row-chevron" />}
      </span>
    </>
  )
  if (onClick) {
    return (
      <button
        type="button"
        className="settings-row list-row-button"
        onClick={() => {
          haptic('selection')
          onClick()
        }}
      >
        {content}
      </button>
    )
  }
  return <div className="settings-row">{content}</div>
}
