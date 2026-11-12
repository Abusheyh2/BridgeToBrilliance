'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Clock,
  Award,
  ArrowRight,
  Video,
  CheckCircle2,
  TrendingUp,
  Flame,
  ExternalLink,
  FileQuestion,
  Users,
  Timer,
  Bell,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { useProfile, useDashboard } from '../DashboardContext'
import {
  MOCK_ENROLLMENTS,
  MOCK_SUBJECTS,
  MOCK_CLASSES,
  MOCK_ANNOUNCEMENTS,
  MOCK_GRADES,
  MOCK_STUDY_HOURS,
  MOCK_STUDENT_PROFILE,
  type MockEnrollmentItem,
} from '@/lib/mockData'
import type { Subject, Announcement, Class as ClassType, Grade } from '@/types/database.types'

export const dynamic = 'force-dynamic'

export default function StudentDashboard() {
  const profileContext = useProfile()
  useDashboard()
  const profile = profileContext || MOCK_STUDENT_PROFILE
  const supabase = createClient()

  const [enrollments, setEnrollments] = useState<MockEnrollmentItem[]>(MOCK_ENROLLMENTS)
  const [allSubjects, setAllSubjects] = useState<Subject[]>(MOCK_SUBJECTS)
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS)
  const [upcomingClasses, setUpcomingClasses] = useState<ClassType[]>(MOCK_CLASSES)
  const [grades, setGrades] = useState<Grade[]>(MOCK_GRADES.slice(0, 3))
  const [enrollingId, setEnrollingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured() || !profileContext) {
      return
    }

    let cancelled = false
    const loadRealData = async () => {
      try {
        const [
          { data: enrollmentData },
          { data: annData },
          { data: classData },
          { data: gradeData },
          { data: subData },
          { data: lessonData },
          { data: progressData },
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
          supabase.from('lessons').select('id, subject_id'),
          supabase
            .from('progress')
            .select('lesson_id, watched')
            .eq('student_id', profile.id)
            .eq('watched', true),
        ])

        if (cancelled) return

        // Real per-subject lesson totals and watched counts. These used to be
        // hardcoded to 12 / 0, so every progress bar read 0% for every student.
        const lessonsBySubject = new Map<string, number>()
        const subjectByLesson = new Map<string, string>()
        for (const lesson of lessonData ?? []) {
          lessonsBySubject.set(
            lesson.subject_id,
            (lessonsBySubject.get(lesson.subject_id) ?? 0) + 1
          )
          subjectByLesson.set(lesson.id, lesson.subject_id)
        }

        const watchedBySubject = new Map<string, number>()
        for (const row of progressData ?? []) {
          const subjectId = subjectByLesson.get(row.lesson_id)
          if (!subjectId) continue
          watchedBySubject.set(subjectId, (watchedBySubject.get(subjectId) ?? 0) + 1)
        }

        if (enrollmentData && enrollmentData.length > 0) {
          const formatted = (enrollmentData as Array<Record<string, unknown>>).map((e) => {
            const subjectId = e['subject_id'] as string
            return {
              ...e,
              subject: e['subject'] as Subject,
              lesson_count: lessonsBySubject.get(subjectId) ?? 0,
              watched_count: watchedBySubject.get(subjectId) ?? 0,
            }
          }) as MockEnrollmentItem[]
          setEnrollments(formatted)
        }
        if (annData && annData.length > 0) setAnnouncements(annData as Announcement[])
        if (classData && classData.length > 0) setUpcomingClasses(classData as ClassType[])
        if (gradeData && gradeData.length > 0) setGrades(gradeData as Grade[])
        if (subData && subData.length > 0) setAllSubjects(subData as Subject[])
      } catch (e) {
        console.warn('Fallback to mock student data:', e)
      }
    }

    loadRealData()
    return () => {
      cancelled = true
    }
  }, [profileContext, profile.id, supabase])

  const handleEnroll = async (subjectId: string) => {
    setEnrollingId(subjectId)
    setTimeout(() => {
      const subjectToEnroll = allSubjects.find((s) => s.id === subjectId)
      if (subjectToEnroll) {
        const newEnrollment: MockEnrollmentItem = {
          id: `enr-${Date.now()}`,
          student_id: profile.id,
          subject_id: subjectId,
          enrolled_at: new Date().toISOString(),
          subject: subjectToEnroll,
          lesson_count: subjectToEnroll.lesson_count || 10,
          watched_count: 0,
        }
        setEnrollments((prev) => [...prev, newEnrollment])
      }
      setEnrollingId(null)
    }, 600)
  }

  // Calculate student statistics
  const enrolledSubjectIds = useMemo(() => new Set(enrollments.map((e) => e.subject_id)), [enrollments])
  const averageGrade = useMemo(() => {
    if (grades.length === 0) return 95
    const total = grades.reduce((acc, g) => acc + (g.score / g.max_score) * 100, 0)
    return Math.round(total / grades.length)
  }, [grades])

  const completedLessons = useMemo(() => {
    return enrollments.reduce((acc, e) => acc + (e.watched_count || 0), 0)
  }, [enrollments])

  const availableToEnroll = useMemo(() => {
    return allSubjects.filter((s) => !enrolledSubjectIds.has(s.id))
  }, [allSubjects, enrolledSubjectIds])

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white p-8 md:p-10 shadow-xl shadow-blue-900/10"
      >
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-64 h-64 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>BridgeToBrilliance Scholar Track</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white tracking-tight">
              Welcome back, {profile.full_name.split(' ')[0]}! 🎓
            </h1>
            <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
              You are enrolled in <span className="text-amber-300 font-semibold">{enrollments.length} active courses</span>. Keep going — every lesson you finish moves your progress bar.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/student/study"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              Open Study Hub
            </Link>
          </div>
        </div>

        {/* Quick KPI Cards Grid */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8 pt-8 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 text-blue-200 text-xs font-medium mb-1">
              <BookOpen className="w-4 h-4 text-blue-300" />
              Enrolled Courses
            </div>
            <div className="text-2xl md:text-3xl font-bold font-heading">{enrollments.length}</div>
            <div className="text-[11px] text-blue-200/70 mt-1">All curricula active</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-medium mb-1">
              <Flame className="w-4 h-4 text-amber-400" />
              Study Streak
            </div>
            <div className="text-2xl md:text-3xl font-bold font-heading text-amber-300">7 Days</div>
            <div className="text-[11px] text-amber-200/70 mt-1">🔥 Top consistency</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium mb-1">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              Cumulative Score
            </div>
            <div className="text-2xl md:text-3xl font-bold font-heading text-emerald-300">{averageGrade}%</div>
            <div className="text-[11px] text-emerald-200/70 mt-1">Grade: A (Distinction)</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-medium mb-1">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              Lessons Completed
            </div>
            <div className="text-2xl md:text-3xl font-bold font-heading text-purple-300">{completedLessons}</div>
            <div className="text-[11px] text-purple-200/70 mt-1">Across all subjects</div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Courses + Study Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: My Courses (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-heading font-bold text-slate-900 tracking-tight">
                My Enrolled Courses
              </h2>
              <p className="text-xs text-slate-500">Pick up right where you left off</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {enrollments.length} Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {enrollments.map((enr, idx) => {
              const sub = enr.subject
              const totalLessons = enr.lesson_count || 12
              const watched = enr.watched_count || 0
              const progressPct = totalLessons > 0 ? Math.min(100, Math.round((watched / totalLessons) * 100)) : 0

              return (
                <motion.div
                  key={enr.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400/70 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100 text-2xl group-hover:scale-110 transition-transform">
                        {sub?.icon || '📚'}
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                        {progressPct}% Completed
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors leading-snug">
                      {sub?.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-4">
                      {sub?.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-600 mb-4">
                      <span className="font-medium text-slate-700">Instructor:</span>
                      <span className="text-slate-500">{sub?.teacher?.full_name || 'Faculty Member'}</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Lesson {watched} of {totalLessons}</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/subjects/${enr.subject_id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-all group-hover:shadow-md"
                    >
                      <span>Continue Learning</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Available to Enroll Section */}
          {availableToEnroll.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-heading font-bold text-slate-900">
                  Explore More Subjects
                </h3>
                <span className="text-xs text-slate-500">{availableToEnroll.length} available</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableToEnroll.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{sub.icon}</span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{sub.title}</h4>
                        <p className="text-xs text-slate-500 truncate">{sub.teacher?.full_name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEnroll(sub.id)}
                      disabled={enrollingId === sub.id}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors disabled:opacity-50"
                    >
                      {enrollingId === sub.id ? 'Enrolling...' : 'Enroll Free'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Learning Analytics (Chart) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading font-bold text-slate-900 text-base">
                  Weekly Study Hours & Consistency
                </h3>
                <p className="text-xs text-slate-500">Tracked across video lectures, quizzes, and group reviews</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18% vs last week</span>
              </div>
            </div>

            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={MOCK_STUDY_HOURS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(val) => [`${val} hours`, 'Study Time']}
                  />
                  <Bar dataKey="hours" fill="#4169E1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Live Classes, Grades, Study Hub Shortcuts (1 col) */}
        <div className="space-y-6">
          {/* Upcoming Live Classes Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                <h3 className="font-heading font-bold text-slate-900 text-base">
                  Live Classroom
                </h3>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
                Upcoming
              </span>
            </div>

            <div className="space-y-3">
              {upcomingClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-blue-600 font-semibold">
                    <span>{cls.subject?.title}</span>
                    <span className="flex items-center gap-1 text-slate-500 font-normal">
                      <Clock className="w-3 h-3" />
                      {new Date(cls.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{cls.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{cls.description}</p>
                  <a
                    href={cls.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Class</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Study Hub Launchpad */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-blue-500/5 to-indigo-500/10 border border-amber-200/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="font-heading font-bold text-slate-900 text-base">
                  Study Tools
                </h3>
              </div>
              <Link href="/dashboard/student/study" className="text-xs font-semibold text-blue-600 hover:underline">
                View all
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/dashboard/student/study/quizzes"
                className="p-3 rounded-xl bg-white border border-slate-200/70 hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <FileQuestion className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Quizzes</span>
                <span className="text-[10px] text-slate-500">Practice tests</span>
              </Link>

              <Link
                href="/dashboard/student/study/flashcards"
                className="p-3 rounded-xl bg-white border border-slate-200/70 hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Flashcards</span>
                <span className="text-[10px] text-slate-500">Spaced recall</span>
              </Link>

              <Link
                href="/dashboard/student/study/timer"
                className="p-3 rounded-xl bg-white border border-slate-200/70 hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Timer className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Pomodoro</span>
                <span className="text-[10px] text-slate-500">Focus sprints</span>
              </Link>

              <Link
                href="/dashboard/student/study/groups"
                className="p-3 rounded-xl bg-white border border-slate-200/70 hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Study Groups</span>
                <span className="text-[10px] text-slate-500">Peer collaboration</span>
              </Link>
            </div>
          </div>

          {/* Recent Grades & Instructor Feedback */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h3 className="font-heading font-bold text-slate-900 text-base">
                  Recent Grades & Feedback
                </h3>
              </div>
              <span className="text-xs text-slate-500">{grades.length} Graded</span>
            </div>

            <div className="space-y-3">
              {grades.map((grade) => (
                <div
                  key={grade.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {grade.assignment_title}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {grade.score}/{grade.max_score} ({Math.round((grade.score / grade.max_score) * 100)}%)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Course: <span className="text-slate-700 font-medium">{grade.subject?.title}</span>
                  </div>
                  {grade.feedback && (
                    <p className="text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200/60">
                      &quot;{grade.feedback}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Announcements Feed */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <h3 className="font-heading font-bold text-slate-900 text-base">
                  Faculty Announcements
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{ann.body}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
