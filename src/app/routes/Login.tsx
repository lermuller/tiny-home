import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Logo } from '../../components/Logo'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../features/auth/useAuth'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function Login() {
  const { session, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [codeError, setCodeError] = useState('')

  if (!loading && session) {
    return <Navigate to="/hoje" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })

    if (error) {
      setStatus('error')
      setErrorMessage(
        error.status === 429
          ? 'Você já pediu um link há pouco. Espere um minuto e tente de novo.'
          : 'Não foi possível entrar com esse e-mail. Confirme que é o e-mail cadastrado da casa.',
      )
      return
    }

    setStatus('sent')
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault()
    setVerifying(true)
    setCodeError('')

    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' })

    setVerifying(false)
    if (error) {
      setCodeError('Código errado ou expirado. Confere os 6 dígitos e tenta de novo.')
      return
    }
    // sessão entra sozinha via onAuthStateChange; RequireAuth cuida do redirect
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 28px',
        gap: 28,
      }}
    >
      <Logo size={64} radius={20} />

      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 34, lineHeight: 1.05, margin: 0 }}>Tiny Home</h1>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-700)', marginTop: 8 }}>A casa da Evelyn e do Leo.</p>
      </div>

      {status === 'sent' ? (
        <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{ fontSize: 14.5, lineHeight: 1.5, textAlign: 'center' }}>
            Olhe seu e-mail. Mandamos um link e um código de 6 dígitos para <strong>{email}</strong>.
          </p>

          <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--color-neutral-700)', textAlign: 'center' }}>
              Instalou na tela de início? Use o código — o link abre no navegador, não no app instalado.
            </div>
            <input
              className="input"
              type="text"
              inputMode="numeric"
              autoFocus
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ minHeight: 44, textAlign: 'center', fontSize: 20, letterSpacing: '0.3em' }}
            />
            {codeError && <div style={{ fontSize: 13, color: 'var(--color-accent-700)', textAlign: 'center' }}>{codeError}</div>}
            <button type="submit" className="btn btn-primary btn-block" disabled={verifying || !code} style={{ minHeight: 44 }}>
              {verifying ? 'Confirmando…' : 'Confirmar código'}
            </button>
          </form>

          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={() => {
              setStatus('idle')
              setEmail('')
              setCode('')
              setCodeError('')
            }}
          >
            Usar outro e-mail
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <input
            className="input"
            type="email"
            required
            autoFocus
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ minHeight: 44, textAlign: 'center' }}
          />
          {status === 'error' && (
            <div style={{ fontSize: 13, color: 'var(--color-accent-700)', textAlign: 'center' }}>{errorMessage}</div>
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={status === 'sending'} style={{ minHeight: 44 }}>
            {status === 'sending' ? 'Enviando…' : 'Entrar com link mágico'}
          </button>
        </form>
      )}
    </div>
  )
}
