'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
})

type ForgotForm = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true)
    setError('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-offwhite)',
      padding: '20px',
    }}>
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #4169E1, #FFB300)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
            }}>🌉</div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: '#4169E1' }}>
              BridgeToBrilliance
            </span>
          </div>
        </Link>

        {sent ? (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📧</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '12px' }}>
              Check Your Email
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-dark-muted)', marginBottom: '24px' }}>
              If an account exists with that email, we&apos;ve sent password reset instructions.
            </p>
            <Link href="/login">
              <button className="btn-primary" style={{ padding: '12px 32px' }}>
                Back to Sign In
              </button>
            </Link>
          </>
        ) : (
          <>
            <h1 style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700,
              color: 'var(--text-dark)', marginBottom: '8px',
            }}>
              Reset Password
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-dark-muted)', marginBottom: '32px' }}>
              Enter your email and we&apos;ll send you reset instructions
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-dark)' }}>
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${errors.email ? '#dc3545' : '#ddd'}`,
                    fontSize: '0.9rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
                  }}
                />
                {errors.email && <p style={{ fontSize: '0.8rem', color: '#dc3545', marginTop: '4px' }}>{errors.email.message}</p>}
              </div>

              {error && (
                <div style={{
                  padding: '12px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(220,53,69,0.1)', color: '#dc3545',
                  fontSize: '0.85rem', marginBottom: '20px',
                }}>{error}</div>
              )}

              <button type="submit" disabled={loading} className="btn-primary"
                style={{ width: '100%', padding: '14px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-dark-muted)' }}>
              <Link href="/login" style={{ color: '#4169E1', textDecoration: 'none', fontWeight: 600 }}>
                ← Back to Sign In
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}
