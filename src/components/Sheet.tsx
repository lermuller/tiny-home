import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { sheetVisibility } from './sheetVisibility'

interface SheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

// Um sheet position:fixed;bottom:0 fica preso à base da layout viewport, não da área visível —
// quando o teclado abre, o Safari/Chrome mobile não encolhem essa base, e o sheet (ou pelo menos
// os botões no fim dele) ficam escondidos atrás do teclado. A Visual Viewport API avisa o quanto
// da tela ficou coberto — mas a barra de endereço do mobile Safari encolhe/expande a mesma
// viewport (às vezes bem mais que um valor fixo de corte), sem teclado nenhum aberto. Por isso só
// aplicamos o desconto enquanto um campo de texto está mesmo focado — é a única situação em que um
// teclado de verdade pode estar na tela.
function useKeyboardInset(active: boolean) {
  const [inset, setInset] = useState(0)
  const [fieldFocused, setFieldFocused] = useState(false)

  useEffect(() => {
    if (!active) {
      setFieldFocused(false)
      return
    }

    function isField(el: EventTarget | null) {
      const tag = (el as HTMLElement)?.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA'
    }
    function onFocusIn(e: FocusEvent) {
      if (isField(e.target)) setFieldFocused(true)
    }
    function onFocusOut(e: FocusEvent) {
      if (isField(e.target)) setFieldFocused(false)
    }

    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [active])

  useEffect(() => {
    const vv = window.visualViewport
    if (!active || !vv || !fieldFocused) {
      setInset(0)
      return
    }

    function update() {
      const hidden = window.innerHeight - (vv!.height + vv!.offsetTop)
      setInset(Math.max(0, Math.round(hidden)))
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [active, fieldFocused])

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

  // Renderiza direto em document.body: um <div style="overflow:auto"> ancestral (a área de rolagem
  // do Layout) faz o Safari no iPhone conter elementos position:fixed dentro dos SEUS próprios
  // limites em vez da tela inteira — então bottom:0 virava "embaixo da área de rolagem", que
  // termina onde a barra de navegação começa, não no fim de verdade da tela. Fora da árvore, esse
  // problema não existe.
  return createPortal(
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
    </>,
    document.body,
  )
}
