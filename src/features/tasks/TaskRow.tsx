import { CheckCircle } from '../../components/CheckCircle'
import { Avatar } from '../../components/Avatar'
import type { Member, Task } from '../../lib/types'

interface TaskRowProps {
  task: Task
  member: Member | null
  meta: string
  onToggle: () => void
  onOpen: () => void
}

export function TaskRow({ task, member, meta, onToggle, onOpen }: TaskRowProps) {
  const done = task.status === 'done'

  return (
    <div
      onClick={onOpen}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: '13px 15px',
        background: 'var(--color-surface)',
        borderRadius: 22,
        cursor: 'pointer',
        borderLeft: task.status === 'doing' ? '4px solid var(--color-accent)' : '4px solid transparent',
        opacity: done ? 0.7 : 1,
      }}
    >
      <CheckCircle done={done} onToggle={onToggle} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.3,
            color: done ? 'var(--color-neutral-500)' : 'var(--color-text)',
            textDecoration: done ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--color-neutral-700)', marginTop: 2 }}>{meta}</div>
      </div>
      <Avatar member={member} size={28} />
    </div>
  )
}
