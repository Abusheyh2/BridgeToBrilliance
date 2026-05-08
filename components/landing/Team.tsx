'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

const teamMembers = [
  { name: 'Nomozova Nozima', role: 'Math Teacher', bio: 'Dedicated mathematics educator bringing complex concepts to life with clarity and patience.', initials: 'NN', color: '#4169E1' },
  { name: 'Muhammadjonova Madina', role: 'Math Teacher', bio: 'Passionate about making mathematics accessible and engaging for every student.', initials: 'MM', color: '#27AE60' },
  { name: 'Qurbonov Jaloliddin', role: 'Coding Teacher', bio: 'Software developer turned educator, teaching the next generation of programmers.', initials: 'QJ', color: '#FFB300' },
  { name: 'Shonazarov Abdurahmon', role: 'Coding Teacher', bio: 'Expert in modern programming languages with a focus on practical, project-based learning.', initials: 'SA', color: '#E74C3C' },
  { name: 'Shokirov Aziz', role: 'Physics Teacher', bio: 'Bringing the laws of physics to life through interactive demonstrations.', initials: 'SA', color: '#9B59B6' },
  { name: 'Nozimov Daler', role: 'Physics Teacher', bio: 'Making physics intuitive through hands-on experiments and clear explanations.', initials: 'ND', color: '#1ABC9C' },
  { name: 'Gulmuradova Gulnoza', role: 'English Teacher', bio: 'Experienced language educator focused on building confidence in communication.', initials: 'GG', color: '#E67E22' },
  { name: 'Mirzayeva Kamila', role: 'English Teacher', bio: 'Creating immersive English learning experiences that inspire fluency.', initials: 'MK', color: '#3498DB' },
  { name: 'Akbaraliyev Eldor', role: 'Media Officer', bio: 'Managing media operations across the platform.', initials: 'AE', color: '#4169E1' },
  { name: 'Adamboyev Behzod', role: 'Media Team', bio: 'Content creator supporting the platform\'s visual identity.', initials: 'AB', color: '#FFB300' },
  { name: 'Zokirjonov Abdulatif', role: 'Media Team', bio: 'Bringing creative vision through engaging multimedia content.', initials: 'ZA', color: '#27AE60' },
  { name: 'Shodiyona', role: 'Academic Coordinator', bio: 'Overseeing curriculum alignment across all subjects.', initials: 'SH', color: '#9B59B6' },
  { name: 'Xolmatova Kamola', role: 'Operation Manager', bio: 'Keeping everything running smoothly behind the scenes.', initials: 'XK', color: '#E74C3C' },
]

const CARD_WIDTH = 280
const GAP = 24

export default function Team() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<number>(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isInView || isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = window.setInterval(() => {
      setActiveIndex(prev => (prev + 1) % teamMembers.length)
    }, 3500)
    return () => clearInterval(intervalRef.current)
  }, [isInView, isPaused])

  useEffect(() => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const targetScroll = activeIndex * (CARD_WIDTH + GAP) - (el.clientWidth - CARD_WIDTH) / 2
    el.scrollTo({ left: targetScroll, behavior: 'smooth' })
  }, [activeIndex])

  const goTo = (index: number) => {
    setActiveIndex(index)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 4000)
  }

  return (
    <section
      id="team"
      ref={sectionRef}
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
            display: 'inline-block', padding: '6px 16px', borderRadius: '20px',
            background: 'rgba(255,179,0,0.15)', border: '1px solid rgba(255,179,0,0.3)',
            color: '#FFB300', fontSize: '0.8rem', fontWeight: 600,
            marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px',
          }}>
            Our Team
          </span>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem,4vw,2.8rem)',
            fontWeight: 700, color: 'white', marginBottom: '16px',
          }}>
            The People Behind the{' '}
            <span style={{
              background: 'linear-gradient(135deg,#FFB300,#FFC233)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Mission
            </span>
          </h2>
        </motion.div>

        {/* Carousel track */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="carousel-track"
          style={{
            display: 'flex', gap: `${GAP}px`,
            overflowX: 'auto', overflowY: 'hidden',
            padding: '20px 0', scrollBehavior: 'smooth',
            scrollSnapType: 'x mandatory',
          }}
        >
          {teamMembers.map((member, i) => {
            const isActive = i === activeIndex
            return (
              <div
                key={member.name}
                onClick={() => goTo(i)}
                style={{
                  minWidth: `${CARD_WIDTH}px`,
                  padding: '28px 24px',
                  borderRadius: '16px',
                  background: isActive
                    ? `linear-gradient(135deg, ${member.color}22, rgba(255,255,255,0.03))`
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? member.color + '44' : 'rgba(255,255,255,0.06)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.4s ease',
                  transform: isActive ? 'translateY(-8px)' : 'translateY(0)',
                  boxShadow: isActive ? `0 8px 32px ${member.color}20` : 'none',
                  scrollSnapAlign: 'center',
                  userSelect: 'none',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${member.color}, ${member.color}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', fontWeight: 700, color: 'white',
                  fontFamily: 'var(--font-heading)', marginBottom: '16px',
                }}>
                  {member.initials}
                </div>
                <div style={{
                  fontSize: '1.05rem', fontWeight: 700,
                  color: isActive ? member.color : 'white',
                  fontFamily: 'var(--font-heading)', marginBottom: '4px',
                  transition: 'color 0.3s',
                }}>
                  {member.name}
                </div>
                <div style={{
                  fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)',
                  marginBottom: '12px',
                }}>
                  {member.role}
                </div>
                <p style={{
                  fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)',
                  lineHeight: 1.6,
                }}>
                  {member.bio}
                </p>
              </div>
            )
          })}
        </div>

        {/* Dots */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px',
        }}>
          {teamMembers.map((member, i) => (
            <button
              key={member.name}
              onClick={() => goTo(i)}
              style={{
                width: i === activeIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                background: i === activeIndex ? member.color : 'rgba(255,255,255,0.15)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
              aria-label={`Go to ${member.name}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
