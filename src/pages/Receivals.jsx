import React, { useState } from 'react'
import { useAuth } from '../App'

const MOCK_RECEIVALS = [
  { id:1,  ref:'RCV-001', date:'2026-05-12', packages:4,  total_weight_lbs:12.5, carrier:'ShipAve',  origin:'Miami, FL',    status:'processed',  handler:'Duane F.',  notes:'All packages in good condition' },
  { id:2,  ref:'RCV-002', date:'2026-05-11', packages:7,  total_weight_lbs:34.2, carrier:'ShipBiz',  origin:'New York, NY', status:'processing', handler:'Ranne C.',  notes:'2 packages require inspection' },
  { id:3,  ref:'RCV-003', date:'2026-05-10', packages:2,  total_weight_lbs:8.1,  carrier:'ShipAve',  origin:'Miami, FL',    status:'processed',  handler:'Duane F.',  notes:'' },
  { id:4,  ref:'RCV-004', date:'2026-05-09', packages:11, total_weight_lbs:67.3, carrier:'FedEx',    origin:'Los Angeles',  status:'processed',  handler:'Ranne C.',  notes:'Heavy cargo — forklifted' },
  { id:5,  ref:'RCV-005', date:'2026-05-08', packages:3,  total_weight_lbs:5.4,  carrier:'ShipBiz',  origin:'Toronto, CA',  status:'processed',  handler:'Duane F.',  notes:'' },
  { id:6,  ref:'RCV-006', date:'2026-05-07', packages:6,  total_weight_lbs:22.8, carrier:'DHL',      origin:'London, UK',   status:'processed',  handler:'Ranne C.',  notes:'International — customs cleared' },
  { id:7,  ref:'RCV-007', date:'2026-05-06', packages:1,  total_weight_lbs:1.2,  carrier:'ShipAve',  origin:'Miami, FL',    status:'pending',    handler:'',          notes:'Awaiting customer pickup' },
]

const STATUS_COLOR = { pending:'#c27803', processing:'#1a56db', processed:'#0e9f6e' }
const STATUS_LABEL = { pending:'Pending', processing:'Processing', processed:'Processed' }

