'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    setError('')

    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          role: 'student',
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
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
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-dark)',
            marginBottom: '12px',
          }}>
            Check Your Email!
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-dark-muted)', marginBottom: '24px' }}>
            We&apos;ve sent a verification link to your email. Please verify your account before signing in.
          </p>
          <Link href="/login">
            <button className="btn-primary" style={{ padding: '12px 32px' }}>
              Go to Sign In
            </button>
          </Link>
        </motion.div>
      </div>
    )
  }

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${hasError ? '#dc3545' : '#ddd'}`,
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'var(--font-body)',
    boxSizing: 'border-box' as const,
  })

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
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{
                width: '40px', height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4169E1, #FFB300)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}>🌉</div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: '#4169E1' }}>
                BridgeToBrilliance
              </span>
            </div>
          </Link>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.8rem',
            fontWeight: 700,
            color: 'var(--text-dark)',
            marginBottom: '8px',
          }}>
            Create Account
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-dark-muted)' }}>
            Join BridgeToBrilliance and start learning
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>
              Full Name
            </label>
            <input
              {...register('full_name')}
              type="text"
              placeholder="John Doe"
              style={inputStyle(!!errors.full_name)}
              onFocus={(e) => e.currentTarget.style.borderColor = '#4169E1'}
              onBlur={(e) => e.currentTarget.style.borderColor = errors.full_name ? '#dc3545' : '#ddd'}
            />
            {errors.full_name && <p style={{ fontSize: '0.8rem', color: '#dc3545', marginTop: '4px' }}>{errors.full_name.message}</p>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              style={inputStyle(!!errors.email)}
              onFocus={(e) => e.currentTarget.style.borderColor = '#4169E1'}
              onBlur={(e) => e.currentTarget.style.borderColor = errors.email ? '#dc3545' : '#ddd'}
            />
            {errors.email && <p style={{ fontSize: '0.8rem', color: '#dc3545', marginTop: '4px' }}>{errors.email.message}</p>}
          </div>



          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              style={inputStyle(!!errors.password)}
              onFocus={(e) => e.currentTarget.style.borderColor = '#4169E1'}
              onBlur={(e) => e.currentTarget.style.borderColor = errors.password ? '#dc3545' : '#ddd'}
            />
            {errors.password && <p style={{ fontSize: '0.8rem', color: '#dc3545', marginTop: '4px' }}>{errors.password.message}</p>}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>
              Confirm Password
            </label>
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="••••••••"
              style={inputStyle(!!errors.confirmPassword)}
              onFocus={(e) => e.currentTarget.style.borderColor = '#4169E1'}
              onBlur={(e) => e.currentTarget.style.borderColor = errors.confirmPassword ? '#dc3545' : '#ddd'}
            />
            {errors.confirmPassword && <p style={{ fontSize: '0.8rem', color: '#dc3545', marginTop: '4px' }}>{errors.confirmPassword.message}</p>}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(220, 53, 69, 0.1)',
                border: '1px solid rgba(220, 53, 69, 0.2)',
                color: '#dc3545',
                fontSize: '0.85rem',
                marginBottom: '20px',
              }}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '0.95rem',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-dark-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#4169E1', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
