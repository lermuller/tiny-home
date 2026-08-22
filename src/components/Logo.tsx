interface LogoProps {
  size?: number
  tile?: string
  mark?: string
  radius?: number
}

export function Logo({ size = 30, tile = '#c67139', mark = '#fff8ef', radius = 9 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ flex: 'none', borderRadius: radius }}>
      <rect width="32" height="32" rx="10" fill={tile} />
      <path
        d="M8.5 24.5v-8.2a7.5 7.5 0 0 1 15 0v8.2a1.5 1.5 0 0 1-1.5 1.5h-3.6v-5.6a2.4 2.4 0 0 0-4.8 0V26h-3.6a1.5 1.5 0 0 1-1.5-1.5z"
        fill={mark}
      />
    </svg>
  )
}
