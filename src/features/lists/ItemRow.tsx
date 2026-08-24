import { Check, Trash2 } from 'lucide-react'
import { useState, type KeyboardEvent, type MouseEvent } from 'react'
import type { ListItem } from '../../lib/types'

interface ItemRowProps {
  item: ListItem
  shopMode: boolean
  onToggle: () => void
  onRename: (name: string) => void
  onDelete: () => void
}

export function ItemRow({ item, shopMode, onToggle, onRename, onDelete }: ItemRowProps) {
  const done = item.done
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(item.name)

  function startEdit(e: MouseEvent) {
    e.stopPropagation()
    setDraft(item.name)
    setEditing(true)
  }

  function commit() {
    setEditing(false)
    onRename(draft)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') e.currentTarget.blur()
    if (e.key === 'Escape') {
      setDraft(item.name)
      setEditing(false)
    }
  }

  function handleToggleClick(e: MouseEvent) {
    e.stopPropagation()
    onToggle()
  }

  function handleDelete(e: MouseEvent) {
    e.stopPropagation()
    if (!window.confirm(`Excluir "${item.name}" da lista?`)) return
    onDelete()
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: shopMode ? '17px 16px' : '13px 16px',
        background: done ? 'transparent' : 'var(--color-surface)',
        border: done ? '1px solid rgba(32,30,29,.10)' : '1px solid transparent',
        borderRadius: 22,
        transition: 'background .18s ease',
      }}
    >
      <button
        type="button"
        onClick={handleToggleClick}
        aria-label={done ? `Desmarcar ${item.name}` : `Marcar ${item.name} como comprado`}
        style={{
          width: 24,
          height: 24,
          flex: 'none',
          borderRadius: 8,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: done ? '2px solid var(--color-accent-2)' : '2px solid var(--color-neutral-400)',
          background: done ? 'var(--color-accent-2)' : 'transparent',
          cursor: 'pointer',
          transition: 'all .18s ease',
        }}
      >
        <Check size={13} color="#fff8ef" strokeWidth={3.4} style={{ opacity: done ? 1 : 0, transition: 'opacity .18s ease' }} />
      </button>

      {editing ? (
        <input
          className="input"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          style={{ flex: 1, fontSize: 16, minHeight: shopMode ? 34 : 30, padding: '4px 10px' }}
        />
      ) : (
        <div
          onClick={startEdit}
          style={{
            flex: 1,
            fontSize: shopMode ? 17 : 15,
            fontWeight: 600,
            color: done ? 'var(--color-neutral-500)' : 'var(--color-text)',
            textDecoration: done ? 'line-through' : 'none',
            cursor: 'text',
          }}
        >
          {item.name}
        </div>
      )}

      <button
        type="button"
        onClick={handleDelete}
        aria-label={`Excluir ${item.name}`}
        style={{
          width: 44,
          height: 44,
          flex: 'none',
          margin: '-10px -12px -10px 0',
          background: 'transparent',
          border: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-neutral-500)',
          cursor: 'pointer',
        }}
      >
        <Trash2 size={16} strokeWidth={2.5} />
      </button>
    </div>
  )
}
