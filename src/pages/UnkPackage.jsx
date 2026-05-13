import React, { useState } from 'react'
import { useAuth } from '../App'

const MOCK_UNK = [
  { id:1, ref:'UNK-001', received_date:'2026-05-12', carrier:'ShipAve',  weight_lbs:3.2,  description:'Brown box — Nike logo',           origin:'Miami, FL',    photo:null, status:'unmatched', notes:'No label inside' },
  { id:2, ref:'UNK-002', received_date:'2026-05-12', carrier:'ShipBiz',  weight_lbs:12.5, description:'Large flat box — electronics',     origin:'New York, NY', photo:null, status:'unmatched', notes:'Fragile sticker' },
  { id:3, ref:'UNK-003', received_date:'2026-05-11', carrier:'FedEx',    weight_lbs:1.1,  description:'Small envelope — documents',       origin:'Toronto, CA',  photo:null, status:'matched',   notes:'Matched to Marcus Brown' },
  { id:4, ref:'UNK-004', received_date:'2026-05-11', carrier:'ShipAve',  weight_lbs:6.7,  description:'Black bag — clothing items',       origin:'Miami, FL',    photo:null, status:'unmatched', notes:'' },
  { id:5, ref:'UNK-005', received_date:'2026-05-10', carrier:'DHL',      weight_lbs:22.0, description:'Heavy crate — machinery parts',    origin:'London, UK',   photo:null, status:'matched',   notes:'Matched to Devon Campbell' },
  { id:6, ref:'UNK-006', received_date:'2026-05-09', carrier:'ShipBiz',  weight_lbs:2.3,  description:'Padded envelope — jewelry box',   origin:'New York, NY', photo:null, status:'returned',  notes:'Customer not found — returned' },
]

const STATUS_COLOR = { unmatched:'#c27803', matched:'#0e9f6e', returned:'#e02424' }
const STATUS_LABEL = { unmatched:'Unmatched', matched:'Matched', returned:'Returned' }

export default function UnkPackage({ onNavigate }) {
  const { notify } = useAuth()
  const [packages] = useState(MOCK_UNK)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('')
  const [selected, setSelected]   = useState(null)
  const [matchEmail, setMatchEmail] = useState('')

  const filtered = packages.filter(p => {
    const matchStatus = !filter || p.status === filter
    const matchSearch = !search || [p.ref, p.carrier, p.description, p.origin]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  const unmatchedCount = packages.filter(p => p.status === 'unmatched').length
  const matchedCount   = packages.filter(p => p.status === 'matched').length

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, margin:0 }}>Unknown Packages</h1>
          <p style={{ color:'var(--text-3)', fontSize:13, marginTop:4 }}>Packages received without a customer match</p>
        </div>
        <button onClick={() => notify('Log unknown package coming soon')}
          style={{ background:'var(--primary)', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'var(--radius)', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          + Log Unknown
        </button>
      </div>

      {/* Alert banner if there are unmatched packages */}
      {unmatchedCount > 0 && (
        <div style={{ padding:'14px 18px', background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:'var(--radius)', marginBottom:20, display:'flex', alignItems:'center', gap:12, fontSize:13 }}>
          <span style={{ fontSize:20 }}>⚠️</span>
          <div>
            <strong style={{ color:'#92400e' }}>{unmatchedCount} unmatched {unmatchedCount===1?'package':'packages'}</strong>
            <span style={{ color:'#92400e' }}> — these need to be matched to a customer or returned.</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Total Unknown',  value: packages.length,   color:'var(--primary)' },
          { label:'Unmatched',      value: unmatchedCount,    color:'var(--warning)' },
          { label:'Matched',        value: matchedCount,      color:'var(--success)' },
          { label:'Returned',       value: packages.filter(p=>p.status==='returned').length, color:'var(--danger)' },
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
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by reference, carrier, description…"
            style={{ width:'100%', paddingLeft:34, paddingRight:12, paddingTop:8, paddingBottom:8, border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, outline:'none', background:'var(--surface)', color:'var(--text-1)', boxSizing:'border-box' }} />
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[['','All'],...Object.entries(STATUS_LABEL)].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{ padding:'5px 14px', borderRadius:99, fontSize:12, fontWeight:600, border:`1px solid ${filter===v&&v?STATUS_COLOR[v]:'var(--border)'}`, background:filter===v?(v?STATUS_COLOR[v]+'18':'var(--primary-soft)'):'transparent', color:filter===v?(v?STATUS_COLOR[v]:'var(--primary)'):'var(--text-2)', cursor:'pointer' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Cards grid for unmatched */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
        {filtered.map(p=>(
          <div key={p.id} className="card" style={{ padding:20, borderLeft:`4px solid ${STATUS_COLOR[p.status]}`, animation:'fadeUp .3s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div>
                <div style={{ fontFamily:'monospace', fontWeight:700, color:'var(--primary)', fontSize:13 }}>{p.ref}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{new Date(p.received_date).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})}</div>
              </div>
              <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:STATUS_COLOR[p.status]+'18', color:STATUS_COLOR[p.status] }}>{STATUS_LABEL[p.status]}</span>
            </div>

            <div style={{ background:'var(--surface-2)', borderRadius:'var(--radius-sm)', padding:'10px 14px', marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text-1)', marginBottom:4 }}>{p.description}</div>
              <div style={{ display:'flex', gap:16, fontSize:12, color:'var(--text-3)' }}>
                <span>📦 {p.weight_lbs} lbs</span>
                <span>🚚 {p.carrier}</span>
                <span>📍 {p.origin}</span>
              </div>
            </div>

            {p.notes && <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:14, fontStyle:'italic' }}>{p.notes}</div>}

            {p.status === 'unmatched' ? (
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', marginBottom:6 }}>Match to customer:</div>
                <div style={{ display:'flex', gap:8 }}>
                  <input
                    placeholder="Customer email…"
                    style={{ flex:1, padding:'8px 10px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:12, background:'var(--surface)', color:'var(--text-1)', outline:'none' }}
                    onChange={e=>setMatchEmail(e.target.value)}
                  />
                  <button onClick={()=>notify('Package matched to customer')}
                    style={{ padding:'8px 14px', borderRadius:'var(--radius-sm)', background:'var(--success)', color:'#fff', border:'none', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                    Match
                  </button>
                </div>
                <button onClick={()=>notify('Package marked for return')}
                  style={{ width:'100%', marginTop:8, padding:'8px', borderRadius:'var(--radius-sm)', background:'var(--danger-soft)', color:'var(--danger)', border:'1px solid #fca5a5', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                  Return to Sender
                </button>
              </div>
            ) : (
              <div style={{ fontSize:12, color: p.status==='matched' ? 'var(--success)' : 'var(--danger)', fontWeight:600 }}>
                {p.status==='matched' ? '✓ ' : '✗ '}{p.notes}
              </div>
            )}
          </div>
        ))}
        {filtered.length===0&&(
          <div style={{ gridColumn:'1/-1', padding:48, textAlign:'center', color:'var(--text-3)' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>📭</div>
            <div style={{ fontWeight:700 }}>No unknown packages</div>
          </div>
        )}
      </div>
    </div>
  )
}
