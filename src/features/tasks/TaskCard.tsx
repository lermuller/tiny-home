import { CheckCircle } from '../../components/CheckCircle'
import { Avatar } from '../../components/Avatar'
import type { Member, Task } from '../../lib/types'
import { isLate, taskWhen } from './decorate'

interface TaskCardProps {
  task: Task
  member: Member | null
  onToggle: () => void
  onOpen: () => void
}

export function TaskCard({ task, member, onToggle, onOpen }: TaskCardProps) {
  const done = task.status === 'done'
  const late = isLate(task)

  return (
    <div
      onClick={onOpen}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 24,
        padding: '14px 15px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        borderLeft: task.status === 'doing' ? '4px solid var(--color-accent)' : '4px solid transparent',
        opacity: done ? 0.7 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <CheckCircle done={done} onToggle={onToggle} />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.3,
            color: done ? 'var(--color-neutral-500)' : 'var(--color-text)',
            textDecoration: done ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {task.room && <span className="tag tag-neutral">{task.room}</span>}
        <span
          style={{
            flex: 1,
            fontSize: 11.5,
            color: late ? 'var(--color-accent-600)' : 'var(--color-neutral-700)',
            fontWeight: late ? 700 : 400,
          }}
        >
          {taskWhen(task)}
        </span>
        <Avatar member={member} size={24} />
      </div>
    </div>
  )
}
