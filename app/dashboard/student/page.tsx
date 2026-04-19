'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '../layout'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Subject, Announcement, Class as ClassType, Grade, Enrollment } from '@/types/database.types'

export default function StudentDashboard() {
  const profile = useProfile()
  const supabase = createClient()
  const [enrollments, setEnrollments] = useState<(Enrollment & { subject: Subject & { teacher: { full_name: string } }; lesson_count: number; watched_count: number })[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [upcomingClasses, setUpcomingClasses] = useState<(ClassType & { subject: { title: string } })[]>([])
  const [grades, setGrades] = useState<(Grade & { subject: { title: string } })[]>([])
  const [allSubjects, setAllSubjects] = useState<(Subject & { teacher: { full_name: string } })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) {
      setLoading(false)
      return
    }
    
    const fetchData = async () => {
      try {
        // Fetch enrollments with subjects
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('*, subject:subjects(*, teacher:profiles!subjects_teacher_id_fkey(full_name))')
          .eq('student_id', profile.id)

        if (enrollmentData) {
          const enriched = await Promise.all(
            enrollmentData.map(async (e: any) => {
              const { count: lessonCount } = await supabase
                .from('lessons')
                .select('*', { count: 'exact', head: true })
                .eq('subject_id', e.subject_id)
              const { count: watchedCount } = await supabase
                .from('progress')
                .select('*', { count: 'exact', head: true })
                .eq('student_id', profile.id)
                .eq('watched', true)
              return { ...e, lesson_count: lessonCount || 0, watched_count: watchedCount || 0 }
            })
          )
          setEnrollments(enriched as any)
        }

        // Fetch announcements
        const { data: annData } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)
        if (annData) setAnnouncements(annData)

        // Fetch upcoming classes
        const { data: classData } = await supabase
          .from('classes')
          .select('*, subject:subjects(title)')
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(5)
        if (classData) setUpcomingClasses(classData as any)

        // Fetch grades
        const { data: gradeData } = await supabase
          .from('grades')
          .select('*, subject:subjects(title)')
          .eq('student_id', profile.id)
          .order('created_at', { ascending: false })
        if (gradeData) setGrades(gradeData as any)

        // Fetch all subjects for enrollment
        const { data: subData } = await supabase
          .from('subjects')
          .select('*, teacher:profiles!subjects_teacher_id_fkey(full_name)')
        if (subData) setAllSubjects(subData as any)

      } catch (err) {
        console.error("Dashboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const handleEnroll = async (subjectId: string) => {
    if (!profile) return
    const { error } = await supabase.from('enrollments').insert({ student_id: profile.id, subject_id: subjectId })
    if (error) {
      alert('Failed to enroll: ' + error.message)
      return
    }
    // Refresh data without page reload
    setLoading(true)
    const fetchData = async () => {
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('*, subject:subjects(*, teacher:profiles!subjects_teacher_id_fkey(full_name))')
        .eq('student_id', profile.id)
      if (enrollmentData) {
        const enriched = await Promise.all(
          enrollmentData.map(async (e: any) => {
            const { count: lessonCount } = await supabase
              .from('lessons').select('*', { count: 'exact', head: true }).eq('subject_id', e.subject_id)
            const { count: watchedCount } = await supabase
              .from('progress').select('*', { count: 'exact', head: true }).eq('student_id', profile.id).eq('watched', true)
            return { ...e, lesson_count: lessonCount || 0, watched_count: watchedCount || 0 }
          })
        )
        setEnrollments(enriched as any)
      }
      const { data: subData } = await supabase
        .from('subjects').select('*, teacher:profiles!subjects_teacher_id_fkey(full_name)')
      if (subData) setAllSubjects(subData as any)
      setLoading(false)
    }
    fetchData()
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#FFB300', borderRadius: '50%' }} />
      </div>
    )
  }

  // Mock chart data
  const progressData = [
    { week: 'W1', lessons: 2 }, { week: 'W2', lessons: 5 }, { week: 'W3', lessons: 3 },
    { week: 'W4', lessons: 7 }, { week: 'W5', lessons: 4 }, { week: 'W6', lessons: 8 },
  ]

  const subjectProgress = enrollments.map(e => ({
    name: (e as any).subject?.title?.slice(0, 12) || 'Subject',
    progress: e.lesson_count > 0 ? Math.round((e.watched_count / e.lesson_count) * 100) : 0,
  }))

  return (
    <div>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.2), rgba(255, 179, 0, 0.1))',
          border: '1px solid rgba(65, 105, 225, 0.2)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
        }}
      >
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)' }}>
          You&apos;re enrolled in {enrollments.length} subject{enrollments.length !== 1 ? 's' : ''}. Keep learning!
        </p>
      </motion.div>

      {/* My Subjects */}
      <div id="subjects" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: 'white', marginBottom: '20px' }}>
          📚 My Subjects
        </h2>
        {enrollments.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>You haven&apos;t enrolled in any subjects yet.</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {allSubjects.map((s) => (
                <motion.div key={s.id} whileHover={{ scale: 1.02 }}
                  style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', minWidth: '200px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                  <h4 style={{ color: 'white', fontSize: '0.95rem', margin: '8px 0 4px' }}>{s.title}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '12px' }}>by {(s as any).teacher?.full_name}</p>
                  <button onClick={() => handleEnroll(s.id)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Enroll</button>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {enrollments.map((enrollment, i) => {
              const subject = (enrollment as any).subject
              const progress = enrollment.lesson_count > 0 ? Math.round((enrollment.watched_count / enrollment.lesson_count) * 100) : 0
              return (
                <motion.div key={enrollment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}>
                  <Link href={`/subjects/${enrollment.subject_id}`} style={{ textDecoration: 'none' }}>
                    <div className="glass-card-gold" style={{ padding: '24px', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <span style={{ fontSize: '2rem' }}>{subject?.icon || '📚'}</span>
                        <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(255,179,0,0.1)', color: '#FFB300', fontWeight: 600 }}>
                          {progress}%
                        </span>
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '4px' }}>
                        {subject?.title}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
                        {subject?.teacher?.full_name}
                      </p>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Two column: Upcoming Classes + Announcements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {/* Upcoming Classes */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: 'white', marginBottom: '20px' }}>
            📅 Upcoming Classes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingClasses.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                No upcoming classes scheduled.
              </p>
            ) : (
              upcomingClasses.map((cls) => (
                <motion.div key={cls.id} whileHover={{ x: 4 }} style={{
                  padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '4px' }}>{cls.title}</h4>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                      {(cls as any).subject?.title} · {new Date(cls.scheduled_at).toLocaleDateString()} at {new Date(cls.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {cls.meeting_link && (
                    <a href={cls.meeting_link} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
                      Join
                    </a>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Announcements */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: 'white', marginBottom: '20px' }}>
            📢 Announcements
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {announcements.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                No announcements yet.
              </p>
            ) : (
              announcements.map((ann) => (
                <motion.div key={ann.id} whileHover={{ x: 4 }} style={{
                  padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ color: 'white', fontSize: '0.9rem' }}>{ann.title}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>{ann.body}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grades */}
      <div id="grades" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: 'white', marginBottom: '20px' }}>
          📝 My Grades
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['Subject', 'Assignment', 'Score', 'Feedback'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grades.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '20px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>No grades yet.</td></tr>
              ) : (
                grades.map((g) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{(g as any).subject?.title}</td>
                    <td style={{ padding: '12px 16px', color: 'white', fontSize: '0.85rem' }}>{g.assignment_title}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                        background: (g.score / g.max_score) >= 0.7 ? 'rgba(40,167,69,0.15)' : 'rgba(220,53,69,0.15)',
                        color: (g.score / g.max_score) >= 0.7 ? '#28a745' : '#dc3545',
                      }}>
                        {g.score}/{g.max_score}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{g.feedback || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: 'white', marginBottom: '20px' }}>
          📊 Progress Analytics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '16px' }}>Lessons Completed Over Time</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1A2D56', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                <Line type="monotone" dataKey="lessons" stroke="#FFB300" strokeWidth={2} dot={{ fill: '#FFB300' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '16px' }}>Progress by Subject</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjectProgress.length > 0 ? subjectProgress : [{ name: 'No data', progress: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1A2D56', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                <Bar dataKey="progress" fill="#4169E1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
