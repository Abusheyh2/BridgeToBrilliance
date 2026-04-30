'use client'

import { motion, useInView } from 'framer-motion'
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

function FlipCard({ member, index, isInView }: { member: typeof teamMembers[0]; index: number; isInView: boolean }) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.15 * index }}
      style={{ perspective: '1000px', cursor: 'pointer' }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          position: 'relative',
          width: '100%',
          height: '320px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          borderRadius: '16px',
          background: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          gap: '16px',
        }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${member.color}, ${member.color}99)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'white',
            fontFamily: 'var(--font-heading)',
            boxShadow: `0 4px 20px ${member.color}40`,
          }}>
            {member.initials}
          </div>
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.2rem',
            fontWeight: 600,
            color: 'var(--text-dark)',
          }}>
            {member.name}
          </h3>
          <span style={{
            fontSize: '0.85rem',
            color: member.color,
            fontWeight: 600,
          }}>
            {member.role}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dark-subtle)' }}>
            Hover to learn more →
          </span>
        </div>

        {/* Back */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #0D1B3E, #1A2D56)',
          border: '1px solid rgba(255, 179, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          gap: '16px',
          transform: 'rotateY(180deg)',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#FFB300',
          }}>
            {member.name}
          </h3>
          <span style={{
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.7)',
            fontWeight: 500,
          }}>
            {member.role}
          </span>
          <p style={{
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.6,
            textAlign: 'center',
          }}>
            {member.bio}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Team() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      id="team"
      ref={ref}
      style={{
        padding: '120px 40px',
        background: 'var(--bg-offwhite)',
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
            background: 'rgba(65, 105, 225, 0.1)',
            color: '#4169E1',
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
            color: 'var(--text-dark)',
            marginBottom: '16px',
          }}>
            The People Behind the{' '}
            <span className="gold-underline" style={{ color: 'var(--royal-blue)' }}>
              Mission
            </span>
          </h2>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
        }}>
          {teamMembers.map((member, i) => (
            <FlipCard key={i} member={member} index={i} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  )
}
