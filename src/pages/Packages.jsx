import React, { useState } from 'react'
import { useAuth } from '../App'

const STATUS_COLOR = { pending:'#c27803', received:'#1a56db', in_transit:'#7e3af2', delivered:'#0e9f6e', exception:'#e02424' }
const STATUS_LABEL = { pending:'Pending', received:'Received', in_transit:'In Transit', delivered:'Delivered', exception:'Exception' }

const MOCK_PACKAGES = [
  { id:1,  package_id:'PKG-001', tracking_number:'AZ-AB-100000', customer_name:'Marcus Brown',   customer_email:'marcus@email.com',  description:'Electronics — iPhone 15',     weight_lbs:1.2, weight_kg:0.54, value_usd:850.00, status:'in_transit', origin:'Miami, FL',    received_date:'2026-05-01', service:'air' },
  { id:2,  package_id:'PKG-002', tracking_number:'AZ-BL-100001', customer_name:'Kezia Williams', customer_email:'kezia@email.com',   description:'Clothing — 3 dresses',        weight_lbs:3.5, weight_kg:1.59, value_usd:120.00, status:'received',   origin:'New York, NY', received_date:'2026-05-02', service:'sea' },
  { id:3,  package_id:'PKG-003', tracking_number:'AZ-CM-100002', customer_name:'Devon Campbell', customer_email:'devon@email.com',   description:'Machinery parts',             weight_lbs:45.0,weight_kg:20.41,value_usd:650.00, status:'pending',    origin:'Miami, FL',    received_date:null,         service:'sea' },
  { id:4,  package_id:'PKG-004', tracking_number:'AZ-DN-100003', customer_name:'Asha Reid',      customer_email:'asha@email.com',    description:'Shoes — 2 pairs',             weight_lbs:4.2, weight_kg:1.91, value_usd:280.00, status:'delivered',  origin:'Toronto, CA',  received_date:'2026-04-28', service:'express' },
  { id:5,  package_id:'PKG-005', tracking_number:'AZ-EO-100004', customer_name:'Omar Francis',   customer_email:'omar@email.com',    description:'Supplements — vitamins',      weight_lbs:6.0, weight_kg:2.72, value_usd:95.00,  status:'in_transit', origin:'Miami, FL',    received_date:'2026-05-03', service:'sea' },
  { id:6,  package_id:'PKG-006', tracking_number:'AZ-FP-100005', customer_name:'Tanya Clarke',   customer_email:'tanya@email.com',   description:'Handbag — designer',          weight_lbs:2.1, weight_kg:0.95, value_usd:420.00, status:'received',   origin:'New York, NY', received_date:'2026-05-04', service:'air' },
  { id:7,  package_id:'PKG-007', tracking_number:'AZ-GQ-100006', customer_name:'Rohan Grant',    customer_email:'rohan@email.com',   description:'Car parts — brake pads',      weight_lbs:12.0,weight_kg:5.44, value_usd:180.00, status:'exception',  origin:'Miami, FL',    received_date:'2026-05-01', service:'sea' },
  { id:8,  package_id:'PKG-008', tracking_number:'AZ-HR-100007', customer_name:'Simone Taylor',  customer_email:'simone@email.com',  description:'Baby items — stroller',       weight_lbs:22.0,weight_kg:9.98, value_usd:350.00, status:'in_transit', origin:'Miami, FL',    received_date:'2026-05-05', service:'sea' },
]

