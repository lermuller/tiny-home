import { RefreshCw, Bell, History, Trash2 } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Sheet } from '../../components/Sheet'
import { Switch } from '../../components/Switch'
import { FREQ } from '../../lib/people'
import type { Member, Task, TaskStatus } from '../../lib/types'
import { taskRepeatLine } from './decorate'
import { useTaskHistory } from './useTaskHistory'

interface TaskSheetProps {
  task: Task | null
  members: Member[]
  onClose: () => void
  onSetStatus: (id: string, status: TaskStatus) => void
  onSetOwner: (id: string, ownerId: string | null) => void
  onToggleRemind: (id: string) => void
  onToggleDone: (id: string) => void
  onDelete: (id: string) => void
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

function historyLine(count: number, avgDays: number | null) {
  if (count === 1) return 'Feita 1 vez nos últimos 3 meses.'
  const avg = avgDays === 1 ? '1 dia' : `${avgDays} dias`
  return `Feita ${count} vezes nos últimos 3 meses, em média a cada ${avg}.`
}

export function TaskSheet({ task, members, onClose, onSetStatus, onSetOwner, onToggleRemind, onToggleDone, onDelete }: TaskSheetProps) {
  const history = useTaskHistory(task?.id ?? null)

  function handleDelete() {
    if (!task) return
    if (!window.confirm(`Excluir "${task.title}"? Isso apaga o histórico dela também e não pode ser desfeito.`)) return
    onDelete(task.id)
    onClose()
  }

  return (
    <Sheet open={!!task} onClose={onClose}>
      {task && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="tag tag-neutral">{FREQ[task.frequency]}</span>
            {task.room && <span className="tag tag-accent-2">{task.room}</span>}
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 27, lineHeight: 1.1, margin: '0 0 6px' }}>
            {task.title}
          </h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              fontSize: 13,
              color: 'var(--color-neutral-700)',
              marginBottom: history && history.count > 0 ? 6 : 20,
            }}
          >
            <RefreshCw size={14} strokeWidth={2.75} />
            {taskRepeatLine(task)}
          </div>

          {history && history.count > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 13,
                color: 'var(--color-neutral-700)',
                marginBottom: 20,
              }}
            >
              <History size={14} strokeWidth={2.75} />
              {historyLine(history.count, history.avgDays)}
            </div>
          )}

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
            Como está
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button style={choiceStyle(task.status === 'todo')} onClick={() => onSetStatus(task.id, 'todo')}>
              A fazer
            </button>
            <button style={choiceStyle(task.status === 'doing')} onClick={() => onSetStatus(task.id, 'doing')}>
              Fazendo
            </button>
            <button style={choiceStyle(task.status === 'done')} onClick={() => onSetStatus(task.id, 'done')}>
              Feito
            </button>
          </div>

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
            De quem é
          </div>
          <div style={{ display: 'flex', gap: 9, marginBottom: 18 }}>
            {members.map((member) => (
              <button
                key={member.id}
                style={choiceStyle(task.owner_id === member.id)}
                onClick={() => onSetOwner(task.id, member.id)}
              >
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
            <button style={choiceStyle(task.owner_id === null)} onClick={() => onSetOwner(task.id, null)}>
              Os dois
            </button>
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
            <Bell size={17} strokeWidth={2.6} color="var(--color-neutral-600)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Me lembrar</div>
              <div style={{ fontSize: 11.5, color: 'var(--color-neutral-700)', marginTop: 1 }}>
                {task.remind ? 'Notificação no dia, às 19:00' : 'Sem notificação'}
              </div>
            </div>
            <Switch on={task.remind} onToggle={() => onToggleRemind(task.id)} label="Me lembrar" />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, padding: 14, fontSize: 15 }}
              onClick={() => {
                onToggleDone(task.id)
                onClose()
              }}
            >
              {task.status === 'done' ? 'Desmarcar' : 'Marcar como feita'}
            </button>
            <button className="btn btn-secondary" style={{ padding: '14px 20px', fontSize: 15 }} onClick={onClose}>
              Fechar
            </button>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              width: '100%',
              marginTop: 14,
              padding: 10,
              minHeight: 44,
              background: 'transparent',
              border: 0,
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--color-accent-700)',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={14} strokeWidth={2.75} />
            Excluir tarefa
          </button>
        </>
      )}
    </Sheet>
  )
}
