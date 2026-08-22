export type BoardLayout = 'colunas' | 'lista'
export type NavStyle = 'abas' | 'pilula'

interface Appearance {
  boardLayout: BoardLayout
  navStyle: NavStyle
}

const STORAGE_KEY = 'tinyhome.appearance'
const DEFAULTS: Appearance = { boardLayout: 'colunas', navStyle: 'abas' }

function readStored(): Appearance {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw)
    return {
      boardLayout: parsed.boardLayout === 'lista' ? 'lista' : 'colunas',
      navStyle: parsed.navStyle === 'pilula' ? 'pilula' : 'abas',
    }
  } catch {
    return DEFAULTS
  }
}

let state = readStored()
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const appearanceStore = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  setBoardLayout(boardLayout: BoardLayout) {
    state = { ...state, boardLayout }
    persist()
    emit()
  },
  setNavStyle(navStyle: NavStyle) {
    state = { ...state, navStyle }
    persist()
    emit()
  },
}
