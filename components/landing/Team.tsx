'use client'

import { motion, useInView, useAnimationFrame } from 'framer-motion'
import { useRef, useState } from 'react'

const teamMembers = [
  {
    name: 'Nomozova Nozima',
    role: 'Math Teacher',
    bio: 'Dedicated mathematics educator bringing complex concepts to life with clarity and patience.',
    initials: 'NN',
    color: '#4169E1',
  },
  {
    name: 'Muhammadjonova Madina',
    role: 'Math Teacher',
    bio: 'Passionate about making mathematics accessible and engaging for every student.',
    initials: 'MM',
    color: '#27AE60',
  },
  {
    name: 'Qurbonov Jaloliddin',
    role: 'Coding Teacher',
    bio: 'Software developer turned educator, teaching the next generation of programmers.',
    initials: 'QJ',
    color: '#FFB300',
  },
  {
    name: 'Shonazarov Abdurahmon',
    role: 'Coding Teacher',
    bio: 'Expert in modern programming languages with a focus on practical, project-based learning.',
    initials: 'SA',
    color: '#E74C3C',
  },
  {
    name: 'Shokirov Aziz',
    role: 'Physics Teacher',
    bio: 'Bringing the laws of physics to life through interactive demonstrations and real-world examples.',
    initials: 'SA',
    color: '#9B59B6',
  },
  {
    name: 'Nozimov Daler',
    role: 'Physics Teacher',
    bio: 'Making physics intuitive and exciting through hands-on experiments and clear explanations.',
    initials: 'ND',
    color: '#1ABC9C',
  },
  {
    name: 'Gulmuradova Gulnoza',
    role: 'English Teacher',
    bio: 'Experienced language educator focused on building confidence in communication.',
    initials: 'GG',
    color: '#E67E22',
  },
  {
    name: 'Mirzayeva Kamila',
    role: 'English Teacher',
    bio: 'Creating immersive English learning experiences that inspire fluency and creativity.',
    initials: 'MK',
    color: '#3498DB',
  },
  {
    name: 'Akbaraliyev Eldor',
    role: 'Media Officer',
    bio: 'Managing all media operations and ensuring clear communication across the platform.',
    initials: 'AE',
    color: '#4169E1',
  },
  {
    name: 'Adamboyev Behzod',
    role: 'Media Team',
    bio: 'Content creator and media specialist supporting the platform\'s visual identity.',
    initials: 'AB',
    color: '#FFB300',
  },
  {
    name: 'Zokirjonov Abdulatif',
    role: 'Media Team',
    bio: 'Bringing creative vision to life through engaging multimedia content.',
    initials: 'ZA',
    color: '#27AE60',
  },
  {
    name: 'Shodiyona',
    role: 'Academic Coordinator',
    bio: 'Overseeing curriculum alignment and ensuring academic excellence across all subjects.',
    initials: 'SH',
    color: '#9B59B6',
  },
  {
    name: 'Xolmatova Kamola',
    role: 'Operation Manager',
    bio: 'Keeping everything running smoothly behind the scenes with efficient management.',
    initials: 'XK',
    color: '#E74C3C',
  },
]

const RADIUS_X = 320
const RADIUS_Y = 140
const CARD_SIZE = 130

function OrbitCard({ member, index, total, rotation }: {
  member: typeof teamMembers[0]
  index: number
  total: number
  rotation: number
}) {
  const baseAngle = (360 / total) * index
  const angle = baseAngle + rotation
  const rad = (angle * Math.PI) / 180

  const x = Math.cos(rad) * RADIUS_X
  const y = Math.sin(rad) * RADIUS_Y

  const normalizedAngle = ((angle % 360) + 360) % 360
  const isActive = normalizedAngle > 315 || normalizedAngle < 45

  return (
    <div
      style={{
        position: 'absolute',
        width: CARD_SIZE,
        height: CARD_SIZE,
        left: '50%',
        top: '50%',
        marginLeft: -(CARD_SIZE / 2),
        marginTop: -(CARD_SIZE / 2),
        transform: `translate(${x}px, ${y}px)`,
        borderRadius: '50%',
        background: isActive
          ? `linear-gradient(135deg, ${member.color}, ${member.color}88)`
          : 'rgba(255,255,255,0.04)',
        border: `2px solid ${isActive ? member.color : 'rgba(255,255,255,0.08)'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
        boxShadow: isActive ? `0 0 30px ${member.color}40` : 'none',
        zIndex: isActive ? 10 : 1,
        cursor: 'pointer',
        opacity: isActive ? 1 : 0.55,
        scale: isActive ? 1.15 : 0.9,
      }}
    >
      <div style={{
        fontSize: '1.3rem',
        fontWeight: 700,
        color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
        fontFamily: 'var(--font-heading)',
        marginBottom: '4px',
      }}>
        {member.initials}
      </div>
      <div style={{
        fontSize: '0.6rem',
        fontWeight: 600,
        color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
        textAlign: 'center',
        padding: '0 6px',
        lineHeight: 1.2,
      }}>
        {member.name.split(' ').pop()}
      </div>
      <div style={{
        fontSize: '0.5rem',
        color: isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)',
        marginTop: '2px',
      }}>
        {member.role}
      </div>
    </div>
  )
}

export default function Team() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [isPaused, setIsPaused] = useState(false)
  const rotationRef = useRef(0)
  const [, setTick] = useState(0)

  useAnimationFrame((_, delta) => {
    if (!isInView || isPaused) return
    const speed = 0.012
    rotationRef.current += delta * speed
    if (rotationRef.current > 360) rotationRef.current -= 360
    setTick(t => t + 1)
  })

  const rotation = rotationRef.current
  const segmentAngle = 360 / teamMembers.length
  const frontAngle = ((360 - rotation) % 360 + 360) % 360
  const activeIndex = Math.round(frontAngle / segmentAngle) % teamMembers.length
  const activeMember = teamMembers[activeIndex]

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

          <p style={{
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.4)',
          }}>
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
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,179,0,0.1) 0%, transparent 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
          }}>
            🌉
          </div>

          {/* Cards */}
          {teamMembers.map((member, i) => (
            <OrbitCard
              key={member.name}
              member={member}
              index={i}
              total={teamMembers.length}
              rotation={rotation}
            />
          ))}
        </div>

        {/* Active member detail */}
        <motion.div
          key={activeMember.name}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            padding: '20px 28px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
            maxWidth: '480px',
            margin: '0 auto',
          }}
        >
          <div style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: activeMember.color,
            fontFamily: 'var(--font-heading)',
            marginBottom: '6px',
          }}>
            {activeMember.name}
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '10px',
          }}>
            {activeMember.role}
          </div>
          <p style={{
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.6,
          }}>
            {activeMember.bio}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
