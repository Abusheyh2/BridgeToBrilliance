'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import * as studyService from '@/services/study.service'
import type { UserAchievement, Achievement } from '@/types/database.types'

export default function AchievementsPage() {
  const [unlocked, setUnlocked] = useState<UserAchievement[]>([])
  const [all, setAll] = useState<Achievement[]>([])

  useEffect(() => {
    Promise.all([studyService.getAchievements(), studyService.getAllAchievements()]).then(([uRes, aRes]) => {
      if (uRes.success && uRes.data) setUnlocked(uRes.data)
      if (aRes.success && aRes.data) setAll(aRes.data)
    })
  }, [])

  const unlockedIds = new Set(unlocked.map(u => u.achievement_id))
  const unlockedCount = unlocked.length
  const totalCount = all.length
  const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0

  const categories = Array.from(new Set(all.map(a => a.category)))

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'white', marginBottom: '4px' }}>
          Achievements 🏆
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Track your milestones and accomplishments</p>
      </div>

      {/* Progress Overview */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div style={{ position: 'relative', width: '100px', height: '100px' }}>
          <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#FFB300" strokeWidth="8" strokeLinecap="round" strokeDasharray={251.2} strokeDashoffset={251.2 - (percentage / 100) * 251.2} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{percentage}%</span>
          </div>
        </div>
        <div>
          <h2 style={{ fontSize: '1.3rem', color: 'white', marginBottom: '4px' }}>{unlockedCount} of {totalCount} Unlocked</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Keep studying to unlock more achievements!</p>
        </div>
      </div>

      {/* Category Sections */}
      {categories.map(category => {
        const categoryAchievements = all.filter(a => a.category === category)
        return (
          <div key={category} style={{ marginBottom: '32px' }}>
            <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>
              {category.replace('_', ' ')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {categoryAchievements.map(achievement => {
                const isUnlocked = unlockedIds.has(achievement.id)
                const userAch = unlocked.find(u => u.achievement_id === achievement.id)
                return (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ y: -4 }}
                    style={{
                      background: isUnlocked ? 'rgba(255, 179, 0, 0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isUnlocked ? 'rgba(255, 179, 0, 0.2)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: '16px', padding: '20px',
                      opacity: isUnlocked ? 1 : 0.5,
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: isUnlocked ? 'rgba(255, 179, 0, 0.15)' : 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.8rem',
                        filter: isUnlocked ? 'none' : 'grayscale(1)',
                      }}>
                        {achievement.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '1rem', color: isUnlocked ? '#FFB300' : 'rgba(255,255,255,0.5)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {achievement.name}
                          {isUnlocked && <span style={{ fontSize: '0.7rem' }}>✅</span>}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>
                          {achievement.description}
                        </p>
                        {userAch && (
                          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                            Unlocked {new Date(userAch.unlocked_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
