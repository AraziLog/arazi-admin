import React, { useState } from 'react'
import { useAuth } from '../App'

export default function Profile() {
  const { user, logout, notify } = useAuth()

  const [activeTab, setActiveTab] = useState('profile')

  // Profile form
  const [name,     setName]     = useState(user?.name     || '')
  const [email,    setEmail]    = useState(user?.email    || '')
  const [saving,   setSaving]   = useState(false)

  // Password form
  const [currentPass, setCurrentPass] = useState('')
  const [newPass,     setNewPass]     = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [changingPass, setChangingPass] = useState(false)

  // App password
  const [appPassLabel, setAppPassLabel] = useState('')
  const [generatedPass, setGeneratedPass] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const WP_BASE = import.meta.env.VITE_WP_URL || 'https://arazilogistics.com'

  const getAuthHeader = () => {
    const username    = localStorage.getItem('arazi_username')    || ''
    const appPassword = localStorage.getItem('arazi_app_password') || ''
    return username && appPassword
      ? { Authorization: `Basic ${btoa(`${username}:${appPassword}`)}` }
      : {}
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`${WP_BASE}/wp-json/wp/v2/users/me`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ name, email }),
      })
      if (res.ok) {
        notify('Profile updated successfully')
        const u = JSON.parse(localStorage.getItem('arazi_user') || '{}')
        localStorage.setItem('arazi_user', JSON.stringify({ ...u, name, email }))
      } else {
        notify('Failed to update profile', 'error')
      }
    } catch {
      // Demo mode
      notify('Profile updated (demo mode)')
    }
    setSaving(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPass.length < 8) { notify('Password must be at least 8 characters', 'error'); return }
    if (newPass !== confirmPass) { notify('Passwords do not match', 'error'); return }
    setChangingPass(true)
    try {
      const res = await fetch(`${WP_BASE}/wp-json/wp/v2/users/me`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ password: newPass }),
      })
      if (res.ok) {
        notify('Password changed. Please log in again.')
        setTimeout(() => logout(), 2000)
      } else {
        notify('Failed to change password — check your current password', 'error')
      }
    } catch {
      notify('Password changed (demo mode) — logging out', 'success')
      setTimeout(() => logout(), 2000)
    }
    setChangingPass(false)
    setCurrentPass(''); setNewPass(''); setConfirmPass('')
  }

  const handleGenerateAppPassword = async (e) => {
    e.preventDefault()
    if (!appPassLabel.trim()) { notify('Enter a name for this password', 'error'); return }
    setGenerating(true)
    try {
      const res = await fetch(`${WP_BASE}/wp-json/wp/v2/users/me/application-passwords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ name: appPassLabel }),
      })
      if (res.ok) {
        const data = await res.json()
        setGeneratedPass(data.password)
        notify('Application password generated')
      } else {
        notify('Failed to generate — try from WordPress Admin → Profile', 'error')
      }
    } catch {
      // Demo — show fake format
      const fake = Array.from({length:6}, () => Math.random().toString(36).substring(2,6).toUpperCase()).join(' ')
      setGeneratedPass(fake)
      notify('Demo mode — use WordPress Admin → Profile for real passwords')
    }
    setGenerating(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPass)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const TABS = [
    { id:'profile',  label:'Profile' },
    { id:'password', label:'Change Password' },
    { id:'apppass',  label:'Application Passwords' },
  ]

  return (
    <div style={{ animation:'fadeUp .3s ease', maxWidth:640 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, margin:0 }}>Account Settings</h1>
        <p style={{ color:'var(--text-3)', fontSize:13, marginTop:4 }}>Manage your profile, password and API access</p>
      </div>

      {/* Avatar + name hero */}
      <div className="card" style={{ padding:24, marginBottom:20, display:'flex', alignItems:'center', gap:20 }}>
        <div style={{
          width:64, height:64, borderRadius:'50%',
          background:'linear-gradient(135deg,#1a56db,#7e3af2)',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', fontSize:24, fontWeight:800, flexShrink:0,
        }}>
          {(user?.name || 'A').charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18 }}>{user?.name || 'Admin'}</div>
          <div style={{ color:'var(--text-3)', fontSize:13, marginTop:2 }}>{user?.email || ''}</div>
          <div style={{ marginTop:6 }}>
            <span style={{ background:'var(--primary-soft)', color:'var(--primary)', fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:99 }}>
              Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--surface-2)', padding:4, borderRadius:'var(--radius)', width:'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding:'7px 18px', borderRadius:'var(--radius-sm)', fontSize:13, fontWeight:600,
            border:'none', cursor:'pointer', transition:'all var(--transition)',
            background: activeTab===t.id ? 'var(--surface)' : 'transparent',
            color: activeTab===t.id ? 'var(--text-1)' : 'var(--text-3)',
            boxShadow: activeTab===t.id ? 'var(--shadow-sm)' : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Profile tab ──────────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="card" style={{ padding:28 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:20 }}>Profile Information</h3>
          <form onSubmit={handleSaveProfile}>
            <Field label="Display Name" value={name} onChange={setName} placeholder="Your name" />
            <Field label="Email Address" value={email} onChange={setEmail} placeholder="your@email.com" type="email" />
            <div style={{ marginTop:8, padding:'12px 16px', background:'var(--surface-2)', borderRadius:'var(--radius-sm)', fontSize:12, color:'var(--text-3)' }}>
              Changes sync to your WordPress account. You may need to log in again after changing your email.
            </div>
            <SaveBtn loading={saving}>Save Profile</SaveBtn>
          </form>
        </div>
      )}

      {/* ── Password tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'password' && (
        <div className="card" style={{ padding:28 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:20 }}>Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <Field label="Current Password" value={currentPass} onChange={setCurrentPass} type={showPass?'text':'password'} placeholder="Enter current password" />
            <Field label="New Password" value={newPass} onChange={setNewPass} type={showPass?'text':'password'} placeholder="Minimum 8 characters" />
            <Field label="Confirm New Password" value={confirmPass} onChange={setConfirmPass} type={showPass?'text':'password'} placeholder="Repeat new password" />

            {/* Password strength */}
            {newPass && (
              <div style={{ marginBottom:16 }}>
                <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                  {[1,2,3,4].map(i => {
                    const score = [newPass.length>=8, /[A-Z]/.test(newPass), /[0-9]/.test(newPass), /[^A-Za-z0-9]/.test(newPass)].filter(Boolean).length
                    const colors = ['#ef4444','#f59e0b','#10b981','#10b981']
                    return <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i<=score ? colors[score-1] : 'var(--border)', transition:'all .2s' }} />
                  })}
                </div>
                <div style={{ fontSize:11, color:'var(--text-3)' }}>
                  {[newPass.length>=8, /[A-Z]/.test(newPass), /[0-9]/.test(newPass), /[^A-Za-z0-9]/.test(newPass)].filter(Boolean).length <= 1 ? 'Weak' :
                   [newPass.length>=8, /[A-Z]/.test(newPass), /[0-9]/.test(newPass), /[^A-Za-z0-9]/.test(newPass)].filter(Boolean).length === 2 ? 'Fair' :
                   [newPass.length>=8, /[A-Z]/.test(newPass), /[0-9]/.test(newPass), /[^A-Za-z0-9]/.test(newPass)].filter(Boolean).length === 3 ? 'Good' : 'Strong'} password
                </div>
              </div>
            )}

            <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--text-2)', marginBottom:20, cursor:'pointer' }}>
              <input type="checkbox" checked={showPass} onChange={e => setShowPass(e.target.checked)} />
              Show passwords
            </label>

            <div style={{ padding:'12px 16px', background:'#fffbeb', borderRadius:'var(--radius-sm)', fontSize:12, color:'#92400e', marginBottom:16, borderLeft:'3px solid #f59e0b' }}>
              ⚠ After changing your password you will be logged out and need to sign in again.
            </div>

            <SaveBtn loading={changingPass} color="#e02424">Change Password</SaveBtn>
          </form>
        </div>
      )}

      {/* ── App Passwords tab ─────────────────────────────────────────────────── */}
      {activeTab === 'apppass' && (
        <div>
          <div className="card" style={{ padding:28, marginBottom:16 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:8 }}>Application Passwords</h3>
            <p style={{ fontSize:13, color:'var(--text-2)', marginBottom:20, lineHeight:1.6 }}>
              Application passwords let external apps (like this dashboard and the mobile app) connect to your WordPress account securely without using your main password.
            </p>

            <form onSubmit={handleGenerateAppPassword}>
              <Field label="Password Name" value={appPassLabel} onChange={setAppPassLabel} placeholder='e.g. "Arazi Admin Dashboard"' />
              <SaveBtn loading={generating} color="var(--success)">Generate New Password</SaveBtn>
            </form>

            {generatedPass && (
              <div style={{ marginTop:20, padding:20, background:'var(--success-soft)', borderRadius:'var(--radius)', border:'1px solid #6ee7b7' }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--success)', marginBottom:8 }}>
                  ✓ Password generated — copy it now, it won't be shown again
                </div>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <code style={{ flex:1, background:'var(--surface)', padding:'10px 14px', borderRadius:'var(--radius-sm)', fontSize:13, fontFamily:'monospace', letterSpacing:'.05em', border:'1px solid var(--border)', wordBreak:'break-all' }}>
                    {generatedPass}
                  </code>
                  <button onClick={handleCopy} style={{
                    padding:'10px 16px', borderRadius:'var(--radius-sm)', fontSize:12, fontWeight:700,
                    border:'none', cursor:'pointer', flexShrink:0,
                    background: copied ? 'var(--success)' : 'var(--primary)',
                    color:'#fff', transition:'all .2s',
                  }}>
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ padding:20 }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>Manage all application passwords</div>
            <p style={{ fontSize:13, color:'var(--text-2)', marginBottom:14 }}>
              To view, revoke, or manage existing application passwords go to your WordPress admin profile page.
            </p>
            <a
              href={`${WP_BASE}/wp-admin/profile.php#application-passwords-section`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:'inline-flex', alignItems:'center', gap:8,
                background:'var(--primary)', color:'#fff', padding:'9px 18px',
                borderRadius:'var(--radius-sm)', fontSize:13, fontWeight:600,
                textDecoration:'none',
              }}
            >
              Open WordPress Profile →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type='text' }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-2)', marginBottom:6 }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required
        style={{ width:'100%', padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:14, background:'var(--surface)', color:'var(--text-1)', outline:'none', boxSizing:'border-box', transition:'border .15s' }}
        onFocus={e  => e.target.style.borderColor = 'var(--primary)'}
        onBlur={e   => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}

function SaveBtn({ children, loading, color='var(--primary)' }) {
  return (
    <button type="submit" disabled={loading} style={{
      padding:'10px 24px', borderRadius:'var(--radius-sm)',
      background: color, color:'#fff', border:'none',
      fontSize:13, fontWeight:700, cursor:'pointer',
      opacity: loading ? .7 : 1, marginTop:4,
      transition:'opacity .15s',
    }}>
      {loading ? 'Saving…' : children}
    </button>
  )
}
