import React, { useState } from 'react'
import { useAuth } from '../App'
import { createShipment } from '../services/api'

export default function AddShipment({ onNavigate }) {
  const { notify } = useAuth()
  const [form, setForm] = useState({
    customer_name:'', customer_email:'', origin:'', destination:'',
    service_type:'sea', weight_kg:'', dimensions:'', description:'', estimated_delivery:''
  })
  const [saving, setSaving] = useState(false)
  const u = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await createShipment(form)
      notify(`Shipment ${res.shipment.tracking_number} created!`)
      onNavigate('shipments')
    } catch (err) {
      notify(err.message || 'Failed to create shipment', 'error')
    }
    setSaving(false)
  }

  return (
    <div style={{ animation:'fadeUp .3s ease', maxWidth:700 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, margin:0 }}>Add Shipment</h1>
        <p style={{ color:'var(--text-3)', fontSize:13, marginTop:4 }}>Create a new shipment and notify the customer</p>
      </div>
      <div className="card" style={{ padding:28 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <F label="Customer Name *"  value={form.customer_name}  onChange={v=>u('customer_name',v)}  placeholder="Marcus Brown" />
            <F label="Customer Email *" value={form.customer_email} onChange={v=>u('customer_email',v)} placeholder="marcus@email.com" type="email" />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <F label="Origin *"      value={form.origin}      onChange={v=>u('origin',v)}      placeholder="Miami, FL, USA" />
            <F label="Destination *" value={form.destination} onChange={v=>u('destination',v)} placeholder="Kingston, Jamaica" />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:16 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Service Type *</label>
              <select value={form.service_type} onChange={e=>u('service_type',e.target.value)}
                style={{ width:'100%', padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)' }}>
                <option value="sea">Sea Freight</option>
                <option value="air">Air Freight</option>
                <option value="express">Express</option>
                <option value="last-mile">Last-Mile</option>
              </select>
            </div>
            <F label="Weight (kg)"   value={form.weight_kg}  onChange={v=>u('weight_kg',v)}  placeholder="0.00" type="number" />
            <F label="Dimensions"    value={form.dimensions}  onChange={v=>u('dimensions',v)}  placeholder="L×W×H cm" />
          </div>
          <div style={{ marginBottom:16 }}>
            <F label="Est. Delivery Date" value={form.estimated_delivery} onChange={v=>u('estimated_delivery',v)} type="date" />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Description</label>
            <textarea value={form.description} onChange={e=>u('description',e.target.value)} rows={3}
              placeholder="Package contents, special instructions…"
              style={{ width:'100%', padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)', resize:'vertical', boxSizing:'border-box' }} />
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <button type="submit" disabled={saving}
              style={{ padding:'11px 28px', borderRadius:'var(--radius-sm)', background:'var(--primary)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', opacity:saving?.7:1 }}>
              {saving ? 'Creating…' : 'Create Shipment'}
            </button>
            <button type="button" onClick={() => onNavigate('shipments')}
              style={{ padding:'11px 28px', borderRadius:'var(--radius-sm)', background:'var(--surface-2)', color:'var(--text-2)', border:'1px solid var(--border)', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function F({ label, value, onChange, placeholder, type='text' }) {
  return (
    <div>
      <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%', padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)', outline:'none', boxSizing:'border-box' }}
        onFocus={e=>e.target.style.borderColor='var(--primary)'}
        onBlur={e=>e.target.style.borderColor='var(--border)'} />
    </div>
  )
}
