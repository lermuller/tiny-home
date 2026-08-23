import { useState, type KeyboardEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Plus } from 'lucide-react'
import { Logo } from '../../components/Logo'
import { useLists } from '../../features/lists/useLists'
import { useMe } from '../../features/auth/useMe'
import { ItemRow } from '../../features/lists/ItemRow'
import { TONE_BG } from '../../features/lists/tone'

export function ComprasLista() {
  const { listId } = useParams()
  const navigate = useNavigate()
  const { lists, loading, addItem, toggleItem, deleteItem } = useLists()
  const { me } = useMe()
  const [shopMode, setShopMode] = useState(false)
  const [draft, setDraft] = useState('')

  if (loading) {
    return (
      <div style={{ height: '70dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Logo size={44} radius={14} />
      </div>
    )
  }

  const list = lists.find((l) => l.id === listId)
  if (!list) {
    return (
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 22px) 20px', textAlign: 'center', color: 'var(--color-neutral-600)' }}>
        Lista não encontrada.
      </div>
    )
  }

  const items = shopMode ? list.items.filter((i) => !i.done) : list.items
  const sectionNames: string[] = []
  items.forEach((i) => {
    if (!sectionNames.includes(i.sec)) sectionNames.push(i.sec)
  })

  const open = list.items.filter((i) => !i.done).length
  const listSub = `${open} de ${list.items.length} faltando`
  const emptyLabel = shopMode ? 'Tudo comprado. Podem ir embora.' : 'Lista vazia. Adicione o primeiro item aí embaixo.'

  const handleAdd = () => {
    const name = draft.trim()
    if (!name) return
    void addItem(list.id, name, me?.id ?? null)
    setDraft('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ background: TONE_BG[list.tone], borderRadius: '0 0 34px 34px' }}>
        <div style={{ padding: 'calc(env(safe-area-inset-top) + 18px) 20px 20px' }}>
          <button
            type="button"
            onClick={() => navigate('/compras')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'transparent',
              border: 0,
              padding: 0,
              color: 'inherit',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              cursor: 'pointer',
              opacity: 0.75,
            }}
          >
            <ChevronLeft size={17} strokeWidth={2.75} />
            Compras
          </button>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 34, lineHeight: 1.05, margin: '12px 0 4px' }}>{list.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 10 }}>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{listSub}</div>
            <button
              type="button"
              onClick={() => setShopMode((s) => !s)}
              style={{
                padding: '8px 15px',
                borderRadius: 999,
                fontFamily: 'var(--font-body)',
                fontSize: 12.5,
                cursor: 'pointer',
                border: '1px solid rgba(32,30,29,.18)',
                background: shopMode ? 'var(--color-text)' : 'transparent',
                color: shopMode ? 'var(--color-bg)' : 'var(--color-text)',
              }}
            >
              {shopMode ? 'Saindo do mercado' : 'Estou no mercado'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '18px 20px 176px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
        {sectionNames.map((sec) => (
          <div key={sec} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {list.sections && (
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: 'var(--color-neutral-700)',
                  paddingLeft: 4,
                }}
              >
                {sec}
              </div>
            )}
            {items
              .filter((i) => i.sec === sec)
              .map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  shopMode={shopMode}
                  onToggle={() => void toggleItem(list.id, item.id)}
                  onDelete={() => void deleteItem(list.id, item.id)}
                />
              ))}
          </div>
        ))}
        {sectionNames.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-neutral-600)', fontSize: 14 }}>
            {emptyLabel}
          </div>
        )}
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 'calc(env(safe-area-inset-bottom) + 96px)',
          padding: '0 16px',
          zIndex: 30,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            background: 'var(--color-bg)',
            border: '1px solid var(--color-neutral-400)',
            borderRadius: 999,
            padding: '5px 5px 5px 16px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Adicionar item…"
            style={{
              flex: 1,
              border: 0,
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              color: 'var(--color-text)',
              minWidth: 0,
            }}
          />
          <button
            type="button"
            onClick={handleAdd}
            style={{
              width: 38,
              height: 38,
              flex: 'none',
              borderRadius: 999,
              border: 0,
              background: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Plus size={18} strokeWidth={3} color="#fff8ef" />
          </button>
        </div>
      </div>
    </div>
  )
}
