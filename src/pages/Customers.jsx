import React, { useState } from 'react'
import { useAuth } from '../App'
import { MOCK_SHIPMENTS } from '../services/api'

// Mock customers derived from shipment data + extras
const MOCK_CUSTOMERS = [
  { id:1,  name:'Marcus Brown',   email:'marcus@email.com',   phone:'+1 876 555 0101', location:'Kingston, JM',     registered:'2026-01-15', status:'active',   total_shipments:4, total_spent:856.00 },
  { id:2,  name:'Kezia Williams', email:'kezia@email.com',    phone:'+1 876 555 0102', location:'Portmore, JM',     registered:'2026-01-22', status:'active',   total_shipments:3, total_spent:620.50 },
  { id:3,  name:'Devon Campbell', email:'devon@email.com',    phone:'+1 876 555 0103', location:'Spanish Town, JM', registered:'2026-02-03', status:'active',   total_shipments:6, total_spent:1240.00 },
  { id:4,  name:'Asha Reid',      email:'asha@email.com',     phone:'+1 876 555 0104', location:'Montego Bay, JM',  registered:'2026-02-14', status:'active',   total_shipments:2, total_spent:310.00 },
  { id:5,  name:'Omar Francis',   email:'omar@email.com',     phone:'+1 876 555 0105', location:'Mandeville, JM',   registered:'2026-02-28', status:'inactive', total_shipments:1, total_spent:95.00 },
  { id:6,  name:'Tanya Clarke',   email:'tanya@email.com',    phone:'+1 876 555 0106', location:'Kingston, JM',     registered:'2026-03-05', status:'active',   total_shipments:5, total_spent:980.00 },
  { id:7,  name:'Rohan Grant',    email:'rohan@email.com',    phone:'+1 876 555 0107', location:'Portmore, JM',     registered:'2026-03-12', status:'active',   total_shipments:2, total_spent:445.00 },
  { id:8,  name:'Simone Taylor',  email:'simone@email.com',   phone:'+1 876 555 0108', location:'Kingston, JM',     registered:'2026-03-20', status:'active',   total_shipments:7, total_spent:1890.00 },
  { id:9,  name:'Andre Morgan',   email:'andre@email.com',    phone:'+1 876 555 0109', location:'Spanish Town, JM', registered:'2026-04-01', status:'active',   total_shipments:3, total_spent:560.00 },
  { id:10, name:'Nadine Brown',   email:'nadine@email.com',   phone:'+1 876 555 0110', location:'Montego Bay, JM',  registered:'2026-04-10', status:'inactive', total_shipments:1, total_spent:120.00 },
  { id:11, name:'Curtis Lewis',   email:'curtis@email.com',   phone:'+1 876 555 0111', location:'Kingston, JM',     registered:'2026-04-15', status:'active',   total_shipments:4, total_spent:730.00 },
  { id:12, name:'Patrice Henry',  email:'patrice@email.com',  phone:'+1 876 555 0112', location:'Portmore, JM',     registered:'2026-04-22', status:'active',   total_shipments:2, total_spent:380.00 },
]

const STATUS_COLOR = {
  pending:'#c27803', in_transit:'#1a56db', customs:'#7e3af2',
  out_for_delivery:'#E85D04', delivered:'#0e9f6e', exception:'#e02424',
}
const STATUS_LABEL = {
  pending:'Pending', in_transit:'In Transit', customs:'Customs',
  out_for_delivery:'Out for Delivery', delivered:'Delivered', exception:'Exception',
}

