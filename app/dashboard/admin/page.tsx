'use client'

import { useState, useEffect } from 'react'
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
  const [stats, setStats] = useState({ students: 0, teachers: 0, subjects: 0, lessons: 0 })
  const [loading, setLoading] = useState(true)
  const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '' })
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    if (!profile) return
    fetchData()
  }, [profile])

  const fetchData = async () => {
    // Users
    const { data: userData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (userData) {
      setUsers(userData as Profile[])
      setStats(prev => ({
        ...prev,
        students: userData.filter(u => u.role === 'student').length,
        teachers: userData.filter(u => u.role === 'teacher').length,
      }))
    }

    // Subjects
    const { data: subjectData } = await supabase.from('subjects').select('*')
    if (subjectData) {
      setSubjects(subjectData)
      setStats(prev => ({ ...prev, subjects: subjectData.length }))
    }

    // Lessons count
    const { count: lessonCount } = await supabase.from('lessons').select('*', { count: 'exact', head: true })
    setStats(prev => ({ ...prev, lessons: lessonCount || 0 }))

    // Global announcements
    const { data: annData } = await supabase
      .from('announcements')
      .select('*')
      .is('subject_id', null)
      .order('created_at', { ascending: false })
    if (annData) setAnnouncements(annData)

    setLoading(false)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    await fetchData()
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
    await fetchData()
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

  const chartData = [
    { name: 'Students', count: stats.students, fill: '#4169E1' },
    { name: 'Teachers', count: stats.teachers, fill: '#FFB300' },
    { name: 'Subjects', count: stats.subjects, fill: '#28a745' },
    { name: 'Lessons', count: stats.lessons, fill: '#6f42c1' },
  ]

  return (
    <div>
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.2), rgba(255, 179, 0, 0.1))',
          border: '1px solid rgba(65, 105, 225, 0.2)', borderRadius: '16px', padding: '32px', marginBottom: '32px',
        }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
          Admin Dashboard 🛡️
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
          Platform overview and management
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Total Students', value: stats.students, icon: '🎓', color: '#4169E1' },
          { label: 'Total Teachers', value: stats.teachers, icon: '👨‍🏫', color: '#FFB300' },
          { label: 'Total Subjects', value: stats.subjects, icon: '📚', color: '#28a745' },
          { label: 'Total Lessons', value: stats.lessons, icon: '🎥', color: '#6f42c1' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px', padding: '24px',
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '8px' }}>{stat.label}</p>
                <p style={{ fontSize: '2rem', fontWeight: 700, color: 'white', fontFamily: 'var(--font-heading)' }}>{stat.value}</p>
              </div>
              <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
            </div>
            <div style={{ marginTop: '12px', height: '3px', borderRadius: '2px', background: `${stat.color}20` }}>
              <div style={{ height: '100%', width: '60%', borderRadius: '2px', background: stat.color }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Chart */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '40px' }}>
        <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Platform Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1A2D56', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* User Management */}
      <div id="users" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: 'white', marginBottom: '20px' }}>👥 User Management</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['Name', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4169E1, #2D4FC8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 700, color: 'white',
                      }}>
                        {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ color: 'white', fontSize: '0.85rem' }}>{user.full_name}</span>
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
                  <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      style={{
                        padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem',
                        background: 'rgba(255,255,255,0.05)', color: 'white',
                        border: '1px solid rgba(255,255,255,0.15)', outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="student" style={{ background: '#132347' }}>Student</option>
                      <option value="teacher" style={{ background: '#132347' }}>Teacher</option>
                      <option value="admin" style={{ background: '#132347' }}>Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Subjects */}
      <div id="subjects" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: 'white', marginBottom: '20px' }}>📚 All Subjects</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {subjects.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{
                padding: '20px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
              <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
              <h4 style={{ color: 'white', fontSize: '0.95rem', margin: '8px 0 4px' }}>{s.title}</h4>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{s.description?.slice(0, 60)}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Global Announcements */}
      <div id="announcements" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: 'white' }}>📢 Platform Announcements</h2>
          <button onClick={() => setShowAnnouncementForm(!showAnnouncementForm)} className="btn-gold" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
            + New Announcement
          </button>
        </div>

        {showAnnouncementForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handlePostAnnouncement}
            style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', padding: '24px', marginBottom: '20px',
            }}>
            <div style={{ marginBottom: '12px' }}>
              <input value={announcementForm.title} onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})} required style={inputStyle} placeholder="Announcement title..." />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <textarea value={announcementForm.body} onChange={e => setAnnouncementForm({...announcementForm, body: e.target.value})} required style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} placeholder="Announcement body..." />
            </div>
            <button type="submit" disabled={formLoading} className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>
              {formLoading ? 'Posting...' : 'Post Announcement'}
            </button>
          </motion.form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {announcements.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', fontSize: '0.9rem' }}>
              No global announcements posted yet.
            </p>
          ) : (
            announcements.map(ann => (
              <div key={ann.id} style={{
                padding: '16px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ color: 'white', fontSize: '0.9rem' }}>{ann.title}</h4>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>{new Date(ann.created_at).toLocaleDateString()}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.5 }}>{ann.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
