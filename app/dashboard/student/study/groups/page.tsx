'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import * as groupsService from '@/services/study-groups.service'
import * as chatService from '@/services/chat.service'
import type { StudyGroup, ChatMessage } from '@/types/database.types'

const COLORS = ['#4169E1', '#9B59B6', '#27AE60', '#E74C3C', '#F39C12', '#1ABC9C', '#3498DB', '#E67E22']
const ICONS = ['📖', '🧪', '📐', '💻', '🎨', '🌍', '📊', '🎵', '🔬', '📚']

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Create form state
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formIcon, setFormIcon] = useState('📖')
  const [formColor, setFormColor] = useState('#4169E1')
  const [formPublic, setFormPublic] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [allRes, myRes] = await Promise.all([
        groupsService.getGroups({ isPublic: true }),
        groupsService.getMyGroups(),
      ])
      if (!cancelled) {
        if (allRes.success && allRes.data) setGroups(allRes.data)
        if (myRes.success && myRes.data) setMyGroups(myRes.data)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      const loadMsgs = async () => {
        const res = await chatService.getMessages(selectedGroup.id, 100)
        if (res.success && res.data) setMessages(res.data)
      }
      loadMsgs()
    }
  }, [selectedGroup])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleCreateGroup = async () => {
    if (!formName.trim()) return
    const res = await groupsService.createGroup(formName, formDesc, formIcon, formColor, null, formPublic, 50)
    if (res.success) {
      setShowCreateModal(false)
      setFormName('')
      setFormDesc('')
      reloadGroups()
    }
  }

  const handleJoinGroup = async (groupId: string) => {
    const res = await groupsService.joinGroup(groupId)
    if (res.success) {
      reloadGroups()
    }
  }

  const reloadGroups = async () => {
    const [allRes, myRes] = await Promise.all([
      groupsService.getGroups({ isPublic: true }),
      groupsService.getMyGroups(),
    ])
    if (allRes.success && allRes.data) setGroups(allRes.data)
    if (myRes.success && myRes.data) setMyGroups(myRes.data)
  }

  const handleSendMessage = async () => {
    if (!selectedGroup || !newMessage.trim() || sending) return
    setSending(true)
    const res = await chatService.sendMessage(selectedGroup.id, newMessage.trim())
    if (res.success && res.data) {
      const msg = res.data
      setMessages(prev => [...prev, msg])
      setNewMessage('')
    }
    setSending(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedGroup || !e.target.files?.[0]) return
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env['NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'] || 'ml_default')

    try {
      const uploadRes = await fetch('https://api.cloudinary.com/v1_1/' + process.env['NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'] + '/auto/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await uploadRes.json()
      if (data.secure_url) {
        const type = file.type.startsWith('image/') ? 'image' : 'file'
        const res = await chatService.sendMessage(
          selectedGroup.id,
          `Shared: ${file.name}`,
          data.secure_url,
          type
        )
        if (res.success && res.data) {
          const msg = res.data
          setMessages(prev => [...prev, msg])
        }
      }
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const myGroupIds = new Set(myGroups.map(g => g.id))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'white', marginBottom: '4px' }}>
            Study Groups 👥
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Collaborate with fellow students</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 20px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #4169E1, #2D4FC8)',
            color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          + Create Group
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedGroup ? '300px 1fr' : '1fr', gap: '20px' }}>
        {/* Groups List */}
        <div>
          {myGroups.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>
                My Groups
              </h3>
              {myGroups.map(group => (
                <motion.button
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  whileHover={{ x: 4 }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', borderRadius: '10px', marginBottom: '8px',
                    background: selectedGroup?.id === group.id ? 'rgba(65, 105, 225, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedGroup?.id === group.id ? 'rgba(65, 105, 225, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                    color: 'white', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: `${group.color}20`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                  }}>
                    {group.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{group.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{group.description?.slice(0, 30) || 'No description'}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>
            Discover Groups
          </h3>
          {loading ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px' }}>Loading...</div>
          ) : groups.filter(g => !myGroupIds.has(g.id)).length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px' }}>No groups available</div>
          ) : (
            groups.filter(g => !myGroupIds.has(g.id)).map(group => (
              <motion.div
                key={group.id}
                whileHover={{ x: 4 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '10px', marginBottom: '8px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: `${group.color}20`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                }}>
                  {group.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>{group.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{group.description?.slice(0, 30) || 'No description'}</div>
                </div>
                <button
                  onClick={() => handleJoinGroup(group.id)}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', border: 'none',
                    background: 'rgba(65, 105, 225, 0.2)', color: '#4169E1',
                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Join
                </button>
              </motion.div>
            ))
          )}
        </div>

        {/* Chat Area */}
        {selectedGroup && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 220px)',
          }}>
            {/* Chat Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${selectedGroup.color}20`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
              }}>
                {selectedGroup.icon}
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>{selectedGroup.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{selectedGroup.description}</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', paddingTop: '40px' }}>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4169E1, #2D4FC8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 700, color: 'white',
                      }}>
                        {(msg as unknown as { sender?: { full_name: string } }).sender?.full_name?.[0] || '?'}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                        {(msg as unknown as { sender?: { full_name: string } }).sender?.full_name || 'Unknown'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {msg.attachment_url && msg.attachment_type === 'image' ? (
                      <div style={{ position: 'relative', maxWidth: '300px', marginTop: '4px' }}>
                        <Image src={msg.attachment_url} alt={msg.content || 'Shared image'} width={300} height={200} style={{
                          borderRadius: '12px', objectFit: 'cover',
                        }} />
                      </div>
                    ) : msg.attachment_url ? (
                      <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" style={{
                        display: 'inline-block', padding: '8px 12px', borderRadius: '8px',
                        background: 'rgba(65, 105, 225, 0.1)', color: '#4169E1',
                        fontSize: '0.85rem', textDecoration: 'none',
                      }}>
                        📎 {msg.content || 'File attachment'}
                      </a>
                    ) : (
                      <div style={{
                        padding: '10px 14px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem',
                      }}>
                        {msg.content}
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: '12px', alignItems: 'center',
            }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title="Attach file or photo"
              >
                📎
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', fontSize: '0.9rem', outline: 'none',
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                style={{
                  padding: '12px 20px', borderRadius: '10px', border: 'none',
                  background: newMessage.trim() ? 'linear-gradient(135deg, #4169E1, #2D4FC8)' : 'rgba(255,255,255,0.05)',
                  color: newMessage.trim() ? 'white' : 'rgba(255,255,255,0.3)',
                  fontSize: '0.9rem', fontWeight: 600, cursor: newMessage.trim() ? 'pointer' : 'default',
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 100, padding: '20px',
            }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px',
              }}
            >
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'white', marginBottom: '24px' }}>
                Create Study Group
              </h2>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block' }}>
                  Group Name *
                </label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Physics Study Group"
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block' }}>
                  Description
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="What will you study?"
                  rows={3}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', fontSize: '0.9rem', outline: 'none', resize: 'vertical',
                    fontFamily: 'var(--font-body)', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>
                  Icon
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setFormIcon(icon)}
                      style={{
                        width: '40px', height: '40px', borderRadius: '8px',
                        background: formIcon === icon ? 'rgba(65, 105, 225, 0.3)' : 'rgba(255,255,255,0.05)',
                        border: formIcon === icon ? '1px solid #4169E1' : '1px solid rgba(255,255,255,0.1)',
                        fontSize: '1.2rem', cursor: 'pointer',
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>
                  Color
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormColor(color)}
                      style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: color,
                        border: formColor === color ? '2px solid white' : '2px solid transparent',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Public Group</label>
                <button
                  onClick={() => setFormPublic(!formPublic)}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px',
                    background: formPublic ? '#4169E1' : 'rgba(255,255,255,0.1)',
                    border: 'none', cursor: 'pointer', position: 'relative',
                  }}
                >
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: 'white', position: 'absolute', top: '3px',
                    left: formPublic ? '23px' : '3px', transition: 'left 0.2s',
                  }} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!formName.trim()}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                    background: formName.trim() ? 'linear-gradient(135deg, #4169E1, #2D4FC8)' : 'rgba(255,255,255,0.05)',
                    color: formName.trim() ? 'white' : 'rgba(255,255,255,0.3)',
                    fontSize: '0.9rem', fontWeight: 600, cursor: formName.trim() ? 'pointer' : 'default',
                  }}
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
