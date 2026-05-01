'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

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

function MemberCard({ member, angle, radius, isActive, onClick }: {
  member: typeof teamMembers[0]
  angle: number
  radius: number
  isActive: boolean
  onClick: () => void
}) {
  const rad = (angle * Math.PI) / 180
  const x = Math.cos(rad) * radius
  const y = Math.sin(rad) * radius * 0.4

  const scale = isActive ? 1.2 : 0.85
  const opacity = isActive ? 1 : 0.5
  const zIndex = isActive ? 10 : 1

  return (
    <motion.div
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '140px',
        height: '140px',
        marginLeft: '-70px',
        marginTop: '-70px',
        borderRadius: '50%',
        background: isActive
          ? `linear-gradient(135deg, ${member.color}, ${member.color}99)`
          : `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`,
        border: `2px solid ${isActive ? member.color : 'rgba(255,255,255,0.1)'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex,
        transition: 'border-color 0.3s, background 0.3s',
        transform: `translate(${x}px, ${y}px)`,
      }}
      animate={{
        scale,
        opacity,
      }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div style={{
        fontSize: '1.4rem',
        fontWeight: 700,
        color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
        fontFamily: 'var(--font-heading)',
        marginBottom: '4px',
      }}>
        {member.initials}
      </div>
      <div style={{
        fontSize: '0.65rem',
        fontWeight: 600,
        color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        padding: '0 8px',
        lineHeight: 1.2,
      }}>
        {member.name.split(' ').pop()}
      </div>
      <div style={{
        fontSize: '0.55rem',
        color: isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
        textAlign: 'center',
        marginTop: '2px',
      }}>
        {member.role}
      </div>
    </motion.div>
  )
}

export default function Team() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [isPaused, setIsPaused] = useState(false)
  const [rotation, setRotation] = useState(0)
  const animFrame = useRef<number>(0)

  const radius = 280
  const speed = 0.15

  useEffect(() => {
    if (!isInView) return

    let cancelled = false
    const animate = () => {
      if (!cancelled && !isPaused) {
        setRotation(prev => prev + speed)
      }
      animFrame.current = requestAnimationFrame(animate)
    }
    animFrame.current = requestAnimationFrame(animate)

    return () => {
      cancelled = true
      if (animFrame.current) cancelAnimationFrame(animFrame.current)
    }
  }, [isInView, isPaused])

  const handleCardClick = (_index: number) => {
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 3000)
  }

  // Compute which card is closest to the front (angle 0)
  const frontAngle = ((-rotation % 360) + 360) % 360
  const segmentAngle = 360 / teamMembers.length
  const computedActive = Math.round(frontAngle / segmentAngle) % teamMembers.length

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
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '500px',
            margin: '0 auto',
          }}>
            Hover to pause • Click a card to focus
          </p>
        </motion.div>

        {/* Carousel container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Orbit ring */}
          <div style={{
            position: 'absolute',
            width: radius * 2 + 140,
            height: (radius * 0.4 * 2) + 140,
            borderRadius: '50%',
            border: '1px dashed rgba(255,255,255,0.06)',
          }} />

          {/* Center glow */}
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,179,0,0.15) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute',
            fontSize: '2.5rem',
          }}>
            🌉
          </div>

          {/* Cards */}
          {teamMembers.map((member, i) => {
            const angle = (360 / teamMembers.length) * i + rotation
            const normalizedAngle = ((angle % 360) + 360) % 360
            const isActive = normalizedAngle < 45 || normalizedAngle > 315

            return (
              <MemberCard
                key={i}
                member={member}
                angle={angle}
                radius={radius}
                isActive={isActive}
                onClick={() => handleCardClick(i)}
              />
            )
          })}
        </div>

        {/* Active member detail */}
        <motion.div
          key={computedActive}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            marginTop: '20px',
            padding: '24px 32px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
            maxWidth: '500px',
            margin: '20px auto 0',
          }}
        >
          <div style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: teamMembers[computedActive].color,
            fontFamily: 'var(--font-heading)',
            marginBottom: '8px',
          }}>
            {teamMembers[computedActive].name}
          </div>
          <div style={{
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '12px',
          }}>
            {teamMembers[computedActive].role}
          </div>
          <p style={{
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.6,
          }}>
            {teamMembers[computedActive].bio}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
