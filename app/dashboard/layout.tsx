'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  Video,
  Bell,
  Sparkles,
  Timer,
  Lightbulb,
  FileText,
  Bookmark,
  Award,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  UserCheck,
  ArrowRightLeft,
} from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { MOCK_STUDENT_PROFILE, MOCK_TEACHER_PROFILE } from '@/lib/mockData'
import { DashboardContext } from './DashboardContext'
import type { Profile } from '@/types/database.types'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const studentNavItems: NavItem[] = [
  { href: '/dashboard/student', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/student#subjects', label: 'My Enrolled Courses', icon: BookOpen },
  { href: '/dashboard/student/study', label: 'Study Hub', icon: Sparkles, badge: 'AI Hub' },
  { href: '/dashboard/student/study/quizzes', label: 'Quizzes & Practice', icon: Lightbulb },
  { href: '/dashboard/student/study/flashcards', label: 'Flashcards', icon: Award },
  { href: '/dashboard/student/study/timer', label: 'Pomodoro Timer', icon: Timer },
  { href: '/dashboard/student/study/groups', label: 'Study Groups', icon: Users },
  { href: '/dashboard/student/study/notes', label: 'Personal Notes', icon: FileText },
  { href: '/dashboard/student/study/bookmarks', label: 'Saved Bookmarks', icon: Bookmark },
]

const teacherNavItems: NavItem[] = [
  { href: '/dashboard/teacher', label: 'Educator Console', icon: LayoutDashboard },
  { href: '/dashboard/teacher#subjects', label: 'Course Offerings', icon: BookOpen },
  { href: '/dashboard/teacher#gradebook', label: 'Gradebook & Feedback', icon: GraduationCap, badge: 'Active' },
  { href: '/dashboard/teacher#classes', label: 'Live Video Sessions', icon: Video },
  { href: '/dashboard/teacher#announcements', label: 'Announcements Feed', icon: Bell },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Determine current active role from pathname
  const isTeacherRoute = pathname.includes('/dashboard/teacher')
  const [activeRole, setActiveRole] = useState<'student' | 'teacher' | 'admin'>(
    isTeacherRoute ? 'teacher' : 'student'
  )
  const [profile, setProfile] = useState<Profile | null>(
    isTeacherRoute ? MOCK_TEACHER_PROFILE : MOCK_STUDENT_PROFILE
  )
  const [isDemo, setIsDemo] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    const checkAuth = async () => {
      try {
        if (!isSupabaseConfigured()) {
          setIsDemo(true)
          const chosenRole = pathname.includes('/dashboard/teacher') ? 'teacher' : 'student'
          setActiveRole(chosenRole)
          setProfile(chosenRole === 'teacher' ? MOCK_TEACHER_PROFILE : MOCK_STUDENT_PROFILE)
          return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (data && !cancelled) {
            setProfile(data as Profile)
            setActiveRole((data.role as 'student' | 'teacher' | 'admin') || 'student')
            setIsDemo(false)
            return
          }
        }
      } catch (e) {
        console.warn('Using demo dashboard mode:', e)
      }

      // Default demo fallback based on current path
      if (!cancelled) {
        setIsDemo(true)
        const currentRole = pathname.includes('/dashboard/teacher') ? 'teacher' : 'student'
        setActiveRole(currentRole)
        setProfile(currentRole === 'teacher' ? MOCK_TEACHER_PROFILE : MOCK_STUDENT_PROFILE)
      }
    }

    checkAuth()
    return () => {
      cancelled = true
    }
  }, [pathname, supabase])

  const toggleRole = useCallback((targetRole: 'student' | 'teacher') => {
    setActiveRole(targetRole)
    if (targetRole === 'teacher') {
      setProfile(MOCK_TEACHER_PROFILE)
      router.push('/dashboard/teacher')
    } else {
      setProfile(MOCK_STUDENT_PROFILE)
      router.push('/dashboard/student')
    }
  }, [router])

  const handleLogout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut()
    }
    router.push('/login')
  }, [router, supabase])

  const navItems = activeRole === 'teacher' ? teacherNavItems : studentNavItems

  return (
    <DashboardContext.Provider value={{ profile, role: activeRole, isDemoMode: isDemo, toggleRole }}>
      <div className="flex min-h-screen bg-[#F8FAFC] text-slate-800 antialiased selection:bg-amber-400 selection:text-slate-900">
        {/* Desktop Sidebar */}
        <aside
          className={`fixed top-0 bottom-0 left-0 z-40 hidden md:flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out shadow-sm ${
            sidebarOpen ? 'w-72' : 'w-20'
          }`}
        >
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between h-20 px-5 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-3 overflow-hidden group">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/pictures/logo.png"
                  alt="BridgeToBrilliance"
                  width={28}
                  height={28}
                  className="rounded-lg object-contain brightness-0 invert"
                />
              </div>
              {sidebarOpen && (
                <div className="flex flex-col transition-opacity duration-200">
                  <span className="font-heading font-bold text-lg leading-tight tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                    BridgeToBrilliance
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                    {activeRole === 'teacher' ? 'Faculty Portal' : 'Student Portal'}
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

          {/* Quick Role Switcher Banner in Sidebar — demo only: a real user's role
              comes from the profiles table, and switching it here was immediately
              reverted by the auth effect below. */}
          {sidebarOpen && isDemo && (
            <div className="p-4 mx-3 my-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-100/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-blue-900/70 uppercase tracking-wider flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  Active Role
                </span>
                {isDemo && (
                  <span className="text-[10px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Demo Mode
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-white rounded-lg border border-blue-100 shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleRole('student')}
                  className={`text-xs font-semibold py-1.5 px-2 rounded-md transition-all ${
                    activeRole === 'student'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => toggleRole('teacher')}
                  className={`text-xs font-semibold py-1.5 px-2 rounded-md transition-all ${
                    activeRole === 'teacher'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Teacher
                </button>
              </div>
            </div>
          )}

          {/* Nav Items */}
          <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {sidebarOpen && (
              <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Navigation
              </p>
            )}
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/dashboard/student' && item.href !== '/dashboard/teacher' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'
                    }`}
                  />
                  {sidebarOpen && (
                    <span className="flex-1 truncate tracking-tight">{item.label}</span>
                  )}
                  {sidebarOpen && item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Profile & Footer in Sidebar */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors ${!sidebarOpen ? 'justify-center' : ''}`}>
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-blue-100 border border-blue-200 shrink-0">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Profile'}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-blue-700 text-sm">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {profile?.full_name || 'Academic User'}
                  </p>
                  <p className="text-xs text-slate-500 truncate capitalize">
                    {activeRole} • {isDemo ? 'Interactive Preview' : 'Connected'}
                  </p>
                </div>
              )}
              {sidebarOpen && (
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign out / Exit"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Header & Sidebar Overlay */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Image src="/pictures/logo.png" alt="Logo" width={20} height={20} className="brightness-0 invert" />
            </div>
            <span className="font-heading font-bold text-slate-900 text-sm">BridgeToBrilliance</span>
          </Link>
          <div className="flex items-center gap-2">
            {isDemo && (
            <button
              onClick={() => toggleRole(activeRole === 'student' ? 'teacher' : 'student')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{activeRole === 'student' ? 'Teacher' : 'Student'}</span>
            </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-out Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -280 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -280 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col md:hidden border-r border-slate-200"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <span className="font-heading font-bold text-slate-900">Portal Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                        isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
              {isDemo && (
              <div className="p-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    toggleRole(activeRole === 'student' ? 'teacher' : 'student')
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Switch to {activeRole === 'student' ? 'Teacher' : 'Student'} View
                </button>
              </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'md:ml-72' : 'md:ml-20'
          }`}
        >
          {/* Top Bar for Desktop */}
          <header className="sticky top-0 z-30 hidden md:flex items-center justify-between h-20 px-8 bg-white/80 backdrop-blur-md border-b border-slate-200/70 shadow-xs">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    activeRole === 'teacher'
                      ? 'Search students, assignments, curricula, gradebook...'
                      : 'Search courses, video lessons, flashcards, study groups...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Interactive Role Switcher Pill (demo only) */}
              {isDemo && (
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                <span className="text-xs font-semibold px-2 text-slate-500">View as:</span>
                <button
                  type="button"
                  onClick={() => toggleRole('student')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeRole === 'student'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => toggleRole('teacher')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeRole === 'teacher'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Teacher
                </button>
              </div>
              )}

              {/* Notification Bell */}
              <div className="relative">
                <button
                  className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  title="Announcements & Alerts"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
                </button>
              </div>

              {/* Profile Chip */}
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800">
                    {profile?.full_name}
                  </span>
                  <span className="text-[11px] font-medium text-blue-600">
                    {activeRole === 'teacher' ? 'Faculty Lead' : 'Scholar'}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5">
                  <Image
                    src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt="Profile"
                    width={36}
                    height={36}
                    unoptimized
                    className="w-full h-full object-cover rounded-full bg-white"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Page Body with Content Padding */}
          <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  )
}
