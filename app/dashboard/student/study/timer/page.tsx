'use client'

import { useState, useRef, useEffect } from 'react'
import * as timerService from '@/services/timer.service'
import type { StudySession } from '@/types/database.types'

export default function TimerPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work')
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [stats, setStats] = useState<{ totalMinutes: number; sessionsCompleted: number; currentStreak: number } | null>(null)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [sessionNotes, setSessionNotes] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const modeRef = useRef(mode)
  const activeSessionRef = useRef(activeSessionId)
  const notesRef = useRef(sessionNotes)

  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { activeSessionRef.current = activeSessionId }, [activeSessionId])
  useEffect(() => { notesRef.current = sessionNotes }, [sessionNotes])

  const MODES = {
    work: { label: 'Focus', duration: 25 * 60, color: '#E74C3C' },
    short: { label: 'Short Break', duration: 5 * 60, color: '#27AE60' },
    long: { label: 'Long Break', duration: 15 * 60, color: '#4169E1' },
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [sessionsRes, statsRes] = await Promise.all([
        timerService.getSessions({ limit: 10 }),
        timerService.getStudyStats(),
      ])
      if (!cancelled) {
        if (sessionsRes.success && sessionsRes.data) setSessions(sessionsRes.data)
        if (statsRes.success && statsRes.data) setStats(statsRes.data)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleComplete = async () => {
    if (modeRef.current === 'work' && activeSessionRef.current) {
      await timerService.completeSession(activeSessionRef.current, MODES.work.duration, notesRef.current || undefined)
      setActiveSessionId(null)
      setSessionNotes('')
    }
    const [sessionsRes, statsRes] = await Promise.all([
      timerService.getSessions({ limit: 10 }),
      timerService.getStudyStats(),
    ])
    if (sessionsRes.success && sessionsRes.data) setSessions(sessionsRes.data)
    if (statsRes.success && statsRes.data) setStats(statsRes.data)
  }

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning])

  const handleStart = async () => {
    if (mode === 'work') {
      const res = await timerService.startSession(null, 'pomodoro')
      if (res.success && res.data) setActiveSessionId(res.data.id)
    }
    setIsRunning(true)
  }

  const handlePause = () => setIsRunning(false)

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(MODES[mode].duration)
  }

  const switchMode = (newMode: 'work' | 'short' | 'long') => {
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(MODES[newMode].duration)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const currentMode = MODES[mode]
  const progress = ((currentMode.duration - timeLeft) / currentMode.duration) * 100
  const circumference = 2 * Math.PI * 120

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'white', marginBottom: '4px' }}>
          Study Timer ⏱️
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Pomodoro technique for focused studying</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Timer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Mode Selector */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            {(Object.entries(MODES) as Array<['work' | 'short' | 'long', typeof currentMode]>).map(([key, m]) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  background: mode === key ? `${m.color}20` : 'rgba(255,255,255,0.05)',
                  color: mode === key ? m.color : 'rgba(255,255,255,0.5)',
                  fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Circular Timer */}
          <div style={{ position: 'relative', width: '260px', height: '260px' }}>
            <svg width="260" height="260" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle
                cx="130" cy="130" r="120" fill="none"
                stroke={currentMode.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (progress / 100) * circumference}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 700, color: 'white', fontFamily: 'monospace' }}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '0.85rem', color: currentMode.color, marginTop: '4px' }}>
                {currentMode.label}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            {!isRunning ? (
              <button
                onClick={handleStart}
                style={{
                  padding: '14px 40px', borderRadius: '12px', border: 'none',
                  background: `linear-gradient(135deg, ${currentMode.color}, ${currentMode.color}CC)`,
                  color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                {timeLeft === currentMode.duration ? 'Start' : 'Resume'}
              </button>
            ) : (
              <button
                onClick={handlePause}
                style={{
                  padding: '14px 40px', borderRadius: '12px', border: 'none',
                  background: 'rgba(255,255,255,0.1)', color: 'white',
                  fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Pause
              </button>
            )}
            <button
              onClick={handleReset}
              style={{
                padding: '14px 24px', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                color: 'rgba(255,255,255,0.5)', fontSize: '1rem', cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </div>

          {/* Session Notes */}
          {mode === 'work' && (
            <div style={{ marginTop: '24px', width: '100%', maxWidth: '300px' }}>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Session notes (optional)"
                rows={2}
                style={{
                  width: '100%', padding: '12px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', fontSize: '0.85rem', outline: 'none', resize: 'none',
                  fontFamily: 'var(--font-body)', boxSizing: 'border-box',
                }}
              />
            </div>
          )}
        </div>

        {/* Stats & History */}
        <div>
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'Total Time', value: `${stats.totalMinutes}m`, icon: '⏱️' },
                { label: 'Sessions', value: stats.sessionsCompleted.toString(), icon: '📚' },
                { label: 'Day Streak', value: stats.currentStreak.toString(), icon: '🔥' },
                { label: 'Best Streak', value: (stats as unknown as { longestStreak?: number }).longestStreak?.toString() ?? '0', icon: '⭐' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>
            Recent Sessions
          </h3>
          {sessions.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px' }}>
              No sessions yet. Start studying!
            </div>
          ) : (
            sessions.map(session => (
              <div key={session.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px', marginBottom: '8px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 500 }}>
                    {Math.round(session.duration_seconds / 60)} min session
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                    {new Date(session.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span style={{
                  padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                  background: session.completed ? 'rgba(39, 174, 96, 0.1)' : 'rgba(255,255,255,0.05)',
                  color: session.completed ? '#27AE60' : 'rgba(255,255,255,0.3)',
                }}>
                  {session.completed ? 'Completed' : 'Incomplete'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
