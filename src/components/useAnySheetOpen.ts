import { useSyncExternalStore } from 'react'
import { sheetVisibility } from './sheetVisibility'

export function useAnySheetOpen() {
  return useSyncExternalStore(sheetVisibility.subscribe, sheetVisibility.isAnyOpen, sheetVisibility.isAnyOpen)
}
