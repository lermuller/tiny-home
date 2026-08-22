import { Logo } from './Logo'

interface ToastProps {
  text: string
}

export function Toast({ text }: ToastProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 52,
        left: 14,
        right: 14,
        zIndex: 80,
        animation: 'dropIn .22s cubic-bezier(.2,.8,.3,1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 11,
          alignItems: 'flex-start',
          background: 'rgba(250,244,235,.97)',
          border: '1px solid var(--color-neutral-300)',
          borderRadius: 20,
          padding: '12px 14px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <Logo size={30} radius={9} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>Tiny Home</div>
            <div style={{ fontSize: 11, color: 'var(--color-neutral-600)' }}>agora</div>
          </div>
          <div style={{ fontSize: 12.5, marginTop: 2, lineHeight: 1.35 }}>{text}</div>
        </div>
      </div>
    </div>
  )
}
