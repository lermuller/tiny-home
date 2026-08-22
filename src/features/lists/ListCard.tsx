import type { ShoppingList } from '../../lib/types'
import { TONE_BG, TONE_INK } from './tone'

interface ListCardProps {
  list: ShoppingList
  onOpen: () => void
}

export function ListCard({ list, onOpen }: ListCardProps) {
  const open = list.items.filter((i) => !i.done).length
  const pct = list.items.length ? Math.round(((list.items.length - open) / list.items.length) * 100) : 0
  const sub = list.items.length === 0 ? 'Lista vazia' : open === 0 ? 'Tudo comprado' : open === 1 ? '1 item aberto' : `${open} itens abertos`

  return (
    <div
      onClick={onOpen}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: TONE_BG[list.tone],
        borderRadius: 28,
        padding: '18px 16px 16px',
        cursor: 'pointer',
        minHeight: 132,
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: -26,
          top: -26,
          width: 84,
          height: 84,
          borderRadius: 999,
          background: TONE_INK[list.tone],
          opacity: 0.18,
        }}
      />
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, position: 'relative' }}>{list.name}</div>
      <div style={{ fontSize: 12, position: 'relative', opacity: 0.75 }}>{sub}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, position: 'relative' }}>
        <div
          style={{
            height: 6,
            flex: 1,
            borderRadius: 999,
            background: `linear-gradient(to right, ${TONE_INK[list.tone]} ${pct}%, rgba(32,30,29,.12) ${pct}%)`,
          }}
        />
        <span style={{ fontSize: 11, opacity: 0.7 }}>{pct}%</span>
      </div>
    </div>
  )
}
