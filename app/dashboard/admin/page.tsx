'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '../layout'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Profile, Subject, Announcement } from '@/types/database.types'

export default function AdminDashboard() {
  const profile = useProfile()
  const supabase = createClient()
  const [users, setUsers] = useState<Profile[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [lessonCount, setLessonCount] = useState(0)
  const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '' })
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    if (!profile) return
    let cancelled = false
    const run = async () => {
      const [userRes, subjectRes, lessonCountRes, annRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('subjects').select('*'),
        supabase.from('lessons').select('*', { count: 'exact', head: true }),
        supabase
          .from('announcements')
          .select('*')
          .is('subject_id', null)
          .order('created_at', { ascending: false }),
      ])

      if (cancelled) return

      if (userRes.data) setUsers(userRes.data as Profile[])
      if (subjectRes.data) setSubjects(subjectRes.data)
      if (annRes.data) setAnnouncements(annRes.data)
      setLessonCount(lessonCountRes.count || 0)
      setLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, [profile])

  const stats = useMemo(() => ({
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    subjects: subjects.length,
    lessons: lessonCount,
  }), [users, subjects, lessonCount])

  const chartData = useMemo(() => [
    { name: 'Students', count: stats.students, fill: '#4169E1' },
    { name: 'Teachers', count: stats.teachers, fill: '#FFB300' },
    { name: 'Subjects', count: stats.subjects, fill: '#28a745' },
    { name: 'Lessons', count: stats.lessons, fill: '#6f42c1' },
  ], [stats])

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as Profile['role'] } : u))
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
  }

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setFormLoading(true)
    await supabase.from('announcements').insert({
      author_id: profile.id,
      subject_id: null,
      ...announcementForm,
    })
    setAnnouncementForm({ title: '', body: '' })
    setShowAnnouncementForm(false)
    const { data: annData } = await supabase
      .from('announcements')
      .select('*')
      .is('subject_id', null)
      .order('created_at', { ascending: false })
    if (annData) setAnnouncements(annData)
    setFormLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.03)',
    color: '#1A1A2E', fontSize: '0.9rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ willChange: 'transform, opacity',
          background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.2), rgba(255, 179, 0, 0.1))',
          border: '1px solid rgba(65, 105, 225, 0.2)', borderRadius: '16px', padding: '32px', marginBottom: '32px',
        }}>
        <h1 style={{ willChange: 'transform, opacity',  fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: '#1A1A2E', marginBottom: '8px' }}>
          Admin Dashboard
        </h1>
        <p style={{ willChange: 'transform, opacity',  color: 'rgba(0,0,0,0.5)', fontSize: '0.95rem' }}>
          Platform overview and management
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Total Students', value: stats.students, icon: '🎓', color: '#4169E1' },
          { label: 'Total Teachers', value: stats.teachers, icon: '👨‍🏫', color: '#FFB300' },
          { label: 'Total Subjects', value: stats.subjects, icon: '📚', color: '#28a745' },
          { label: 'Total Lessons', value: stats.lessons, icon: '🎥', color: '#6f42c1' },
        ].map((stat, i) => (
          <div key={i} style={{ animationDelay: `${i * 0.05}s` }} className="fade-in-up">
            <div style={{
              background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '16px', padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.8rem', marginBottom: '8px' }}>{stat.label}</p>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1A1A2E', fontFamily: 'var(--font-heading)' }}>{stat.value}</p>
                </div>
                <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
              </div>
              <div style={{ marginTop: '12px', height: '3px', borderRadius: '2px', background: `${stat.color}20` }}>
                <div style={{ height: '100%', width: '60%', borderRadius: '2px', background: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '40px' }}>
        <h3 style={{ color: '#1A1A2E', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Platform Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
            <XAxis dataKey="name" stroke="rgba(0,0,0,0.3)" fontSize={12} />
            <YAxis stroke="rgba(0,0,0,0.3)" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1A2D56', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', color: '#1A1A2E' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div id="users" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: '#1A1A2E', marginBottom: '20px' }}>User Management</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['Name', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'rgba(0,0,0,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4169E1, #2D4FC8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 700, color: '#1A1A2E',
                      }}>
                        {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ color: '#1A1A2E', fontSize: '0.85rem' }}>{user.full_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                      background: user.role === 'admin' ? 'rgba(255,179,0,0.15)' : user.role === 'teacher' ? 'rgba(65,105,225,0.15)' : 'rgba(40,167,69,0.15)',
                      color: user.role === 'admin' ? '#FFB300' : user.role === 'teacher' ? '#4169E1' : '#28a745',
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'rgba(0,0,0,0.4)', fontSize: '0.8rem' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      style={{
                        padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem',
                        background: 'rgba(0,0,0,0.03)', color: '#1A1A2E',
                        border: '1px solid rgba(0,0,0,0.1)', outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="student" style={{ background: '#ffffff' }}>Student</option>
                      <option value="teacher" style={{ background: '#ffffff' }}>Teacher</option>
                      <option value="admin" style={{ background: '#ffffff' }}>Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div id="subjects" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: '#1A1A2E', marginBottom: '20px' }}>All Subjects</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {subjects.map((s, i) => (
            <div key={s.id} style={{ animationDelay: `${i * 0.03}s` }} className="fade-in-up">
              <div style={{
                padding: '20px', borderRadius: '12px',
                background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)',
              }}>
                <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                <h4 style={{ color: '#1A1A2E', fontSize: '0.95rem', margin: '8px 0 4px' }}>{s.title}</h4>
                <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.8rem' }}>{s.description?.slice(0, 60)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="announcements" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: '#1A1A2E' }}>Platform Announcements</h2>
          <button onClick={() => setShowAnnouncementForm(!showAnnouncementForm)} className="btn-gold" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
            + New Announcement
          </button>
        </div>

        {showAnnouncementForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handlePostAnnouncement}
              style={{ willChange: 'transform, opacity',
              background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '12px', padding: '24px', marginBottom: '20px',
            }}>
            <div style={{ willChange: 'transform, opacity',  marginBottom: '12px' }}>
              <input value={announcementForm.title} onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})} required style={inputStyle} placeholder="Announcement title..." />
            </div>
            <div style={{ willChange: 'transform, opacity',  marginBottom: '12px' }}>
              <textarea value={announcementForm.body} onChange={e => setAnnouncementForm({...announcementForm, body: e.target.value})} required style={{ willChange: 'transform, opacity', ...inputStyle, minHeight: '80px', resize: 'vertical'}} placeholder="Announcement body..." />
            </div>
            <button type="submit" disabled={formLoading} className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>
              {formLoading ? 'Posting...' : 'Post Announcement'}
            </button>
          </motion.form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {announcements.length === 0 ? (
            <p style={{ color: 'rgba(0,0,0,0.4)', padding: '20px', background: '#ffffff', borderRadius: '12px', fontSize: '0.9rem' }}>
              No global announcements posted yet.
            </p>
          ) : (
            announcements.map(ann => (
              <div key={ann.id} style={{
                padding: '16px', borderRadius: '12px',
                background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ color: '#1A1A2E', fontSize: '0.9rem' }}>{ann.title}</h4>
                  <span style={{ color: 'rgba(0,0,0,0.3)', fontSize: '0.7rem' }}>{new Date(ann.created_at).toLocaleDateString()}</span>
                </div>
                <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.85rem', lineHeight: 1.5 }}>{ann.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
