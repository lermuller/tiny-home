import { Plus } from 'lucide-react'
import type { ShoppingList } from '../../lib/types'

interface FrequentItemsCardProps {
  names: string[]
  mercado: ShoppingList | undefined
  onAdd: (name: string) => void
}

export function FrequentItemsCard({ names, mercado, onAdd }: FrequentItemsCardProps) {
  if (names.length === 0) return null

  return (
    <div style={{ background: 'var(--color-surface)', borderRadius: 26, padding: '16px 18px' }}>
      <div
        style={{
          fontSize: 11,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: 'var(--color-neutral-700)',
          marginBottom: 10,
        }}
      >
        Compra sempre
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {names.map((name) => {
          const inList = mercado?.items.some((i) => i.name === name && !i.done) ?? false
          return (
            <button
              key={name}
              onClick={() => onAdd(name)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 999,
                border: inList ? '1px solid var(--color-accent-2)' : '1px solid rgba(32,30,29,.16)',
                background: inList ? 'var(--color-accent-2-200)' : 'var(--color-bg)',
                fontFamily: 'var(--font-body)',
                fontSize: 12.5,
                color: inList ? 'var(--color-accent-2-800)' : 'var(--color-text)',
                cursor: 'pointer',
                transition: 'all .16s ease',
              }}
            >
              <Plus size={12} strokeWidth={3.2} />
              {name}
            </button>
          )
        })}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', marginTop: 11 }}>Vai direto para a lista do Mercado.</div>
    </div>
  )
}
