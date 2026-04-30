'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import * as adminService from '@/services/admin-users.service'
import type { Profile, TeacherAssignment, Subject } from '@/types/database.types'

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Profile[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignments, setAssignments] = useState<Record<string, TeacherAssignment[]>>({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Profile | null>(null)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [loading, setLoading] = useState(true)

  // Create teacher form
  const [teacherName, setTeacherName] = useState('')
  const [teacherEmail, setTeacherEmail] = useState('')
  const [teacherPassword, setTeacherPassword] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [usersRes, subjectsRes] = await Promise.all([
        adminService.getAllUsers(),
        createClient().from('subjects').select('*'),
      ])
      if (!cancelled) {
        if (usersRes.success && usersRes.data) {
          const teacherUsers = usersRes.data.filter(u => u.role === 'teacher')
          setTeachers(teacherUsers)
          const assignmentsMap: Record<string, TeacherAssignment[]> = {}
          for (const teacher of teacherUsers) {
            const assignRes = await adminService.getTeacherAssignments(teacher.id)
            if (assignRes.success && assignRes.data) {
              assignmentsMap[teacher.id] = assignRes.data
            }
          }
          setAssignments(assignmentsMap)
        }
        if (subjectsRes.data) setSubjects(subjectsRes.data as unknown as Subject[])
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const loadData = async () => {
    const [usersRes, subjectsRes] = await Promise.all([
      adminService.getAllUsers(),
      createClient().from('subjects').select('*'),
    ])
    if (usersRes.success && usersRes.data) {
      const teacherUsers = usersRes.data.filter(u => u.role === 'teacher')
      setTeachers(teacherUsers)
      // Load assignments for each teacher
      const assignmentsMap: Record<string, TeacherAssignment[]> = {}
      for (const teacher of teacherUsers) {
        const assignRes = await adminService.getTeacherAssignments(teacher.id)
        if (assignRes.success && assignRes.data) {
          assignmentsMap[teacher.id] = assignRes.data
        }
      }
      setAssignments(assignmentsMap)
    }
    if (subjectsRes.data) setSubjects(subjectsRes.data as unknown as Subject[])
    setLoading(false)
  }

  const handleCreateTeacher = async () => {
    if (!teacherName.trim() || !teacherEmail.trim() || !teacherPassword.trim()) return
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: teacherEmail,
      password: teacherPassword,
      options: {
        data: { full_name: teacherName, role: 'teacher' },
      },
    })
    if (error) {
      alert(error.message)
      return
    }
    setShowCreateModal(false)
    setTeacherName('')
    setTeacherEmail('')
    setTeacherPassword('')
    loadData()
  }

  const handleAssignSubject = async () => {
    if (!selectedTeacher || !selectedSubject) return
    const res = await adminService.assignTeacherToSubject(selectedTeacher.id, selectedSubject)
    if (res.success) {
      setShowAssignModal(false)
      setSelectedSubject('')
      loadData()
    }
  }

  const handleRemoveAssignment = async (id: string) => {
    const res = await adminService.removeTeacherAssignment(id)
    if (res.success) loadData()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'white', marginBottom: '4px' }}>
            Teacher Management 👨‍🏫
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Create teacher accounts and assign subjects</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #9B59B6, #7D3C98)',
              color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            + Create Teacher
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>
      ) : teachers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👨‍🏫</div>
          <p>No teachers yet. Create your first teacher account!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {teachers.map(teacher => (
            <motion.div
              key={teacher.id}
              whileHover={{ y: -4 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #9B59B6, #7D3C98)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', fontWeight: 700, color: 'white',
                }}>
                  {teacher.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', color: 'white', fontWeight: 600 }}>{teacher.full_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{teacher.email}</div>
                </div>
              </div>

              {/* Assigned Subjects */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Assigned Subjects
                </div>
                {(assignments[teacher.id] ?? []).length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>No subjects assigned</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(assignments[teacher.id] ?? []).map(assignment => {
                      const subject = subjects.find(s => s.id === assignment.subject_id)
                      return (
                        <div key={assignment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                          <span style={{ fontSize: '0.85rem', color: 'white' }}>
                            {subject?.icon} {subject?.title}
                            {assignment.is_primary && <span style={{ marginLeft: '6px', fontSize: '0.7rem', color: '#FFB300' }}>(Primary)</span>}
                          </span>
                          <button onClick={() => handleRemoveAssignment(assignment.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.85rem' }}>✕</button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => { setSelectedTeacher(teacher); setSelectedSubject(''); setShowAssignModal(true) }}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                  color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', cursor: 'pointer',
                }}
              >
                + Assign Subject
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Teacher Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'white', marginBottom: '24px' }}>Create Teacher Account</h2>
              <input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="Full Name *" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
              <input value={teacherEmail} onChange={(e) => setTeacherEmail(e.target.value)} placeholder="Email *" type="email" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
              <input value={teacherPassword} onChange={(e) => setTeacherPassword(e.target.value)} placeholder="Temporary Password *" type="password" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleCreateTeacher} disabled={!teacherName.trim() || !teacherEmail.trim() || !teacherPassword.trim()} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: teacherName.trim() && teacherEmail.trim() && teacherPassword.trim() ? 'linear-gradient(135deg, #9B59B6, #7D3C98)' : 'rgba(255,255,255,0.05)', color: teacherName.trim() && teacherEmail.trim() && teacherPassword.trim() ? 'white' : 'rgba(255,255,255,0.3)', fontSize: '0.9rem', fontWeight: 600, cursor: teacherName.trim() && teacherEmail.trim() && teacherPassword.trim() ? 'pointer' : 'default' }}>Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Subject Modal */}
      <AnimatePresence>
        {showAssignModal && selectedTeacher && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'white', marginBottom: '8px' }}>Assign Subject</h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>To: {selectedTeacher.full_name}</p>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '16px', appearance: 'none' as const }}>
                <option value="" style={{ background: '#1a1a2e' }}>Select a subject...</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id} style={{ background: '#1a1a2e' }}>{s.icon} {s.title}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowAssignModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleAssignSubject} disabled={!selectedSubject} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: selectedSubject ? 'linear-gradient(135deg, #4169E1, #2D4FC8)' : 'rgba(255,255,255,0.05)', color: selectedSubject ? 'white' : 'rgba(255,255,255,0.3)', fontSize: '0.9rem', fontWeight: 600, cursor: selectedSubject ? 'pointer' : 'default' }}>Assign</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
