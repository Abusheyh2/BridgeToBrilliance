'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as studyService from '@/services/study.service'
import type { Bookmark } from '@/types/database.types'

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const res = await studyService.getBookmarks()
      if (!cancelled && res.success && res.data) setBookmarks(res.data)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const loadBookmarks = async () => {
    const res = await studyService.getBookmarks()
    if (res.success && res.data) setBookmarks(res.data)
  }

  const handleCreate = async () => {
    if (!title.trim()) return
    const res = await studyService.createBookmark(title, null, null, url || null, notes || null)
    if (res.success) { setShowCreateModal(false); setTitle(''); setUrl(''); setNotes(''); loadBookmarks() }
  }

  const handleDelete = async (id: string) => {
    const res = await studyService.deleteBookmark(id)
    if (res.success) loadBookmarks()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'white', marginBottom: '4px' }}>
            Bookmarks 🔖
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Save lessons and resources for quick access</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1ABC9C, #16A085)', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
        >
          + Add Bookmark
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {bookmarks.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔖</div>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>No bookmarks yet. Save resources you want to revisit!</p>
          </div>
        ) : (
          bookmarks.map(bm => (
            <motion.div
              key={bm.id}
              whileHover={{ y: -4 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'white', flex: 1 }}>{bm.title}</h3>
                <button onClick={() => handleDelete(bm.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.9rem' }}>🗑️</button>
              </div>
              {bm.url && (
                <a href={bm.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#1ABC9C', textDecoration: 'none', wordBreak: 'break-all', display: 'block', marginBottom: '8px' }}>
                  🔗 {bm.url}
                </a>
              )}
              {bm.notes && (
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>{bm.notes}</p>
              )}
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                {new Date(bm.created_at).toLocaleDateString()}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'white', marginBottom: '24px' }}>Add Bookmark</h2>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (optional)" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={3} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: '16px' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleCreate} disabled={!title.trim()} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: title.trim() ? 'linear-gradient(135deg, #1ABC9C, #16A085)' : 'rgba(255,255,255,0.05)', color: title.trim() ? 'white' : 'rgba(255,255,255,0.3)', fontSize: '0.9rem', fontWeight: 600, cursor: title.trim() ? 'pointer' : 'default' }}>Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
