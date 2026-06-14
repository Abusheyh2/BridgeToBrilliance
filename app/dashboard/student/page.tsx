'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '../layout'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Subject, Announcement, Class as ClassType, Grade, Enrollment, Profile } from '@/types/database.types'

type EnrollmentWithDetails = Enrollment & {
  subject: Subject & { teacher: Pick<Profile, 'full_name'> | null } | null
  lesson_count: number
  watched_count: number
}

type ClassWithSubject = ClassType & {
  subject: Pick<Subject, 'title'> | null
}

type GradeWithSubject = Grade & {
  subject: Pick<Subject, 'title'> | null
}

type SubjectWithTeacher = Subject & {
  teacher: Pick<Profile, 'full_name'> | null
}

async function enrichEnrollments(supabase: ReturnType<typeof createClient>, studentId: string, enrollmentData: any[]): Promise<EnrollmentWithDetails[]> {
  if (!enrollmentData || enrollmentData.length === 0) return []

  const subjectIds = enrollmentData.map(e => e.subject_id)

  const [{ data: lessonCounts }, { data: progressData }] = await Promise.all([
    subjectIds.length > 0
      ? supabase.from('lessons').select('id, subject_id').in('subject_id', subjectIds)
      : { data: [] },
    subjectIds.length > 0
      ? supabase.from('progress').select('lesson_id').eq('student_id', studentId).eq('watched', true)
      : { data: [] },
  ])

  const lessonCountMap: Record<string, number> = {}
  const lessonSubjectMap: Record<string, string> = {}
  if (lessonCounts) {
    for (const l of lessonCounts) {
      lessonCountMap[l.subject_id] = (lessonCountMap[l.subject_id] || 0) + 1
      lessonSubjectMap[l.id] = l.subject_id
    }
  }

  const watchedSubjectCount: Record<string, number> = {}
  for (const p of progressData || []) {
    const subId = lessonSubjectMap[p.lesson_id]
    if (subId) watchedSubjectCount[subId] = (watchedSubjectCount[subId] || 0) + 1
  }

  return enrollmentData.map(e => ({
    ...(e as EnrollmentWithDetails),
    lesson_count: lessonCountMap[e.subject_id] || 0,
    watched_count: watchedSubjectCount[e.subject_id] || 0,
  }))
}

