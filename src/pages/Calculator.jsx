import React, { useState } from 'react'
export default function Calculator() {
  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState('lbs')
  const [value, setValue] = useState('')
  const [tariff, setTariff] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const TARIFFS = [
    {value:'',label:'None / General Cargo',surcharge:0},{value:'ELECTRONICS',label:'Electronics',surcharge:5},
    {value:'CLOTHING',label:'Clothing & Apparel',surcharge:2},{value:'FOOD',label:'Food & Perishables',surcharge:8},
    {value:'MACHINERY',label:'Machinery',surcharge:3},{value:'HAZMAT',label:'Hazardous Materials',surcharge:15},
    {value:'FURNITURE',label:'Furniture & Bulky',surcharge:4},{value:'MEDICAL',label:'Medical/Pharma',surcharge:6},
  ]
  const RATES = [
    {key:'sea',name:'Sea Freight',base:25,per_kg:3.5,val_pct:2.0,days:'14–21',color:'#1a56db'},
    {key:'air',name:'Air Freight',base:45,per_kg:7.0,val_pct:2.5,days:'3–5',color:'#7e3af2'},
    {key:'express',name:'Express',base:75,per_kg:12.0,val_pct:3.0,days:'1–2',color:'#E85D04'},
    {key:'last-mile',name:'Last-Mile',base:15,per_kg:1.5,val_pct:0.0,days:'1–3',color:'#0e9f6e'},
  ]
  const calculate = () => {
    if (!weight || parseFloat(weight) <= 0) return
    setLoading(true)
    setTimeout(() => {
      const wKg = unit === 'lbs' ? parseFloat(weight) * 0.453592 : parseFloat(weight)
      const val = parseFloat(value) || 0
      const tc = TARIFFS.find(t => t.value === tariff)
      const surch = tc?.surcharge || 0
      const calced = RATES.map(r => {
        const sub = r.base + wKg * r.per_kg + val * (r.val_pct / 100)
        const extra = sub * (surch / 100)
        const total = sub + extra
        const gct = total * 0.15
        return { ...r, total: +(total + gct).toFixed(2), breakdown: { base:r.base, weight_fee:+(wKg*r.per_kg).toFixed(2), value_fee:+(val*(r.val_pct/100)).toFixed(2), surcharge:+extra.toFixed(2), gct:+gct.toFixed(2) } }
      }).sort((a,b) => a.total - b.total)
      setResults({ items:calced, wKg:wKg.toFixed(2), wLbs:(wKg/0.453592).toFixed(2), value:val, tariff:tc?.label||'None' })
      setLoading(false)
    }, 500)
  }
  return (
    <div style={{ animation:'fadeUp .3s ease', maxWidth:780 }}>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, marginBottom:6 }}>Rate Calculator</h1>
      <p style={{ color:'var(--text-3)', marginBottom:24 }}>Instant shipping estimates for all service types including 15% GCT.</p>
      <div className="card" style={{ padding:28, marginBottom:24 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Package Weight</label>
            <div style={{ display:'flex', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', overflow:'hidden' }}>
              <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} min="0.1" step="0.1" placeholder="0.00"
                style={{ flex:1, padding:'10px 14px', border:'none', fontSize:14, outline:'none', background:'var(--surface)', color:'var(--text-1)' }} />
              <div style={{ display:'flex', borderLeft:'1px solid var(--border)' }}>
                {['lbs','kg'].map(u => (
                  <button key={u} onClick={()=>setUnit(u)} style={{ padding:'0 14px', border:'none', fontSize:12, fontWeight:700, cursor:'pointer', background:unit===u?'var(--primary)':'var(--surface-2)', color:unit===u?'#fff':'var(--text-2)' }}>{u}</button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Package Value (USD)</label>
            <div style={{ display:'flex', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', overflow:'hidden' }}>
              <span style={{ padding:'10px 12px', background:'var(--surface-2)', borderRight:'1px solid var(--border)', fontSize:14, color:'var(--text-3)', fontWeight:700 }}>$</span>
              <input type="number" value={value} onChange={e=>setValue(e.target.value)} min="0" step="0.01" placeholder="0.00"
                style={{ flex:1, padding:'10px 14px', border:'none', fontSize:14, outline:'none', background:'var(--surface)', color:'var(--text-1)' }} />
            </div>
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Tariff Code</label>
          <select value={tariff} onChange={e=>setTariff(e.target.value)} style={{ width:'100%', padding:'10px 14px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)' }}>
            {TARIFFS.map(t => <option key={t.value} value={t.value}>{t.label}{t.surcharge>0?` (+${t.surcharge}%)`:''}</option>)}
          </select>
        </div>
        <button onClick={calculate} disabled={loading} style={{ width:'100%', padding:14, background:'var(--primary)', color:'#fff', border:'none', borderRadius:'var(--radius)', fontSize:15, fontWeight:700, cursor:'pointer', opacity:loading?.7:1 }}>
          {loading ? 'Calculating…' : 'Calculate Shipping Cost'}
        </button>
      </div>
      {results && (
        <div style={{ animation:'fadeUp .3s ease' }}>
          <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:16 }}>{results.wLbs} lbs ({results.wKg} kg) · Value: ${results.value.toFixed(2)} · {results.tariff}</p>
          {results.items.map((r,i) => (
            <div key={r.key} className="card" style={{ padding:'20px 24px', marginBottom:12, borderLeft:`4px solid ${r.color}`, animation:`fadeUp .3s ease ${i*60}ms both` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div>
                  {i===0 && <span style={{ fontSize:10, fontWeight:800, color:r.color, background:r.color+'18', padding:'2px 8px', borderRadius:99, display:'inline-block', marginBottom:6, textTransform:'uppercase' }}>Best Value</span>}
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18 }}>{r.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>🕐 {r.days} business days</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:28 }}>${r.total.toFixed(2)}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)' }}>incl. 15% GCT</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, paddingTop:12, borderTop:'1px solid var(--border)' }}>
                {[['Base fee',`$${r.breakdown.base}`],['Weight fee',`$${r.breakdown.weight_fee}`],['Value fee',`$${r.breakdown.value_fee}`],['Tariff',`$${r.breakdown.surcharge}`],['GCT 15%',`$${r.breakdown.gct.toFixed(2)}`]].map(([l,v])=>(
                  <div key={l}><div style={{fontSize:10,color:'var(--text-3)',marginBottom:2}}>{l}</div><div style={{fontSize:13,fontWeight:700}}>{v}</div></div>
                ))}
              </div>
            </div>
          ))}
          <p style={{ fontSize:11, color:'var(--text-3)', textAlign:'center', marginTop:12 }}>* Estimates in USD. 15% GCT included. Final price confirmed at booking.</p>
        </div>
      )}
    </div>
  )
}
