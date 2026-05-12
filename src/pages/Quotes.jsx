import React, { useState } from 'react'
import { MOCK_QUOTES } from '../services/api'
import { useAuth } from '../App'
export default function Quotes() {
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
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[['','All'],['new','New'],['quoted','Quoted'],['accepted','Accepted'],['declined','Declined']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ padding:'7px 18px', borderRadius:'var(--radius)', fontSize:13, fontWeight:600, border:'none', cursor:'pointer', background: filter===v ? 'var(--primary)' : 'var(--surface)', color: filter===v ? '#fff' : 'var(--text-2)', boxShadow: filter===v ? 'none' : 'var(--shadow-sm)' }}>{l}</button>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
        {filtered.map(q => (
          <div key={q.id} className="card" style={{ padding:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div>
                <div style={{ fontFamily:'monospace', fontSize:12, color:'var(--text-3)' }}>{q.reference}</div>
                <div style={{ fontWeight:700, fontSize:15, marginTop:2 }}>{q.customer_name}</div>
              </div>
              <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background: SCOLOR[q.status]+'18', color: SCOLOR[q.status] }}>{STATUS[q.status]}</span>
            </div>
            <div style={{ background:'var(--surface-2)', borderRadius:'var(--radius-sm)', padding:'10px 14px', marginBottom:14, fontSize:12, display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--text-2)' }}>{q.origin}</span>
              <span style={{ color:'var(--accent)' }}>→</span>
              <span style={{ color:'var(--text-2)' }}>{q.destination}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, fontSize:12, marginBottom:16 }}>
              {[['Service',q.service_type],['Weight',q.weight_kg+' kg'],[q.quoted_price&&'Quoted',q.quoted_price&&'$'+q.quoted_price],['Date',new Date(q.created_at).toLocaleDateString()]].filter(Boolean).filter(([l])=>l).map(([l,v])=>(
                <React.Fragment key={l}><div style={{color:'var(--text-3)'}}>{l}</div><div style={{fontWeight:600}}>{v}</div></React.Fragment>
              ))}
            </div>
            {q.status === 'new' && (
              responding === q.id ? (
                <div style={{ display:'flex', gap:8 }}>
                  <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="USD price" type="number" min="0"
                    style={{ flex:1, padding:'7px 10px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13 }} />
                  <button onClick={()=>{ notify('Quote sent!'); setResponding(null); setPrice('') }}
                    style={{ background:'var(--success)', color:'#fff', border:'none', padding:'7px 14px', borderRadius:'var(--radius-sm)', fontSize:12, fontWeight:600, cursor:'pointer' }}>Send</button>
                  <button onClick={()=>setResponding(null)} style={{ background:'var(--surface-2)', color:'var(--text-2)', border:'none', padding:'7px 10px', borderRadius:'var(--radius-sm)', fontSize:12, cursor:'pointer' }}>✕</button>
                </div>
              ) : (
                <button onClick={()=>setResponding(q.id)} style={{ width:'100%', padding:'8px', borderRadius:'var(--radius-sm)', background:'var(--primary)', color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer' }}>Respond with Quote</button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
