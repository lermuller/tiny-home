import type { CSSProperties } from 'react'
import { Logo } from '../../components/Logo'
import { Avatar } from '../../components/Avatar'
import { Switch } from '../../components/Switch'
import { useMe, type NotifPrefs } from '../../features/auth/useMe'
import { useMembers } from '../../features/members/useMembers'
import { useTasks } from '../../features/tasks/useTasks'
import { useWeeklyCompletions } from '../../features/members/useWeeklyCompletions'
import { useRecentCompletions } from '../../features/members/useRecentCompletions'
import { formatRelativeDateTime } from '../../lib/formatDate'
import { useAppearance } from '../../features/settings/useAppearance'
import { isLate } from '../../features/tasks/decorate'
import { daysBetween, todayISO } from '../../features/tasks/dueDate'
import { supabase } from '../../lib/supabase'
import { ensurePushSubscription } from '../../lib/push'
import { useToast } from '../../components/useToast'

const NOTIF_DEFS: { key: keyof NotifPrefs; title: string; sub: string }[] = [
  { key: 'manha', title: 'Resumo do dia', sub: 'Todo dia às 8:00, o que é de cada um' },
  { key: 'atraso', title: 'Cutucão de atraso', sub: 'Quando algo semanal passa 2 dias' },
  { key: 'mercado', title: 'Item novo na lista', sub: 'Quando um de vocês adiciona algo' },
]

const CARD_BG = ['var(--color-accent-200)', 'var(--color-accent-2-200)']
const CARD_SUB = ['var(--color-accent-800)', 'var(--color-accent-2-800)']

const kicker: CSSProperties = {
  fontSize: 11,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  fontWeight: 700,
  color: 'var(--color-neutral-700)',
}

function optionStyle(active: boolean): CSSProperties {
  return {
    flex: 1,
    padding: '11px 10px',
    borderRadius: 999,
    fontFamily: 'var(--font-body)',
    fontSize: 13.5,
    cursor: 'pointer',
    border: active ? '2px solid var(--color-accent)' : '2px solid rgba(32,30,29,.12)',
    background: active ? 'var(--color-accent-200)' : 'transparent',
    color: 'var(--color-text)',
    transition: 'all .16s ease',
  }
}

export function Casa() {
  const { me, toggleNotifPref } = useMe()
  const { members } = useMembers()
  const { tasks } = useTasks()
  const weeklyDone = useWeeklyCompletions()
  const { boardLayout, navStyle, setBoardLayout, setNavStyle } = useAppearance()
  const showToast = useToast()
  const { completions } = useRecentCompletions(30)

  async function handleToggleNotif(key: keyof NotifPrefs) {
    const turningOn = !me?.notif_prefs[key]
    await toggleNotifPref(key)
    if (!turningOn || !me) return

    const result = await ensurePushSubscription(me.id)
    if (result === 'denied') {
      showToast('Notificação bloqueada no navegador. Ative nas permissões do site pra receber avisos.')
    } else if (result === 'unsupported') {
      showToast('Este navegador não suporta notificações push.')
    }
  }

  const lateTasks = tasks.filter((t) => isLate(t)).sort((a, b) => (a.due_on ?? '').localeCompare(b.due_on ?? ''))
  const oldest = lateTasks[0]
  let notifPreview = 'Tudo em dia por aí. Boa noite!'
  if (oldest?.due_on) {
    const days = daysBetween(oldest.due_on, todayISO())
    notifPreview = `"${oldest.title}" está esperando desde ${days === 1 ? 'ontem' : `${days} dias`}. Quem pega?`
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Logo size={52} radius={16} />
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, lineHeight: 1, margin: 0 }}>Tiny Home</h1>
          <p style={{ fontSize: 13, color: 'var(--color-neutral-700)', margin: '5px 0 0' }}>A casa da Evelyn e do Leo.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {members.map((m, i) => (
          <div
            key={m.id}
            style={{
              flex: 1,
              background: CARD_BG[i % 2],
              borderRadius: 26,
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <Avatar member={m} size={38} />
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19, marginTop: 8 }}>{m.name}</div>
            <div style={{ fontSize: 12, color: CARD_SUB[i % 2] }}>{weeklyDone[m.id] ?? 0} feitas esta semana</div>
          </div>
        ))}
      </div>

      {completions.length > 0 && (
        <div style={{ background: 'var(--color-surface)', borderRadius: 26, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ ...kicker, marginBottom: 6 }}>Últimas conclusões</div>
          {completions.map((c) => (
            <div
              key={c.id}
              style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 0', borderBottom: '1px solid var(--color-divider)' }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  flex: 'none',
                  borderRadius: 999,
                  background: c.memberColor ?? 'var(--color-neutral-500)',
                  color: '#fff8ef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {c.memberInitial ?? '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{c.taskTitle}</div>
                <div style={{ fontSize: 11.5, color: 'var(--color-neutral-700)', marginTop: 2 }}>
                  {c.memberName ?? 'Alguém'} · {formatRelativeDateTime(c.completedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'var(--color-surface)', borderRadius: 26, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ ...kicker, marginBottom: 6 }}>Avisos</div>
        {NOTIF_DEFS.map((n) => (
          <div
            key={n.key}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: '1px solid var(--color-divider)' }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>{n.title}</div>
              <div style={{ fontSize: 11.5, color: 'var(--color-neutral-700)', marginTop: 2 }}>{n.sub}</div>
            </div>
            <Switch on={me?.notif_prefs[n.key] ?? false} onToggle={() => void handleToggleNotif(n.key)} label={n.title} />
          </div>
        ))}
        <div
          style={{
            marginTop: 14,
            background: 'var(--color-neutral-200)',
            borderRadius: 20,
            padding: '13px 14px',
            display: 'flex',
            gap: 11,
            alignItems: 'flex-start',
          }}
        >
          <Logo size={30} radius={9} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>Tiny Home</div>
              <div style={{ fontSize: 11, color: 'var(--color-neutral-600)' }}>19:00</div>
            </div>
            <div style={{ fontSize: 12.5, marginTop: 2, lineHeight: 1.35 }}>{notifPreview}</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: 26, padding: '18px 20px' }}>
        <div style={{ ...kicker, marginBottom: 12 }}>Aparência</div>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>Quadro</div>
        <div style={{ display: 'flex', gap: 9, marginBottom: 18 }}>
          <button style={optionStyle(boardLayout === 'colunas')} onClick={() => setBoardLayout('colunas')}>
            Colunas
          </button>
          <button style={optionStyle(boardLayout === 'lista')} onClick={() => setBoardLayout('lista')}>
            Lista agrupada
          </button>
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>Navegação</div>
        <div style={{ display: 'flex', gap: 9 }}>
          <button style={optionStyle(navStyle === 'abas')} onClick={() => setNavStyle('abas')}>
            Barra de abas
          </button>
          <button style={optionStyle(navStyle === 'pilula')} onClick={() => setNavStyle('pilula')}>
            Pílula flutuante
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--color-accent-2-100)', borderRadius: 26, padding: '18px 20px' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19, marginBottom: 6 }}>Combinado da semana</div>
        <p style={{ fontSize: 13.5, margin: 0, color: 'var(--color-accent-2-900)', lineHeight: 1.5 }}>
          Quem cozinha não lava a louça. Domingo à noite, cinco minutos pra planejar a semana juntos.
        </p>
      </div>

      <button
        type="button"
        className="btn btn-secondary"
        style={{ alignSelf: 'flex-start', minHeight: 44 }}
        onClick={() => supabase.auth.signOut()}
      >
        Sair
      </button>
    </div>
  )
}
