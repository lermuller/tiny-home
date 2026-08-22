import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Logo } from '../../components/Logo'
import { useLists } from '../../features/lists/useLists'
import { useFrequentItems } from '../../features/lists/useFrequentItems'
import { useMe } from '../../features/auth/useMe'
import { useToast } from '../../components/useToast'
import { ListCard } from '../../features/lists/ListCard'
import { NewListSheet } from '../../features/lists/NewListSheet'
import { FrequentItemsCard } from '../../features/lists/FrequentItemsCard'
import type { ListTone } from '../../lib/types'

export function Compras() {
  const navigate = useNavigate()
  const { lists, loading, createList, addItem } = useLists()
  const { me } = useMe()
  const showToast = useToast()
  const [sheetOpen, setSheetOpen] = useState(false)

  const mercado = lists.find((l) => l.name === 'Mercado')
  const frequentNames = useFrequentItems(mercado?.id ?? null)

  if (loading) {
    return (
      <div style={{ height: '70dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Logo size={44} radius={14} />
      </div>
    )
  }

  async function handleCreate(name: string, tone: ListTone, sectioned: boolean) {
    const id = await createList(name, tone, sectioned)
    setSheetOpen(false)
    if (id) navigate(`/compras/${id}`)
  }

  function handleFrequentAdd(name: string) {
    if (!mercado) return
    void addItem(mercado.id, name, me?.id ?? null)
    showToast(`${name} foi para a lista do Mercado.`)
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
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 38, lineHeight: 1.05, margin: 0 }}>Compras</h1>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-700)', margin: '6px 0 0' }}>
          Uma lista para cada lugar aonde vocês vão.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {lists.map((list) => (
          <ListCard key={list.id} list={list} onOpen={() => navigate(`/compras/${list.id}`)} />
        ))}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          style={{
            minHeight: 132,
            border: '1.5px dashed var(--color-neutral-400)',
            background: 'transparent',
            borderRadius: 28,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: 'var(--color-neutral-700)',
            fontFamily: 'var(--font-body)',
            fontSize: 13.5,
            cursor: 'pointer',
          }}
        >
          <Plus size={20} strokeWidth={2.75} />
          Nova lista
        </button>
      </div>

      <FrequentItemsCard names={frequentNames} mercado={mercado} onAdd={handleFrequentAdd} />

      <NewListSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onCreate={handleCreate} />
    </div>
  )
}
