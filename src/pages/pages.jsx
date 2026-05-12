// ── Quotes.jsx ────────────────────────────────────────────────────────────────
import React, { useState } from 'react'
import { MOCK_QUOTES } from '../services/api'
import { useAuth } from '../App'

export function Quotes() {
  const { notify } = useAuth()
  const [quotes] = useState(MOCK_QUOTES)
  const [filter, setFilter] = useState('')
  const [responding, setResponding] = useState(null)
  const [price, setPrice] = useState('')

  const filtered = quotes.filter(q => !filter || q.status === filter)

  const STATUS = { new:'New', quoted:'Quoted', accepted:'Accepted', declined:'Declined' }
  const SCOLOR = { new:'#1a56db', quoted:'#c27803', accepted:'#0e9f6e', declined:'#e02424' }

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, margin:0 }}>Quote Requests</h1>
          <p style={{ color:'var(--text-3)', fontSize:13, marginTop:4 }}>{filtered.length} quotes</p>
        </div>
      </div>

      {/* Status tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[['','All'],['new','New'],['quoted','Quoted'],['accepted','Accepted'],['declined','Declined']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding:'7px 18px', borderRadius:'var(--radius)', fontSize:13, fontWeight:600,
            border:'none', cursor:'pointer',
            background: filter===v ? 'var(--primary)' : 'var(--surface)',
            color: filter===v ? '#fff' : 'var(--text-2)',
            boxShadow: filter===v ? 'none' : 'var(--shadow-sm)',
          }}>{l}</button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
        {filtered.map(q => (
          <div key={q.id} className="card" style={{ padding:20, animation:'fadeUp .3s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div>
                <div style={{ fontFamily:'monospace', fontSize:12, color:'var(--text-3)' }}>{q.reference}</div>
                <div style={{ fontWeight:700, fontSize:15, marginTop:2 }}>{q.customer_name}</div>
              </div>
              <span style={{
                padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700,
                background: SCOLOR[q.status] + '18', color: SCOLOR[q.status],
              }}>{STATUS[q.status]}</span>
            </div>

            <div style={{ background:'var(--surface-2)', borderRadius:'var(--radius-sm)', padding:'10px 14px', marginBottom:14 }}>
              <div style={{ fontSize:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:'var(--text-2)' }}>{q.origin}</span>
                <span style={{ color:'var(--accent)' }}>→</span>
                <span style={{ color:'var(--text-2)' }}>{q.destination}</span>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:12, marginBottom:16 }}>
              <div style={{ color:'var(--text-3)' }}>Service</div>
              <div style={{ fontWeight:600, textTransform:'capitalize' }}>{q.service_type}</div>
              <div style={{ color:'var(--text-3)' }}>Weight</div>
              <div style={{ fontWeight:600 }}>{q.weight_kg} kg</div>
              {q.quoted_price && <>
                <div style={{ color:'var(--text-3)' }}>Quoted</div>
                <div style={{ fontWeight:700, color:'var(--success)' }}>${q.quoted_price}</div>
              </>}
              <div style={{ color:'var(--text-3)' }}>Received</div>
              <div style={{ fontWeight:600 }}>{new Date(q.created_at).toLocaleDateString()}</div>
            </div>

            {q.status === 'new' && (
              responding === q.id ? (
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input value={price} onChange={e=>setPrice(e.target.value)}
                    placeholder="USD price" type="number" min="0" step="0.01"
                    style={{ flex:1, padding:'7px 10px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13 }} />
                  <button onClick={()=>{ notify('Quote sent to customer'); setResponding(null); setPrice('') }}
                    style={{ background:'var(--success)', color:'#fff', border:'none', padding:'7px 14px', borderRadius:'var(--radius-sm)', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                    Send
                  </button>
                  <button onClick={()=>setResponding(null)}
                    style={{ background:'var(--surface-2)', color:'var(--text-2)', border:'none', padding:'7px 10px', borderRadius:'var(--radius-sm)', fontSize:12, cursor:'pointer' }}>
                    ✕
                  </button>
                </div>
              ) : (
                <button onClick={()=>setResponding(q.id)} style={{
                  width:'100%', padding:'8px', borderRadius:'var(--radius-sm)',
                  background:'var(--primary)', color:'#fff', border:'none',
                  fontSize:13, fontWeight:600, cursor:'pointer',
                }}>Respond with Quote</button>
              )
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:40, color:'var(--text-3)' }}>
            No quotes found.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Calculator.jsx ────────────────────────────────────────────────────────────
export function Calculator() {
  const [weight, setWeight]     = useState('')
  const [unit, setUnit]         = useState('lbs')
  const [value, setValue]       = useState('')
  const [tariff, setTariff]     = useState('')
  const [results, setResults]   = useState(null)
  const [loading, setLoading]   = useState(false)

  const TARIFFS = [
    { value:'', label:'None / General Cargo', surcharge:0 },
    { value:'ELECTRONICS', label:'Electronics', surcharge:5 },
    { value:'CLOTHING', label:'Clothing & Apparel', surcharge:2 },
    { value:'FOOD', label:'Food & Perishables', surcharge:8 },
    { value:'MACHINERY', label:'Machinery', surcharge:3 },
    { value:'HAZMAT', label:'Hazardous Materials', surcharge:15 },
    { value:'FURNITURE', label:'Furniture & Bulky', surcharge:4 },
    { value:'MEDICAL', label:'Medical/Pharma', surcharge:6 },
  ]

  const RATES = [
    { key:'sea',       name:'Sea Freight',    base:25, per_kg:3.5,  val_pct:2.0, days:'14–21', color:'#1a56db' },
    { key:'air',       name:'Air Freight',    base:45, per_kg:7.0,  val_pct:2.5, days:'3–5',   color:'#7e3af2' },
    { key:'express',   name:'Express',        base:75, per_kg:12.0, val_pct:3.0, days:'1–2',   color:'#E85D04' },
    { key:'last-mile', name:'Last-Mile',      base:15, per_kg:1.5,  val_pct:0.0, days:'1–3',   color:'#0e9f6e' },
  ]

  const calculate = () => {
    if (!weight || parseFloat(weight) <= 0) return
    setLoading(true)
    setTimeout(() => {
      const wKg    = unit === 'lbs' ? parseFloat(weight) * 0.453592 : parseFloat(weight)
      const val    = parseFloat(value) || 0
      const tc     = TARIFFS.find(t => t.value === tariff)
      const surch  = tc?.surcharge || 0

      const calced = RATES.map(r => {
        const sub   = r.base + wKg * r.per_kg + val * (r.val_pct / 100)
        const extra = sub * (surch / 100)
        const total = sub + extra
        const gct   = total * 0.15
        return { ...r, total: total + gct, subtotal: total, gct, wKg, breakdown: {
          base: r.base, weight_fee: +(wKg*r.per_kg).toFixed(2),
          value_fee: +(val*(r.val_pct/100)).toFixed(2), surcharge: +extra.toFixed(2), gct: +gct.toFixed(2)
        }}
      }).sort((a,b) => a.total - b.total)

      setResults({ items: calced, wKg: wKg.toFixed(2), wLbs: (wKg/0.453592).toFixed(2), value: val, tariff: tc?.label || 'None' })
      setLoading(false)
    }, 600)
  }

  return (
    <div style={{ animation:'fadeUp .3s ease', maxWidth:800 }}>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, marginBottom:6 }}>Rate Calculator</h1>
      <p style={{ color:'var(--text-3)', marginBottom:24 }}>Instant shipping cost estimates for all service types.</p>

      <div className="card" style={{ padding:28, marginBottom:24 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Package Weight</label>
            <div style={{ display:'flex', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', overflow:'hidden' }}>
              <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} min="0.1" step="0.1" placeholder="0.00"
                style={{ flex:1, padding:'10px 14px', border:'none', fontSize:14, outline:'none', background:'var(--surface)' }} />
              <div style={{ display:'flex', borderLeft:'1px solid var(--border)' }}>
                {['lbs','kg'].map(u => (
                  <button key={u} onClick={()=>setUnit(u)} style={{
                    padding:'0 14px', border:'none', fontSize:12, fontWeight:700, cursor:'pointer',
                    background: unit===u ? 'var(--primary)' : 'var(--surface-2)',
                    color: unit===u ? '#fff' : 'var(--text-2)',
                  }}>{u}</button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Package Value (USD)</label>
            <div style={{ display:'flex', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', overflow:'hidden' }}>
              <span style={{ padding:'10px 12px', background:'var(--surface-2)', borderRight:'1px solid var(--border)', fontSize:14, color:'var(--text-3)', fontWeight:700 }}>$</span>
              <input type="number" value={value} onChange={e=>setValue(e.target.value)} min="0" step="0.01" placeholder="0.00"
                style={{ flex:1, padding:'10px 14px', border:'none', fontSize:14, outline:'none', background:'var(--surface)' }} />
            </div>
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Tariff Code</label>
          <select value={tariff} onChange={e=>setTariff(e.target.value)} style={{
            width:'100%', padding:'10px 14px', border:'1px solid var(--border)',
            borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)',
          }}>
            {TARIFFS.map(t => <option key={t.value} value={t.value}>{t.label}{t.surcharge > 0 ? ` (+${t.surcharge}%)` : ''}</option>)}
          </select>
        </div>
        <button onClick={calculate} disabled={loading} style={{
          width:'100%', padding:14, background:'var(--primary)', color:'#fff',
          border:'none', borderRadius:'var(--radius)', fontSize:15, fontWeight:700, cursor:'pointer',
          opacity: loading ? .7 : 1,
        }}>{loading ? 'Calculating…' : 'Calculate Shipping Cost'}</button>
      </div>

      {results && (
        <div style={{ animation:'fadeUp .3s ease' }}>
          <div style={{ fontSize:13, color:'var(--text-3)', marginBottom:16 }}>
            {results.wLbs} lbs ({results.wKg} kg) · Value: ${results.value.toFixed(2)} · {results.tariff}
          </div>
          {results.items.map((r, i) => (
            <div key={r.key} className="card" style={{
              padding:'20px 24px', marginBottom:12,
              borderLeft:`4px solid ${r.color}`,
              animation:`fadeUp .3s ease ${i*60}ms both`,
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div>
                  {i === 0 && <span style={{ fontSize:10, fontWeight:800, color:r.color, background:r.color+'18', padding:'2px 8px', borderRadius:99, display:'inline-block', marginBottom:6, textTransform:'uppercase', letterSpacing:'.04em' }}>Best Value</span>}
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18 }}>{r.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>🕐 {r.days} business days</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:28 }}>${r.total.toFixed(2)}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)' }}>incl. 15% GCT</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, paddingTop:12, borderTop:'1px solid var(--border)' }}>
                {[
                  ['Base fee', `$${r.breakdown.base}`],
                  ['Weight fee', `$${r.breakdown.weight_fee}`],
                  ['Value fee', `$${r.breakdown.value_fee}`],
                  ['Tariff', `$${r.breakdown.surcharge}`],
                  ['GCT 15%', `$${r.breakdown.gct.toFixed(2)}`],
                ].map(([l,v]) => (
                  <div key={l}>
                    <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:2 }}>{l}</div>
                    <div style={{ fontSize:13, fontWeight:700 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p style={{ fontSize:11, color:'var(--text-3)', textAlign:'center', marginTop:12 }}>
            * Estimates in USD. 15% GCT included. Final price confirmed at booking.
          </p>
        </div>
      )}
    </div>
  )
}

// ── Carriers.jsx ──────────────────────────────────────────────────────────────
export function Carriers() {
  const { notify } = useAuth()
  const [editing, setEditing] = useState(null)
  const [slots] = useState([
    { slot:1, carrier:'', label:'', enabled:false },
    { slot:2, carrier:'', label:'', enabled:false },
    { slot:3, carrier:'shipave', label:'ShipAve', enabled:true, environment:'production', updated_at:new Date().toISOString() },
    { slot:4, carrier:'shipbiz', label:'ShipBiz', enabled:true, environment:'production', updated_at:new Date().toISOString() },
    { slot:5, carrier:'', label:'', enabled:false },
  ])

  const CARRIERS = {
    fedex:   { name:'FedEx',           color:'#4D148C', fields:['api_key','api_secret','account_number'] },
    dhl:     { name:'DHL Express',     color:'#FFCC00', fields:['api_key','account_number'] },
    ups:     { name:'UPS',             color:'#351C15', fields:['api_key','api_secret','account_number'] },
    usps:    { name:'USPS',            color:'#004B87', fields:['user_id'] },
    shipave: { name:'ShipAve',         color:'#00a651', fields:['api_key'] },
    shipbiz: { name:'ShipBiz',         color:'#0066cc', fields:['api_key'] },
    custom:  { name:'Custom Carrier',  color:'#E85D04', fields:['api_key','endpoint_url','carrier_name'] },
  }

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, marginBottom:6 }}>Carrier APIs</h1>
      <p style={{ color:'var(--text-3)', marginBottom:24 }}>Connect up to 5 carrier accounts for real-time tracking sync.</p>

      <div style={{ display:'grid', gap:14 }}>
        {slots.map(slot => {
          const meta = CARRIERS[slot.carrier]
          return (
            <div key={slot.slot} className="card" style={{
              padding:'18px 22px',
              borderLeft: `5px solid ${meta?.color || 'var(--border)'}`,
              animation:`fadeUp .3s ease ${slot.slot*50}ms both`,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ background:'var(--surface-2)', borderRadius:6, padding:'4px 10px', fontSize:10, fontWeight:800, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', flexShrink:0 }}>
                  SLOT {slot.slot}
                </div>
                <div style={{ flex:1 }}>
                  {meta ? (
                    <div>
                      <span style={{ fontWeight:700, fontSize:15 }}>{slot.label || meta.name}</span>
                      <span style={{ fontSize:12, color:'var(--text-3)', marginLeft:10 }}>{meta.name}</span>
                      {slot.environment && <span style={{ marginLeft:8, fontSize:11, background:'var(--surface-2)', padding:'2px 8px', borderRadius:99, color:'var(--text-2)' }}>{slot.environment}</span>}
                    </div>
                  ) : (
                    <span style={{ color:'var(--text-3)', fontStyle:'italic', fontSize:14 }}>Not configured</span>
                  )}
                </div>
                {meta && (
                  <span style={{
                    padding:'3px 12px', borderRadius:99, fontSize:11, fontWeight:700,
                    background: slot.enabled ? 'var(--success-soft)' : 'var(--surface-2)',
                    color: slot.enabled ? 'var(--success)' : 'var(--text-3)',
                  }}>{slot.enabled ? '● Active' : '○ Inactive'}</span>
                )}
                <button
                  onClick={() => { setEditing(slot); notify('Configure carrier in the WordPress admin under Settings → Carrier APIs') }}
                  style={{
                    padding:'7px 16px', borderRadius:'var(--radius-sm)', fontSize:12, fontWeight:600,
                    border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text-2)',
                    cursor:'pointer',
                  }}>{meta ? '✏️ Edit' : '+ Configure'}</button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card" style={{ marginTop:20, padding:20, background:'#fffbeb', borderColor:'#f59e0b' }}>
        <div style={{ fontWeight:700, fontSize:13, marginBottom:6 }}>⚙️ Carrier configuration is managed in WordPress</div>
        <p style={{ fontSize:13, color:'var(--text-2)', margin:0 }}>
          To add or edit API keys, go to your WordPress admin → Arazi Logistics → Settings → Carrier APIs.
          API credentials are stored securely on the server and never exposed to the browser.
        </p>
      </div>
    </div>
  )
}

// ── WebhookLog.jsx ────────────────────────────────────────────────────────────
export function WebhookLog() {
  const MOCK_LOG = Array.from({length:20}, (_,i) => ({
    time: new Date(Date.now() - i * 180000).toISOString(),
    source: i % 2 === 0 ? 'shipave' : 'shipbiz',
    event: ['processed','signature_failed','no_match','processed','processed','replay_rejected'][i%6],
    data: {
      shipment_id: i % 2 === 0 ? 100+i : null,
      carrier_tn: `TRK${100000+i}`,
      status: ['in_transit','out_for_delivery','delivered'][i%3],
    }
  }))

  const EVENT_STYLE = {
    processed:          { color:'#0e9f6e', bg:'#ecfdf5', icon:'✅' },
    signature_failed:   { color:'#e02424', bg:'#fef2f2', icon:'🔴' },
    no_match:           { color:'#c27803', bg:'#fffbeb', icon:'🟡' },
    no_tracking_number: { color:'#c27803', bg:'#fffbeb', icon:'🟡' },
    replay_rejected:    { color:'#e02424', bg:'#fef2f2', icon:'🔴' },
    rejected:           { color:'#7e3af2', bg:'#f5f3ff', icon:'🟠' },
  }

  const saActive = true
  const sbActive = true

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, margin:0 }}>Webhook Log</h1>
          <p style={{ color:'var(--text-3)', fontSize:13, marginTop:4 }}>Real-time push events from ShipAve &amp; ShipBiz</p>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--surface)', padding:'8px 16px', borderRadius:'var(--radius)', border:'1px solid var(--border)', fontSize:13 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background: saActive ? 'var(--success)' : 'var(--text-3)', display:'inline-block' }}/>
            ShipAve {saActive ? 'Active' : 'Inactive'}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--surface)', padding:'8px 16px', borderRadius:'var(--radius)', border:'1px solid var(--border)', fontSize:13 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background: sbActive ? 'var(--success)' : 'var(--text-3)', display:'inline-block' }}/>
            ShipBiz {sbActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
                {['Time','Source','Event','Data'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:800, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_LOG.map((row, i) => {
                const es = EVENT_STYLE[row.event] || { color:'var(--text-2)', bg:'var(--surface-2)', icon:'ℹ️' }
                return (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border-light)' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding:'10px 16px', color:'var(--text-3)', whiteSpace:'nowrap', fontSize:12 }}>
                      {new Date(row.time).toLocaleString()}
                    </td>
                    <td style={{ padding:'10px 16px' }}>
                      <span style={{ fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:'.06em',
                        color: row.source==='shipave' ? '#00a651' : '#0066cc' }}>
                        {row.source}
                      </span>
                    </td>
                    <td style={{ padding:'10px 16px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:es.bg, color:es.color }}>
                        {es.icon} {row.event}
                      </span>
                    </td>
                    <td style={{ padding:'10px 16px', fontFamily:'monospace', fontSize:11, color:'var(--text-3)' }}>
                      {Object.entries(row.data).filter(([,v])=>v!=null).map(([k,v])=>`${k}: ${v}`).join('  ·  ')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Login.jsx ─────────────────────────────────────────────────────────────────
export function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [appPass,  setAppPass]  = useState('')
  const [step, setStep]         = useState('login')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [userData, setUserData] = useState(null)

  const { saveAuth } = require('../services/api')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { login, saveAuth } = await import('../services/api')
      const res = await login(username, password)
      if (res.success) { setUserData(res); setStep('apppassword') }
      else setError(res.message || 'Invalid credentials')
    } catch (err) {
      // Demo mode — allow login with any credentials
      const mockUser = { name: username || 'Admin', email: username, roles: ['administrator'] }
      saveAuth(username, password, mockUser)
      onLogin(mockUser)
    }
    setLoading(false)
  }

  const handleAppPass = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { saveAuth } = await import('../services/api')
      saveAuth(username, appPass, userData)
      onLogin(userData)
    } catch {
      setError('Failed to save credentials')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight:'100vh', background:'var(--sidebar-bg)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:20, fontFamily:'var(--font-body)',
    }}>
      {/* Background pattern */}
      <div style={{ position:'absolute', inset:0, opacity:.04, backgroundImage:'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize:'28px 28px' }}/>

      <div style={{
        width:420, background:'rgba(255,255,255,.05)',
        border:'1px solid rgba(255,255,255,.1)', borderRadius:20,
        padding:40, backdropFilter:'blur(20px)',
        boxShadow:'0 25px 50px rgba(0,0,0,.4)',
        position:'relative', animation:'fadeUp .4s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{
            width:56, height:56, borderRadius:16, margin:'0 auto 16px',
            background:'linear-gradient(135deg, #1a56db, #E85D04)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--font-display)', fontWeight:800, color:'#fff', fontSize:20,
          }}>AL</div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, color:'#fff' }}>ARAZI Logistics</div>
          <div style={{ color:'rgba(255,255,255,.4)', fontSize:13, marginTop:4 }}>
            {step === 'login' ? 'Sign in to your admin panel' : 'Set up API access'}
          </div>
        </div>

        {step === 'login' ? (
          <form onSubmit={handleLogin}>
            <Field label="Username or Email" value={username} onChange={setUsername} placeholder="admin" />
            <Field label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
            {error && <div style={{ color:'#f87171', fontSize:12, marginBottom:12, textAlign:'center' }}>{error}</div>}
            <SubmitBtn loading={loading}>Sign In</SubmitBtn>
            <div style={{ textAlign:'center', marginTop:16, fontSize:12, color:'rgba(255,255,255,.3)' }}>
              Demo mode: enter any credentials to preview
            </div>
          </form>
        ) : (
          <form onSubmit={handleAppPass}>
            <div style={{ background:'rgba(255,255,255,.07)', borderRadius:10, padding:16, marginBottom:20, fontSize:13, color:'rgba(255,255,255,.6)', lineHeight:1.6 }}>
              <strong style={{ color:'#fff' }}>One more step.</strong> For security, this app uses WordPress Application Passwords.
              Go to <strong style={{ color:'#60a5fa' }}>WP Admin → Profile → Application Passwords</strong>, create one named "Arazi Admin", then paste it below.
            </div>
            <Field label="Application Password" value={appPass} onChange={setAppPass} type="password" placeholder="xxxx xxxx xxxx xxxx xxxx xxxx" />
            {error && <div style={{ color:'#f87171', fontSize:12, marginBottom:12 }}>{error}</div>}
            <SubmitBtn loading={loading}>Complete Setup</SubmitBtn>
            <button type="button" onClick={() => setStep('login')} style={{ width:'100%', marginTop:10, background:'none', border:'none', color:'rgba(255,255,255,.3)', fontSize:13, cursor:'pointer' }}>← Back</button>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type='text', placeholder }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'rgba(255,255,255,.5)', marginBottom:6 }}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required
        style={{
          width:'100%', padding:'11px 14px', borderRadius:8,
          background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)',
          color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box',
        }} />
    </div>
  )
}

function SubmitBtn({ children, loading }) {
  return (
    <button type="submit" disabled={loading} style={{
      width:'100%', padding:13, borderRadius:8,
      background:'linear-gradient(135deg,#1a56db,#1e40af)',
      color:'#fff', border:'none', fontSize:15, fontWeight:700,
      cursor:'pointer', marginTop:4,
      opacity: loading ? .7 : 1,
    }}>{loading ? 'Please wait…' : children}</button>
  )
}

import { useState } from 'react'
import { useAuth } from '../App'
