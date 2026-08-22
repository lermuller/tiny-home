import { Check } from 'lucide-react'
import type { ListItem } from '../../lib/types'

interface ItemRowProps {
  item: ListItem
  shopMode: boolean
  onToggle: () => void
}

export function ItemRow({ item, shopMode, onToggle }: ItemRowProps) {
  const done = item.done

  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: shopMode ? '17px 16px' : '13px 16px',
        background: done ? 'transparent' : 'var(--color-surface)',
        border: done ? '1px solid rgba(32,30,29,.10)' : '1px solid transparent',
        borderRadius: 22,
        cursor: 'pointer',
        transition: 'background .18s ease',
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          flex: 'none',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: done ? '2px solid var(--color-accent-2)' : '2px solid var(--color-neutral-400)',
          background: done ? 'var(--color-accent-2)' : 'transparent',
          transition: 'all .18s ease',
        }}
      >
        <Check size={13} color="#fff8ef" strokeWidth={3.4} style={{ opacity: done ? 1 : 0, transition: 'opacity .18s ease' }} />
      </div>
      <div
        style={{
          flex: 1,
          fontSize: shopMode ? 17 : 15,
          fontWeight: 600,
          color: done ? 'var(--color-neutral-500)' : 'var(--color-text)',
          textDecoration: done ? 'line-through' : 'none',
        }}
      >
        {item.name}
      </div>
    </div>
  )
}
