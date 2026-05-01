'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

const teamMembers = [
  { name: 'Nomozova Nozima', role: 'Math Teacher', bio: 'Dedicated mathematics educator bringing complex concepts to life with clarity and patience.', initials: 'NN', color: '#4169E1' },
  { name: 'Muhammadjonova Madina', role: 'Math Teacher', bio: 'Passionate about making mathematics accessible and engaging for every student.', initials: 'MM', color: '#27AE60' },
  { name: 'Qurbonov Jaloliddin', role: 'Coding Teacher', bio: 'Software developer turned educator, teaching the next generation of programmers.', initials: 'QJ', color: '#FFB300' },
  { name: 'Shonazarov Abdurahmon', role: 'Coding Teacher', bio: 'Expert in modern programming languages with a focus on practical, project-based learning.', initials: 'SA', color: '#E74C3C' },
  { name: 'Shokirov Aziz', role: 'Physics Teacher', bio: 'Bringing the laws of physics to life through interactive demonstrations and real-world examples.', initials: 'SA', color: '#9B59B6' },
  { name: 'Nozimov Daler', role: 'Physics Teacher', bio: 'Making physics intuitive and exciting through hands-on experiments and clear explanations.', initials: 'ND', color: '#1ABC9C' },
  { name: 'Gulmuradova Gulnoza', role: 'English Teacher', bio: 'Experienced language educator focused on building confidence in communication.', initials: 'GG', color: '#E67E22' },
  { name: 'Mirzayeva Kamila', role: 'English Teacher', bio: 'Creating immersive English learning experiences that inspire fluency and creativity.', initials: 'MK', color: '#3498DB' },
  { name: 'Akbaraliyev Eldor', role: 'Media Officer', bio: 'Managing all media operations and ensuring clear communication across the platform.', initials: 'AE', color: '#4169E1' },
  { name: 'Adamboyev Behzod', role: 'Media Team', bio: 'Content creator and media specialist supporting the platform\'s visual identity.', initials: 'AB', color: '#FFB300' },
  { name: 'Zokirjonov Abdulatif', role: 'Media Team', bio: 'Bringing creative vision to life through engaging multimedia content.', initials: 'ZA', color: '#27AE60' },
  { name: 'Shodiyona', role: 'Academic Coordinator', bio: 'Overseeing curriculum alignment and ensuring academic excellence across all subjects.', initials: 'SH', color: '#9B59B6' },
  { name: 'Xolmatova Kamola', role: 'Operation Manager', bio: 'Keeping everything running smoothly behind the scenes with efficient management.', initials: 'XK', color: '#E74C3C' },
]

const RADIUS_X = 320
const RADIUS_Y = 140
const CARD_SIZE = 130
const SPEED = 0.008 // degrees per ms

