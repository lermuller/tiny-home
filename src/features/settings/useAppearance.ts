import { useSyncExternalStore } from 'react'
import { appearanceStore } from './appearanceStore'

export function useAppearance() {
  const state = useSyncExternalStore(appearanceStore.subscribe, appearanceStore.get, appearanceStore.get)
  return { ...state, setBoardLayout: appearanceStore.setBoardLayout, setNavStyle: appearanceStore.setNavStyle }
}
