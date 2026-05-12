import React from 'react'
import { useAuth } from '../App'
export default function Carriers() {
  const { notify } = useAuth()
  const slots = [
    {slot:1,carrier:'',label:'',enabled:false},
    {slot:2,carrier:'',label:'',enabled:false},
    {slot:3,carrier:'shipave',label:'ShipAve',enabled:true,environment:'production'},
    {slot:4,carrier:'shipbiz',label:'ShipBiz',enabled:true,environment:'production'},
    {slot:5,carrier:'',label:'',enabled:false},
  ]
  const CARRIERS = {
    fedex:{name:'FedEx',color:'#4D148C'},dhl:{name:'DHL Express',color:'#FFCC00'},
    ups:{name:'UPS',color:'#351C15'},usps:{name:'USPS',color:'#004B87'},
    shipave:{name:'ShipAve',color:'#00a651'},shipbiz:{name:'ShipBiz',color:'#0066cc'},
    custom:{name:'Custom',color:'#E85D04'},
  }
  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, marginBottom:6 }}>Carrier APIs</h1>
      <p style={{ color:'var(--text-3)', marginBottom:24 }}>Connect up to 5 carrier accounts for real-time tracking updates.</p>
      <div style={{ display:'grid', gap:14, marginBottom:20 }}>
        {slots.map(slot => {
          const meta = CARRIERS[slot.carrier]
          return (
            <div key={slot.slot} className="card" style={{ padding:'18px 22px', borderLeft:`5px solid ${meta?.color||'var(--border)'}`, animation:`fadeUp .3s ease ${slot.slot*50}ms both` }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ background:'var(--surface-2)', borderRadius:6, padding:'4px 10px', fontSize:10, fontWeight:800, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', flexShrink:0 }}>SLOT {slot.slot}</div>
                <div style={{ flex:1 }}>
                  {meta ? (
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontWeight:700, fontSize:15 }}>{slot.label||meta.name}</span>
                      {slot.environment && <span style={{ fontSize:11, background:'var(--surface-2)', padding:'2px 8px', borderRadius:99, color:'var(--text-2)' }}>{slot.environment}</span>}
                    </div>
                  ) : <span style={{ color:'var(--text-3)', fontStyle:'italic', fontSize:14 }}>Not configured</span>}
                </div>
                {meta && <span style={{ padding:'3px 12px', borderRadius:99, fontSize:11, fontWeight:700, background:slot.enabled?'var(--success-soft)':'var(--surface-2)', color:slot.enabled?'var(--success)':'var(--text-3)' }}>{slot.enabled?'● Active':'○ Inactive'}</span>}
                <button onClick={()=>notify('Configure in WordPress Admin → Arazi Logistics → Settings → Carrier APIs')} style={{ padding:'7px 16px', borderRadius:'var(--radius-sm)', fontSize:12, fontWeight:600, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text-2)', cursor:'pointer' }}>{meta?'✏️ Edit':'+ Configure'}</button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="card" style={{ padding:20, background:'#fffbeb', borderColor:'#f59e0b' }}>
        <div style={{ fontWeight:700, fontSize:13, marginBottom:6 }}>⚙️ Carrier API credentials are managed in WordPress</div>
        <p style={{ fontSize:13, color:'var(--text-2)', margin:0 }}>Go to WordPress Admin → Arazi Logistics → Settings → Carrier APIs to add or edit API keys. Credentials are stored securely server-side.</p>
      </div>
    </div>
  )
}
