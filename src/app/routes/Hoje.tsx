import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, ShoppingCart, ChevronRight } from 'lucide-react'
import { Pill } from '../../components/Pill'
import { Avatar } from '../../components/Avatar'
import { Logo } from '../../components/Logo'
import { CheckCircle } from '../../components/CheckCircle'
import { useTasks } from '../../features/tasks/useTasks'
import { TaskRow } from '../../features/tasks/TaskRow'
import { TaskSheet } from '../../features/tasks/TaskSheet'
import { taskLateLabel, taskMeta, isLate, isDueToday } from '../../features/tasks/decorate'
import { useMembers } from '../../features/members/useMembers'
import { useMe } from '../../features/auth/useMe'
import { useLists } from '../../features/lists/useLists'

export function Hoje() {
  const navigate = useNavigate()
  const { tasks, loading, setStatus, toggleTask, setOwner, toggleRemind, deleteTask } = useTasks()
  const { members, loading: membersLoading } = useMembers()
  const { me } = useMe()
  const { lists } = useLists()
  const [homeFilter, setHomeFilter] = useState<'todos' | string>('todos')
  const [sheetTaskId, setSheetTaskId] = useState<string | null>(null)

  if (loading || membersLoading) {
    return (
      <div style={{ height: '70dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Logo size={44} radius={14} />
      </div>
    )
  }

  const memberById = (id: string | null) => members.find((m) => m.id === id) ?? null

  const homeChips = [
    { key: 'todos' as const, label: 'Nós dois', tone: '#201e1d' },
    ...members.map((m) => ({ key: m.id, label: m.name, tone: m.color })),
  ]

  const mine = (ownerId: string | null) => homeFilter === 'todos' || ownerId === homeFilter || ownerId === null

  const todayTasks = tasks.filter((t) => isDueToday(t) && mine(t.owner_id))
  const lateTasks = tasks.filter((t) => isLate(t) && mine(t.owner_id))
  const doneToday = todayTasks.filter((t) => t.status === 'done').length
  const pct = todayTasks.length ? Math.round((doneToday / todayTasks.length) * 100) : 0
  const restantes = todayTasks.length - doneToday

  const reminderLine =
    restantes === 0
      ? 'Dia zerado. Vão descansar.'
      : restantes === 1
        ? 'Falta 1. Aviso às 19:00 se ela sobrar.'
        : `Faltam ${restantes}. Aviso às 19:00 se sobrar alguma.`

  const filterMemberName = homeFilter === 'todos' ? null : memberById(homeFilter)?.name
  const todayLabel = filterMemberName ? `Para hoje · ${filterMemberName}` : 'Para hoje'

  const mercado = lists.find((l) => l.name === 'Mercado')
  const mercadoOpen = mercado ? mercado.items.filter((i) => !i.done).length : 0
  const mercadoLabel = mercadoOpen === 1 ? '1 item na lista do mercado' : `${mercadoOpen} itens na lista do mercado`

  const sheetTask = tasks.find((t) => t.id === sheetTaskId) ?? null

  function handleToggle(taskId: string) {
    if (!me) return
    void toggleTask(taskId, me.id)
  }

  return (
    <div
      style={{
        padding: 'calc(env(safe-area-inset-top) + 22px) 20px 120px',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: 'var(--color-accent-700)',
              fontWeight: 700,
            }}
          >
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 38, lineHeight: 1.05, margin: '6px 0 0' }}>
            Hoje em casa
          </h1>
        </div>
        <div style={{ display: 'flex', marginTop: 26 }}>
          {members.map((m, i) => (
            <Avatar key={m.id} member={m} size={34} style={{ border: '2px solid var(--color-bg)', marginLeft: i === 0 ? 0 : -10 }} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 7 }}>
        {homeChips.map((chip) => (
          <Pill key={chip.key} active={homeFilter === chip.key} tone={chip.tone} onClick={() => setHomeFilter(chip.key)}>
            {chip.label}
          </Pill>
        ))}
      </div>

      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 28,
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22 }}>
            {doneToday} de {todayTasks.length} feitas
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>{pct}%</div>
        </div>
        <div style={{ height: 10, borderRadius: 999, background: 'var(--color-neutral-300)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              borderRadius: 999,
              background: 'var(--color-accent-2)',
              transition: 'width .4s cubic-bezier(.2,.8,.3,1)',
            }}
          />
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--color-neutral-700)' }}>{reminderLine}</div>
      </div>

      {lateTasks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={15} strokeWidth={2.75} color="var(--color-accent-600)" />
            <div
              style={{
                fontSize: 11,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: 'var(--color-accent-700)',
              }}
            >
              Passou da hora
            </div>
          </div>
          {lateTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => setSheetTaskId(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 13,
                padding: '13px 15px',
                background: 'var(--color-accent-100)',
                border: '1px solid var(--color-accent-300)',
                borderRadius: 22,
                cursor: 'pointer',
              }}
            >
              <CheckCircle done={t.status === 'done'} onToggle={() => handleToggle(t.id)} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: 'var(--color-text)' }}>{t.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--color-accent-700)', marginTop: 2 }}>{taskLateLabel(t)}</div>
              </div>
              <Avatar member={memberById(t.owner_id)} size={28} />
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: 'var(--color-neutral-700)',
          }}
        >
          {todayLabel}
        </div>
        {todayTasks.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            member={memberById(t.owner_id)}
            meta={taskMeta(t)}
            onToggle={() => handleToggle(t.id)}
            onOpen={() => setSheetTaskId(t.id)}
          />
        ))}
      </div>

      <div
        onClick={() => navigate('/compras')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px 18px',
          background: 'var(--color-accent-2-200)',
          borderRadius: 26,
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 999,
            background: 'var(--color-accent-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          <ShoppingCart size={20} strokeWidth={2.75} color="#fbfdf5" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17 }}>Feira do sábado</div>
          <div style={{ fontSize: 12, color: 'var(--color-accent-2-800)', marginTop: 1 }}>{mercadoLabel}</div>
        </div>
        <ChevronRight size={18} strokeWidth={2.75} color="var(--color-accent-2-800)" />
      </div>

      <TaskSheet
        task={sheetTask}
        members={members}
        onClose={() => setSheetTaskId(null)}
        onSetStatus={(id, status) => { if (me) void setStatus(id, status, me.id) }}
        onSetOwner={setOwner}
        onToggleRemind={toggleRemind}
        onToggleDone={(id) => handleToggle(id)}
        onDelete={(id) => void deleteTask(id)}
      />
    </div>
  )
}
