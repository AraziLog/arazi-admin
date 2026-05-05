import React, { useState } from 'react'
import { useAuth } from '../App'

const PAGE_LABELS = {
  dashboard: 'Overview',
  shipments: 'Shipments',
  quotes:    'Quotes',
  carriers:  'Carrier APIs',
  calculator:'Rate Calculator',
  webhooks:  'Webhook Log',
  broadcast: 'Broadcast',
  referrals: 'Referrals',
}

export default function TopBar({ page, onLogout, onToggleSidebar }) {
  const { user, navigate } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header style={{
      height: 56,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      flexShrink: 0,
      position: 'relative',
      zIndex: 50,
    }}>
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        style={{ background:'none', border:'none', cursor:'pointer', padding:6, borderRadius:6, color:'var(--text-2)', display:'flex' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Breadcrumb */}
      <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--text-3)' }}>
        <span
          style={{ cursor:'pointer' }}
          onClick={() => navigate('dashboard')}
        >Dashboard</span>
        <span>›</span>
        <span style={{ color:'var(--text-1)', fontWeight:600 }}>{PAGE_LABELS[page] || 'Overview'}</span>
      </div>

      <div style={{ flex:1 }} />

      {/* Location pill */}
      <div style={{
        display:'flex', alignItems:'center', gap:6,
        fontSize:12, color:'var(--text-2)',
        background:'var(--surface-2)', padding:'5px 12px', borderRadius:99,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
        Spanish Town
      </div>

      {/* Quick Quote */}
      <button
        onClick={() => navigate('quotes')}
        style={{
          display:'flex', alignItems:'center', gap:6,
          fontSize:12, fontWeight:600, color:'var(--text-2)',
          background:'var(--surface-2)', padding:'5px 12px', borderRadius:99,
          border:'none', cursor:'pointer',
          transition:'all var(--transition)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        Quick Quote
      </button>

      {/* Settings */}
      <button style={{ background:'none', border:'none', cursor:'pointer', padding:6, borderRadius:6, color:'var(--text-3)', display:'flex' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>

      {/* User avatar */}
      <div style={{ position:'relative' }}>
        <button
          onClick={() => setShowUserMenu(v => !v)}
          style={{
            width:32, height:32, borderRadius:'50%',
            background:'linear-gradient(135deg,#1a56db,#7e3af2)',
            border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontSize:12, fontWeight:700,
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'A'}
        </button>
        {showUserMenu && (
          <div style={{
            position:'absolute', top:'calc(100% + 8px)', right:0,
            background:'var(--surface)', border:'1px solid var(--border)',
            borderRadius:'var(--radius)', boxShadow:'var(--shadow-lg)',
            minWidth:180, overflow:'hidden', zIndex:200,
          }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontWeight:600, fontSize:13 }}>{user?.name || 'Admin'}</div>
              <div style={{ color:'var(--text-3)', fontSize:11, marginTop:2 }}>{user?.email}</div>
            </div>
            <button
              onClick={() => { setShowUserMenu(false); onLogout() }}
              style={{
                width:'100%', padding:'10px 16px', textAlign:'left',
                background:'none', border:'none', cursor:'pointer',
                fontSize:13, color:'var(--danger)',
                display:'flex', alignItems:'center', gap:8,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