export default function Team() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [isPaused, setIsPaused] = useState(false)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const rotationRef = useRef(0)
  const animRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const activeRef = useRef<HTMLDivElement>(null)

  // Direct DOM animation - no React re-renders during orbit
  useEffect(() => {
    if (!isInView) return

    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time
      const delta = time - lastTimeRef.current

      if (!isPaused) {
        rotationRef.current = (rotationRef.current + delta * SPEED) % 360
      }
      lastTimeRef.current = time

      const rot = rotationRef.current
      const total = teamMembers.length
      const seg = 360 / total
      let closestDist = Infinity
      let closestIdx = 0

      for (let i = 0; i < total; i++) {
        const baseAngle = seg * i
        const angle = ((baseAngle + rot) % 360 + 360) % 360
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * RADIUS_X
        const y = Math.sin(rad) * RADIUS_Y

        const el = cardRefs.current[i]
        if (el) {
          el.style.transform = `translate(${x}px, ${y}px)`
          const distTo0 = Math.min(angle, 360 - angle)
          const isActive = distTo0 < seg * 1.5
          const scale = isActive ? 1.15 : 0.9
          const opacity = isActive ? 1 : 0.5
          const zIndex = isActive ? 10 : 1
          el.style.scale = String(scale)
          el.style.opacity = String(opacity)
          el.style.zIndex = String(zIndex)

          if (isActive) {
            el.style.background = `linear-gradient(135deg, ${teamMembers[i].color}, ${teamMembers[i].color}88)`
            el.style.borderColor = teamMembers[i].color
            el.style.boxShadow = `0 0 30px ${teamMembers[i].color}40`
          } else {
            el.style.background = 'rgba(255,255,255,0.04)'
            el.style.borderColor = 'rgba(255,255,255,0.08)'
            el.style.boxShadow = 'none'
          }

          if (distTo0 < closestDist) {
            closestDist = distTo0
            closestIdx = i
          }
        }
      }

      // Update description without full re-render
      if (activeRef.current) {
        const m = teamMembers[closestIdx]
        const colorEl = activeRef.current.querySelector('[data-field="color"]') as HTMLElement
        const nameEl = activeRef.current.querySelector('[data-field="name"]') as HTMLElement
        const roleEl = activeRef.current.querySelector('[data-field="role"]') as HTMLElement
        const bioEl = activeRef.current.querySelector('[data-field="bio"]') as HTMLElement
        if (colorEl) colorEl.style.color = m.color
        if (nameEl) nameEl.textContent = m.name
        if (roleEl) roleEl.textContent = m.role
        if (bioEl) bioEl.textContent = m.bio
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(animRef.current)
      lastTimeRef.current = 0
    }
  }, [isInView, isPaused])

  return (
    <section
      id="team"
      ref={ref}
      style={{
        padding: '120px 40px',
        background: 'linear-gradient(180deg, #0D1B3E 0%, #132347 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          style={{ textAlign: 'center', marginBottom: '48px' }}
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
            Our Team
          </span>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 700,
            color: 'white',
            marginBottom: '16px',
          }}>
            The People Behind the{' '}
            <span style={{
              background: 'linear-gradient(135deg, #FFB300, #FFC233)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Mission
            </span>
          </h2>

          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>
            Hover to pause the orbit
          </p>
        </motion.div>

        {/* Carousel */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            position: 'relative',
            width: '100%',
            height: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Orbit ring */}
          <div style={{
            position: 'absolute',
            width: RADIUS_X * 2,
            height: RADIUS_Y * 2,
            borderRadius: '50%',
            border: '1px dashed rgba(255,255,255,0.06)',
          }} />

          {/* Center */}
          <div style={{
            position: 'absolute',
            width: '80px', height: '80px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,179,0,0.1) 0%, transparent 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem',
          }}>
            🌉
          </div>

          {/* Cards */}
          {teamMembers.map((member, i) => (
            <div
              key={member.name}
              ref={el => { cardRefs.current[i] = el }}
              style={{
                position: 'absolute',
                width: CARD_SIZE, height: CARD_SIZE,
                left: '50%', top: '50%',
                marginLeft: -(CARD_SIZE / 2), marginTop: -(CARD_SIZE / 2),
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                border: '2px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s, scale 0.3s, opacity 0.3s',
                willChange: 'transform',
              }}
            >
              <div style={{
                fontSize: '1.3rem', fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'var(--font-heading)', marginBottom: '4px',
              }}>
                {member.initials}
              </div>
              <div style={{
                fontSize: '0.6rem', fontWeight: 600,
                color: 'rgba(255,255,255,0.35)', textAlign: 'center',
                padding: '0 6px', lineHeight: 1.2,
              }}>
                {member.name.split(' ').pop()}
              </div>
              <div style={{
                fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)', marginTop: '2px',
              }}>
                {member.role}
              </div>
            </div>
          ))}
        </div>

        {/* Active member detail */}
        <div
          ref={activeRef}
          style={{
            padding: '20px 28px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
            maxWidth: '480px',
            margin: '0 auto',
            minHeight: '110px',
          }}
        >
          <div data-field="color" style={{
            fontSize: '1.05rem', fontWeight: 700,
            fontFamily: 'var(--font-heading)', marginBottom: '6px',
            color: '#FFB300',
          }}>
            <span data-field="name">{teamMembers[0].name}</span>
          </div>
          <div data-field="role" style={{
            fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '10px',
          }}>
            {teamMembers[0].role}
          </div>
          <p data-field="bio" style={{
            fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6,
          }}>
            {teamMembers[0].bio}
          </p>
        </div>
      </div>
    </section>
  )
}
