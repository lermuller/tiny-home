import { useEffect, useState, type ReactNode } from 'react'
import { sheetVisibility } from './sheetVisibility'

interface SheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

// Um sheet position:fixed;bottom:0 fica preso à base da layout viewport, não da área visível —
// quando o teclado abre, o Safari/Chrome mobile não encolhem essa base, e o sheet (ou pelo menos
// os botões no fim dele) ficam escondidos atrás do teclado. A Visual Viewport API avisa o quanto
// da tela ficou coberto, e a gente sobe o sheet exatamente essa distância.
function useKeyboardInset(active: boolean) {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!active || !vv) {
      setInset(0)
      return
    }

    function update() {
      const hidden = window.innerHeight - (vv!.height + vv!.offsetTop)
      // a barra de endereço do mobile Safari também encolhe a visual viewport (por ~50-100px) sem
      // teclado nenhum aberto — só trata como teclado de verdade acima de um teclado físico mínimo,
      // senão o sheet sobe (e descola da barra de navegação) toda hora à toa.
      setInset(hidden > 150 ? Math.round(hidden) : 0)
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [active])

  return inset
}

export function Sheet({ open, onClose, children }: SheetProps) {
  const keyboardInset = useKeyboardInset(open)

  useEffect(() => {
    if (!open) return
    sheetVisibility.register()
    return () => sheetVisibility.unregister()
  }, [open])

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
          bottom: keyboardInset,
          zIndex: 70,
          background: 'var(--color-bg)',
          borderRadius: '34px 34px 0 0',
          padding: '14px 22px 40px',
          animation: 'sheetUp .26s cubic-bezier(.2,.8,.3,1)',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: `calc(86dvh - ${keyboardInset}px)`,
          overflowY: 'auto',
          transition: 'bottom .12s ease',
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