export default function Customers() {
  const { notify, navigate } = useAuth()
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('')
  const [selected, setSelected] = useState(null)
  const [sortBy, setSortBy]     = useState('registered')

  const filtered = MOCK_CUSTOMERS
    .filter(c => {
      const matchSearch = !search || [c.name, c.email, c.phone, c.location]
        .some(v => v.toLowerCase().includes(search.toLowerCase()))
      const matchFilter = !filter || c.status === filter
      return matchSearch && matchFilter
    })
    .sort((a, b) => {
      if (sortBy === 'name')             return a.name.localeCompare(b.name)
      if (sortBy === 'total_spent')      return b.total_spent - a.total_spent
      if (sortBy === 'total_shipments')  return b.total_shipments - a.total_shipments
      return new Date(b.registered) - new Date(a.registered)
    })

  const totalRevenue  = MOCK_CUSTOMERS.reduce((s, c) => s + c.total_spent, 0)
  const activeCount   = MOCK_CUSTOMERS.filter(c => c.status === 'active').length
  const avgSpend      = totalRevenue / MOCK_CUSTOMERS.length

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, margin:0 }}>Customers</h1>
          <p style={{ color:'var(--text-3)', fontSize:13, marginTop:4 }}>{filtered.length} customers found</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Total Customers',  value: MOCK_CUSTOMERS.length,         color:'var(--primary)' },
          { label:'Active',           value: activeCount,                    color:'var(--success)' },
          { label:'Total Revenue',    value: `$${totalRevenue.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`, color:'var(--purple)' },
          { label:'Avg. Spend',       value: `$${avgSpend.toFixed(2)}`,      color:'var(--accent)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:'18px 20px', borderTop:`3px solid ${s.color}` }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:26, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-3)', marginTop:4, textTransform:'uppercase', letterSpacing:'.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding:'14px 18px', marginBottom:18, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
        {/* Search */}
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2"
            style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, location…"
            style={{ width:'100%', paddingLeft:34, paddingRight:12, paddingTop:8, paddingBottom:8, border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, outline:'none', background:'var(--surface)', color:'var(--text-1)', boxSizing:'border-box' }} />
        </div>

        {/* Status filter */}
        <div style={{ display:'flex', gap:6 }}>
          {[['','All'],['active','Active'],['inactive','Inactive']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{
              padding:'5px 14px', borderRadius:99, fontSize:12, fontWeight:600,
              border:`1px solid ${filter===v ? 'var(--primary)' : 'var(--border)'}`,
              background: filter===v ? 'var(--primary-soft)' : 'transparent',
              color: filter===v ? 'var(--primary)' : 'var(--text-2)', cursor:'pointer',
            }}>{l}</button>
          ))}
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding:'6px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:12, background:'var(--surface)', color:'var(--text-2)', cursor:'pointer' }}>
          <option value="registered">Sort: Newest</option>
          <option value="name">Sort: Name</option>
          <option value="total_spent">Sort: Most Spent</option>
          <option value="total_shipments">Sort: Most Shipments</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
                {['Customer','Location','Phone','Shipments','Total Spent','Status','Registered','Actions'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:800, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}
                  style={{ borderBottom:'1px solid var(--border-light)', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Avatar + name */}
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{
                        width:32, height:32, borderRadius:'50%', flexShrink:0,
                        background:`hsl(${c.id * 47 % 360}, 60%, 55%)`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        color:'#fff', fontSize:12, fontWeight:700,
                      }}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight:600 }}>{c.name}</div>
                        <div style={{ fontSize:11, color:'var(--text-3)', marginTop:1 }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px', color:'var(--text-2)', fontSize:12 }}>{c.location}</td>
                  <td style={{ padding:'12px 16px', color:'var(--text-2)', fontSize:12, whiteSpace:'nowrap' }}>{c.phone}</td>
                  <td style={{ padding:'12px 16px', textAlign:'center' }}>
                    <span style={{ fontWeight:700, color:'var(--primary)' }}>{c.total_shipments}</span>
                  </td>
                  <td style={{ padding:'12px 16px', fontWeight:700, color:'var(--success)' }}>
                    ${c.total_spent.toFixed(2)}
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{
                      padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700,
                      background: c.status==='active' ? 'var(--success-soft)' : 'var(--surface-2)',
                      color: c.status==='active' ? 'var(--success)' : 'var(--text-3)',
                    }}>{c.status}</span>
                  </td>
                  <td style={{ padding:'12px 16px', color:'var(--text-3)', fontSize:12 }}>
                    {new Date(c.registered).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})}
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <ActionBtn onClick={() => setSelected(c)}>View</ActionBtn>
                      <ActionBtn onClick={() => { navigate('pos'); notify(`Charging ${c.name}`) }}>Charge</ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding:40, textAlign:'center', color:'var(--text-3)' }}>
                  No customers match your search.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer detail modal */}
      {selected && (
        <CustomerModal
          customer={selected}
          onClose={() => setSelected(null)}
          onNavigate={navigate}
          onNotify={notify}
        />
      )}
    </div>
  )
}

