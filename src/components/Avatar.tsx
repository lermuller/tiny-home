import type { CSSProperties } from 'react'
import type { Member } from '../lib/types'

interface AvatarProps {
  member: Member | null // null = "Os dois"
  size?: number
  style?: CSSProperties
}

export function Avatar({ member, size = 28, style }: AvatarProps) {
  const bg = member ? member.color : 'var(--color-neutral-500)'
  const initial = member ? member.initial : '2'

  return (
    <div
      style={{
        width: size,
        height: size,
        flex: 'none',
        borderRadius: 999,
        background: bg,
        color: '#fff8ef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.42,
        fontWeight: 700,
        ...style,
      }}
    >
      {initial}
    </div>
  )
}
