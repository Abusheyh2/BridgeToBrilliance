'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

const teamMembers = [
  {
    name: 'Dr. Sarah Mitchell',
    role: 'Founder & Director',
    bio: 'Former educator with 15 years of experience in building accessible education programs across developing nations.',
    initials: 'SM',
    color: '#4169E1',
  },
  {
    name: 'James Okafor',
    role: 'Head of Curriculum',
    bio: 'Curriculum design expert focused on making complex subjects accessible to learners of all backgrounds.',
    initials: 'JO',
    color: '#FFB300',
  },
  {
    name: 'Priya Sharma',
    role: 'Lead Developer',
    bio: 'Full-stack engineer passionate about using technology to democratize education worldwide.',
    initials: 'PS',
    color: '#4169E1',
  },
  {
    name: 'Carlos Rivera',
    role: 'Community Manager',
    bio: 'Building bridges between teachers and learners, ensuring every voice is heard and every question answered.',
    initials: 'CR',
    color: '#FFB300',
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