function CustomerModal({ customer: c, onClose, onNavigate, onNotify }) {
  // Get shipments for this customer (mock — match by name)
  const shipments = MOCK_SHIPMENTS.filter(s => s.customer_name === c.name)

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(15,23,42,.6)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:1000, backdropFilter:'blur(4px)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:'var(--surface)', borderRadius:'var(--radius-lg)',
        width:620, maxWidth:'95vw', maxHeight:'85vh',
        overflow:'auto', boxShadow:'var(--shadow-lg)',
        animation:'fadeUp .2s ease',
      }}>
        {/* Modal header */}
        <div style={{
          background:'var(--sidebar-bg)', padding:'20px 24px',
          borderRadius:'var(--radius-lg) var(--radius-lg) 0 0',
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{
              width:44, height:44, borderRadius:'50%',
              background:`hsl(${c.id * 47 % 360}, 60%, 55%)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'#fff', fontSize:18, fontWeight:700,
            }}>{c.name.charAt(0)}</div>
            <div>
              <div style={{ color:'#fff', fontFamily:'var(--font-display)', fontWeight:800, fontSize:17 }}>{c.name}</div>
              <div style={{ color:'rgba(255,255,255,.5)', fontSize:12, marginTop:2 }}>{c.email}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,.1)', border:'none', color:'#fff', width:28, height:28, borderRadius:'50%', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        <div style={{ padding:24 }}>
          {/* Details grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
            {[
              ['Phone',      c.phone],
              ['Location',   c.location],
              ['Status',     c.status],
              ['Registered', new Date(c.registered).toLocaleDateString('en',{month:'long',day:'numeric',year:'numeric'})],
              ['Shipments',  c.total_shipments],
              ['Total Spent','$' + c.total_spent.toFixed(2)],
            ].map(([label, value]) => (
              <div key={label} style={{ background:'var(--surface-2)', padding:'12px 14px', borderRadius:'var(--radius-sm)' }}>
                <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:3, textTransform:'uppercase', letterSpacing:'.06em' }}>{label}</div>
                <div style={{ fontWeight:600, fontSize:14, textTransform:'capitalize' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display:'flex', gap:10, marginBottom:24 }}>
            <button onClick={() => { onClose(); onNavigate('pos'); onNotify(`POS opened for ${c.name}`) }}
              style={{ flex:1, padding:'10px', borderRadius:'var(--radius-sm)', background:'var(--primary)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              💳 Charge Customer
            </button>
            <a href={`mailto:${c.email}`}
              style={{ flex:1, padding:'10px', borderRadius:'var(--radius-sm)', background:'var(--surface-2)', color:'var(--text-1)', border:'1px solid var(--border)', fontSize:13, fontWeight:700, cursor:'pointer', textDecoration:'none', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              ✉️ Send Email
            </a>
            <a href={`https://wa.me/${c.phone.replace(/[^0-9]/g,'')}`} target="_blank" rel="noopener noreferrer"
              style={{ flex:1, padding:'10px', borderRadius:'var(--radius-sm)', background:'#25D366', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', textDecoration:'none', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              💬 WhatsApp
            </a>
          </div>

          {/* Shipment history */}
          <div>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Shipment History</div>
            {shipments.length === 0 ? (
              <div style={{ padding:20, background:'var(--surface-2)', borderRadius:'var(--radius-sm)', textAlign:'center', color:'var(--text-3)', fontSize:13 }}>
                No shipments found for this customer
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {shipments.map(s => (
                  <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--surface-2)', borderRadius:'var(--radius-sm)' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:'monospace', fontSize:12, fontWeight:700, color:'var(--primary)' }}>{s.tracking_number}</div>
                      <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{s.origin} → {s.destination}</div>
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:99, background:'var(--surface)', color:'var(--text-2)', border:'1px solid var(--border)', textTransform:'capitalize' }}>{s.service_type}</span>
                    <span style={{
                      padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700,
                      background: STATUS_COLOR[s.status] + '18',
                      color: STATUS_COLOR[s.status],
                    }}>{STATUS_LABEL[s.status]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:'4px 10px', borderRadius:'var(--radius-sm)', fontSize:11, fontWeight:600,
      border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text-2)',
      cursor:'pointer', transition:'all var(--transition)',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >{children}</button>
  )
}
