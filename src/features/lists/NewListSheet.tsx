import { useState } from 'react'
import { Sheet } from '../../components/Sheet'
import { Switch } from '../../components/Switch'
import type { ListTone } from '../../lib/types'
import { TONE_BG, TONE_INK } from './tone'

const TONES: ListTone[] = ['accent', 'accent2', 'neutral']

interface NewListSheetProps {
  open: boolean
  onClose: () => void
  onCreate: (name: string, tone: ListTone, sectioned: boolean) => void
}

export function NewListSheet({ open, onClose, onCreate }: NewListSheetProps) {
  const [name, setName] = useState('')
  const [tone, setTone] = useState<ListTone>('accent')
  const [sectioned, setSectioned] = useState(false)

  function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate(trimmed, tone, sectioned)
    setName('')
    setTone('accent')
    setSectioned(false)
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 25, lineHeight: 1.1, margin: '0 0 16px' }}>Nova lista</h2>
      <input
        className="input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex: Ferragem, Pet, Presentes…"
        style={{ fontSize: 16, minHeight: 46, marginBottom: 16 }}
      />
      <div
        style={{
          fontSize: 11,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: 'var(--color-neutral-700)',
          marginBottom: 9,
        }}
      >
        Cor
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {TONES.map((t) => (
          <button
            key={t}
            onClick={() => setTone(t)}
            aria-label={t}
            style={{
              width: 52,
              height: 52,
              borderRadius: 18,
              cursor: 'pointer',
              background: TONE_BG[t],
              border: tone === t ? `3px solid ${TONE_INK[t]}` : '3px solid transparent',
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--color-surface)',
          borderRadius: 20,
          padding: '13px 16px',
          marginBottom: 20,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Separar por seções</div>
          <div style={{ fontSize: 11.5, color: 'var(--color-neutral-700)', marginTop: 1 }}>Hortifruti, limpeza, padaria…</div>
        </div>
        <Switch on={sectioned} onToggle={() => setSectioned((s) => !s)} label="Separar por seções" />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" style={{ flex: 1, padding: 14, fontSize: 15 }} onClick={handleCreate}>
          Criar lista
        </button>
        <button className="btn btn-secondary" style={{ padding: '14px 20px', fontSize: 15 }} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </Sheet>
  )
}
