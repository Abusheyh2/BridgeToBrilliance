'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      id="about"
      ref={ref}
      style={{
        padding: '120px 40px',
        background: 'var(--bg-offwhite)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute', top: '-50px', right: '-50px',
        width: '300px', height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(65, 105, 225, 0.06) 0%, transparent 70%)',
      }} />

      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '80px',
        flexWrap: 'wrap',
      }}>
        {/* Left: Text */}
        <motion.div
          style={{ flex: '1 1 450px', minWidth: '300px' }}
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(65, 105, 225, 0.1)',
            color: '#4169E1',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Our Mission
          </span>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 700,
            color: 'var(--text-dark)',
            marginBottom: '24px',
            lineHeight: 1.2,
          }}>
            Education is a Right,{' '}
            <span className="gold-underline" style={{ color: 'var(--royal-blue)' }}>
              Not a Privilege
            </span>
          </h2>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-dark-muted)',
            lineHeight: 1.8,
            marginBottom: '20px',
          }}>
            BridgeToBrilliance is a nonprofit initiative dedicated to breaking down barriers 
            to quality education. We believe every student, regardless of background or circumstance, 
            deserves access to world-class learning resources.
          </p>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-dark-muted)',
            lineHeight: 1.8,
            marginBottom: '32px',
          }}>
            Our platform connects passionate teachers with eager learners through structured 
            video lessons, live interactive classes, progress tracking, and personalized feedback — 
            all completely free.
          </p>

          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            {[
              { icon: '🎓', label: 'Free Quality Education' },
              { icon: '🌍', label: 'Global Access' },
              { icon: '❤️', label: 'Community Driven' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Animated illustration */}
        <motion.div
          style={{ flex: '1 1 350px', minWidth: '280px', display: 'flex', justifyContent: 'center' }}
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div style={{ position: 'relative', width: '350px', height: '350px' }}>
            {/* Decorative circles */}
            <motion.div
              style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                border: '2px dashed rgba(65, 105, 225, 0.2)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              style={{
                position: 'absolute', inset: '30px',
                borderRadius: '50%',
                border: '2px dashed rgba(255, 179, 0, 0.2)',
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            />

            {/* Center icon */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120px', height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4169E1, #2D4FC8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              boxShadow: '0 8px 32px rgba(65, 105, 225, 0.4)',
            }}>
              📚
            </div>

            {/* Orbiting elements */}
            {['🎥', '📊', '🏆', '💡'].map((emoji, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  width: '48px', height: '48px',
                  marginTop: '-24px', marginLeft: '-24px',
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  boxShadow: 'var(--shadow-md)',
                }}
                animate={{
                  x: [
                    Math.cos((i * Math.PI) / 2) * 130,
                    Math.cos((i * Math.PI) / 2 + Math.PI / 4) * 130,
                    Math.cos((i * Math.PI) / 2 + Math.PI / 2) * 130,
                    Math.cos((i * Math.PI) / 2 + (3 * Math.PI) / 4) * 130,
                    Math.cos((i * Math.PI) / 2 + Math.PI) * 130,
                  ],
                  y: [
                    Math.sin((i * Math.PI) / 2) * 130,
                    Math.sin((i * Math.PI) / 2 + Math.PI / 4) * 130,
                    Math.sin((i * Math.PI) / 2 + Math.PI / 2) * 130,
                    Math.sin((i * Math.PI) / 2 + (3 * Math.PI) / 4) * 130,
                    Math.sin((i * Math.PI) / 2 + Math.PI) * 130,
                  ],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 0.5,
                }}
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
