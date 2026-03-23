'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database.types'

const ProfileContext = createContext<Profile | null>(null)
export const useProfile = () => useContext(ProfileContext)

const navItems = {
  student: [
    { href: '/dashboard/student', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/student#subjects', label: 'My Subjects', icon: '📚' },
    { href: '/dashboard/student#grades', label: 'My Grades', icon: '📝' },
  ],
  teacher: [
    { href: '/dashboard/teacher', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/teacher#subjects', label: 'My Subjects', icon: '📚' },
    { href: '/dashboard/teacher#gradebook', label: 'Gradebook', icon: '📝' },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/admin#users', label: 'Users', icon: '👥' },
    { href: '/dashboard/admin#subjects', label: 'Subjects', icon: '📚' },
    { href: '/dashboard/admin#announcements', label: 'Announcements', icon: '📢' },
  ],
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setProfile(data as Profile)
      }
      setLoading(false)
    }

    getProfile()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-navy)',
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '40px', height: '40px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: '#FFB300',
            borderRadius: '50%',
          }}
        />
      </div>
    )
  }

  const role = profile?.role || 'student'
  const items = navItems[role] || navItems.student

  return (
    <ProfileContext.Provider value={profile}>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-navy)' }}>
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: sidebarOpen ? 0 : -280 }}
          transition={{ duration: 0.3 }}
          style={{
            width: '280px',
            minWidth: '280px',
            background: 'var(--bg-navy)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {/* Logo */}
          <div style={{
            padding: '24px 24px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #4169E1, #FFB300)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
              }}>🌉</div>
              <span style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.1rem',
                fontWeight: 700, color: '#FFB300',
              }}>BridgeToBrilliance</span>
            </Link>
          </div>

          {/* Nav items */}
          <nav style={{ padding: '16px 12px', flex: 1 }}>
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      marginBottom: '4px',
                      background: isActive ? 'rgba(65, 105, 225, 0.15)' : 'transparent',
                      color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                    {isActive && (
                      <div style={{
                        marginLeft: 'auto', width: '6px', height: '6px',
                        borderRadius: '50%', background: '#FFB300',
                      }} />
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* User profile */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #4169E1, #2D4FC8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, color: 'white',
              }}>
                {profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>
                  {profile?.full_name || 'User'}
                </div>
                <div style={{
                  fontSize: '0.7rem', color: '#FFB300', textTransform: 'capitalize',
                  fontWeight: 600,
                }}>
                  {role}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '10px',
                borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: 'rgba(255,255,255,0.5)',
                fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(220,53,69,0.1)'
                e.currentTarget.style.borderColor = 'rgba(220,53,69,0.3)'
                e.currentTarget.style.color = '#dc3545'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
              }}
            >
              Sign Out
            </button>
          </div>
        </motion.aside>

        {/* Main content */}
        <main style={{
          flex: 1,
          marginLeft: sidebarOpen ? '280px' : '0',
          transition: 'margin-left 0.3s',
          minHeight: '100vh',
        }}>
          {/* Top bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 32px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
                fontSize: '1.2rem', cursor: 'pointer', padding: '4px 8px',
              }}
            >
              ☰
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{
                padding: '4px 12px', borderRadius: '20px',
                background: 'rgba(255, 179, 0, 0.1)', border: '1px solid rgba(255, 179, 0, 0.2)',
                color: '#FFB300', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
              }}>
                {role}
              </span>
            </div>
          </div>

          {/* Page content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ padding: '32px' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </ProfileContext.Provider>
  )
}
