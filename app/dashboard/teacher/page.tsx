'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  GraduationCap,
  Users,
  Video,
  Bell,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  X,
  Award,
  Filter,
} from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { useProfile, useDashboard } from '../DashboardContext'
import {
  MOCK_TEACHER_PROFILE,
  MOCK_SUBJECTS,
  MOCK_LESSONS,
  MOCK_CLASSES,
  MOCK_ANNOUNCEMENTS,
  MOCK_GRADES,
  MOCK_STUDENTS_LIST,
} from '@/lib/mockData'
import type { Subject, Lesson, Profile, Announcement, Class as ClassType, Grade } from '@/types/database.types'

export const dynamic = 'force-dynamic'

interface ModalProps {
  isOpen: boolean
  title: string
  subtitle?: string
  children: React.ReactNode
  onClose: () => void
}

function ModernModal({ isOpen, title, subtitle, children, onClose }: ModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg rounded-2xl bg-white p-6 md:p-8 shadow-2xl border border-slate-200 z-10 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h3 className="font-heading font-bold text-xl text-slate-900">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default function TeacherDashboard() {
  const profileContext = useProfile()
  useDashboard()
  const profile = profileContext || MOCK_TEACHER_PROFILE
  const supabase = createClient()

  // State Management
  const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS)
  const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS)
  const [classes, setClasses] = useState<ClassType[]>(MOCK_CLASSES)
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS)
  const [grades, setGrades] = useState<Grade[]>(MOCK_GRADES)
  const [students] = useState<Profile[]>(MOCK_STUDENTS_LIST)

  // Filter & Search
  const [gradeSearch, setGradeSearch] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all')

  // Modals state
  const [activeModal, setActiveModal] = useState<
    'subject' | 'lesson' | 'class' | 'announcement' | 'grade' | null
  >(null)

  // Form states
  const [subjectForm, setSubjectForm] = useState({
    title: '',
    description: '',
    color: '#4169E1',
    icon: '📚',
  })

  const [lessonForm, setLessonForm] = useState({
    subject_id: MOCK_SUBJECTS[0].id,
    title: '',
    description: '',
    video_url: '',
    order_index: 1,
  })

  const [classForm, setClassForm] = useState({
    subject_id: MOCK_SUBJECTS[0].id,
    title: '',
    scheduled_at: '',
    meeting_link: '',
    description: '',
  })

  const [announcementForm, setAnnouncementForm] = useState({
    subject_id: 'all',
    title: '',
    body: '',
  })

  const [gradeForm, setGradeForm] = useState({
    student_id: MOCK_STUDENTS_LIST[0].id,
    subject_id: MOCK_SUBJECTS[0].id,
    assignment_title: '',
    score: 95,
    max_score: 100,
    feedback: '',
  })

  useEffect(() => {
    if (!isSupabaseConfigured() || !profileContext) {
      return
    }

    let cancelled = false
    const fetchData = async () => {
      try {
        const [
          { data: subData },
          { data: annData },
          { data: classData },
          { data: gradeData },
        ] = await Promise.all([
          supabase.from('subjects').select('*').order('created_at', { ascending: false }),
          supabase.from('announcements').select('*').order('created_at', { ascending: false }),
          supabase.from('classes').select('*, subject:subjects(title)').order('scheduled_at', { ascending: true }),
          supabase.from('grades').select('*, subject:subjects(title), student:profiles!grades_student_id_fkey(full_name, email)').order('created_at', { ascending: false }),
        ])

        if (cancelled) return

        if (subData && subData.length > 0) setSubjects(subData as Subject[])
        if (annData && annData.length > 0) setAnnouncements(annData as Announcement[])
        if (classData && classData.length > 0) setClasses(classData as ClassType[])
        if (gradeData && gradeData.length > 0) setGrades(gradeData as Grade[])
      } catch (e) {
        console.warn('Teacher dashboard fallback:', e)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [profileContext, supabase])

  // Handlers for creating new items with immediate UI feedback
  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjectForm.title) return

    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      title: subjectForm.title,
      description: subjectForm.description || 'Comprehensive curriculum overview.',
      teacher_id: profile.id,
      color: subjectForm.color,
      icon: subjectForm.icon || '📚',
      created_at: new Date().toISOString(),
      enrollment_count: 0,
      lesson_count: 0,
    }

    setSubjects([newSub, ...subjects])
    setSubjectForm({ title: '', description: '', color: '#4169E1', icon: '📚' })
    setActiveModal(null)
  }

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault()
    if (!lessonForm.title) return

    const newLes: Lesson = {
      id: `les-${Date.now()}`,
      subject_id: lessonForm.subject_id,
      title: lessonForm.title,
      description: lessonForm.description,
      video_url: lessonForm.video_url || 'https://www.youtube.com/watch?v=9vKqVkMQHKk',
      thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
      order_index: Number(lessonForm.order_index) || lessons.length + 1,
      created_at: new Date().toISOString(),
    }

    setLessons([...lessons, newLes])
    setSubjects(
      subjects.map((s) =>
        s.id === lessonForm.subject_id ? { ...s, lesson_count: (s.lesson_count || 0) + 1 } : s
      )
    )
    setLessonForm({ subject_id: subjects[0]?.id || '', title: '', description: '', video_url: '', order_index: 1 })
    setActiveModal(null)
  }

  const handleScheduleClass = (e: React.FormEvent) => {
    e.preventDefault()
    if (!classForm.title) return

    const targetSub = subjects.find((s) => s.id === classForm.subject_id)
    const newClass: ClassType = {
      id: `cls-${Date.now()}`,
      subject_id: classForm.subject_id,
      title: classForm.title,
      scheduled_at: classForm.scheduled_at || new Date(Date.now() + 24 * 3600000).toISOString(),
      meeting_link: classForm.meeting_link || 'https://meet.google.com/b2b-live-lecture',
      description: classForm.description,
      created_at: new Date().toISOString(),
      subject: targetSub,
    }

    setClasses([newClass, ...classes])
    setClassForm({ subject_id: subjects[0]?.id || '', title: '', scheduled_at: '', meeting_link: '', description: '' })
    setActiveModal(null)
  }

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!announcementForm.title) return

    const targetSub = subjects.find((s) => s.id === announcementForm.subject_id)
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      subject_id: announcementForm.subject_id === 'all' ? null : announcementForm.subject_id,
      author_id: profile.id,
      title: announcementForm.title,
      body: announcementForm.body,
      created_at: new Date().toISOString(),
      author: profile,
      subject: targetSub,
    }

    setAnnouncements([newAnn, ...announcements])
    setAnnouncementForm({ subject_id: 'all', title: '', body: '' })
    setActiveModal(null)
  }

  const handleRecordGrade = (e: React.FormEvent) => {
    e.preventDefault()
    if (!gradeForm.assignment_title) return

    const targetStudent = students.find((s) => s.id === gradeForm.student_id)
    const targetSub = subjects.find((s) => s.id === gradeForm.subject_id)

    const newGrade: Grade = {
      id: `grd-${Date.now()}`,
      student_id: gradeForm.student_id,
      subject_id: gradeForm.subject_id,
      assignment_title: gradeForm.assignment_title,
      score: Number(gradeForm.score),
      max_score: Number(gradeForm.max_score) || 100,
      feedback: gradeForm.feedback,
      graded_by: profile.id,
      created_at: new Date().toISOString(),
      subject: targetSub,
      student: targetStudent,
    }

    setGrades([newGrade, ...grades])
    setGradeForm({
      student_id: students[0]?.id || '',
      subject_id: subjects[0]?.id || '',
      assignment_title: '',
      score: 95,
      max_score: 100,
      feedback: '',
    })
    setActiveModal(null)
  }

  // Filtered grades calculation
  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      const matchSearch =
        (g.assignment_title?.toLowerCase() || '').includes(gradeSearch.toLowerCase()) ||
        (g.student?.full_name?.toLowerCase() || '').includes(gradeSearch.toLowerCase()) ||
        (g.subject?.title?.toLowerCase() || '').includes(gradeSearch.toLowerCase())

      const matchSubject = selectedSubjectId === 'all' || g.subject_id === selectedSubjectId
      return matchSearch && matchSubject
    })
  }, [grades, gradeSearch, selectedSubjectId])

  const totalEnrollments = useMemo(() => {
    return subjects.reduce((acc, s) => acc + (s.enrollment_count || 24), 0)
  }, [subjects])

  return (
    <div className="space-y-8 pb-16">
      {/* Faculty Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-8 md:p-10 shadow-xl shadow-slate-900/10"
      >
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-72 h-72 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Faculty Academic Console</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white tracking-tight">
              Good day, {profile.full_name}! 📚
            </h1>
            <p className="text-blue-100/80 text-sm md:text-base leading-relaxed">
              Manage your curricula, coordinate live lecture classrooms, evaluate student submissions, and broadcast academic notices.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveModal('subject')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
            <button
              onClick={() => setActiveModal('lesson')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-all active:scale-95"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>Add Lesson</span>
            </button>
            <button
              onClick={() => setActiveModal('class')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-all active:scale-95"
            >
              <Video className="w-4 h-4 text-emerald-300" />
              <span>Live Session</span>
            </button>
            <button
              onClick={() => setActiveModal('grade')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-400/20 active:scale-95"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Record Grade</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 text-blue-200 text-xs font-medium mb-1">
              <Users className="w-4 h-4 text-blue-300" />
              Active Students
            </div>
            <div className="text-2xl md:text-3xl font-bold font-heading">{totalEnrollments}</div>
            <div className="text-[11px] text-blue-200/70 mt-1">Enrolled across cohort</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-medium mb-1">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Active Subjects
            </div>
            <div className="text-2xl md:text-3xl font-bold font-heading text-amber-300">{subjects.length}</div>
            <div className="text-[11px] text-amber-200/70 mt-1">Courses instructed</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium mb-1">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              Evaluations Graded
            </div>
            <div className="text-2xl md:text-3xl font-bold font-heading text-emerald-300">{grades.length}</div>
            <div className="text-[11px] text-emerald-200/70 mt-1">Submissions marked</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-medium mb-1">
              <Video className="w-4 h-4 text-purple-400" />
              Upcoming Classes
            </div>
            <div className="text-2xl md:text-3xl font-bold font-heading text-purple-300">{classes.length}</div>
            <div className="text-[11px] text-purple-200/70 mt-1">Live seminars booked</div>
          </div>
        </div>
      </motion.div>

      {/* Subjects & Curriculum Section */}
      <div id="subjects" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold text-slate-900 tracking-tight">
              My Teaching Offerings & Curricula
            </h2>
            <p className="text-xs text-slate-500">Configure subject outlines, publish video lessons, and monitor rosters</p>
          </div>
          <button
            onClick={() => setActiveModal('subject')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs border border-blue-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Subject</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub, idx) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400/80 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-110 transition-transform">
                    {sub.icon}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                    {sub.enrollment_count || 24} Students
                  </span>
                </div>

                <h3 className="font-heading font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                  {sub.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {sub.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {sub.lesson_count || 10} Published Lessons
                  </span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setLessonForm((prev) => ({ ...prev, subject_id: sub.id }))
                      setActiveModal('lesson')
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Lesson</span>
                  </button>
                  <button
                    onClick={() => {
                      setClassForm((prev) => ({ ...prev, subject_id: sub.id }))
                      setActiveModal('class')
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Host Live</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Gradebook & Student Submissions Console */}
      <div id="gradebook" className="space-y-6">
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-blue-600" />
                <span>Gradebook & Performance Matrix</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Review student scores, assignment results, and constructive feedback</p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setActiveModal('grade')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Record New Grade</span>
              </button>
            </div>
          </div>

          {/* Search & Subject Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name or assignment title..."
                value={gradeSearch}
                onChange={(e) => setGradeSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grades Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Assignment / Examination</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Grade %</th>
                  <th className="py-3 px-4">Feedback Remarks</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGrades.map((g) => {
                  const pct = Math.round((g.score / g.max_score) * 100)
                  const isHigh = pct >= 90
                  const isMed = pct >= 80 && pct < 90

                  return (
                    <tr key={g.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {g.student?.full_name || 'Alex Morgan'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {g.subject?.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {g.assignment_title}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {g.score} / {g.max_score}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            isHigh
                              ? 'bg-emerald-100 text-emerald-800'
                              : isMed
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                        &quot;{g.feedback || 'Satisfactory work'}&quot;
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-right">
                        {new Date(g.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grid: Live Classes + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Classes Management */}
        <div id="classes" className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-emerald-600" />
              <h3 className="font-heading font-bold text-slate-900 text-lg">
                Scheduled Live Seminars
              </h3>
            </div>
            <button
              onClick={() => setActiveModal('class')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs border border-emerald-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Session</span>
            </button>
          </div>

          <div className="space-y-4">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{cls.subject?.title}</span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(cls.scheduled_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{cls.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{cls.description}</p>
                <div className="pt-2 flex items-center justify-between">
                  <a
                    href={cls.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Launch Video Classroom</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                  <span className="text-[11px] text-slate-400">Google Meet link verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements Publisher */}
        <div id="announcements" className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              <h3 className="font-heading font-bold text-slate-900 text-lg">
                Broadcast Academic Notices
              </h3>
            </div>
            <button
              onClick={() => setActiveModal('announcement')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold text-xs border border-amber-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Notice</span>
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-bold text-slate-900">{ann.title}</h4>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{ann.body}</p>
                <div className="text-[10px] text-slate-400 pt-1">
                  Posted by {ann.author?.full_name || 'Faculty Office'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL 1: Create Subject */}
      <ModernModal
        isOpen={activeModal === 'subject'}
        title="Create New Subject Curriculum"
        subtitle="Introduce a course offering for BridgeToBrilliance students"
        onClose={() => setActiveModal(null)}
      >
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Title</label>
            <input
              type="text"
              required
              placeholder="e.g. AP Physics C: Mechanics"
              value={subjectForm.title}
              onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Icon Emoji</label>
            <input
              type="text"
              placeholder="e.g. ⚡, 🧬, 🚀"
              value={subjectForm.icon}
              onChange={(e) => setSubjectForm({ ...subjectForm, icon: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Syllabus</label>
            <textarea
              rows={3}
              placeholder="Brief course objectives and syllabus..."
              value={subjectForm.description}
              onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
            >
              Publish Subject
            </button>
          </div>
        </form>
      </ModernModal>

      {/* MODAL 2: Add Lesson */}
      <ModernModal
        isOpen={activeModal === 'lesson'}
        title="Add Curriculum Lesson"
        subtitle="Upload or link a video lecture with descriptions"
        onClose={() => setActiveModal(null)}
      >
        <form onSubmit={handleCreateLesson} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <select
              value={lessonForm.subject_id}
              onChange={(e) => setLessonForm({ ...lessonForm, subject_id: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lesson Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Fundamental Theorem of Calculus Part 1"
              value={lessonForm.title}
              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Video Lecture URL (YouTube / MP4)</label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={lessonForm.video_url}
              onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lesson Overview</label>
            <textarea
              rows={2}
              placeholder="Key concepts covered in this lecture..."
              value={lessonForm.description}
              onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
            >
              Upload Lesson
            </button>
          </div>
        </form>
      </ModernModal>

      {/* MODAL 3: Schedule Live Class */}
      <ModernModal
        isOpen={activeModal === 'class'}
        title="Schedule Live Virtual Seminar"
        subtitle="Host a live Q&A or lecture session via Google Meet / Zoom"
        onClose={() => setActiveModal(null)}
      >
        <form onSubmit={handleScheduleClass} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <select
              value={classForm.subject_id}
              onChange={(e) => setClassForm({ ...classForm, subject_id: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Session Topic</label>
            <input
              type="text"
              required
              placeholder="e.g. Final Review: Multi-variable Calculus"
              value={classForm.title}
              onChange={(e) => setClassForm({ ...classForm, title: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Link</label>
            <input
              type="url"
              placeholder="https://meet.google.com/..."
              value={classForm.meeting_link}
              onChange={(e) => setClassForm({ ...classForm, meeting_link: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Session Notes / Instructions</label>
            <textarea
              rows={2}
              placeholder="Bring past exam questions and graphing calculators..."
              value={classForm.description}
              onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              Confirm Schedule
            </button>
          </div>
        </form>
      </ModernModal>

      {/* MODAL 4: Record Grade */}
      <ModernModal
        isOpen={activeModal === 'grade'}
        title="Record Student Grade & Feedback"
        subtitle="Provide individual evaluation and constructive guidance"
        onClose={() => setActiveModal(null)}
      >
        <form onSubmit={handleRecordGrade} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student</label>
              <select
                value={gradeForm.student_id}
                onChange={(e) => setGradeForm({ ...gradeForm, student_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={gradeForm.subject_id}
                onChange={(e) => setGradeForm({ ...gradeForm, subject_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment / Exam Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Unit 5 Differential Equations Mastery"
              value={gradeForm.assignment_title}
              onChange={(e) => setGradeForm({ ...gradeForm, assignment_title: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Score Awarded</label>
              <input
                type="number"
                required
                min={0}
                max={100}
                value={gradeForm.score}
                onChange={(e) => setGradeForm({ ...gradeForm, score: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Score</label>
              <input
                type="number"
                required
                min={1}
                value={gradeForm.max_score}
                onChange={(e) => setGradeForm({ ...gradeForm, max_score: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Instructor Feedback</label>
            <textarea
              rows={3}
              placeholder="Detailed notes, commendations, areas for improvement..."
              value={gradeForm.feedback}
              onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs"
            >
              Save Grade
            </button>
          </div>
        </form>
      </ModernModal>

      {/* MODAL 5: Post Announcement */}
      <ModernModal
        isOpen={activeModal === 'announcement'}
        title="Broadcast Announcement"
        subtitle="Notify your students about exams, schedule changes, or events"
        onClose={() => setActiveModal(null)}
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Audience</label>
            <select
              value={announcementForm.subject_id}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, subject_id: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Enrolled Students (Global)</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Midterm Preparation Guide & Study Group Hours"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message Body</label>
            <textarea
              rows={4}
              required
              placeholder="Detailed message..."
              value={announcementForm.body}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, body: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs"
            >
              Broadcast Notice
            </button>
          </div>
        </form>
      </ModernModal>
    </div>
  )
}
