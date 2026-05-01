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
  const towerX1 = 140
  const towerX2 = 460
  const towerTop = 40
  const towerBottom = 250
  const deckY = 200
  const anchorX1 = 30
  const anchorX2 = 570

  // Quadratic bezier Y at parameter t
  const quadY = (y0: number, y1: number, y2: number, t: number) =>
    (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2

  // Control points for the 3 bezier segments
  const mid1X = (anchorX1 + towerX1) / 2
  const mid2X = (towerX1 + towerX2) / 2
  const mid3X = (towerX2 + anchorX2) / 2
  const sag1 = towerTop + 70
  const sag2 = towerTop + 95
  const sag3 = towerTop + 70

  // Compute hangers that match the exact bezier curves
  const hangers = []
  for (let x = 55; x < 550; x += 22) {
    let cableY: number
    if (x <= towerX1) {
      const t = (x - anchorX1) / (towerX1 - anchorX1)
      cableY = quadY(deckY, sag1, towerTop, t)
    } else if (x <= towerX2) {
      const t = (x - towerX1) / (towerX2 - towerX1)
      cableY = quadY(towerTop, sag2, towerTop, t)
    } else {
      const t = (x - towerX2) / (anchorX2 - towerX2)
      cableY = quadY(towerTop, sag3, deckY, t)
    }
    // Only draw hangers where cable is above deck
    if (cableY < deckY - 12) {
      hangers.push({ x, y: cableY })
    }
  }

  const catenaryPath = `M${anchorX1} ${deckY} Q${mid1X} ${sag1}, ${towerX1} ${towerTop} Q${mid2X} ${sag2}, ${towerX2} ${towerTop} Q${mid3X} ${sag3}, ${anchorX2} ${deckY}`

  return (
    <motion.svg
      viewBox="0 0 600 300"
      style={{ width: '100%', maxWidth: '520px', height: 'auto' }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.4 }}
    >
      {/* Sky gradient */}
      <defs>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(65, 105, 225, 0.3)" />
          <stop offset="100%" stopColor="rgba(65, 105, 225, 0.05)" />
        </linearGradient>
        <linearGradient id="towerGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#CC8800" />
        </linearGradient>
        <radialGradient id="sunGlow">
          <stop offset="0%" stopColor="rgba(255, 200, 80, 0.9)" />
          <stop offset="40%" stopColor="rgba(255, 179, 0, 0.4)" />
          <stop offset="100%" stopColor="rgba(255, 179, 0, 0)" />
        </radialGradient>
        <radialGradient id="sunHalo">
          <stop offset="0%" stopColor="rgba(255, 220, 130, 0.6)" />
          <stop offset="100%" stopColor="rgba(255, 179, 0, 0)" />
        </radialGradient>
        <filter id="sunBloom">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ===== SUN (behind everything) ===== */}
      {/* Sun halo */}
      <motion.circle cx="300" cy={deckY - 10} r="80" fill="url(#sunHalo)"
        animate={{ r: [80, 90, 80], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
      {/* Sun glow */}
      <motion.circle cx="300" cy={deckY - 10} r="45" fill="url(#sunGlow)"
        animate={{ r: [45, 50, 45], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
      {/* Sun core */}
      <motion.circle cx="300" cy={deckY - 10} r="18" fill="#FFE4A0" filter="url(#sunBloom)"
        animate={{ r: [18, 20, 18] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
      {/* Sun inner bright spot */}
      <motion.circle cx="300" cy={deckY - 10} r="8" fill="white" opacity="0.9"
        animate={{ opacity: [0.9, 1, 0.9] }} transition={{ duration: 3, repeat: Infinity }} />
      {/* Sun rays */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
        <motion.line key={`ray-${i}`}
          x1="300" y1={deckY - 10}
          x2={300 + Math.cos((angle * Math.PI) / 180) * 65}
          y2={(deckY - 10) + Math.sin((angle * Math.PI) / 180) * 65}
          stroke="rgba(255, 210, 100, 0.15)" strokeWidth="2" strokeLinecap="round"
          animate={{ opacity: [0.1, 0.25, 0.1], strokeWidth: [2, 2.5, 2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
        />
      ))}

      {/* Horizon glow (behind bridge, at deck level) */}
      <motion.ellipse cx="300" cy={deckY} rx="250" ry="15" fill="rgba(255,179,0,0.06)" />

      {/* Water */}
      <motion.rect x="0" y={deckY + 20} width="600" height="100" fill="url(#waterGrad)" rx="4" />
      <motion.ellipse cx="300" cy={deckY + 25} rx="280" ry="8" fill="rgba(255,179,0,0.05)"
        animate={{ rx: [280, 290, 280], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
      {/* Water ripple lines */}
      {[0, 1, 2].map(i => (
        <motion.line key={`ripple-${i}`}
          x1="60" y1={deckY + 40 + i * 15} x2="540" y2={deckY + 40 + i * 15}
          stroke="rgba(65, 105, 225, 0.15)" strokeWidth="0.5"
          animate={{ x1: [60, 70, 60], x2: [540, 530, 540] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }} />
      ))}

      {/* Bridge foundations */}
      <rect x={towerX1 - 20} y={deckY} width="40" height="30" rx="2" fill="rgba(255,179,0,0.3)" />
      <rect x={towerX2 - 20} y={deckY} width="40" height="30" rx="2" fill="rgba(255,179,0,0.3)" />

      {/* Towers */}
      {/* Tower 1 */}
      <motion.rect x={towerX1 - 8} y={towerTop} width="16" height={towerBottom - towerTop} rx="2" fill="url(#towerGrad)"
        initial={{ height: 0 }} animate={{ height: towerBottom - towerTop }}
        transition={{ duration: 0.8, delay: 0.5 }} />
      <motion.rect x={towerX1 - 12} y={towerTop} width="24" height="8" rx="2" fill="#FFB300"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} />
      {/* Tower 1 cross beams */}
      <rect x={towerX1 - 6} y={towerTop + 50} width="12" height="3" rx="1" fill="rgba(204,136,0,0.8)" />
      <rect x={towerX1 - 6} y={towerTop + 100} width="12" height="3" rx="1" fill="rgba(204,136,0,0.8)" />
      <rect x={towerX1 - 6} y={towerTop + 150} width="12" height="3" rx="1" fill="rgba(204,136,0,0.8)" />
      {/* Tower 1 top cap */}
      <motion.path d={`M${towerX1 - 14} ${towerTop} L${towerX1} ${towerTop - 15} L${towerX1 + 14} ${towerTop}`} fill="#FFB300"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} />
      {/* Tower 1 beacon */}
      <motion.circle cx={towerX1} cy={towerTop - 12} r="3" fill="#FFB300" filter="url(#glow)"
        animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />

      {/* Tower 2 */}
      <motion.rect x={towerX2 - 8} y={towerTop} width="16" height={towerBottom - towerTop} rx="2" fill="url(#towerGrad)"
        initial={{ height: 0 }} animate={{ height: towerBottom - towerTop }}
        transition={{ duration: 0.8, delay: 0.6 }} />
      <motion.rect x={towerX2 - 12} y={towerTop} width="24" height="8" rx="2" fill="#FFB300"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }} />
      {/* Tower 2 cross beams */}
      <rect x={towerX2 - 6} y={towerTop + 50} width="12" height="3" rx="1" fill="rgba(204,136,0,0.8)" />
      <rect x={towerX2 - 6} y={towerTop + 100} width="12" height="3" rx="1" fill="rgba(204,136,0,0.8)" />
      <rect x={towerX2 - 6} y={towerTop + 150} width="12" height="3" rx="1" fill="rgba(204,136,0,0.8)" />
      {/* Tower 2 top cap */}
      <motion.path d={`M${towerX2 - 14} ${towerTop} L${towerX2} ${towerTop - 15} L${towerX2 + 14} ${towerTop}`} fill="#FFB300"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} />
      {/* Tower 2 beacon */}
      <motion.circle cx={towerX2} cy={towerTop - 12} r="3" fill="#FFB300" filter="url(#glow)"
        animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />

      {/* Main suspension cables */}
      <motion.path
        d={catenaryPath}
        stroke="#FFB300" strokeWidth="2.5" fill="none" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.8 }}
      />
      {/* Second cable (parallel, slightly below) */}
      <motion.path
        d={`M${anchorX1} ${deckY + 4} Q${mid1X} ${sag1 + 4}, ${towerX1} ${towerTop + 4} Q${mid2X} ${sag2 + 4}, ${towerX2} ${towerTop + 4} Q${mid3X} ${sag3 + 4}, ${anchorX2} ${deckY + 4}`}
        stroke="rgba(255,179,0,0.3)" strokeWidth="1" fill="none" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.9 }}
      />

      {/* Vertical hanger cables */}
      {hangers.map((h, i) => (
        <motion.line key={`hanger-${i}`}
          x1={h.x} y1={h.y} x2={h.x} y2={deckY}
          stroke="rgba(255,179,0,0.3)" strokeWidth="0.8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 1.2 + i * 0.02 }}
        />
      ))}

      {/* Bridge deck */}
      <motion.rect x="20" y={deckY - 4} width="560" height="8" rx="2" fill="#4169E1"
        initial={{ width: 0 }} animate={{ width: 560 }}
        transition={{ duration: 1.2, delay: 0.7 }} />
      {/* Deck road markings */}
      {Array.from({ length: 20 }, (_, i) => i * 28 + 30).map((x, i) => (
        <rect key={`mark-${i}`} x={x} y={deckY} width="14" height="1" rx="0.5" fill="rgba(255,255,255,0.3)" />
      ))}
      {/* Deck edge lines */}
      <line x1="20" y1={deckY - 3} x2="580" y2={deckY - 3} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <line x1="20" y1={deckY + 3} x2="580" y2={deckY + 3} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

      {/* Anchors at ends */}
      <rect x="15" y={deckY - 8} width="12" height="16" rx="2" fill="rgba(255,179,0,0.4)" />
      <rect x="573" y={deckY - 8} width="12" height="16" rx="2" fill="rgba(255,179,0,0.4)" />

      {/* Sun reflection on water */}
      <motion.ellipse cx="300" cy={deckY + 35} rx="40" ry="6" fill="rgba(255,200,80,0.15)"
        animate={{ rx: [40, 50, 40], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.ellipse cx="300" cy={deckY + 50} rx="25" ry="3" fill="rgba(255,200,80,0.08)"
        animate={{ rx: [25, 35, 25], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} />
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
