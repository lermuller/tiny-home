import { useState } from 'react'
import { Columns3, Rows3 } from 'lucide-react'
import { Pill } from '../../components/Pill'
import { Logo } from '../../components/Logo'
import { useTasks } from '../../features/tasks/useTasks'
import { useMembers } from '../../features/members/useMembers'
import { useMe } from '../../features/auth/useMe'
import { TaskCard } from '../../features/tasks/TaskCard'
import { TaskRow } from '../../features/tasks/TaskRow'
import { TaskSheet } from '../../features/tasks/TaskSheet'
import { taskMeta } from '../../features/tasks/decorate'
import { buildColumns, type GroupBy } from '../../features/tasks/columns'
import { useAppearance } from '../../features/settings/useAppearance'

const GROUP_CHIPS: { key: GroupBy; label: string }[] = [
  { key: 'frequencia', label: 'Frequência' },
  { key: 'status', label: 'Status' },
  { key: 'dia', label: 'Dia da semana' },
  { key: 'pessoa', label: 'Pessoa' },
]

function countLabel(n: number) {
  return n === 1 ? '1 aberta' : `${n} abertas`
}

export function Quadro() {
  const { tasks, loading, setStatus, toggleTask, setOwner, toggleRemind } = useTasks()
  const { members, loading: membersLoading } = useMembers()
  const { me } = useMe()
  const { boardLayout: layout, setBoardLayout } = useAppearance()
  const [groupBy, setGroupBy] = useState<GroupBy>('frequencia')
  const [personFilter, setPersonFilter] = useState<'todos' | string>('todos')
  const [hideDone, setHideDone] = useState(false)
  const [sheetTaskId, setSheetTaskId] = useState<string | null>(null)

  if (loading || membersLoading) {
    return (
      <div style={{ height: '70dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Logo size={44} radius={14} />
      </div>
    )
  }

  const memberById = (id: string | null) => members.find((m) => m.id === id) ?? null

  const visible = tasks
    .filter((t) => personFilter === 'todos' || t.owner_id === personFilter || t.owner_id === null)
    .filter((t) => !hideDone || t.status !== 'done')

  const todayWeekday = new Date().getDay()
  const columns = buildColumns(visible, groupBy, members, todayWeekday)

  const peopleChips = [
    { key: 'todos' as const, label: 'Todos', tone: '#201e1d' },
    ...members.map((m) => ({ key: m.id, label: m.name, tone: m.color })),
  ]

  const sheetTask = tasks.find((t) => t.id === sheetTaskId) ?? null

  function handleToggle(taskId: string) {
    if (!me) return
    void toggleTask(taskId, me.id)
  }

  return (
    <div style={{ padding: 'calc(env(safe-area-inset-top) + 22px) 0 120px' }}>
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 38, lineHeight: 1.05, margin: 0, flex: 1 }}>Quadro</h1>
          <button
            type="button"
            onClick={() => setBoardLayout(layout === 'colunas' ? 'lista' : 'colunas')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 13px',
              borderRadius: 999,
              border: '1px solid rgba(32,30,29,.16)',
              background: 'transparent',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
              fontSize: 12.5,
              cursor: 'pointer',
              marginTop: 6,
              minHeight: 36,
            }}
          >
            {layout === 'colunas' ? <Columns3 size={17} strokeWidth={2.6} /> : <Rows3 size={17} strokeWidth={2.6} />}
            {layout === 'colunas' ? 'Colunas' : 'Lista'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', margin: '14px -20px 0', padding: '0 20px 2px' }}>
          {GROUP_CHIPS.map((g) => (
            <Pill key={g.key} active={groupBy === g.key} onClick={() => setGroupBy(g.key)}>
              {g.label}
            </Pill>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, overflowX: 'auto' }}>
          {peopleChips.map((p) => (
            <Pill key={p.key} active={personFilter === p.key} tone={p.tone} onClick={() => setPersonFilter(p.key)}>
              {p.label}
            </Pill>
          ))}
          <button
            type="button"
            onClick={() => setHideDone((h) => !h)}
            style={{
              marginLeft: 'auto',
              flex: 'none',
              padding: '7px 13px',
              borderRadius: 999,
              fontFamily: 'var(--font-body)',
              fontSize: 12.5,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              border: '1px solid rgba(32,30,29,.16)',
              background: hideDone ? 'var(--color-text)' : 'transparent',
              color: hideDone ? 'var(--color-bg)' : 'var(--color-neutral-600)',
            }}
          >
            {hideDone ? 'Feitas ocultas' : 'Ocultar feitas'}
          </button>
        </div>
      </div>

      {layout === 'colunas' ? (
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            gap: 14,
            padding: '18px 20px 8px',
            marginTop: 4,
          }}
        >
          {columns.map((col) => (
            <div
              key={col.key}
              style={{ flex: 'none', width: 268, scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: col.tone, flex: 'none' }} />
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19, flex: 1, minWidth: 0 }}>{col.label}</div>
                <div style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>{countLabel(col.openCount)}</div>
              </div>
              {col.tasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  member={memberById(t.owner_id)}
                  onToggle={() => handleToggle(t.id)}
                  onOpen={() => setSheetTaskId(t.id)}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, padding: '18px 20px', marginTop: 4 }}>
          {columns.map((col) => (
            <div key={col.key}>
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  background: 'var(--color-bg)',
                  padding: '6px 0 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  zIndex: 5,
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 999, background: col.tone, flex: 'none' }} />
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19, flex: 1, minWidth: 0 }}>{col.label}</div>
                <div style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>{countLabel(col.openCount)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.tasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    member={memberById(t.owner_id)}
                    meta={taskMeta(t) + (t.status === 'doing' ? ' · fazendo' : '')}
                    onToggle={() => handleToggle(t.id)}
                    onOpen={() => setSheetTaskId(t.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskSheet
        task={sheetTask}
        members={members}
        onClose={() => setSheetTaskId(null)}
        onSetStatus={(id, status) => { if (me) void setStatus(id, status, me.id) }}
        onSetOwner={setOwner}
        onToggleRemind={toggleRemind}
        onToggleDone={(id) => handleToggle(id)}
      />
    </div>
  )
}
