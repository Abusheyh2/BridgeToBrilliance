'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-navy)',
      padding: '80px 40px 40px',
      borderTop: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px',
          marginBottom: '60px',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '32px', height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #4169E1, #FFB300)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}>
                🌉
              </div>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#FFB300',
              }}>
                BridgeToBrilliance
              </span>
            </div>
            <p style={{
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.6,
              maxWidth: '280px',
            }}>
              Empowering students worldwide with free, quality education. 
              Because brilliance knows no boundaries.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'white',
              marginBottom: '16px',
            }}>
              Quick Links
            </h4>
            {['About', 'Features', 'Team'].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  marginBottom: '10px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFB300')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Platform */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'white',
              marginBottom: '16px',
            }}>
              Platform
            </h4>
            {[
              { label: 'Sign In', href: '/login' },
              { label: 'Register', href: '/register' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  marginBottom: '10px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFB300')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'white',
              marginBottom: '16px',
            }}>
              Connect
            </h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['X', 'in', 'fb', 'yt'].map((platform, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -3, scale: 1.1 }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.5)',
                    textDecoration: 'none',
                    fontWeight: 700,
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 179, 0, 0.4)'
                    e.currentTarget.style.color = '#FFB300'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                  }}
                >
                  {platform}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          marginBottom: '24px',
        }} />

        {/* Bottom */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
            © 2024 BridgeToBrilliance. All rights reserved. A nonprofit initiative.
          </p>
          <p style={{
            fontSize: '0.8rem',
            color: 'rgba(255, 179, 0, 0.5)',
            fontStyle: 'italic',
          }}>
            &quot;Building bridges to a brighter future&quot;
          </p>
        </div>
      </div>
    </footer>
  )
}
