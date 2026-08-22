interface SwitchProps {
  on: boolean
  onToggle: () => void
  label?: string
}

export function Switch({ on, onToggle, label }: SwitchProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={label}
      style={{
        width: 46,
        height: 27,
        flex: 'none',
        borderRadius: 999,
        border: 0,
        padding: 3,
        cursor: 'pointer',
        display: 'flex',
        justifyContent: on ? 'flex-end' : 'flex-start',
        background: on ? 'var(--color-accent-2)' : 'var(--color-neutral-400)',
        transition: 'background .18s ease',
      }}
    >
      <span
        style={{
          width: 21,
          height: 21,
          borderRadius: 999,
          background: '#fff8ef',
          display: 'block',
          boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        }}
      />
    </button>
  )
}
