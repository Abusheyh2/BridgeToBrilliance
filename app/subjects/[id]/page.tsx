'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Subject, Lesson, Announcement, Class as ClassType, Grade, Profile, Progress } from '@/types/database.types'

export default function SubjectPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const subjectId = params.id as string

  const [subject, setSubject] = useState<Subject & { teacher: Profile } | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [classes, setClasses] = useState<ClassType[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [progress, setProgress] = useState<Progress[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activeTab, setActiveTab] = useState('lessons')
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrollmentCount, setEnrollmentCount] = useState(0)

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Get profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (!profileData) return
    setProfile(profileData as Profile)

    // Get subject
    const { data: subjectData } = await supabase
      .from('subjects')
      .select('*, teacher:profiles!subjects_teacher_id_fkey(*)')
      .eq('id', subjectId)
      .single()
    if (!subjectData) { router.push('/dashboard/student'); return }
    setSubject(subjectData as any)

    // Check enrollment (for students)
    if (profileData.role === 'student') {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', profileData.id)
        .eq('subject_id', subjectId)
        .single()
      if (!enrollment) {
        router.push('/dashboard/student')
        return
      }
    }

    // Enrollment count
    const { count } = await supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('subject_id', subjectId)
    setEnrollmentCount(count || 0)

    // Lessons
    const { data: lessonData } = await supabase
      .from('lessons')
      .select('*')
      .eq('subject_id', subjectId)
      .order('order_index')
    if (lessonData) setLessons(lessonData)

    // Progress
    const { data: progressData } = await supabase
      .from('progress')
      .select('*')
      .eq('student_id', profileData.id)
    if (progressData) setProgress(progressData as Progress[])

    // Announcements
    const { data: annData } = await supabase
      .from('announcements')
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false })
    if (annData) setAnnouncements(annData)

    // Classes
    const { data: classData } = await supabase
      .from('classes')
      .select('*')
      .eq('subject_id', subjectId)
      .order('scheduled_at', { ascending: true })
    if (classData) setClasses(classData)

    // Grades (for students)
    if (profileData.role === 'student') {
      const { data: gradeData } = await supabase
        .from('grades')
        .select('*')
        .eq('student_id', profileData.id)
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false })
      if (gradeData) setGrades(gradeData)
    }

    setLoading(false)
  }, [subjectId, supabase, router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const markAsWatched = async (lessonId: string) => {
    if (!profile) return
    const existing = progress.find(p => p.lesson_id === lessonId)
    if (existing?.watched) return

    if (existing) {
      await supabase.from('progress').update({ watched: true, watched_at: new Date().toISOString() }).eq('id', existing.id)
    } else {
      await supabase.from('progress').insert({
        student_id: profile.id,
        lesson_id: lessonId,
        watched: true,
        watched_at: new Date().toISOString(),
      })
    }
    // Refresh progress
    const { data: newProgress } = await supabase.from('progress').select('*').eq('student_id', profile.id)
    if (newProgress) setProgress(newProgress as Progress[])
  }

  const isLessonWatched = (lessonId: string) => {
    return progress.some(p => p.lesson_id === lessonId && p.watched)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-navy)',
      }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#FFB300', borderRadius: '50%' }} />
      </div>
    )
  }

  if (!subject) return null

  const tabs = ['lessons', 'announcements', 'classes']
  if (profile?.role === 'student') tabs.push('grades')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-navy)' }}>
      {/* Subject Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${subject.color}30, rgba(255,179,0,0.1))`,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 40px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <button onClick={() => router.back()} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer', fontSize: '0.85rem', marginBottom: '16px', fontFamily: 'var(--font-body)',
          }}>← Back to Dashboard</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <span style={{ fontSize: '2.5rem' }}>{subject.icon}</span>
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: 'white' }}>
                {subject.title}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                {(subject as any).teacher?.full_name} · {enrollmentCount} student{enrollmentCount !== 1 ? 's' : ''} · {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {subject.description && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: '8px', maxWidth: '600px' }}>
              {subject.description}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '32px' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none', padding: '16px 0',
                color: activeTab === tab ? '#FFB300' : 'rgba(255,255,255,0.4)',
                borderBottom: activeTab === tab ? '2px solid #FFB300' : '2px solid transparent',
                fontSize: '0.9rem', fontWeight: activeTab === tab ? 600 : 400,
                cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'var(--font-body)',
                transition: 'color 0.2s',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '32px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Video Player */}
          {activeLesson && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: '32px' }}>
              <div className="video-container" style={{ marginBottom: '16px' }}>
                <video
                  controls
                  src={activeLesson.video_url}
                  poster={activeLesson.thumbnail_url}
                  onPlay={() => markAsWatched(activeLesson.id)}
                  style={{ width: '100%', maxHeight: '500px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: 'white', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>{activeLesson.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '4px' }}>{activeLesson.description}</p>
                </div>
                <button onClick={() => setActiveLesson(null)} style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)',
                  padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font-body)',
                }}>Close</button>
              </div>
            </motion.div>
          )}

          {/* Lessons Tab */}
          {activeTab === 'lessons' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              {lessons.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>No lessons available yet.</p>
              ) : (
                lessons.map((lesson, i) => {
                  const watched = isLessonWatched(lesson.id)
                  return (
                    <motion.div key={lesson.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
                      onClick={() => setActiveLesson(lesson)}
                      style={{
                        cursor: 'pointer', borderRadius: '12px', overflow: 'hidden',
                        background: 'rgba(255,255,255,0.03)', border: `1px solid ${watched ? 'rgba(40,167,69,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        transition: 'border-color 0.2s',
                      }}>
                      <div style={{
                        height: '140px',
                        background: lesson.thumbnail_url ? `url(${lesson.thumbnail_url}) center/cover` : `linear-gradient(135deg, ${subject.color}30, rgba(255,179,0,0.1))`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                      }}>
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '50%',
                          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.2rem',
                        }}>▶</div>
                        {watched && (
                          <div style={{
                            position: 'absolute', top: '8px', right: '8px',
                            padding: '4px 8px', borderRadius: '6px',
                            background: 'rgba(40,167,69,0.9)', fontSize: '0.7rem', color: 'white', fontWeight: 600,
                          }}>✓ Watched</div>
                        )}
                      </div>
                      <div style={{ padding: '14px' }}>
                        <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '4px' }}>{lesson.title}</h4>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Lesson {i + 1}</p>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {announcements.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>No announcements for this subject.</p>
              ) : (
                announcements.map(ann => (
                  <motion.div key={ann.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{
                      padding: '20px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4 style={{ color: 'white', fontSize: '0.95rem' }}>{ann.title}</h4>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{new Date(ann.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.6 }}>{ann.body}</p>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Classes Tab */}
          {activeTab === 'classes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {classes.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>No classes scheduled.</p>
              ) : (
                classes.map(cls => {
                  const isPast = new Date(cls.scheduled_at) < new Date()
                  return (
                    <motion.div key={cls.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{
                        padding: '20px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        opacity: isPast ? 0.5 : 1,
                      }}>
                      <div>
                        <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '4px' }}>{cls.title}</h4>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                          {new Date(cls.scheduled_at).toLocaleString()} {isPast && '(Past)'}
                        </p>
                        {cls.description && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: '4px' }}>{cls.description}</p>}
                      </div>
                      {cls.meeting_link && !isPast && (
                        <a href={cls.meeting_link} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          Join Class
                        </a>
                      )}
                    </motion.div>
                  )
                })
              )}
            </div>
          )}

          {/* Grades Tab (student only) */}
          {activeTab === 'grades' && profile?.role === 'student' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Assignment', 'Score', 'Feedback', 'Date'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grades.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '20px 16px', color: 'rgba(255,255,255,0.4)' }}>No grades yet.</td></tr>
                  ) : (
                    grades.map(g => (
                      <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 16px', color: 'white', fontSize: '0.85rem' }}>{g.assignment_title}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                            background: (g.score / g.max_score) >= 0.7 ? 'rgba(40,167,69,0.15)' : 'rgba(220,53,69,0.15)',
                            color: (g.score / g.max_score) >= 0.7 ? '#28a745' : '#dc3545',
                          }}>{g.score}/{g.max_score}</span>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{g.feedback || '—'}</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{new Date(g.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
