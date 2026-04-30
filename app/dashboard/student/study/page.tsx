'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useProfile } from '@/app/dashboard/layout'
import * as timerService from '@/services/timer.service'
import * as groupsService from '@/services/study-groups.service'

const features = [
  { href: '/dashboard/student/study/groups', icon: '👥', title: 'Study Groups', desc: 'Join or create study groups with chat, file sharing, and collaboration', color: '#4169E1' },
  { href: '/dashboard/student/study/flashcards', icon: '🃏', title: 'Flashcards', desc: 'Create and review flashcard decks with spaced repetition', color: '#9B59B6' },
  { href: '/dashboard/student/study/notes', icon: '📝', title: 'My Notes', desc: 'Take organized notes with tags, colors, and pinning', color: '#27AE60' },
  { href: '/dashboard/student/study/timer', icon: '⏱️', title: 'Study Timer', desc: 'Pomodoro timer with session tracking and streaks', color: '#E74C3C' },
  { href: '/dashboard/student/study/quizzes', icon: '💡', title: 'Quizzes', desc: 'Take practice quizzes and track your scores', color: '#F39C12' },
  { href: '/dashboard/student/study/bookmarks', icon: '🔖', title: 'Bookmarks', desc: 'Save lessons and resources for quick access', color: '#1ABC9C' },
  { href: '/dashboard/student/study/plans', icon: '📋', title: 'Study Plans', desc: 'Create personalized study schedules with tasks', color: '#3498DB' },
  { href: '/dashboard/student/study/achievements', icon: '🏆', title: 'Achievements', desc: 'Unlock achievements and track your progress', color: '#E67E22' },
]

export default function StudyHubPage() {
  const profile = useProfile()
  const [stats, setStats] = useState<{ totalMinutes: number; sessionsCompleted: number; currentStreak: number } | null>(null)
  const [groupCount, setGroupCount] = useState(0)
  const [noteCount, setNoteCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const [statsRes, groupsRes, notesRes] = await Promise.all([
        timerService.getStudyStats(),
        groupsService.getMyGroups(),
        import('@/services/notes.service').then(ns => ns.getNotes()),
      ])
      if (statsRes.success && statsRes.data) setStats(statsRes.data)
      if (groupsRes.success && groupsRes.data) setGroupCount(groupsRes.data.length)
      if (notesRes.success && notesRes.data) setNoteCount(notesRes.data.length)
    }
    fetchData()
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'white', marginBottom: '8px' }}>
          Study Hub 🎯
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>
          Welcome back, {profile?.full_name?.split(' ')[0]}! Ready to learn?
        </p>
      </div>

      {/* Stats Row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Study Time', value: `${stats.totalMinutes}m`, icon: '⏱️', color: '#E74C3C' },
            { label: 'Sessions', value: stats.sessionsCompleted.toString(), icon: '📚', color: '#4169E1' },
            { label: 'Day Streak', value: stats.currentStreak.toString(), icon: '🔥', color: '#F39C12' },
            { label: 'Groups', value: groupCount.toString(), icon: '👥', color: '#9B59B6' },
            { label: 'Notes', value: noteCount.toString(), icon: '📝', color: '#27AE60' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -4 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${stat.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem',
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Feature Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {features.map((feature, i) => (
          <Link key={feature.href} href={feature.href} style={{ textDecoration: 'none' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6, scale: 1.02 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                height: '100%',
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '14px',
                background: `${feature.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem',
                marginBottom: '16px',
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'white', marginBottom: '8px' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: 0 }}>
                {feature.desc}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}
