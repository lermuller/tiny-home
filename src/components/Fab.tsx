import { Plus } from 'lucide-react'

interface FabProps {
  navStyle: 'abas' | 'pilula'
  onClick: () => void
}

export function Fab({ navStyle, onClick }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Nova tarefa"
      style={{
        position: 'absolute',
        right: 18,
        bottom: `calc(env(safe-area-inset-bottom) + ${navStyle === 'abas' ? 108 : 100}px)`,
        width: 58,
        height: 58,
        borderRadius: 999,
        border: 0,
        background: 'var(--color-accent)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 40,
      }}
    >
      <Plus size={24} strokeWidth={3} color="#fff8ef" />
    </button>
  )
}
