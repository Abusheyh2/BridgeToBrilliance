'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

function FloatingOrb({ size, x, y, delay, duration, color }: { size: number; x: string; y: string; delay: number; duration: number; color: string }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        left: x,
        top: y,
        filter: 'blur(1px)',
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

function BridgeSVG() {
  return (
    <motion.svg
      viewBox="0 0 600 300"
      style={{ width: '100%', maxWidth: '500px', height: 'auto' }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.4 }}
    >
      {/* Water reflection */}
      <motion.ellipse cx="300" cy="280" rx="280" ry="15" fill="rgba(65, 105, 225, 0.15)"
        animate={{ rx: [280, 290, 280], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Bridge pillars */}
      <motion.rect x="120" y="120" width="16" height="150" rx="4" fill="#FFB300"
        initial={{ height: 0, y: 270 }} animate={{ height: 150, y: 120 }}
        transition={{ duration: 0.8, delay: 0.6 }} />
      <motion.rect x="464" y="120" width="16" height="150" rx="4" fill="#FFB300"
        initial={{ height: 0, y: 270 }} animate={{ height: 150, y: 120 }}
        transition={{ duration: 0.8, delay: 0.7 }} />
      
      {/* Bridge towers */}
      <motion.rect x="112" y="60" width="32" height="80" rx="6" fill="#4169E1"
        initial={{ height: 0, y: 140 }} animate={{ height: 80, y: 60 }}
        transition={{ duration: 0.8, delay: 0.9 }} />
      <motion.rect x="456" y="60" width="32" height="80" rx="6" fill="#4169E1"
        initial={{ height: 0, y: 140 }} animate={{ height: 80, y: 60 }}
        transition={{ duration: 0.8, delay: 1.0 }} />
      
      {/* Tower tops */}
      <motion.polygon points="108,60 148,60 128,30" fill="#FFB300"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }} />
      <motion.polygon points="452,60 492,60 472,30" fill="#FFB300"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.3 }} />
      
      {/* Main bridge deck */}
      <motion.path
        d="M60 200 Q128 140, 300 160 Q472 140, 540 200"
        stroke="#4169E1" strokeWidth="8" fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.8 }} />
      
      {/* Bridge cables */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.line key={`cable-l-${i}`}
          x1={128} y1={65} x2={80 + i * 25} y2={190 - i * 5}
          stroke="#FFB300" strokeWidth="1.5" opacity={0.6}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 1.4 + i * 0.1 }} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.line key={`cable-r-${i}`}
          x1={472} y1={65} x2={520 - i * 25} y2={190 - i * 5}
          stroke="#FFB300" strokeWidth="1.5" opacity={0.6}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 1.4 + i * 0.1 }} />
      ))}

      {/* Glowing star on bridge */}
      <motion.circle cx="300" cy="155" r="8" fill="#FFB300"
        animate={{ r: [8, 12, 8], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.circle cx="300" cy="155" r="16" fill="none" stroke="#FFB300" strokeWidth="1"
        animate={{ r: [16, 24, 16], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
    </motion.svg>
  )
}

export default function Hero() {
  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0D1B3E 0%, #162550 40%, #1A2D56 70%, #0D1B3E 100%)',
      overflow: 'hidden',
      padding: '120px 40px 80px',
    }}>
      {/* Floating orbs */}
      <FloatingOrb size={12} x="10%" y="20%" delay={0} duration={7} color="rgba(65, 105, 225, 0.4)" />
      <FloatingOrb size={8} x="80%" y="15%" delay={1} duration={5} color="rgba(255, 179, 0, 0.3)" />
      <FloatingOrb size={16} x="70%" y="70%" delay={2} duration={8} color="rgba(65, 105, 225, 0.25)" />
      <FloatingOrb size={6} x="20%" y="75%" delay={0.5} duration={6} color="rgba(255, 179, 0, 0.35)" />
      <FloatingOrb size={10} x="50%" y="10%" delay={3} duration={9} color="rgba(65, 105, 225, 0.3)" />
      <FloatingOrb size={14} x="85%" y="50%" delay={1.5} duration={7} color="rgba(255, 179, 0, 0.2)" />
      <FloatingOrb size={8} x="30%" y="40%" delay={2.5} duration={6} color="rgba(65, 105, 225, 0.35)" />
      <FloatingOrb size={20} x="5%" y="55%" delay={4} duration={10} color="rgba(65, 105, 225, 0.15)" />

      {/* Gradient mesh overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 30% 40%, rgba(65, 105, 225, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 179, 0, 0.08) 0%, transparent 50%)',
      }} />

      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        width: '100%',
        gap: '60px',
        flexWrap: 'wrap',
      }}>
        {/* Left: Text */}
        <div style={{ flex: '1 1 500px', minWidth: '300px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: '20px',
              background: 'rgba(255, 179, 0, 0.15)',
              border: '1px solid rgba(255, 179, 0, 0.3)',
              color: '#FFB300',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '24px',
            }}>
              ✨ Free Education for Everyone
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.1,
              marginBottom: '24px',
            }}
          >
            Bridge the Gap to{' '}
            <span style={{
              background: 'linear-gradient(135deg, #FFB300, #FFC233)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Brilliance
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              fontSize: '1.15rem',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.6,
              marginBottom: '36px',
              maxWidth: '520px',
            }}
          >
            A nonprofit learning platform providing free access to quality education.
            Video lessons, live classes, progress tracking, and more — built for those who deserve brilliance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}
          >
            <Link href="/register">
              <button className="btn-gold" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                Get Started Free →
              </button>
            </Link>
            <a href="#about">
              <button className="btn-primary" style={{
                padding: '14px 32px',
                fontSize: '1rem',
                background: 'transparent',
                border: '2px solid rgba(255,255,255,0.3)',
              }}>
                Learn More
              </button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            style={{
              display: 'flex',
              gap: '32px',
              marginTop: '48px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {[
              { num: '4', label: 'Subjects' },
              { num: '13', label: 'Teachers' },
              { num: '100%', label: 'Free' },
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFB300', fontFamily: 'var(--font-heading)' }}>{stat.num}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Bridge SVG */}
        <motion.div
          style={{ flex: '1 1 400px', minWidth: '300px', display: 'flex', justifyContent: 'center' }}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <BridgeSVG />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div style={{
          width: '24px', height: '40px',
          borderRadius: '12px',
          border: '2px solid rgba(255,255,255,0.3)',
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '8px',
        }}>
          <motion.div
            style={{ width: '4px', height: '8px', borderRadius: '2px', background: '#FFB300' }}
            animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}
