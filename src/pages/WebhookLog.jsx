import React from 'react'
export default function WebhookLog() {
  const MOCK_LOG = Array.from({length:20},(_,i)=>({
    time:new Date(Date.now()-i*180000).toISOString(),
    source:i%2===0?'shipave':'shipbiz',
    event:['processed','signature_failed','no_match','processed','processed','replay_rejected'][i%6],
    data:{shipment_id:i%2===0?100+i:null,carrier_tn:`TRK${100000+i}`,status:['in_transit','out_for_delivery','delivered'][i%3]}
  }))
  const ES = {processed:{color:'#0e9f6e',bg:'#ecfdf5',icon:'✅'},signature_failed:{color:'#e02424',bg:'#fef2f2',icon:'🔴'},no_match:{color:'#c27803',bg:'#fffbeb',icon:'🟡'},replay_rejected:{color:'#e02424',bg:'#fef2f2',icon:'🔴'}}
  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, margin:0 }}>Webhook Log</h1>
          <p style={{ color:'var(--text-3)', fontSize:13, marginTop:4 }}>Real-time push events from ShipAve & ShipBiz</p>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          {['ShipAve','ShipBiz'].map(n=>(
            <div key={n} style={{ display:'flex', alignItems:'center', gap:8, background:'var(--surface)', padding:'8px 16px', borderRadius:'var(--radius)', border:'1px solid var(--border)', fontSize:13 }}>
              <span style={{ width:8,height:8,borderRadius:'50%',background:'var(--success)',display:'inline-block' }}/>
              {n} Active
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
                {['Time','Source','Event','Data'].map(h=>(
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:800, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_LOG.map((row,i)=>{
                const es=ES[row.event]||{color:'var(--text-2)',bg:'var(--surface-2)',icon:'ℹ️'}
                return (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border-light)' }} onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'10px 16px', color:'var(--text-3)', whiteSpace:'nowrap', fontSize:12 }}>{new Date(row.time).toLocaleString()}</td>
                    <td style={{ padding:'10px 16px' }}><span style={{ fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:'.06em', color:row.source==='shipave'?'#00a651':'#0066cc' }}>{row.source}</span></td>
                    <td style={{ padding:'10px 16px' }}><span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:es.bg, color:es.color }}>{es.icon} {row.event}</span></td>
                    <td style={{ padding:'10px 16px', fontFamily:'monospace', fontSize:11, color:'var(--text-3)' }}>{Object.entries(row.data).filter(([,v])=>v!=null).map(([k,v])=>`${k}: ${v}`).join('  ·  ')}</td>
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
