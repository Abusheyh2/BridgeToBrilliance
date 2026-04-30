'use client'

import { useEffect, useState } from 'react'
import * as adminService from '@/services/admin-users.service'
import type { Profile } from '@/types/database.types'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [filter, setFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const res = await adminService.getAllUsers()
      if (!cancelled && res.success && res.data) setUsers(res.data)
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const loadUsers = async () => {
    const res = await adminService.getAllUsers()
    if (res.success && res.data) setUsers(res.data)
  }

  const handleRoleChange = async (userId: string, role: 'student' | 'teacher' | 'admin') => {
    const res = await adminService.updateUserRole(userId, role)
    if (res.success) loadUsers()
  }

  const handleBan = async (userId: string) => {
    const res = await adminService.banUser(userId)
    if (res.success) loadUsers()
  }

  const handleUnban = async (userId: string) => {
    const res = await adminService.unbanUser(userId)
    if (res.success) loadUsers()
  }

  const filteredUsers = users.filter(u => {
    if (filter !== 'all' && u.role !== filter) return false
    if (search && !u.full_name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'white', marginBottom: '4px' }}>
          User Management 👥
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Manage all platform users</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          style={{
            padding: '10px 16px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', fontSize: '0.9rem', outline: 'none', minWidth: '200px',
          }}
        />
        {(['all', 'student', 'teacher', 'admin'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: filter === f ? 'rgba(65, 105, 225, 0.2)' : 'rgba(255,255,255,0.05)',
              color: filter === f ? '#4169E1' : 'rgba(255,255,255,0.5)',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
            }}
          >
            {f} ({f === 'all' ? users.length : users.filter(u => u.role === f).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
          {filteredUsers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No users found</div>
          ) : (
            filteredUsers.map(user => (
              <div key={user.id} style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4169E1, #2D4FC8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 700, color: 'white',
                  }}>
                    {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {user.full_name}
                      {user.is_banned && <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(220, 53, 69, 0.2)', color: '#dc3545', fontSize: '0.7rem', fontWeight: 600 }}>BANNED</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.user_id, e.target.value as 'student' | 'teacher' | 'admin')}
                    style={{
                      padding: '6px 10px', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white', fontSize: '0.8rem', cursor: 'pointer',
                    }}
                  >
                    <option value="student" style={{ background: '#1a1a2e' }}>Student</option>
                    <option value="teacher" style={{ background: '#1a1a2e' }}>Teacher</option>
                    <option value="admin" style={{ background: '#1a1a2e' }}>Admin</option>
                  </select>
                  {user.is_banned ? (
                    <button onClick={() => handleUnban(user.user_id)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'rgba(39, 174, 96, 0.2)', color: '#27AE60', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Unban</button>
                  ) : (
                    <button onClick={() => handleBan(user.user_id)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'rgba(220, 53, 69, 0.2)', color: '#dc3545', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Ban</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
