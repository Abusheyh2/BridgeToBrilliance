'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const features = [
  {
    icon: '🎥',
    title: 'Video Lessons',
    description: 'Structured video content organized by subject. Learn at your own pace with progress tracking.',
  },
  {
    icon: '📡',
    title: 'Live Classes',
    description: 'Join scheduled live sessions with teachers. Interactive learning with real-time Q&A and discussion.',
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    description: 'Visual analytics showing learning journeys. Track completed lessons, grades, and growth over time.',
  },
  {
    icon: '📢',
    title: 'Announcements',
    description: 'Stay updated with platform and subject-specific announcements from teachers and administrators.',
  },
  {
    icon: '📝',
    title: 'Gradebook',
    description: 'Teachers provide grades and personalized feedback. Track performance across all subjects.',
  },
  {
    icon: '🔐',
    title: 'Role-Based Access',
    description: 'Tailored dashboards for students, teachers, and administrators. Each role gets the tools they need.',
  },
  {
    icon: '🃏',
    title: 'Flashcards',
    description: 'Create and review flashcards with spaced repetition for better retention and mastery.',
  },
  {
    icon: '📝',
    title: 'Study Notes',
    description: 'Take organized notes with tags and colors. Pin important ones for quick access.',
  },
  {
    icon: '⏱️',
    title: 'Study Timer',
    description: 'Pomodoro timer with session tracking. Build focus and measure study time.',
  },
  {
    icon: '💡',
    title: 'Quizzes',
    description: 'Take interactive quizzes with instant feedback. Track scores and review mistakes.',
  },
  {
    icon: '🔖',
    title: 'Bookmarks',
    description: 'Save important lessons and subjects for quick access. Organize your study materials.',
  },
  {
    icon: '📋',
    title: 'Study Plans',
    description: 'Create structured study plans with tasks and deadlines. Stay organized and on track.',
  },
]

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      id="features"
      ref={ref}
      style={{
        padding: '120px 40px',
        background: 'linear-gradient(180deg, #0D1B3E 0%, #132347 100%)',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          style={{ textAlign: 'center', marginBottom: '64px' }}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(255, 179, 0, 0.15)',
            border: '1px solid rgba(255, 179, 0, 0.3)',
            color: '#FFB300',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Platform Features
          </span>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 700,
            color: 'white',
            marginBottom: '16px',
          }}>
            Everything You Need to{' '}
            <span style={{
              background: 'linear-gradient(135deg, #FFB300, #FFC233)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Excel
            </span>
          </h2>

          <p style={{
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Our platform provides comprehensive tools for a complete learning experience.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * i }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '32px',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(255, 179, 0, 0.3)'
                el.style.boxShadow = '0 0 30px rgba(255, 179, 0, 0.1), inset 0 1px 0 rgba(255, 179, 0, 0.2)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(255,255,255,0.08)'
                el.style.boxShadow = 'none'
              }}
            >
              {/* Gold top border glow on hover (handled via onMouseEnter/Leave above) */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(255, 179, 0, 0.5), transparent)',
                opacity: 0,
                transition: 'opacity 0.3s',
              }} />

              <div style={{
                width: '56px', height: '56px',
                borderRadius: '14px',
                background: 'rgba(65, 105, 225, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                marginBottom: '20px',
              }}>
                {feature.icon}
              </div>

              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'white',
                marginBottom: '12px',
              }}>
                {feature.title}
              </h3>

              <p style={{
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.6,
              }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
