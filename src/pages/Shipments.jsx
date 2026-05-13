import React, { useState } from 'react'
import { MOCK_SHIPMENTS, syncShipment } from '../services/api'
import { useAuth } from '../App'

const STATUS_COLOR = { pending:'#c27803',in_transit:'#1a56db',customs:'#7e3af2',out_for_delivery:'#E85D04',delivered:'#0e9f6e',exception:'#e02424' }
const STATUS_LABEL = { pending:'Pending',in_transit:'In Transit',customs:'Customs',out_for_delivery:'Out for Delivery',delivered:'Delivered',exception:'Exception' }
const STATUSES = Object.keys(STATUS_LABEL)

export default function Shipments() {
  const { notify } = useAuth()
  const [shipments] = useState(MOCK_SHIPMENTS)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [syncing, setSyncing] = useState(null)

  const filtered = shipments.filter(s => {
    const matchStatus = !filter || s.status === filter
    const matchSearch = !search || [s.tracking_number,s.customer_name,s.origin,s.destination].some(v=>v.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  const handleSync = async (id) => {
    setSyncing(id)
    await new Promise(r=>setTimeout(r,800))
    notify('Carrier sync complete — 2 new events added')
    setSyncing(null)
  }

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, margin:0 }}>Shipments</h1>
          <p style={{ color:'var(--text-3)', fontSize:13, marginTop:4 }}>{filtered.length} shipments found</p>
        </div>
    <button onClick={() => onNavigate('addshipment')} style={{ background:'var(--primary)', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'var(--radius)', fontSize:13, fontWeight:600, cursor:'pointer' }}>+ Add Shipment</button>
      </div>

      <div className="card" style={{ padding:'14px 18px', marginBottom:18, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tracking, customer, route…"
            style={{ width:'100%', paddingLeft:34, paddingRight:12, paddingTop:8, paddingBottom:8, border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, outline:'none', background:'var(--surface)', color:'var(--text-1)', boxSizing:'border-box' }} />
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {[['','All'],...STATUSES.map(s=>[s,STATUS_LABEL[s]])].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{ padding:'5px 14px', borderRadius:99, fontSize:12, fontWeight:600, border:`1px solid ${filter===v&&v?STATUS_COLOR[v]||'var(--primary)':'var(--border)'}`, background:filter===v?(v?STATUS_COLOR[v]+'18':'var(--primary-soft)'):'transparent', color:filter===v?(v?STATUS_COLOR[v]:'var(--primary)'):'var(--text-2)', cursor:'pointer' }}>{l}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
                {['Tracking #','Customer','Route','Service','Status','Weight','Est. Delivery','Actions'].map(h=>(
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:800, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s=>(
                <tr key={s.id} style={{ borderBottom:'1px solid var(--border-light)', cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'12px 16px' }}><span style={{ fontFamily:'monospace', fontWeight:700, color:'var(--primary)', fontSize:12 }}>{s.tracking_number}</span></td>
                  <td style={{ padding:'12px 16px' }}><div style={{ fontWeight:600 }}>{s.customer_name}</div><div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{s.customer_email}</div></td>
                  <td style={{ padding:'12px 16px', fontSize:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ color:'var(--text-2)' }}>{s.origin}</span>
                      <span style={{ color:'var(--accent)', fontSize:10 }}>→</span>
                      <span style={{ color:'var(--text-2)' }}>{s.destination}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px' }}><ServiceBadge type={s.service_type}/></td>
                  <td style={{ padding:'12px 16px' }}><span style={{ padding:'4px 12px', borderRadius:99, fontSize:11, fontWeight:700, background:STATUS_COLOR[s.status]+'18', color:STATUS_COLOR[s.status] }}>{STATUS_LABEL[s.status]}</span></td>
                  <td style={{ padding:'12px 16px', color:'var(--text-2)' }}>{s.weight_kg} kg</td>
                  <td style={{ padding:'12px 16px', color:'var(--text-2)', fontSize:12 }}>{s.estimated_delivery||'—'}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <ABtn onClick={()=>setSelected(s)}>View</ABtn>
                      <ABtn onClick={()=>handleSync(s.id)} loading={syncing===s.id}>{syncing===s.id?'⟳':'↻'}</ABtn>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0&&<tr><td colSpan={8} style={{ padding:40, textAlign:'center', color:'var(--text-3)' }}>No shipments match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {selected && <ShipModal s={selected} onClose={()=>setSelected(null)} onNotify={notify}/>}
    </div>
  )
}

function ServiceBadge({type}) {
  const cfg = {sea:{l:'Sea',c:'badge-blue'},air:{l:'Air',c:'badge-purple'},express:{l:'Express',c:'badge-orange'},'last-mile':{l:'Last-Mile',c:'badge-green'}}
  const d = cfg[type]||{l:type,c:'badge-gray'}
  return <span className={`badge ${d.c}`}>{d.l}</span>
}

function ABtn({children,onClick,loading}) {
  return <button onClick={onClick} disabled={loading} style={{ padding:'4px 10px', borderRadius:'var(--radius-sm)', fontSize:11, fontWeight:600, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text-2)', cursor:'pointer', opacity:loading?.6:1 }} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--primary)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>{children}</button>
}

function ShipModal({s, onClose, onNotify}) {
  const [newStatus, setNewStatus] = useState(s.status)
  const [evtText, setEvtText] = useState('')
  const [loc, setLoc] = useState('')
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'var(--surface)', borderRadius:'var(--radius-lg)', width:560, maxWidth:'95vw', maxHeight:'85vh', overflow:'auto', boxShadow:'var(--shadow-lg)', animation:'fadeUp .2s ease' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--sidebar-bg)', borderRadius:'var(--radius-lg) var(--radius-lg) 0 0' }}>
          <div>
            <div style={{ color:'rgba(255,255,255,.5)', fontSize:11, letterSpacing:'.08em', textTransform:'uppercase' }}>Tracking Number</div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, color:'#fff', marginTop:2 }}>{s.tracking_number}</div>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <span style={{ padding:'6px 14px', borderRadius:99, fontSize:12, fontWeight:700, background:STATUS_COLOR[s.status]+'30', color:STATUS_COLOR[s.status] }}>{STATUS_LABEL[s.status]}</span>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,.1)', border:'none', color:'#fff', width:28, height:28, borderRadius:'50%', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
          </div>
        </div>
        <div style={{ padding:24 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:12, alignItems:'center', background:'var(--surface-2)', borderRadius:'var(--radius)', padding:'14px 18px', marginBottom:18 }}>
            <div><div style={{ fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em' }}>FROM</div><div style={{ fontWeight:700, marginTop:3 }}>{s.origin}</div></div>
            <div style={{ color:'var(--accent)', fontSize:18 }}>→</div>
            <div style={{ textAlign:'right' }}><div style={{ fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em' }}>TO</div><div style={{ fontWeight:700, marginTop:3 }}>{s.destination}</div></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
            {[['Customer',s.customer_name],['Email',s.customer_email],['Service',s.service_type],['Weight',s.weight_kg+' kg'],['Est. Delivery',s.estimated_delivery||'—'],['Created',new Date(s.created_at).toLocaleDateString()]].map(([l,v])=>(
              <div key={l} style={{ background:'var(--surface-2)', padding:'10px 14px', borderRadius:'var(--radius-sm)' }}>
                <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:3 }}>{l}</div>
                <div style={{ fontWeight:600, fontSize:13 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid var(--border)', paddingTop:18 }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>Update Status</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
              {Object.entries(STATUS_LABEL).map(([k,l])=>(
                <button key={k} onClick={()=>setNewStatus(k)} style={{ padding:'5px 12px', borderRadius:99, fontSize:11, fontWeight:600, border:`1px solid ${newStatus===k?STATUS_COLOR[k]:'var(--border)'}`, background:newStatus===k?STATUS_COLOR[k]+'18':'transparent', color:newStatus===k?STATUS_COLOR[k]:'var(--text-2)', cursor:'pointer' }}>{l}</button>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              <input value={loc} onChange={e=>setLoc(e.target.value)} placeholder="Location" style={{ padding:'8px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)' }}/>
              <input value={evtText} onChange={e=>setEvtText(e.target.value)} placeholder="Event description" style={{ padding:'8px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)' }}/>
            </div>
            <button onClick={()=>{onNotify('Shipment updated successfully');onClose()}} style={{ background:'var(--primary)', color:'#fff', border:'none', padding:'10px 24px', borderRadius:'var(--radius)', fontSize:13, fontWeight:600, cursor:'pointer' }}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  )
}