export default function Receivals({ onNavigate }) {
  const { notify } = useAuth()
  const [receivals] = useState(MOCK_RECEIVALS)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('')
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ carrier:'ShipAve', origin:'Miami, FL', packages:'', total_weight_lbs:'', notes:'' })

  const filtered = receivals.filter(r => {
    const matchStatus = !filter || r.status === filter
    const matchSearch = !search || [r.ref, r.carrier, r.origin, r.handler]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  const totalPkgs    = receivals.reduce((s,r) => s+r.packages, 0)
  const totalWeight  = receivals.reduce((s,r) => s+r.total_weight_lbs, 0)
  const todayCount   = receivals.filter(r => r.date === '2026-05-12').length

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, margin:0 }}>Receivals</h1>
          <p style={{ color:'var(--text-3)', fontSize:13, marginTop:4 }}>Log incoming shipments received at your warehouse</p>
        </div>
        <button onClick={() => setShowForm(true)}
          style={{ background:'var(--primary)', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'var(--radius)', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          + Log Receival
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Total Receivals', value: receivals.length,        color:'var(--primary)' },
          { label:'Received Today',  value: todayCount,              color:'var(--success)' },
          { label:'Total Packages',  value: totalPkgs,               color:'var(--purple)' },
          { label:'Total Weight',    value: totalWeight.toFixed(1)+' lbs', color:'var(--accent)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:'16px 18px', borderTop:`3px solid ${s.color}` }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:26, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, color:'var(--text-3)', marginTop:4, textTransform:'uppercase', letterSpacing:'.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding:'14px 18px', marginBottom:18, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by reference, carrier, origin…"
            style={{ width:'100%', paddingLeft:34, paddingRight:12, paddingTop:8, paddingBottom:8, border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, outline:'none', background:'var(--surface)', color:'var(--text-1)', boxSizing:'border-box' }} />
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[['','All'],...Object.entries(STATUS_LABEL)].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{ padding:'5px 14px', borderRadius:99, fontSize:12, fontWeight:600, border:`1px solid ${filter===v&&v?STATUS_COLOR[v]:'var(--border)'}`, background:filter===v?(v?STATUS_COLOR[v]+'18':'var(--primary-soft)'):'transparent', color:filter===v?(v?STATUS_COLOR[v]:'var(--primary)'):'var(--text-2)', cursor:'pointer' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
                {['Reference','Date','Carrier','Origin','Packages','Weight','Handler','Status','Notes','Actions'].map(h=>(
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:800, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r=>(
                <tr key={r.id} style={{ borderBottom:'1px solid var(--border-light)' }} onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'12px 14px' }}><span style={{ fontFamily:'monospace', fontWeight:700, color:'var(--primary)', fontSize:12 }}>{r.ref}</span></td>
                  <td style={{ padding:'12px 14px', color:'var(--text-2)', fontSize:12 }}>{new Date(r.date).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})}</td>
                  <td style={{ padding:'12px 14px', fontWeight:600 }}>{r.carrier}</td>
                  <td style={{ padding:'12px 14px', color:'var(--text-2)' }}>{r.origin}</td>
                  <td style={{ padding:'12px 14px', textAlign:'center', fontWeight:700, color:'var(--primary)' }}>{r.packages}</td>
                  <td style={{ padding:'12px 14px', color:'var(--text-2)' }}>{r.total_weight_lbs} lbs</td>
                  <td style={{ padding:'12px 14px', color:'var(--text-2)' }}>{r.handler || '—'}</td>
                  <td style={{ padding:'12px 14px' }}><span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:STATUS_COLOR[r.status]+'18', color:STATUS_COLOR[r.status] }}>{STATUS_LABEL[r.status]}</span></td>
                  <td style={{ padding:'12px 14px', color:'var(--text-3)', fontSize:12, maxWidth:160 }}>{r.notes || '—'}</td>
                  <td style={{ padding:'12px 14px' }}><button onClick={()=>setSelected(r)} style={{ padding:'4px 10px', borderRadius:'var(--radius-sm)', fontSize:11, fontWeight:600, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text-2)', cursor:'pointer' }}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Receival form modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }} onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div style={{ background:'var(--surface)', borderRadius:'var(--radius-lg)', width:500, maxWidth:'95vw', boxShadow:'var(--shadow-lg)', animation:'fadeUp .2s ease' }}>
            <div style={{ background:'var(--sidebar-bg)', padding:'18px 24px', borderRadius:'var(--radius-lg) var(--radius-lg) 0 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:17, color:'#fff' }}>Log New Receival</div>
              <button onClick={()=>setShowForm(false)} style={{ background:'rgba(255,255,255,.1)', border:'none', color:'#fff', width:28, height:28, borderRadius:'50%', cursor:'pointer', fontSize:16 }}>×</button>
            </div>
            <div style={{ padding:24 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Carrier</label>
                  <select value={form.carrier} onChange={e=>setForm(p=>({...p,carrier:e.target.value}))}
                    style={{ width:'100%', padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)' }}>
                    {['ShipAve','ShipBiz','FedEx','DHL','UPS','USPS','Other'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Origin</label>
                  <input value={form.origin} onChange={e=>setForm(p=>({...p,origin:e.target.value}))} placeholder="Miami, FL"
                    style={{ width:'100%', padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Number of Packages</label>
                  <input type="number" value={form.packages} onChange={e=>setForm(p=>({...p,packages:e.target.value}))} placeholder="0"
                    style={{ width:'100%', padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Total Weight (lbs)</label>
                  <input type="number" value={form.total_weight_lbs} onChange={e=>setForm(p=>({...p,total_weight_lbs:e.target.value}))} placeholder="0.0"
                    style={{ width:'100%', padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)', boxSizing:'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Notes</label>
                <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} rows={3} placeholder="Any special notes about this receival…"
                  style={{ width:'100%', padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)', resize:'vertical', boxSizing:'border-box' }} />
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={()=>{ notify('Receival logged successfully'); setShowForm(false) }}
                  style={{ flex:1, padding:'11px', borderRadius:'var(--radius-sm)', background:'var(--primary)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  Log Receival
                </button>
                <button onClick={()=>setShowForm(false)}
                  style={{ flex:1, padding:'11px', borderRadius:'var(--radius-sm)', background:'var(--surface-2)', color:'var(--text-2)', border:'1px solid var(--border)', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
