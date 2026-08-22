import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Logo } from '../../components/Logo'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../features/auth/useAuth'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function Login() {
  const { session, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

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
        <div style={{ width: '100%', maxWidth: 340, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14.5, lineHeight: 1.5 }}>
            Olhe seu e-mail. Mandamos um link para <strong>{email}</strong>.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={() => {
              setStatus('idle')
              setEmail('')
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