export default function StudentDashboard() {
  const profile = useProfile()
  const supabase = createClient()
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [upcomingClasses, setUpcomingClasses] = useState<ClassWithSubject[]>([])
  const [grades, setGrades] = useState<GradeWithSubject[]>([])
  const [allSubjects, setAllSubjects] = useState<SubjectWithTeacher[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) {
      setLoading(false)
      return
    }

    let cancelled = false
    const fetchData = async () => {
      try {
        const [
          { data: enrollmentData },
          { data: annData },
          { data: classData },
          { data: gradeData },
          { data: subData },
        ] = await Promise.all([
          supabase
            .from('enrollments')
            .select('*, subject:subjects(*, teacher:profiles!subjects_teacher_id_fkey(full_name))')
            .eq('student_id', profile.id),
          supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('classes')
            .select('*, subject:subjects(title)')
            .gte('scheduled_at', new Date().toISOString())
            .order('scheduled_at', { ascending: true })
            .limit(5),
          supabase
            .from('grades')
            .select('*, subject:subjects(title)')
            .eq('student_id', profile.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('subjects')
            .select('*, teacher:profiles!subjects_teacher_id_fkey(full_name)'),
        ])

        if (cancelled) return

        if (enrollmentData) {
          const enriched = await enrichEnrollments(supabase, profile.id, enrollmentData)
          setEnrollments(enriched)
        }
        if (annData) setAnnouncements(annData)
        if (classData) setUpcomingClasses(classData as ClassWithSubject[])
        if (gradeData) setGrades(gradeData as GradeWithSubject[])
        if (subData) setAllSubjects(subData as SubjectWithTeacher[])

      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [profile])

  const handleEnroll = async (subjectId: string) => {
    if (!profile) return
    const { error } = await supabase.from('enrollments').insert({ student_id: profile.id, subject_id: subjectId })
    if (error) {
      alert('Failed to enroll: ' + error.message)
      return
    }

    const [{ data: enrollmentData }, { data: subData }] = await Promise.all([
      supabase
        .from('enrollments')
        .select('*, subject:subjects(*, teacher:profiles!subjects_teacher_id_fkey(full_name))')
        .eq('student_id', profile.id),
      supabase.from('subjects').select('*, teacher:profiles!subjects_teacher_id_fkey(full_name)'),
    ])

    if (enrollmentData) {
      const enriched = await enrichEnrollments(supabase, profile.id, enrollmentData)
      setEnrollments(enriched)
    }
    if (subData) setAllSubjects(subData as SubjectWithTeacher[])
  }

  const progressData = useMemo(() => [
    { week: 'W1', lessons: 2 }, { week: 'W2', lessons: 5 }, { week: 'W3', lessons: 3 },
    { week: 'W4', lessons: 7 }, { week: 'W5', lessons: 4 }, { week: 'W6', lessons: 8 },
  ], [])

  const subjectProgress = useMemo(() =>
    enrollments.map(e => ({
      name: e.subject?.title?.slice(0, 12) || 'Subject',
      progress: e.lesson_count > 0 ? Math.round((e.watched_count / e.lesson_count) * 100) : 0,
    })),
    [enrollments]
  )

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}>
        <div className="spinner" />
      </div>
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Student'

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
          style={{ willChange: 'transform, opacity',
          background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.2), rgba(255, 179, 0, 0.1))',
          border: '1px solid rgba(65, 105, 225, 0.2)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
        }}
      >
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: '#1A1A2E', marginBottom: '8px' }}>
          Welcome back, {firstName}! 👋
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'rgba(0,0,0,0.5)' }}>
          You&apos;re enrolled in {enrollments.length} subject{enrollments.length !== 1 ? 's' : ''}. Keep learning!
        </p>
      </motion.div>

      <div id="subjects" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: '#1A1A2E', marginBottom: '20px' }}>
          📚 My Subjects
        </h2>
        {enrollments.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <p style={{ color: 'rgba(0,0,0,0.5)', marginBottom: '16px' }}>You haven&apos;t enrolled in any subjects yet.</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {allSubjects.map((s) => (
                <div key={s.id} className="enroll-card"
                  style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', minWidth: '200px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                  <h4 style={{ color: '#1A1A2E', fontSize: '0.95rem', margin: '8px 0 4px' }}>{s.title}</h4>
                  <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.8rem', marginBottom: '12px' }}>by {s.teacher?.full_name}</p>
                  <button onClick={() => handleEnroll(s.id)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Enroll</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {enrollments.map((enrollment, i) => {
              const subject = enrollment.subject
              const progress = enrollment.lesson_count > 0 ? Math.round((enrollment.watched_count / enrollment.lesson_count) * 100) : 0
              return (
                <div key={enrollment.id} style={{ animationDelay: `${i * 0.05}s` }} className="fade-in-up">
                  <Link href={`/subjects/${enrollment.subject_id}`} style={{ textDecoration: 'none' }}>
                    <div className="glass-card-gold subject-card" style={{ padding: '24px', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <span style={{ fontSize: '2rem' }}>{subject?.icon || '📚'}</span>
                        <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(255,179,0,0.1)', color: '#FFB300', fontWeight: 600 }}>
                          {progress}%
                        </span>
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, color: '#1A1A2E', marginBottom: '4px' }}>
                        {subject?.title}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.5)', marginBottom: '16px' }}>
                        {subject?.teacher?.full_name}
                      </p>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: '#1A1A2E', marginBottom: '20px' }}>
            📅 Upcoming Classes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingClasses.length === 0 ? (
              <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.9rem', padding: '20px', background: '#ffffff', borderRadius: '12px' }}>
                No upcoming classes scheduled.
              </p>
            ) : (
              upcomingClasses.map((cls) => (
                <div key={cls.id} className="list-item" style={{
                  padding: '16px', borderRadius: '12px', background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <h4 style={{ color: '#1A1A2E', fontSize: '0.9rem', marginBottom: '4px' }}>{cls.title}</h4>
                    <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.8rem' }}>
                      {cls.subject?.title} &middot; {new Date(cls.scheduled_at).toLocaleDateString()} at {new Date(cls.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {cls.meeting_link && (
                    <a href={cls.meeting_link} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
                      Join
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: '#1A1A2E', marginBottom: '20px' }}>
            📢 Announcements
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {announcements.length === 0 ? (
              <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.9rem', padding: '20px', background: '#ffffff', borderRadius: '12px' }}>
                No announcements yet.
              </p>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="list-item" style={{
                  padding: '16px', borderRadius: '12px', background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ color: '#1A1A2E', fontSize: '0.9rem' }}>{ann.title}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.3)' }}>
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>{ann.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div id="grades" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: '#1A1A2E', marginBottom: '20px' }}>
          📝 My Grades
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['Subject', 'Assignment', 'Score', 'Feedback'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'rgba(0,0,0,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grades.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '20px 16px', color: 'rgba(0,0,0,0.4)', fontSize: '0.9rem' }}>No grades yet.</td></tr>
              ) : (
                grades.map((g) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                    <td style={{ padding: '12px 16px', color: 'rgba(0,0,0,0.6)', fontSize: '0.85rem' }}>{g.subject?.title}</td>
                    <td style={{ padding: '12px 16px', color: '#1A1A2E', fontSize: '0.85rem' }}>{g.assignment_title}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                        background: (g.score / g.max_score) >= 0.7 ? 'rgba(40,167,69,0.15)' : 'rgba(220,53,69,0.15)',
                        color: (g.score / g.max_score) >= 0.7 ? '#28a745' : '#dc3545',
                      }}>
                        {g.score}/{g.max_score}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'rgba(0,0,0,0.5)', fontSize: '0.8rem' }}>{g.feedback || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: '#1A1A2E', marginBottom: '20px' }}>
          📊 Progress Analytics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h4 style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.85rem', marginBottom: '16px' }}>Lessons Completed Over Time</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="week" stroke="rgba(0,0,0,0.3)" fontSize={12} />
                <YAxis stroke="rgba(0,0,0,0.3)" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1A2D56', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', color: '#1A1A2E' }} />
                <Line type="monotone" dataKey="lessons" stroke="#FFB300" strokeWidth={2} dot={{ fill: '#FFB300' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h4 style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.85rem', marginBottom: '16px' }}>Progress by Subject</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjectProgress.length > 0 ? subjectProgress : [{ name: 'No data', progress: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="name" stroke="rgba(0,0,0,0.3)" fontSize={12} />
                <YAxis stroke="rgba(0,0,0,0.3)" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1A2D56', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', color: '#1A1A2E' }} />
                <Bar dataKey="progress" fill="#4169E1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