export default function Packages({ onNavigate }) {
  const { notify } = useAuth()
  const [packages] = useState(MOCK_PACKAGES)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = packages.filter(p => {
    const matchStatus = !filter || p.status === filter
    const matchSearch = !search || [p.package_id, p.customer_name, p.description, p.tracking_number]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  const totalWeight = packages.reduce((s, p) => s + p.weight_lbs, 0)
  const totalValue  = packages.reduce((s, p) => s + p.value_usd, 0)

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, margin:0 }}>Packages</h1>
          <p style={{ color:'var(--text-3)', fontSize:13, marginTop:4 }}>{filtered.length} packages found</p>
        </div>
        <button onClick={() => notify('Package logging coming soon')}
          style={{ background:'var(--primary)', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'var(--radius)', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          + Log Package
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Total Packages',  value: packages.length,                                       color:'var(--primary)' },
          { label:'Received',        value: packages.filter(p=>p.status==='received').length,       color:'var(--success)' },
          { label:'In Transit',      value: packages.filter(p=>p.status==='in_transit').length,     color:'#1a56db' },
          { label:'Total Weight',    value: totalWeight.toFixed(1)+' lbs',                          color:'var(--purple)' },
          { label:'Total Value',     value: '$'+totalValue.toLocaleString(undefined,{minimumFractionDigits:2}), color:'var(--accent)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:'16px 18px', borderTop:`3px solid ${s.color}` }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, color:s.color }}>{s.value}</div>
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
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search package ID, customer, description…"
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
                {['Package ID','Customer','Description','Weight','Value','Service','Status','Received','Actions'].map(h=>(
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:800, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p=>(
                <tr key={p.id} style={{ borderBottom:'1px solid var(--border-light)' }} onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ fontFamily:'monospace', fontWeight:700, color:'var(--primary)', fontSize:12 }}>{p.package_id}</div>
                    <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{p.tracking_number}</div>
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ fontWeight:600 }}>{p.customer_name}</div>
                    <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{p.customer_email}</div>
                  </td>
                  <td style={{ padding:'12px 14px', color:'var(--text-2)', maxWidth:180 }}>{p.description}</td>
                  <td style={{ padding:'12px 14px', color:'var(--text-2)', whiteSpace:'nowrap' }}>
                    <div>{p.weight_lbs} lbs</div>
                    <div style={{ fontSize:11, color:'var(--text-3)' }}>{p.weight_kg} kg</div>
                  </td>
                  <td style={{ padding:'12px 14px', fontWeight:700, color:'var(--success)' }}>${p.value_usd.toFixed(2)}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <span className={`badge ${p.service==='air'?'badge-purple':p.service==='express'?'badge-orange':'badge-blue'}`}>{p.service}</span>
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:STATUS_COLOR[p.status]+'18', color:STATUS_COLOR[p.status] }}>{STATUS_LABEL[p.status]}</span>
                  </td>
                  <td style={{ padding:'12px 14px', color:'var(--text-3)', fontSize:12 }}>{p.received_date ? new Date(p.received_date).toLocaleDateString('en',{month:'short',day:'numeric'}) : '—'}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <button onClick={()=>setSelected(p)} style={{ padding:'4px 10px', borderRadius:'var(--radius-sm)', fontSize:11, fontWeight:600, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text-2)', cursor:'pointer' }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }} onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div style={{ background:'var(--surface)', borderRadius:'var(--radius-lg)', width:520, maxWidth:'95vw', maxHeight:'85vh', overflow:'auto', boxShadow:'var(--shadow-lg)', animation:'fadeUp .2s ease' }}>
            <div style={{ background:'var(--sidebar-bg)', padding:'20px 24px', borderRadius:'var(--radius-lg) var(--radius-lg) 0 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ color:'rgba(255,255,255,.5)', fontSize:11, textTransform:'uppercase', letterSpacing:'.08em' }}>Package</div>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, color:'#fff', marginTop:2 }}>{selected.package_id}</div>
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <span style={{ padding:'5px 12px', borderRadius:99, fontSize:11, fontWeight:700, background:STATUS_COLOR[selected.status]+'30', color:STATUS_COLOR[selected.status] }}>{STATUS_LABEL[selected.status]}</span>
                <button onClick={()=>setSelected(null)} style={{ background:'rgba(255,255,255,.1)', border:'none', color:'#fff', width:28, height:28, borderRadius:'50%', cursor:'pointer', fontSize:16 }}>×</button>
              </div>
            </div>
            <div style={{ padding:24 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  ['Customer',    selected.customer_name],
                  ['Email',       selected.customer_email],
                  ['Description', selected.description],
                  ['Origin',      selected.origin],
                  ['Weight',      selected.weight_lbs+' lbs ('+selected.weight_kg+' kg)'],
                  ['Value',       '$'+selected.value_usd.toFixed(2)+' USD'],
                  ['Service',     selected.service],
                  ['Tracking #',  selected.tracking_number],
                  ['Received',    selected.received_date || 'Not yet received'],
                ].map(([l,v])=>(
                  <div key={l} style={{ background:'var(--surface-2)', padding:'10px 14px', borderRadius:'var(--radius-sm)' }}>
                    <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:3 }}>{l}</div>
                    <div style={{ fontWeight:600, fontSize:13 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:20, display:'flex', gap:10 }}>
                <button onClick={()=>{notify('Status updated');setSelected(null)}} style={{ flex:1, padding:'10px', borderRadius:'var(--radius-sm)', background:'var(--primary)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer' }}>Update Status</button>
                <button onClick={()=>{onNavigate('shipments')}} style={{ flex:1, padding:'10px', borderRadius:'var(--radius-sm)', background:'var(--surface-2)', color:'var(--text-1)', border:'1px solid var(--border)', fontSize:13, fontWeight:600, cursor:'pointer' }}>View Shipment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
