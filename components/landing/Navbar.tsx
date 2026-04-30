'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleAdminLogin = async () => {
    setAdminLoading(true)
    setAdminError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: 'admin@bridgetobrilliance.com',
      password: adminPassword,
    })
    setAdminLoading(false)
    if (error) {
      setAdminError('Invalid password')
      return
    }
    router.push('/dashboard/admin')
  }

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navLinks = [
    { href: '#about', label: 'About' },
    { href: '#features', label: 'Features' },
    { href: '#team', label: 'Team' },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '16px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'rgba(13, 27, 62, 0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4169E1, #FFB300)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              position: 'relative',
            }}>🌉
              <button
                onClick={() => setShowAdminLogin(true)}
                aria-label="Admin Access"
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            </div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#FFB300',
            }}>
              BridgeToBrilliance
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}
          className="desktop-nav">
          {navLinks.map(link => (
            <a key={link.href} href={link.href} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>{link.label}</a>
          ))}
          <Link href="/login" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Sign In</Link>
          <Link href="/register">
            <button className="btn-gold" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              Get Started
            </button>
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '4px',
            zIndex: 110,
          }}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </motion.nav>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowAdminLogin(false); setAdminError(''); setAdminPassword('') }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200,
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#0d1b3e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '32px',
                width: '100%',
                maxWidth: '400px',
              }}
            >
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'white', marginBottom: '8px' }}>
                Admin Access
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
                Enter admin password to continue
              </p>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => { setAdminPassword(e.target.value); setAdminError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdminLogin() }}
                placeholder="Password"
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${adminError ? '#dc3545' : 'rgba(255,255,255,0.1)'}`,
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: adminError ? '8px' : '16px',
                }}
              />
              {adminError && (
                <p style={{ fontSize: '0.8rem', color: '#dc3545', marginBottom: '12px' }}>{adminError}</p>
              )}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => { setShowAdminLogin(false); setAdminError(''); setAdminPassword('') }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdminLogin}
                  disabled={adminLoading || !adminPassword}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: adminPassword ? 'linear-gradient(135deg, #4169E1, #2D4FC8)' : 'rgba(255,255,255,0.05)',
                    color: adminPassword ? 'white' : 'rgba(255,255,255,0.3)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: adminPassword ? 'pointer' : 'default',
                  }}
                >
                  {adminLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '280px',
              background: 'rgba(13, 27, 62, 0.98)',
              backdropFilter: 'blur(20px)',
              zIndex: 99,
              display: 'flex',
              flexDirection: 'column',
              padding: '100px 32px 32px',
              gap: '8px',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  textDecoration: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  padding: '14px 16px',
                  borderRadius: '10px',
                  transition: 'background 0.2s',
                }}
              >
                {link.label}
              </a>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '12px 0' }} />
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                padding: '14px 16px',
                borderRadius: '10px',
              }}
            >
              Sign In
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)}>
              <button className="btn-gold" style={{ width: '100%', padding: '14px 20px', fontSize: '0.95rem', marginTop: '8px' }}>
                Get Started
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 98,
            }}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  )
}
