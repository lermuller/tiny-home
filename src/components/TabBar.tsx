import { Link, useLocation } from 'react-router-dom'
import { NAV_TABS } from './navTabs'

export function TabBar() {
  const { pathname } = useLocation()

  return (
    <nav
      style={{
        flex: 'none',
        display: 'flex',
        alignItems: 'stretch',
        padding: '10px 12px 30px',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-divider)',
        zIndex: 35,
      }}
    >
      {NAV_TABS.map(({ path, label, Icon }) => {
        const active = pathname.startsWith(path)
        return (
          <Link
            key={path}
            to={path}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '6px 0',
              minHeight: 44,
              justifyContent: 'center',
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              color: active ? 'var(--color-accent)' : 'var(--color-neutral-600)',
              transition: 'color .16s ease',
            }}
          >
            <Icon size={21} strokeWidth={2.75} />
            <span style={{ fontSize: 10.5, fontWeight: 600 }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
