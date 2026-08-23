import { useState, type CSSProperties } from 'react'
import { Sheet } from '../../components/Sheet'
import { WEEKDAY_DISPLAY_ORDER, WEEKDAY_LABELS } from '../../lib/people'
import type { Freq, Member } from '../../lib/types'

const MONTH_DAYS = [1, 5, 10, 15, 20, 25]
const FREQ_OPTIONS: { key: Freq; label: string }[] = [
  { key: 'diaria', label: 'Todo dia' },
  { key: 'semanal', label: 'Toda semana' },
  { key: 'mensal', label: 'Todo mês' },
  { key: 'pontual', label: 'Uma vez' },
]

interface NewTaskSheetProps {
  open: boolean
  members: Member[]
  defaultOwnerId: string | null
  onClose: () => void
  onCreate: (input: { title: string; frequency: Freq; ownerId: string | null; weekday: number | null; monthDay: number | null }) => void
}

function choiceStyle(active: boolean): CSSProperties {
  return {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    padding: '11px 10px',
    borderRadius: 999,
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    cursor: 'pointer',
    border: active ? '2px solid var(--color-accent)' : '2px solid rgba(32,30,29,.12)',
    background: active ? 'var(--color-accent-200)' : 'transparent',
    color: 'var(--color-text)',
    transition: 'all .16s ease',
  }
}

function smallChoiceStyle(active: boolean): CSSProperties {
  return {
    flex: 1,
    padding: '9px 0',
    borderRadius: 14,
    fontFamily: 'var(--font-body)',
    fontSize: 12.5,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    border: active ? '2px solid var(--color-accent)' : '2px solid rgba(32,30,29,.12)',
    background: active ? 'var(--color-accent-200)' : 'transparent',
    color: 'var(--color-text)',
  }
}

const kicker: CSSProperties = {
  fontSize: 11,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  fontWeight: 700,
  color: 'var(--color-neutral-700)',
  marginBottom: 9,
}

export function NewTaskSheet({ open, members, defaultOwnerId, onClose, onCreate }: NewTaskSheetProps) {
  const [title, setTitle] = useState('')
  const [frequency, setFrequency] = useState<Freq>('semanal')
  const [weekday, setWeekday] = useState(6) // sábado
  const [monthDay, setMonthDay] = useState(5)
  const [ownerId, setOwnerId] = useState<string | null>(defaultOwnerId)

  function reset() {
    setTitle('')
    setFrequency('semanal')
    setWeekday(6)
    setMonthDay(5)
    setOwnerId(defaultOwnerId)
  }

  function handleCreate() {
    const trimmed = title.trim()
    if (!trimmed) return
    onCreate({ title: trimmed, frequency, ownerId, weekday, monthDay })
    reset()
  }

  return (
    <Sheet
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
    >
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 25, lineHeight: 1.1, margin: '0 0 16px' }}>Nova tarefa</h2>
      <input
        className="input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="O que precisa ser feito?"
        style={{ fontSize: 15, minHeight: 46, marginBottom: 16 }}
      />

      <div style={kicker}>Com que frequência</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {FREQ_OPTIONS.map((f) => (
          <button key={f.key} style={choiceStyle(frequency === f.key)} onClick={() => setFrequency(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {frequency === 'mensal' && (
        <div style={{ marginBottom: 16 }}>
          <div style={kicker}>Em que dia do mês</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {MONTH_DAYS.map((d) => (
              <button key={d} style={smallChoiceStyle(monthDay === d)} onClick={() => setMonthDay(d)}>
                Dia {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {frequency === 'semanal' && (
        <div style={{ marginBottom: 16 }}>
          <div style={kicker}>Em que dia</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {WEEKDAY_DISPLAY_ORDER.map((w) => (
              <button key={w} style={smallChoiceStyle(weekday === w)} onClick={() => setWeekday(w)}>
                {WEEKDAY_LABELS[w].slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={kicker}>De quem é</div>
      <div style={{ display: 'flex', gap: 9, marginBottom: 20 }}>
        {members.map((member) => (
          <button key={member.id} style={choiceStyle(ownerId === member.id)} onClick={() => setOwnerId(member.id)}>
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                background: member.color,
                color: '#fff8ef',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {member.initial}
            </span>
            {member.name}
          </button>
        ))}
        <button style={choiceStyle(ownerId === null)} onClick={() => setOwnerId(null)}>
          Os dois
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" style={{ flex: 1, padding: 14, fontSize: 15 }} onClick={handleCreate}>
          Adicionar ao quadro
        </button>
        <button
          className="btn btn-secondary"
          style={{ padding: '14px 20px', fontSize: 15 }}
          onClick={() => {
            reset()
            onClose()
          }}
        >
          Cancelar
        </button>
      </div>
    </Sheet>
  )
}
