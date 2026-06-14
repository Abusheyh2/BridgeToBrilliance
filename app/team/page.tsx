'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { founder, teamMembers } from '@/data/team'

export default function TeamPage() {
  return (
    <main>
      <div style={{
        padding: '120px 40px 60px',
        background: 'linear-gradient(135deg, #F8F9FF 0%, #E8ECF8 50%, #F8F9FF 100%)',
        textAlign: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
              <Image src="/pictures/logo.png" alt="BridgeToBrilliance" width={40} height={40} style={{ borderRadius: '10px', objectFit: 'contain' }} />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: '#4169E1' }}>
                BridgeToBrilliance
              </span>
            </div>
          </Link>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: 800,
            color: '#1A1A2E',
            marginBottom: '16px',
          }}>
            Meet Our{' '}
            <span style={{
              background: 'linear-gradient(135deg, #FFB300, #FFC233)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Team
            </span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(0,0,0,0.5)', maxWidth: '600px', margin: '0 auto' }}>
            Dedicated educators and staff working together to make quality education accessible to all.
          </p>
        </motion.div>
      </div>

      <div style={{
        padding: '80px 40px',
        background: '#ffffff',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Founder — centered hero card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              textAlign: 'center',
              marginBottom: '80px',
            }}
          >
            <div style={{
              width: '160px', height: '213px',
              borderRadius: '16px',
              background: '#b0b0b0',
              margin: '0 auto 24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }} />
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.8rem',
              fontWeight: 700,
              color: '#1A1A2E',
              marginBottom: '4px',
            }}>
              {founder.name}
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#FFB300',
              fontWeight: 600,
              marginBottom: '12px',
            }}>
              {founder.role}
            </p>
            <p style={{
              fontSize: '0.95rem',
              color: 'rgba(0,0,0,0.5)',
              maxWidth: '550px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}>
              {founder.bio}
            </p>
          </motion.div>

          {/* Team grid — 3 columns, last row centered */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
          }}>
            {teamMembers.map((member, i) => {
              const isLastRowOdd = teamMembers.length % 3 === 1 && i >= teamMembers.length - 1
              const isLastRowTwo = teamMembers.length % 3 === 2 && i >= teamMembers.length - 2
              return (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                  style={{
                    background: '#F8F9FF',
                    borderRadius: '16px',
                    padding: '32px 24px',
                    textAlign: 'center',
                    border: '1px solid rgba(0,0,0,0.04)',
                    gridColumn: isLastRowOdd ? '2 / 3' : isLastRowTwo ? undefined : undefined,
                  }}
                >
                  <div style={{
                    width: '120px', height: '160px',
                    borderRadius: '12px',
                    background: '#b0b0b0',
                    margin: '0 auto 20px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }} />
                  <h3 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#1A1A2E',
                    marginBottom: '4px',
                  }}>
                    {member.name}
                  </h3>
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#4169E1',
                    fontWeight: 600,
                    marginBottom: '10px',
                  }}>
                    {member.role}
                  </p>
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'rgba(0,0,0,0.5)',
                    lineHeight: 1.6,
                  }}>
                    {member.bio}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
