import type { ReactNode } from 'react'

interface PillProps {
  active: boolean
  tone?: string
  onClick: () => void
  children: ReactNode
}

export function Pill({ active, tone = '#c67139', onClick, children }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '7px 15px',
        minHeight: 33,
        borderRadius: 999,
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        border: active ? `1px solid ${tone}` : '1px solid rgba(32,30,29,.16)',
        background: active ? tone : 'transparent',
        color: active ? '#fff8ef' : 'var(--color-text)',
        transition: 'all .16s ease',
      }}
    >
      {children}
    </button>
  )
}
