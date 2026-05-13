import React, { useState } from 'react'

const LOGO_URL = 'https://s3.wasabisys.com/sethwan-logistics/public/c64f2663-c9dc-4c61-a5da-a40ebb9c613e/logo/whatsapp-image-2026-01-07-at-123541ef392e90-37wHscs4zNr6dHT0lbjRZ98OvMR-37x1eORZaBMBWOC3ZtBsk7FgLPW.jpg'

const NAV = [
  { section: 'MAIN' },
  { id:'dashboard',  label:'Dashboard',    icon: <DashIcon /> },
  { id:'pos',        label:'Point of Sale',icon: <PosIcon /> },
  { id:'customers',  label:'Customers',    icon: <CustIcon /> },
  { section: 'MANAGEMENT' },
  { id:'shipments',  label:'Shipments',    icon: <ShipIcon /> },
  { id:'quotes',     label:'Quotes',       icon: <QuoteIcon /> },
  { id:'carriers',   label:'Carriers',     icon: <CarrierIcon /> },
  { id:'calculator', label:'Calculator',   icon: <CalcIcon /> },
  { section: 'MONITORING' },
  { id:'webhooks',   label:'Webhooks',     icon: <WebhookIcon />, badge: 'Live' },
  { section: 'MARKETING' },
  { id:'broadcast',  label:'Broadcast',    icon: <BroadIcon /> },
  { id:'referrals',  label:'Referrals',    icon: <RefIcon />, badge: 'New' },
]

export default function Sidebar({ activePage, onNavigate, isOpen }) {
  return (
    <aside style={{
      width: isOpen ? '240px' : '64px',
      minWidth: isOpen ? '240px' : '64px',
      background: 'var(--sidebar-bg)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      transition: 'width 250ms cubic-bezier(.4,0,.2,1), min-width 250ms cubic-bezier(.4,0,.2,1)',
      position: 'relative',
      zIndex: 100,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'flex-start' : 'center',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        minHeight: 64,
        overflow: 'hidden',
      }}>
        <img
          src={LOGO_URL}
          alt="ARAZI Logistics"
          style={{
            height: 40,
            width: isOpen ? 'auto' : 36,
            maxWidth: isOpen ? 180 : 36,
            objectFit: 'contain',
            flexShrink: 0,
            transition: 'all 250ms ease',
            borderRadius: 6,
          }}
        />
        {isOpen && (
          <div style={{ marginLeft: 10, overflow: 'hidden' }}>
            <div style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, lineHeight: 1.2, whiteSpace: 'nowrap' }}>ARAZI Logistics</div>
            <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 10, marginTop: 1 }}>Admin Panel</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px 8px' }}>
        {NAV.map((item, i) => {
          if (item.section) {
            return isOpen ? (
              <div key={i} style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
                color: 'rgba(255,255,255,.25)', padding: '16px 10px 6px',
                textTransform: 'uppercase',
              }}>{item.section}</div>
            ) : <div key={i} style={{ height: 16 }} />
          }

          const isActive  = activePage === item.id
          
const clickable = ['dashboard','pos','customers','shipments','quotes','carriers','calculator','webhooks','profile','addshipment'].includes(item.id)
                    return (
            <div
              key={item.id}
              onClick={() => clickable && onNavigate(item.id)}
              title={!isOpen ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                borderRadius: 8,
                cursor: clickable ? 'pointer' : 'default',
                marginBottom: 2,
                background: isActive ? 'rgba(26,86,219,.25)' : 'transparent',
                color: isActive ? '#fff' : 'var(--sidebar-text)',
                transition: 'all var(--transition)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,.06)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: '0 3px 3px 0',
                  background: '#1a56db',
                }} />
              )}
              <span style={{ flexShrink: 0, display: 'flex', opacity: isActive ? 1 : .6 }}>
                {item.icon}
              </span>
              {isOpen && (
                <>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, flex: 1, whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 7px',
                      borderRadius: 99, letterSpacing: '.04em',
                      background: item.badge === 'Live' ? 'rgba(14,159,110,.25)' : 'rgba(26,86,219,.3)',
                      color: item.badge === 'Live' ? '#0e9f6e' : '#60a5fa',
                    }}>{item.badge}</span>
                  )}
                </>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom user */}
      <div style={{
        padding: '12px 10px',
        borderTop: '1px solid rgba(255,255,255,.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        overflow: 'hidden',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'linear-gradient(135deg,#1a56db,#7e3af2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}>CN</div>
        {isOpen && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Ranne...</div>
            <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 10 }}>support...</div>
          </div>
        )}
      </div>
    </aside>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function DashIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function PosIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> }
function CustIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
function ShipIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> }
function QuoteIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> }
function CarrierIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 17H5a2 2 0 0 0-2 2"/><path d="M15 17h4a2 2 0 0 1 2 2"/><path d="M12 17V3"/><path d="m8 7-4 4 4 4"/><path d="m16 7 4 4-4 4"/></svg> }
function CalcIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg> }
function WebhookIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 16.98h-5.99c-1.1 0-1.95.68-2.23 1.61"/><circle cx="9" cy="22" r="2"/><path d="M9 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M9 12v3.99"/><path d="M15 9.4a6.5 6.5 0 0 1 .24 9.5"/></svg> }
function BroadIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07"/><path d="M11 11a5 5 0 0 1 7.54.54l3-3a17 17 0 0 0-18.09-.98"/><polyline points="1 1 23 23"/></svg> }
function RefIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> }

function PkgIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> }
function RecvIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> }
function UnkIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> }
