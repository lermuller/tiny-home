import { useCallback, useRef, useState, type ReactNode } from 'react'
import { Toast } from './Toast'
import { ToastContext } from './toastContext'

export function ToastProvider({ children }: { children: ReactNode }) {
  const [text, setText] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const showToast = useCallback((message: string) => {
    clearTimeout(timeoutRef.current)
    setText(message)
    timeoutRef.current = setTimeout(() => setText(null), 2600)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {text && <Toast text={text} />}
    </ToastContext.Provider>
  )
}
