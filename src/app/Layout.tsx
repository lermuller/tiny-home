import { Outlet } from 'react-router-dom'
import { TabBar } from '../components/TabBar'
import { PillNav } from '../components/PillNav'
import { useAppearance } from '../features/settings/useAppearance'

export function Layout() {
  const { navStyle } = useAppearance()

  return (
    <div
      style={{
        height: '100dvh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Outlet />
      </div>
      {navStyle === 'abas' ? <TabBar /> : <PillNav />}
    </div>
  )
}
