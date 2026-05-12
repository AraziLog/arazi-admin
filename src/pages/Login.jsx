import React, { useState } from 'react'
import { saveAuth } from '../services/api'

const LOGO_URL = 'https://s3.wasabisys.com/sethwan-logistics/public/c64f2663-c9dc-4c61-a5da-a40ebb9c613e/logo/whatsapp-image-2026-01-07-at-123541ef392e90-37wHscs4zNr6dHT0lbjRZ98OvMR-37x1eORZaBMBWOC3ZtBsk7FgLPW.jpg'
const WP_BASE = import.meta.env.VITE_WP_URL || 'https://therealtest.mywebz.lat'

export default function Login({ onLogin }) {
  const [step, setStep]         = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [appPass, setAppPass]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [userData, setUserData] = useState(null)
  const [showPass, setShowPass] = useState(false)
  const [showApp, setShowApp]   = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await fetch(`${WP_BASE}/wp-json/arazi/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setUserData(data)
        setStep('apppassword')
      } else {
        setError(data.message || 'Invalid username or password.')
      }
    } catch {
      setError(`Cannot connect to WordPress at ${WP_BASE}. Make sure the site is live and the Arazi plugin is activated.`)
    }
    setLoading(false)
  }

  const handleAppPass = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const cleaned = appPass.trim()
    if (!cleaned) { setError('Please enter your Application Password.'); setLoading(false); return }
    try {
      const res  = await fetch(`${WP_BASE}/wp-json/arazi/v1/profile`, {
        headers: { 'Authorization': `Basic ${btoa(`${username}:${cleaned}`)}` },
      })
      const data = await res.json()
      if (res.ok && data.id) {
        const user = { name: data.name || username, email: data.email || username, roles: data.roles || [], avatar_url: data.avatar_url || '' }
        saveAuth(username, cleaned, user)
        onLogin(user)
      } else {
        setError('Application Password is incorrect. Please check and try again.')
      }
    } catch {
      setError('Connection failed. Check your WordPress URL and plugin status.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ position:'absolute', inset:0, opacity:.04, backgroundImage:'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize:'28px 28px' }}/>
      <div style={{ width:440, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:20, padding:40, backdropFilter:'blur(20px)', boxShadow:'0 25px 50px rgba(0,0,0,.4)', position:'relative', animation:'fadeUp .4s ease' }}>

        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:80, height:80, borderRadius:16, margin:'0 auto 14px', background:'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
            <img src={LOGO_URL} alt="ARAZI Logistics" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
          </div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, color:'#fff' }}>ARAZI Logistics</div>
          <div style={{ color:'rgba(255,255,255,.4)', fontSize:13, marginTop:4 }}>Admin Panel</div>
          <div style={{ color:'rgba(255,255,255,.2)', fontSize:10, marginTop:6, fontFamily:'monospace' }}>{WP_BASE}</div>
        </div>

        {step === 'login' && (
          <form onSubmit={handleLogin}>
            <Field label="WordPress Username" value={username} onChange={setUsername} placeholder="admin" show={true} />
            <PasswordField label="WordPress Password" value={password} onChange={setPassword} placeholder="••••••••" show={showPass} onToggle={() => setShowPass(v=>!v)} />
            {error && <ErrorBox>{error}</ErrorBox>}
            <SubmitBtn loading={loading} color="linear-gradient(135deg,#1a56db,#1e40af)">Continue →</SubmitBtn>
            <div style={{ textAlign:'center', marginTop:14, fontSize:11, color:'rgba(255,255,255,.2)' }}>Your WordPress admin credentials</div>
          </form>
        )}

        {step === 'apppassword' && (
          <form onSubmit={handleAppPass}>
            <div style={{ background:'rgba(26,86,219,.2)', border:'1px solid rgba(26,86,219,.3)', borderRadius:10, padding:14, marginBottom:20 }}>
              <div style={{ color:'#93c5fd', fontWeight:700, fontSize:13, marginBottom:4 }}>✓ Verified as {userData?.name || username}</div>
              <div style={{ color:'rgba(255,255,255,.45)', fontSize:12 }}>Now set up API access with an Application Password.</div>
            </div>

            <div style={{ background:'rgba(255,255,255,.05)', borderRadius:10, padding:16, marginBottom:20, fontSize:12, color:'rgba(255,255,255,.45)', lineHeight:1.9 }}>
              <strong style={{ color:'rgba(255,255,255,.75)', display:'block', marginBottom:8 }}>Get your Application Password:</strong>
              <span style={{ color:'rgba(255,255,255,.3)', fontSize:11 }}>1.</span> Open a new tab → go to wp-admin → Users → Profile<br/>
              <span style={{ color:'rgba(255,255,255,.3)', fontSize:11 }}>2.</span> Scroll to <strong style={{ color:'rgba(255,255,255,.65)' }}>Application Passwords</strong><br/>
              <span style={{ color:'rgba(255,255,255,.3)', fontSize:11 }}>3.</span> Name: <strong style={{ color:'rgba(255,255,255,.65)' }}>Arazi Dashboard</strong> → Add New<br/>
              <span style={{ color:'rgba(255,255,255,.3)', fontSize:11 }}>4.</span> Copy the password and paste it below
            </div>

            <PasswordField label="Application Password" value={appPass} onChange={setAppPass} placeholder="xxxx xxxx xxxx xxxx xxxx xxxx" show={showApp} onToggle={() => setShowApp(v=>!v)} mono={true} />
            {error && <ErrorBox>{error}</ErrorBox>}
            <SubmitBtn loading={loading} color="linear-gradient(135deg,#0e9f6e,#047857)">✓ Connect to WordPress</SubmitBtn>
            <button type="button" onClick={() => { setStep('login'); setError(''); setAppPass('') }}
              style={{ width:'100%', marginTop:10, background:'none', border:'none', color:'rgba(255,255,255,.25)', fontSize:13, cursor:'pointer', padding:8 }}>
              ← Back
            </button>
          </form>
        )}

      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'rgba(255,255,255,.5)', marginBottom:6 }}>{label}</label>
      <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required autoCapitalize="none"
        style={{ width:'100%', padding:'11px 14px', borderRadius:8, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' }} />
    </div>
  )
}

function PasswordField({ label, value, onChange, placeholder, show, onToggle, mono=false }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'rgba(255,255,255,.5)', marginBottom:6 }}>{label}</label>
      <div style={{ position:'relative' }}>
        <input type={show?'text':'password'} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required
          style={{ width:'100%', padding:'11px 44px 11px 14px', borderRadius:8, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', color:'#fff', fontSize: mono ? 13 : 14, fontFamily: mono ? 'monospace' : 'inherit', letterSpacing: mono ? '.05em' : 'normal', outline:'none', boxSizing:'border-box' }} />
        <button type="button" onClick={onToggle}
          style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16, color:'rgba(255,255,255,.35)' }}>
          {show ? '🙈' : '👁'}
        </button>
      </div>
    </div>
  )
}

function ErrorBox({ children }) {
  return (
    <div style={{ background:'rgba(239,68,68,.15)', border:'1px solid rgba(239,68,68,.3)', borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:12, color:'#fca5a5', lineHeight:1.5 }}>
      {children}
    </div>
  )
}

function SubmitBtn({ children, loading, color }) {
  return (
    <button type="submit" disabled={loading}
      style={{ width:'100%', padding:13, borderRadius:8, background: color, color:'#fff', border:'none', fontSize:15, fontWeight:700, cursor:'pointer', marginTop:4, opacity: loading ? .7 : 1 }}>
      {loading ? 'Please wait…' : children}
    </button>
  )
}
