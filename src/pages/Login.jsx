import React, { useState } from 'react'
import { saveAuth } from '../services/api'
export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const mockUser = { name: username || 'Admin', email: username, roles: ['administrator'] }
    saveAuth(username, password, mockUser)
    onLogin(mockUser)
    setLoading(false)
  }
  return (
    <div style={{ minHeight:'100vh', background:'var(--sidebar-bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ position:'absolute', inset:0, opacity:.04, backgroundImage:'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize:'28px 28px' }}/>
      <div style={{ width:420, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:20, padding:40, backdropFilter:'blur(20px)', boxShadow:'0 25px 50px rgba(0,0,0,.4)', position:'relative', animation:'fadeUp .4s ease' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:56, height:56, borderRadius:16, margin:'0 auto 16px', background:'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }><img src="https://s3.wasabisys.com/sethwan-logistics/public/c64f2663-c9dc-4c61-a5da-a40ebb9c613e/logo/whatsapp-image-2026-01-07-at-123541ef392e90-37wHscs4zNr6dHT0lbjRZ98OvMR-37x1eORZaBMBWOC3ZtBsk7FgLPW.jpg" alt="ARAZI Logistics" style={{width:'100%',height:'100%',objectFit:'contain'}}/></div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, color:'#fff' }}>ARAZI Logistics</div>
          <div style={{ color:'rgba(255,255,255,.4)', fontSize:13, marginTop:4 }}>Admin Panel</div>
        </div>
        <form onSubmit={handleLogin}>
          {[['Username or Email', username, setUsername, 'text', 'admin'], ['Password', password, setPassword, 'password', '••••••••']].map(([label, val, setter, type, ph]) => (
            <div key={label} style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'rgba(255,255,255,.5)', marginBottom:6 }}>{label}</label>
              <input type={type} value={val} onChange={e=>setter(e.target.value)} placeholder={ph} required
                style={{ width:'100%', padding:'11px 14px', borderRadius:8, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' }} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ width:'100%', padding:13, borderRadius:8, background:'linear-gradient(135deg,#1a56db,#1e40af)', color:'#fff', border:'none', fontSize:15, fontWeight:700, cursor:'pointer', marginTop:4, opacity:loading?.7:1 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          <div style={{ textAlign:'center', marginTop:16, fontSize:11, color:'rgba(255,255,255,.25)' }}>Demo: enter any credentials to preview the dashboard</div>
        </form>
      </div>
    </div>
  )
}
