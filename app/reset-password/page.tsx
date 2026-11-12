'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

/**
 * The recovery email redirects here (see app/forgot-password/page.tsx).
 * This route previously did not exist, so every reset link 404'd.
 */
export default function ResetPasswordPage() {
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid'>('checking')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    const resolveSession = async () => {
      // @supabase/ssr uses the PKCE flow, so the link carries ?code=...
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (active) setStatus(exchangeError ? 'invalid' : 'ready')
        return
      }

      // Fall back to an already-established recovery session.
      const { data } = await supabase.auth.getSession()
      if (active) setStatus(data.session ? 'ready' : 'invalid')
    }

    resolveSession()

    // Hash-based links arrive after mount, so listen as well.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (session && active) setStatus('ready')
      }
    )

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // Force a fresh sign-in with the new password.
    await supabase.auth.signOut()
    setDone(true)
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid #ddd',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'var(--font-body)',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-offwhite)',
        padding: '20px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          padding: '48px 40px',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            <Image
              src="/pictures/logo.png"
              alt="BridgeToBrilliance"
              width={40}
              height={40}
              style={{ borderRadius: '10px', objectFit: 'contain' }}
            />
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.3rem',
                fontWeight: 700,
                color: '#4169E1',
              }}
            >
              BridgeToBrilliance
            </span>
          </div>
        </Link>

        {done ? (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-dark)',
                marginBottom: '12px',
              }}
            >
              Password Updated
            </h2>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-dark-muted)',
                marginBottom: '24px',
              }}
            >
              Your password has been changed. Sign in with your new password.
            </p>
            <Link href="/login">
              <button className="btn-primary" style={{ padding: '12px 32px' }}>
                Go to Sign In
              </button>
            </Link>
          </>
        ) : status === 'invalid' ? (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-dark)',
                marginBottom: '12px',
              }}
            >
              Link Expired
            </h2>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-dark-muted)',
                marginBottom: '24px',
              }}
            >
              This reset link is invalid or has expired. Request a new one to continue.
            </p>
            <Link href="/forgot-password">
              <button className="btn-primary" style={{ padding: '12px 32px' }}>
                Request New Link
              </button>
            </Link>
          </>
        ) : status === 'checking' ? (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-dark-muted)' }}>
            Verifying your reset link…
          </p>
        ) : (
          <>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.8rem',
                fontWeight: 700,
                color: 'var(--text-dark)',
                marginBottom: '8px',
              }}
            >
              Set a New Password
            </h1>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-dark-muted)',
                marginBottom: '32px',
              }}
            >
              Choose a password with at least 8 characters
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text-dark)',
                  }}
                >
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text-dark)',
                  }}
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </div>

              {error && (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(220,53,69,0.1)',
                    color: '#dc3545',
                    fontSize: '0.85rem',
                    marginBottom: '20px',
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
