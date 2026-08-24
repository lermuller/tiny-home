import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { TabBar } from '../components/TabBar'
import { PillNav } from '../components/PillNav'
import { Fab } from '../components/Fab'
import { useAppearance } from '../features/settings/useAppearance'
import { useMembers } from '../features/members/useMembers'
import { useMe } from '../features/auth/useMe'
import { useToast } from '../components/useToast'
import { NewTaskSheet } from '../features/tasks/NewTaskSheet'
import { createTask } from '../features/tasks/createTask'
import { useAnySheetOpen } from '../components/useAnySheetOpen'
import { WEEKDAY_LABELS } from '../lib/people'
import type { Freq } from '../lib/types'

function creationToast(frequency: Freq, weekday: number | null, monthDay: number | null) {
  if (frequency === 'diaria') return 'Tarefa criada. Volta sozinha todo dia.'
  if (frequency === 'semanal') return `Tarefa criada. Volta sozinha toda ${WEEKDAY_LABELS[weekday!].toLowerCase()}.`
  if (frequency === 'mensal') return `Tarefa criada. Volta sozinha todo dia ${monthDay}.`
  return 'Tarefa criada. Sem repetição.'
}

export function Layout() {
  const { navStyle } = useAppearance()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { members } = useMembers()
  const { me } = useMe()
  const showToast = useToast()
  const [sheetOpen, setSheetOpen] = useState(false)
  const anySheetOpen = useAnySheetOpen()

  const showFab = (pathname === '/hoje' || pathname === '/quadro') && !anySheetOpen

  async function handleCreateTask(input: { title: string; frequency: Freq; ownerId: string | null; weekday: number | null; monthDay: number | null }) {
    setSheetOpen(false)
    const { error } = await createTask(input)
    if (error) {
      showToast('Não deu pra criar a tarefa. Tenta de novo.')
      return
    }
    navigate('/quadro')
    showToast(creationToast(input.frequency, input.weekday, input.monthDay))
  }

  return (
    <div
      style={{
        height: '100dvh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Outlet />
      </div>
      {navStyle === 'abas' ? <TabBar /> : <PillNav />}
      {showFab && <Fab navStyle={navStyle} onClick={() => setSheetOpen(true)} />}
      <NewTaskSheet
        open={sheetOpen}
        members={members}
        defaultOwnerId={me?.id ?? null}
        onClose={() => setSheetOpen(false)}
        onCreate={handleCreateTask}
      />
    </div>
  )
}
