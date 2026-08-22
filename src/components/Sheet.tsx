import type { ReactNode } from 'react'

interface SheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function Sheet({ open, onClose, children }: SheetProps) {
  if (!open) return null

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(46,43,37,.45)',
          zIndex: 60,
          animation: 'fadeIn .18s ease',
        }}
      />
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 70,
          background: 'var(--color-bg)',
          borderRadius: '34px 34px 0 0',
          padding: '14px 22px 40px',
          animation: 'sheetUp .26s cubic-bezier(.2,.8,.3,1)',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '86dvh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            width: 44,
            height: 5,
            borderRadius: 999,
            background: 'var(--color-neutral-400)',
            margin: '0 auto 18px',
          }}
        />
        {children}
      </div>
    </>
  )
}
