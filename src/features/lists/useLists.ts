import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { ListItem, ListTone, ShoppingList } from '../../lib/types'

interface ListItemRow {
  id: string
  name: string
  section: string | null
  done: boolean
}

interface ListRow {
  id: string
  name: string
  tone: string
  sectioned: boolean
  list_items: ListItemRow[]
}

export function useLists() {
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [loading, setLoading] = useState(true)

  const loadLists = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true)
    const { data, error } = await supabase
      .from('lists')
      .select('id, name, tone, sectioned, position, list_items(id, name, section, done, position)')
      .order('position')
      .order('position', { referencedTable: 'list_items' })
    if (!error && data) {
      setLists(
        (data as ListRow[]).map((l) => ({
          id: l.id,
          name: l.name,
          tone: l.tone as ListTone,
          sections: l.sectioned,
          items: l.list_items.map((i): ListItem => ({ id: i.id, name: i.name, sec: i.section ?? 'Itens', done: i.done })),
        })),
      )
    }
    if (!opts?.silent) setLoading(false)
  }, [])

  useEffect(() => {
    void loadLists()
  }, [loadLists])

  // canal único: mudanças em lists OU list_items (de qualquer aparelho) revalidam tudo
  useEffect(() => {
    const channel = supabase
      .channel(`lists-changes-${crypto.randomUUID()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lists' }, () => {
        void loadLists({ silent: true })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'list_items' }, () => {
        void loadLists({ silent: true })
      })
      .subscribe()

    function revalidate() {
      if (document.visibilityState === 'visible') void loadLists({ silent: true })
    }
    document.addEventListener('visibilitychange', revalidate)
    window.addEventListener('online', revalidate)
    window.addEventListener('focus', revalidate)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', revalidate)
      window.removeEventListener('online', revalidate)
      window.removeEventListener('focus', revalidate)
    }
  }, [loadLists])

  async function createList(name: string, tone: ListTone, sectioned: boolean) {
    const { data, error } = await supabase
      .from('lists')
      .insert({ name, tone, sectioned, position: lists.length })
      .select('id, name, tone, sectioned')
      .single()

    if (error || !data) return null

    setLists((prev) => [...prev, { id: data.id, name: data.name, tone: data.tone as ListTone, sections: data.sectioned, items: [] }])
    return data.id as string
  }

  async function addItem(listId: string, name: string, memberId: string | null) {
    const list = lists.find((l) => l.id === listId)
    if (!list) return

    const section = list.sections ? 'Adicionados' : 'Itens'
    const tempId = `temp-${crypto.randomUUID()}`
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, items: [...l.items, { id: tempId, name, sec: section, done: false }] } : l)),
    )

    const { data, error } = await supabase
      .from('list_items')
      .insert({ list_id: listId, name, section, added_by: memberId, position: list.items.length })
      .select('id, name, section, done')
      .single()

    if (error || !data) {
      setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, items: l.items.filter((i) => i.id !== tempId) } : l)))
      return
    }

    setLists((prev) =>
      prev.map((l) =>
        l.id !== listId
          ? l
          : { ...l, items: l.items.map((i) => (i.id === tempId ? { id: data.id, name: data.name, sec: data.section ?? section, done: data.done } : i)) },
      ),
    )
  }

  async function toggleItem(listId: string, itemId: string) {
    const list = lists.find((l) => l.id === listId)
    const item = list?.items.find((i) => i.id === itemId)
    if (!item) return

    const nextDone = !item.done
    setLists((prev) =>
      prev.map((l) => (l.id !== listId ? l : { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, done: nextDone } : i)) })),
    )

    const { error } = await supabase
      .from('list_items')
      .update({ done: nextDone, done_at: nextDone ? new Date().toISOString() : null })
      .eq('id', itemId)

    if (error) {
      setLists((prev) =>
        prev.map((l) => (l.id !== listId ? l : { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, done: item.done } : i)) })),
      )
    }
  }

  return { lists, loading, createList, addItem, toggleItem }
}
