'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as notesService from '@/services/notes.service'
import type { StudyNote } from '@/types/database.types'

const NOTE_COLORS = ['#4169E1', '#9B59B6', '#27AE60', '#E74C3C', '#F39C12', '#1ABC9C', '#3498DB', '#E67E22']

export default function NotesPage() {
  const [notes, setNotes] = useState<StudyNote[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null)
  const [filterTag, setFilterTag] = useState<string | null>(null)

  // Form
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [color, setColor] = useState('#4169E1')
  const [tags, setTags] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const res = await notesService.getNotes()
      if (!cancelled && res.success && res.data) setNotes(res.data)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const loadNotes = async () => {
    const res = await notesService.getNotes()
    if (res.success && res.data) setNotes(res.data)
  }

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
    const res = await notesService.createNote(title, content, null, null, tagList, color)
    if (res.success) {
      setShowCreateModal(false)
      resetForm()
      loadNotes()
    }
  }

  const handleUpdate = async () => {
    if (!editingNote || !title.trim() || !content.trim()) return
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
    const res = await notesService.updateNote(editingNote.id, { title, content, tags: tagList, color })
    if (res.success) {
      setEditingNote(null)
      resetForm()
      loadNotes()
    }
  }

  const handleDelete = async (id: string) => {
    const res = await notesService.deleteNote(id)
    if (res.success) loadNotes()
  }

  const handleTogglePin = async (note: StudyNote) => {
    await notesService.updateNote(note.id, { is_pinned: !note.is_pinned })
    loadNotes()
  }

  const openEdit = (note: StudyNote) => {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
    setColor(note.color)
    setTags(note.tags.join(', '))
  }

  const resetForm = () => {
    setTitle('')
    setContent('')
    setColor('#4169E1')
    setTags('')
  }

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)))
  const filteredNotes = filterTag ? notes.filter(n => n.tags.includes(filterTag)) : notes
  const pinnedNotes = filteredNotes.filter(n => n.is_pinned)
  const otherNotes = filteredNotes.filter(n => !n.is_pinned)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'white', marginBottom: '4px' }}>
            My Notes 📝
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Organize your study notes</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true) }}
          style={{
            padding: '10px 20px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #27AE60, #1E8449)',
            color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          + New Note
        </button>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <button
            onClick={() => setFilterTag(null)}
            style={{
              padding: '6px 14px', borderRadius: '20px',
              background: !filterTag ? 'rgba(65, 105, 225, 0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${!filterTag ? 'rgba(65, 105, 225, 0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: !filterTag ? '#4169E1' : 'rgba(255,255,255,0.5)',
              fontSize: '0.8rem', cursor: 'pointer',
            }}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              style={{
                padding: '6px 14px', borderRadius: '20px',
                background: filterTag === tag ? 'rgba(65, 105, 225, 0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${filterTag === tag ? 'rgba(65, 105, 225, 0.3)' : 'rgba(255,255,255,0.1)'}`,
                color: filterTag === tag ? '#4169E1' : 'rgba(255,255,255,0.5)',
                fontSize: '0.8rem', cursor: 'pointer',
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#FFB300', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>
            📌 Pinned
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {pinnedNotes.map(note => (
              <NoteCard key={note.id} note={note} onEdit={openEdit} onDelete={handleDelete} onPin={handleTogglePin} />
            ))}
          </div>
        </div>
      )}

      {/* Other Notes */}
      {otherNotes.length > 0 && (
        <div>
          {pinnedNotes.length > 0 && (
            <h3 style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>
              Other Notes
            </h3>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {otherNotes.map(note => (
              <NoteCard key={note.id} note={note} onEdit={openEdit} onDelete={handleDelete} onPin={handleTogglePin} />
            ))}
          </div>
        </div>
      )}

      {notes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>No notes yet. Create your first note!</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingNote) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
            onClick={() => { setShowCreateModal(false); setEditingNote(null) }}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '80vh', overflowY: 'auto' }}
            >
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'white', marginBottom: '24px' }}>
                {editingNote ? 'Edit Note' : 'New Note'}
              </h2>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your note..." rows={8} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: '12px' }} />
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }} />
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {NOTE_COLORS.map(c => (
                    <button key={c} onClick={() => setColor(c)} style={{ width: '28px', height: '28px', borderRadius: '6px', background: c, border: color === c ? '2px solid white' : '2px solid transparent', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => { setShowCreateModal(false); setEditingNote(null); resetForm() }} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={editingNote ? handleUpdate : handleCreate} disabled={!title.trim() || !content.trim()} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: title.trim() && content.trim() ? 'linear-gradient(135deg, #27AE60, #1E8449)' : 'rgba(255,255,255,0.05)', color: title.trim() && content.trim() ? 'white' : 'rgba(255,255,255,0.3)', fontSize: '0.9rem', fontWeight: 600, cursor: title.trim() && content.trim() ? 'pointer' : 'default' }}>{editingNote ? 'Save' : 'Create'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NoteCard({ note, onEdit, onDelete, onPin }: { note: StudyNote; onEdit: (n: StudyNote) => void; onDelete: (id: string) => void; onPin: (n: StudyNote) => void }) {
  return (
    <motion.div whileHover={{ y: -4 }} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${note.color}30`, borderRadius: '16px', padding: '20px', borderTop: `3px solid ${note.color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'white', flex: 1 }}>{note.title}</h3>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => onPin(note)} style={{ background: 'none', border: 'none', color: note.is_pinned ? '#FFB300' : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.9rem', padding: '4px' }}>📌</button>
          <button onClick={() => onEdit(note)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.9rem', padding: '4px' }}>✏️</button>
          <button onClick={() => onDelete(note.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.9rem', padding: '4px' }}>🗑️</button>
        </div>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
        {note.content.slice(0, 200)}{note.content.length > 200 ? '...' : ''}
      </p>
      {note.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {note.tags.map(tag => (
            <span key={tag} style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>#{tag}</span>
          ))}
        </div>
      )}
    </motion.div>
  )
}
