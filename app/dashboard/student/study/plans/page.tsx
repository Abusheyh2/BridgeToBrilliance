'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as studyService from '@/services/study.service'
import type { StudyPlan, StudyPlanTask } from '@/types/database.types'

export default function PlansPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [tasks, setTasks] = useState<StudyPlanTask[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)

  // Plan form
  const [planTitle, setPlanTitle] = useState('')
  const [planDesc, setPlanDesc] = useState('')
  const [planStart, setPlanStart] = useState('')
  const [planEnd, setPlanEnd] = useState('')
  const [planGoals, setPlanGoals] = useState('')

  // Task form
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskDue, setTaskDue] = useState('')
  const [taskPriority, setTaskPriority] = useState('medium')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const res = await studyService.getPlans()
      if (!cancelled && res.success && res.data) setPlans(res.data)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const loadPlans = async () => {
    const res = await studyService.getPlans()
    if (res.success && res.data) setPlans(res.data)
  }

  const loadTasks = async (planId: string) => {
    const res = await studyService.getPlanTasks(planId)
    if (res.success && res.data) setTasks(res.data)
  }

  const handleCreatePlan = async () => {
    if (!planTitle.trim() || !planStart || !planEnd) return
    const goals = planGoals.split(',').map(g => g.trim()).filter(Boolean)
    const res = await studyService.createPlan(planTitle, planDesc, planStart, planEnd, goals)
    if (res.success) { setShowCreateModal(false); resetPlanForm(); loadPlans() }
  }

  const handleAddTask = async () => {
    if (!selectedPlan || !taskTitle.trim()) return
    const res = await studyService.addPlanTask(selectedPlan, taskTitle, taskDesc, null, taskDue || null, taskPriority, tasks.length)
    if (res.success) { loadTasks(selectedPlan); setShowAddTaskModal(false); resetTaskForm() }
  }

  const handleToggleTask = async (id: string) => {
    await studyService.toggleTaskCompleted(id)
    if (selectedPlan) loadTasks(selectedPlan)
  }

  const handleDeletePlan = async (id: string) => {
    await studyService.deletePlan(id)
    setSelectedPlan(null)
    loadPlans()
  }

  const resetPlanForm = () => { setPlanTitle(''); setPlanDesc(''); setPlanStart(''); setPlanEnd(''); setPlanGoals('') }
  const resetTaskForm = () => { setTaskTitle(''); setTaskDesc(''); setTaskDue(''); setTaskPriority('medium') }

  const selectPlan = (id: string) => { setSelectedPlan(id); loadTasks(id) }

  const priorityColors: Record<string, string> = { high: '#E74C3C', medium: '#F39C12', low: '#27AE60' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'white', marginBottom: '4px' }}>
            Study Plans 📋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Organize your study schedule with tasks</p>
        </div>
        <button
          onClick={() => { resetPlanForm(); setShowCreateModal(true) }}
          style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #3498DB, #2980B9)', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
        >
          + New Plan
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedPlan ? '320px 1fr' : '1fr', gap: '24px' }}>
        {/* Plans List */}
        <div>
          {plans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>
              No study plans yet. Create one to get started!
            </div>
          ) : (
            plans.map(plan => (
              <motion.div
                key={plan.id}
                whileHover={{ x: 4 }}
                onClick={() => selectPlan(plan.id)}
                style={{
                  padding: '16px', borderRadius: '12px', marginBottom: '12px', cursor: 'pointer',
                  background: selectedPlan === plan.id ? 'rgba(52, 152, 219, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedPlan === plan.id ? 'rgba(52, 152, 219, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <h3 style={{ fontSize: '1rem', color: 'white', fontWeight: 600, marginBottom: '4px' }}>{plan.title}</h3>
                  <button onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id) }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.85rem' }}>🗑️</button>
                </div>
                {plan.description && <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>{plan.description}</p>}
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                  {new Date(plan.start_date).toLocaleDateString()} → {new Date(plan.end_date).toLocaleDateString()}
                </div>
                {plan.goals.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {plan.goals.slice(0, 3).map((g, i) => (
                      <span key={i} style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(52, 152, 219, 0.1)', color: '#3498DB', fontSize: '0.7rem' }}>{g}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Tasks */}
        {selectedPlan && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'white' }}>Tasks</h2>
              <button
                onClick={() => { resetTaskForm(); setShowAddTaskModal(true) }}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'rgba(52, 152, 219, 0.2)', color: '#3498DB', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                + Add Task
              </button>
            </div>

            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>
                No tasks yet. Add tasks to your plan!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tasks.map(task => (
                  <motion.div
                    key={task.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                      borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      opacity: task.is_completed ? 0.6 : 1,
                    }}
                  >
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      style={{
                        width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                        background: task.is_completed ? '#27AE60' : 'rgba(255,255,255,0.1)',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.75rem',
                      }}
                    >
                      {task.is_completed ? '✓' : ''}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', color: 'white', textDecoration: task.is_completed ? 'line-through' : 'none' }}>{task.title}</div>
                      {task.description && <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{task.description}</div>}
                    </div>
                    {task.due_date && (
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                      background: `${priorityColors[task.priority]}20`, color: priorityColors[task.priority],
                    }}>
                      {task.priority}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Plan Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }} onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'white', marginBottom: '24px' }}>New Study Plan</h2>
              <input value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} placeholder="Plan title *" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
              <textarea value={planDesc} onChange={(e) => setPlanDesc(e.target.value)} placeholder="Description" rows={2} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: '12px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <input type="date" value={planStart} onChange={(e) => setPlanStart(e.target.value)} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
                <input type="date" value={planEnd} onChange={(e) => setPlanEnd(e.target.value)} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
              </div>
              <input value={planGoals} onChange={(e) => setPlanGoals(e.target.value)} placeholder="Goals (comma separated)" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleCreatePlan} disabled={!planTitle.trim() || !planStart || !planEnd} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: planTitle.trim() && planStart && planEnd ? 'linear-gradient(135deg, #3498DB, #2980B9)' : 'rgba(255,255,255,0.05)', color: planTitle.trim() && planStart && planEnd ? 'white' : 'rgba(255,255,255,0.3)', fontSize: '0.9rem', fontWeight: 600, cursor: planTitle.trim() && planStart && planEnd ? 'pointer' : 'default' }}>Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddTaskModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }} onClick={() => setShowAddTaskModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'white', marginBottom: '24px' }}>Add Task</h2>
              <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Task title *" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
              <textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="Description" rows={2} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: '12px' }} />
              <input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Priority</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['low', 'medium', 'high'].map(p => (
                    <button key={p} onClick={() => setTaskPriority(p)} style={{ padding: '8px 16px', borderRadius: '8px', background: taskPriority === p ? `${priorityColors[p]}20` : 'rgba(255,255,255,0.05)', border: `1px solid ${taskPriority === p ? priorityColors[p] : 'rgba(255,255,255,0.1)'}`, color: taskPriority === p ? priorityColors[p] : 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textTransform: 'capitalize', cursor: 'pointer' }}>{p}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowAddTaskModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleAddTask} disabled={!taskTitle.trim()} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: taskTitle.trim() ? 'linear-gradient(135deg, #3498DB, #2980B9)' : 'rgba(255,255,255,0.05)', color: taskTitle.trim() ? 'white' : 'rgba(255,255,255,0.3)', fontSize: '0.9rem', fontWeight: 600, cursor: taskTitle.trim() ? 'pointer' : 'default' }}>Add</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
