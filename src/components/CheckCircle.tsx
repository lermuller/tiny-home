import { Check } from 'lucide-react'
import type { MouseEvent } from 'react'

interface CheckCircleProps {
  done: boolean
  onToggle: () => void
}

export function CheckCircle({ done, onToggle }: CheckCircleProps) {
  function handleClick(e: MouseEvent) {
    e.stopPropagation()
    onToggle()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={done}
      aria-label={done ? 'Marcar como não feita' : 'Marcar como feita'}
      style={{
        width: 27,
        height: 27,
        flex: 'none',
        borderRadius: 999,
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: done ? '2px solid var(--color-accent-2)' : '2px solid var(--color-neutral-400)',
        background: done ? 'var(--color-accent-2)' : 'transparent',
        transition: 'background .18s ease, border-color .18s ease',
      }}
    >
      <Check
        size={14}
        color="#fff8ef"
        strokeWidth={3.2}
        style={{ opacity: done ? 1 : 0, transition: 'opacity .18s ease' }}
      />
    </button>
  )
}
