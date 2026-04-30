'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as securityService from '@/services/admin-security.service'
import type { IPBan, SecurityLog, SecuritySetting, RateLimit } from '@/types/database.types'

export default function AdminSecurityPage() {
  const [bannedIPs, setBannedIPs] = useState<IPBan[]>([])
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [settings, setSettings] = useState<SecuritySetting[]>([])
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'bans' | 'logs' | 'settings'>('overview')
  const [showBanModal, setShowBanModal] = useState(false)
  const [banIP, setBanIP] = useState('')
  const [banReason, setBanReason] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [ipsRes, logsRes, settingsRes, ratesRes] = await Promise.all([
        securityService.getBannedIPs(),
        securityService.getSecurityLogs(100),
        securityService.getSecuritySettings(),
        securityService.getRateLimits(),
      ])
      if (!cancelled) {
        if (ipsRes.success && ipsRes.data) setBannedIPs(ipsRes.data)
        if (logsRes.success && logsRes.data) setLogs(logsRes.data)
        if (settingsRes.success && settingsRes.data) setSettings(settingsRes.data)
        if (ratesRes.success && ratesRes.data) setRateLimits(ratesRes.data)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const loadData = async () => {
    const [ipsRes, logsRes, settingsRes, ratesRes] = await Promise.all([
      securityService.getBannedIPs(),
      securityService.getSecurityLogs(100),
      securityService.getSecuritySettings(),
      securityService.getRateLimits(),
    ])
    if (ipsRes.success && ipsRes.data) setBannedIPs(ipsRes.data)
    if (logsRes.success && logsRes.data) setLogs(logsRes.data)
    if (settingsRes.success && settingsRes.data) setSettings(settingsRes.data)
    if (ratesRes.success && ratesRes.data) setRateLimits(ratesRes.data)
    setLoading(false)
  }

  const handleBanIP = async () => {
    if (!banIP.trim()) return
    const res = await securityService.banIP(banIP, banReason || 'Banned by admin')
    if (res.success) {
      setShowBanModal(false)
      setBanIP('')
      setBanReason('')
      loadData()
    }
  }

  const handleUnban = async (id: string) => {
    const res = await securityService.unbanIP(id)
    if (res.success) loadData()
  }

  const toggleSetting = async (key: string, enabled: boolean) => {
    const setting = settings.find(s => s.key === key)
    if (!setting) return
    const newValue = { ...setting.value, enabled }
    await securityService.updateSecuritySetting(key, newValue)
    loadData()
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📊' },
    { id: 'bans' as const, label: 'IP Bans', icon: '🚫' },
    { id: 'logs' as const, label: 'Audit Logs', icon: '📋' },
    { id: 'settings' as const, label: 'Settings', icon: '⚙️' },
  ]

  const ddosSetting = settings.find(s => s.key === 'ddos_protection')
  const rateSetting = settings.find(s => s.key === 'rate_limiting')
  const botSetting = settings.find(s => s.key === 'bot_protection')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'white', marginBottom: '4px' }}>
            Security Center 🛡️
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Monitor and protect your platform</p>
        </div>
        <button
          onClick={() => setShowBanModal(true)}
          style={{
            padding: '10px 20px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #E74C3C, #C0392B)',
            color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          + Ban IP
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: activeTab === tab.id ? 'rgba(65, 105, 225, 0.2)' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.id ? '#4169E1' : 'rgba(255,255,255,0.5)',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>
      ) : activeTab === 'overview' ? (
        <div>
          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {[
              { label: 'Banned IPs', value: bannedIPs.length, icon: '🚫', color: '#E74C3C' },
              { label: 'Active Rate Limits', value: rateLimits.filter(r => r.request_count > 10).length, icon: '⚡', color: '#F39C12' },
              { label: 'Security Events', value: logs.length, icon: '📋', color: '#4169E1' },
              { label: 'Protections Active', value: [ddosSetting, rateSetting, botSetting].filter(s => s?.value['enabled']).length, icon: '🛡️', color: '#27AE60' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white' }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Protection Status */}
          <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>
            Protection Status
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {[
              { key: 'ddos_protection', label: 'DDoS Protection', desc: 'Blocks IPs exceeding request limits', setting: ddosSetting },
              { key: 'rate_limiting', label: 'Rate Limiting', desc: 'Limits login/signup attempts', setting: rateSetting },
              { key: 'bot_protection', label: 'Bot Protection', desc: 'Prevents automated signups', setting: botSetting },
            ].map(protection => (
              <div key={protection.key} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', color: 'white', fontWeight: 600, marginBottom: '4px' }}>{protection.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{protection.desc}</div>
                </div>
                <button
                  onClick={() => toggleSetting(protection.key, !(protection.setting?.value['enabled'] ?? false))}
                  style={{
                    width: '48px', height: '26px', borderRadius: '13px',
                    background: protection.setting?.value['enabled'] ? '#27AE60' : 'rgba(255,255,255,0.1)',
                    border: 'none', cursor: 'pointer', position: 'relative',
                  }}
                >
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: 'white', position: 'absolute', top: '3px',
                    left: protection.setting?.value['enabled'] ? '25px' : '3px',
                    transition: 'left 0.2s',
                  }} />
                </button>
              </div>
            ))}
          </div>

          {/* Recent Logs */}
          <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>
            Recent Security Events
          </h3>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
            {logs.slice(0, 10).map(log => (
              <div key={log.id} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 500 }}>{log.action}</span>
                  {log.ip_address && <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginLeft: '12px' }}>{log.ip_address}</span>}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'bans' ? (
        <div>
          {bannedIPs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.4)' }}>
              No banned IPs. Your platform is clean!
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
              {bannedIPs.map(ip => (
                <div key={ip.id} style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', color: 'white', fontWeight: 600, fontFamily: 'monospace' }}>{ip.ip_address}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{ip.reason}</div>
                    {ip.expires_at && (
                      <div style={{ fontSize: '0.75rem', color: '#F39C12', marginTop: '2px' }}>
                        Expires: {new Date(ip.expires_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleUnban(ip.id)}
                    style={{
                      padding: '6px 14px', borderRadius: '6px', border: 'none',
                      background: 'rgba(39, 174, 96, 0.2)', color: '#27AE60',
                      fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Unban
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'logs' ? (
        <div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
            {logs.map(log => (
              <div key={log.id} style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'white', fontWeight: 500 }}>{log.action}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                  {log.ip_address && <span>IP: {log.ip_address}</span>}
                  {log.user && <span>User: {log.user.full_name}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {settings.map(setting => (
            <div key={setting.key} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1rem', color: 'white', fontWeight: 600, textTransform: 'capitalize' }}>
                  {setting.key.replace(/_/g, ' ')}
                </h3>
                <button
                  onClick={() => toggleSetting(setting.key, !(setting.value['enabled'] ?? false))}
                  style={{
                    width: '48px', height: '26px', borderRadius: '13px',
                    background: setting.value['enabled'] ? '#27AE60' : 'rgba(255,255,255,0.1)',
                    border: 'none', cursor: 'pointer', position: 'relative',
                  }}
                >
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: 'white', position: 'absolute', top: '3px',
                    left: setting.value['enabled'] ? '25px' : '3px',
                    transition: 'left 0.2s',
                  }} />
                </button>
              </div>
              <pre style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', overflow: 'auto' }}>
                {JSON.stringify(setting.value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* Ban IP Modal */}
      <AnimatePresence>
        {showBanModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
            onClick={() => setShowBanModal(false)}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'white', marginBottom: '24px' }}>Ban IP Address</h2>
              <input value={banIP} onChange={(e) => setBanIP(e.target.value)} placeholder="IP Address (e.g., 192.168.1.1)" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
              <textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="Reason for ban" rows={3} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: '16px' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowBanModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleBanIP} disabled={!banIP.trim()} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: banIP.trim() ? 'linear-gradient(135deg, #E74C3C, #C0392B)' : 'rgba(255,255,255,0.05)', color: banIP.trim() ? 'white' : 'rgba(255,255,255,0.3)', fontSize: '0.9rem', fontWeight: 600, cursor: banIP.trim() ? 'pointer' : 'default' }}>Ban IP</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
