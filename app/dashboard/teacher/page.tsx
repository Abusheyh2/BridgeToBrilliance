'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '../layout'
import type { Subject, Lesson, Grade, Profile } from '@/types/database.types'

interface EnrollmentWithStudent {
  student_id: string
  student?: Pick<Profile, 'full_name'> | null
}

type GradeWithStudent = Grade & {
  student?: Pick<Profile, 'full_name'> | null
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#132347', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'white', fontSize: '1.2rem' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>
        {children}
      </motion.div>
    </div>
  )
}

export default function TeacherDashboard() {
  const profile = useProfile()
  const supabase = createClient()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [enrolledStudents, setEnrolledStudents] = useState<EnrollmentWithStudent[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [grades, setGrades] = useState<GradeWithStudent[]>([])

  const [subjectForm, setSubjectForm] = useState({ title: '', description: '', color: '#4169E1', icon: '📚' })
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', youtube_url: '' })
  const [classForm, setClassForm] = useState({ title: '', scheduled_at: '', meeting_link: '', description: '' })
  const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '' })
  const [gradeForm, setGradeForm] = useState({ student_id: '', assignment_title: '', score: '', max_score: '', feedback: '' })
  const [uploading, setUploading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const fetchSubjects = useCallback(async () => {
    if (!profile) return
    const { data } = await supabase
      .from('subjects')
      .select('*')
      .eq('teacher_id', profile.id)
      .order('created_at', { ascending: false })
    if (data && mountedRef.current) setSubjects(data)
    if (mountedRef.current) setLoading(false)
  }, [profile, supabase])

  useEffect(() => {
    if (!profile) return
    let cancelled = false
    const run = async () => {
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false })
      if (data && !cancelled) setSubjects(data)
      if (!cancelled) setLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, [profile, supabase])

  const fetchSubjectDetails = useCallback(async (subject: Subject) => {
    setSelectedSubject(subject)
    const { data: enrollData } = await supabase
      .from('enrollments')
      .select('*, student:profiles!enrollments_student_id_fkey(full_name)')
      .eq('subject_id', subject.id)
    if (enrollData) setEnrolledStudents(enrollData as EnrollmentWithStudent[])

    const { data: lessonData } = await supabase
      .from('lessons')
      .select('*')
      .eq('subject_id', subject.id)
      .order('order_index')
    if (lessonData) setLessons(lessonData)

    const { data: gradeData } = await supabase
      .from('grades')
      .select('*, student:profiles!grades_student_id_fkey(full_name)')
      .eq('subject_id', subject.id)
      .order('created_at', { ascending: false })
    if (gradeData) setGrades(gradeData as GradeWithStudent[])
  }, [supabase])

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setFormLoading(true)
    await supabase.from('subjects').insert({
      ...subjectForm,
      teacher_id: profile.id,
    })
    setSubjectForm({ title: '', description: '', color: '#4169E1', icon: '📚' })
    setActiveModal(null)
    await fetchSubjects()
    setFormLoading(false)
  }

  const extractYouTubeID = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[7].length === 11) ? match[7] : null
  }

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubject || !lessonForm.youtube_url) return
    setUploading(true)
    try {
      const ytId = extractYouTubeID(lessonForm.youtube_url)
      if (!ytId) {
        alert('Invalid YouTube URL. Please provide a valid link.')
        setUploading(false)
        return
      }
      const thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      const embedUrl = `https://www.youtube.com/embed/${ytId}`

      await supabase.from('lessons').insert({
        subject_id: selectedSubject.id,
        title: lessonForm.title,
        description: lessonForm.description,
        video_url: embedUrl,
        thumbnail_url: thumbnailUrl,
        order_index: lessons.length,
      })
      setLessonForm({ title: '', description: '', youtube_url: '' })
      setActiveModal(null)
      await fetchSubjectDetails(selectedSubject)
    } catch {
      alert('Failed to save lesson.')
    }
    setUploading(false)
  }

  const handleScheduleClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubject) return
    setFormLoading(true)
    await supabase.from('classes').insert({
      subject_id: selectedSubject.id,
      ...classForm,
    })
    setClassForm({ title: '', scheduled_at: '', meeting_link: '', description: '' })
    setActiveModal(null)
    setFormLoading(false)
  }

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !selectedSubject) return
    setFormLoading(true)
    await supabase.from('announcements').insert({
      subject_id: selectedSubject.id,
      author_id: profile.id,
      ...announcementForm,
    })
    setAnnouncementForm({ title: '', body: '' })
    setActiveModal(null)
    setFormLoading(false)
  }

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !selectedSubject) return
    setFormLoading(true)
    await supabase.from('grades').insert({
      student_id: gradeForm.student_id,
      subject_id: selectedSubject.id,
      assignment_title: gradeForm.assignment_title,
      score: parseFloat(gradeForm.score),
      max_score: parseFloat(gradeForm.max_score),
      feedback: gradeForm.feedback,
      graded_by: profile.id,
    })
    setGradeForm({ student_id: '', assignment_title: '', score: '', max_score: '', feedback: '' })
    setActiveModal(null)
    await fetchSubjectDetails(selectedSubject)
    setFormLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
    color: 'white', fontSize: '0.9rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#FFB300', borderRadius: '50%' }} />
      </div>
    )
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.2), rgba(255, 179, 0, 0.1))',
          border: '1px solid rgba(65, 105, 225, 0.2)', borderRadius: '16px', padding: '32px', marginBottom: '32px',
        }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
          Teacher Dashboard
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
          You&apos;re teaching {subjects.length} subject{subjects.length !== 1 ? 's' : ''}.
        </p>
      </motion.div>

      <div id="subjects" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: 'white' }}>My Subjects</h2>
          <button onClick={() => setActiveModal('create-subject')} className="btn-gold" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
            + Create Subject
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {subjects.map((subject, i) => (
            <motion.div key={subject.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}
              onClick={() => fetchSubjectDetails(subject)}
              style={{ cursor: 'pointer' }}>
              <div className="glass-card-gold" style={{ padding: '24px' }}>
                <span style={{ fontSize: '2rem' }}>{subject.icon}</span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, color: 'white', margin: '12px 0 8px' }}>
                  {subject.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '16px', lineHeight: 1.5 }}>
                  {subject.description?.slice(0, 80)}{subject.description && subject.description.length > 80 ? '...' : ''}
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(65,105,225,0.15)', color: '#4169E1' }}>Click to manage</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedSubject && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '40px' }}>
          <div style={{
            background: `linear-gradient(135deg, ${selectedSubject.color}20, rgba(255,179,0,0.05))`,
            border: `1px solid ${selectedSubject.color}30`,
            borderRadius: '16px', padding: '24px', marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'white' }}>
                  {selectedSubject.icon} {selectedSubject.title}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {enrolledStudents.length} students enrolled &middot; {lessons.length} lessons
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveModal('add-lesson')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Add Lesson</button>
                <button onClick={() => setActiveModal('schedule-class')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Schedule Class</button>
                <button onClick={() => setActiveModal('post-announcement')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Announcement</button>
              </div>
            </div>
          </div>

          <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Video Lessons</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {lessons.map((lesson, i) => (
              <div key={lesson.id} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px', overflow: 'hidden',
              }}>
                <div style={{ height: '120px', background: `linear-gradient(135deg, ${selectedSubject.color}30, rgba(255,179,0,0.1))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '2rem' }}>🎥</span>
                </div>
                <div style={{ padding: '12px' }}>
                  <h4 style={{ color: 'white', fontSize: '0.85rem', marginBottom: '4px' }}>{lesson.title}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Lesson {i + 1}</p>
                </div>
              </div>
            ))}
          </div>

          <div id="gradebook">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 600 }}>Gradebook</h3>
              <button onClick={() => setActiveModal('add-grade')} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>+ Add Grade</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Student', 'Assignment', 'Score', 'Feedback', 'Date'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grades.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '16px', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>No grades yet.</td></tr>
                  ) : (
                    grades.map((g) => (
                      <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '10px 14px', color: 'white', fontSize: '0.85rem' }}>{g.student?.full_name}</td>
                        <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{g.assignment_title}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                            background: (g.score / g.max_score) >= 0.7 ? 'rgba(40,167,69,0.15)' : 'rgba(220,53,69,0.15)',
                            color: (g.score / g.max_score) >= 0.7 ? '#28a745' : '#dc3545',
                          }}>{g.score}/{g.max_score}</span>
                        </td>
                        <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{g.feedback || '—'}</td>
                        <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{new Date(g.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {activeModal === 'create-subject' && (
        <Modal title="Create Subject" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleCreateSubject}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>Title</label>
              <input value={subjectForm.title} onChange={e => setSubjectForm({...subjectForm, title: e.target.value})} required style={inputStyle} placeholder="e.g. Mathematics" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>Description</label>
              <textarea value={subjectForm.description} onChange={e => setSubjectForm({...subjectForm, description: e.target.value})} style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} placeholder="Subject description..." />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>Icon</label>
                <input value={subjectForm.icon} onChange={e => setSubjectForm({...subjectForm, icon: e.target.value})} style={inputStyle} placeholder="📚" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>Color</label>
                <input type="color" value={subjectForm.color} onChange={e => setSubjectForm({...subjectForm, color: e.target.value})} style={{...inputStyle, height: '42px', padding: '4px'}} />
              </div>
            </div>
            <button type="submit" disabled={formLoading} className="btn-gold" style={{ width: '100%', padding: '12px' }}>
              {formLoading ? 'Creating...' : 'Create Subject'}
            </button>
          </form>
        </Modal>
      )}

      {activeModal === 'add-lesson' && (
        <Modal title="Add Lesson" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleAddLesson}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>Title</label>
              <input value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} required style={inputStyle} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>Description</label>
              <textarea value={lessonForm.description} onChange={e => setLessonForm({...lessonForm, description: e.target.value})} style={{...inputStyle, minHeight: '60px', resize: 'vertical'}} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>YouTube Link</label>
              <input type="text" placeholder="https://youtube.com/watch?v=..." value={lessonForm.youtube_url} onChange={e => setLessonForm({...lessonForm, youtube_url: e.target.value})} required
                style={{...inputStyle, padding: '8px'}} />
            </div>
            <button type="submit" disabled={uploading} className="btn-gold" style={{ width: '100%', padding: '12px' }}>
              {uploading ? 'Parsing...' : 'Add Lesson'}
            </button>
          </form>
        </Modal>
      )}

      {activeModal === 'schedule-class' && (
        <Modal title="Schedule Class" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleScheduleClass}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>Title</label>
              <input value={classForm.title} onChange={e => setClassForm({...classForm, title: e.target.value})} required style={inputStyle} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>Date &amp; Time</label>
              <input type="datetime-local" value={classForm.scheduled_at} onChange={e => setClassForm({...classForm, scheduled_at: e.target.value})} required style={inputStyle} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>Meeting Link</label>
              <input value={classForm.meeting_link} onChange={e => setClassForm({...classForm, meeting_link: e.target.value})} style={inputStyle} placeholder="https://meet.google.com/..." />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>Description</label>
              <textarea value={classForm.description} onChange={e => setClassForm({...classForm, description: e.target.value})} style={{...inputStyle, minHeight: '60px', resize: 'vertical'}} />
            </div>
            <button type="submit" disabled={formLoading} className="btn-gold" style={{ width: '100%', padding: '12px' }}>
              {formLoading ? 'Scheduling...' : 'Schedule Class'}
            </button>
          </form>
        </Modal>
      )}

      {activeModal === 'post-announcement' && (
        <Modal title="Post Announcement" onClose={() => setActiveModal(null)}>
          <form onSubmit={handlePostAnnouncement}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>Title</label>
              <input value={announcementForm.title} onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})} required style={inputStyle} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>Body</label>
              <textarea value={announcementForm.body} onChange={e => setAnnouncementForm({...announcementForm, body: e.target.value})} required style={{...inputStyle, minHeight: '100px', resize: 'vertical'}} />
            </div>
            <button type="submit" disabled={formLoading} className="btn-gold" style={{ width: '100%', padding: '12px' }}>
              {formLoading ? 'Posting...' : 'Post Announcement'}
            </button>
          </form>
        </Modal>
      )}

      {activeModal === 'add-grade' && (
        <Modal title="Add Grade" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleAddGrade}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>Student</label>
              <select value={gradeForm.student_id} onChange={e => setGradeForm({...gradeForm, student_id: e.target.value})} required style={inputStyle}>
                <option value="">Select student...</option>
                {enrolledStudents.map((e) => (
                  <option key={e.student_id} value={e.student_id}>{e.student?.full_name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>Assignment Title</label>
              <input value={gradeForm.assignment_title} onChange={e => setGradeForm({...gradeForm, assignment_title: e.target.value})} required style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>Score</label>
                <input type="number" value={gradeForm.score} onChange={e => setGradeForm({...gradeForm, score: e.target.value})} required style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>Max Score</label>
                <input type="number" value={gradeForm.max_score} onChange={e => setGradeForm({...gradeForm, max_score: e.target.value})} required style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px' }}>Feedback</label>
              <textarea value={gradeForm.feedback} onChange={e => setGradeForm({...gradeForm, feedback: e.target.value})} style={{...inputStyle, minHeight: '60px', resize: 'vertical'}} />
            </div>
            <button type="submit" disabled={formLoading} className="btn-gold" style={{ width: '100%', padding: '12px' }}>
              {formLoading ? 'Saving...' : 'Add Grade'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
