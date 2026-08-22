import { Link, useLocation } from 'react-router-dom'
import { NAV_TABS } from './navTabs'

export function PillNav() {
  const { pathname } = useLocation()

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 'calc(env(safe-area-inset-bottom) + 26px)',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 35,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: 7,
          borderRadius: 999,
          background: 'rgba(32,30,29,.94)',
          boxShadow: 'var(--shadow-lg)',
          pointerEvents: 'auto',
        }}
      >
        {NAV_TABS.map(({ path, label, Icon }) => {
          const active = pathname.startsWith(path)
          return (
            <Link
              key={path}
              to={path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: active ? '10px 16px' : '10px 13px',
                minHeight: 44,
                borderRadius: 999,
                textDecoration: 'none',
                fontFamily: 'var(--font-body)',
                background: active ? 'var(--color-accent)' : 'transparent',
                color: active ? '#fff8ef' : 'var(--color-neutral-400)',
                transition: 'all .18s ease',
              }}
            >
              <Icon size={19} strokeWidth={2.75} />
              <span style={{ fontSize: 13, fontWeight: 600, display: active ? 'inline' : 'none' }}>{label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
