import React, { useState, useEffect } from 'react'
import { useAuth } from '../App'

// ── WiPay config stored in localStorage ───────────────────────────────────────
const STORAGE_KEY = 'arazi_wipay_config'

const loadConfig = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || defaultConfig() }
  catch { return defaultConfig() }
}

const defaultConfig = () => ({
  account_number: '',
  api_key: '',
  country_code: 'JM',
  currency: 'JMD',
  environment: 'sandbox',
  fee_structure: 'customer_pay',
  return_url: window.location.origin + '/payment/return',
})

const saveConfig = (cfg) => localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))

// ── WiPay payment endpoint ────────────────────────────────────────────────────
const WIPAY_URL = {
  sandbox:    'https://sandbox.wipayfinancial.com/plugins/payments/request',
  production: 'https://wipayfinancial.com/plugins/payments/request',
}

export default function PointOfSale() {
  const { notify } = useAuth()
  const [tab, setTab]         = useState('pos')
  const [config, setConfig]   = useState(loadConfig)
  const [saving, setSaving]   = useState(false)
  const [showKey, setShowKey] = useState(false)

  // POS form
  const [customer, setCustomer]   = useState({ name:'', email:'', phone:'' })
  const [items, setItems]         = useState([{ desc:'', qty:1, price:'' }])
  const [notes, setNotes]         = useState('')
  const [processing, setProcessing] = useState(false)

  // Transaction history (localStorage)
  const [transactions, setTransactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('arazi_transactions') || '[]') }
    catch { return [] }
  })

  const total = items.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * (parseInt(i.qty) || 1), 0)

  const addItem    = () => setItems(p => [...p, { desc:'', qty:1, price:'' }])
  const removeItem = (i) => setItems(p => p.filter((_,idx) => idx !== i))
  const updateItem = (i, field, val) => setItems(p => p.map((item,idx) => idx===i ? {...item,[field]:val} : item))

  const handleSaveConfig = (e) => {
    e.preventDefault()
    setSaving(true)
    saveConfig(config)
    setTimeout(() => {
      setSaving(false)
      notify('WiPay settings saved successfully')
    }, 500)
  }

  const handleCharge = async (e) => {
    e.preventDefault()
    if (!config.account_number || !config.api_key) {
      notify('Please configure your WiPay credentials first in the Settings tab', 'error')
      setTab('settings')
      return
    }
    if (total <= 0) {
      notify('Please add at least one item with a price', 'error')
      return
    }
    if (!customer.name || !customer.email) {
      notify('Customer name and email are required', 'error')
      return
    }

    setProcessing(true)

    const orderId = 'AZ-' + Date.now()

    // Build transaction record
    const tx = {
      id:          orderId,
      customer:    customer.name,
      email:       customer.email,
      phone:       customer.phone,
      items:       [...items],
      total:       total.toFixed(2),
      currency:    config.currency,
      environment: config.environment,
      status:      'pending',
      date:        new Date().toISOString(),
      notes,
    }

    // Save to history
    const updated = [tx, ...transactions].slice(0, 100)
    setTransactions(updated)
    localStorage.setItem('arazi_transactions', JSON.stringify(updated))

    // WiPay uses a form POST redirect — build and submit the form
    // The customer is redirected to WiPay's hosted payment page
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = WIPAY_URL[config.environment]
    form.target = '_blank'

    const fields = {
      account_number: config.account_number,
      avs:            0,
      country_code:   config.country_code,
      currency:       config.currency,
      data_ref:       orderId,
      developer_id:   config.environment === 'sandbox' ? '1' : config.account_number,
      environment:    config.environment === 'sandbox' ? 'sandbox' : 'live',
      fee_structure:  config.fee_structure,
      method:         'credit_card',
      name:           customer.name,
      email:          customer.email,
      phone:          customer.phone || '',
      order_id:       orderId,
      response_url:   config.return_url,
      total:          total.toFixed(2),
    }

    Object.entries(fields).forEach(([key, val]) => {
      const input = document.createElement('input')
      input.type  = 'hidden'
      input.name  = key
      input.value = val
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)

    setTimeout(() => {
      setProcessing(false)
      notify(`Payment link opened for ${customer.name} — $${total.toFixed(2)} ${config.currency}`)
      // Reset form
      setCustomer({ name:'', email:'', phone:'' })
      setItems([{ desc:'', qty:1, price:'' }])
      setNotes('')
    }, 1000)
  }

  const totalRevenue = transactions
    .filter(t => t.status !== 'failed')
    .reduce((sum, t) => sum + parseFloat(t.total || 0), 0)

  const TABS = [
    { id:'pos',          label:'New Charge' },
    { id:'transactions', label:'Transactions' },
    { id:'settings',     label:'WiPay Settings' },
  ]

  const isConfigured = config.account_number && config.api_key

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, margin:0 }}>Point of Sale</h1>
          <p style={{ color:'var(--text-3)', fontSize:13, marginTop:4 }}>
            Charge customers via WiPay — Caribbean's leading payment gateway
          </p>
        </div>
        {/* WiPay status pill */}
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'8px 16px', borderRadius:'var(--radius)',
          background: isConfigured ? 'var(--success-soft)' : 'var(--warning-soft)',
          border: `1px solid ${isConfigured ? '#6ee7b7' : '#fcd34d'}`,
          fontSize:12, fontWeight:700,
          color: isConfigured ? 'var(--success)' : 'var(--warning)',
        }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background: isConfigured ? 'var(--success)' : 'var(--warning)', display:'inline-block' }}/>
          {isConfigured
            ? `WiPay ${config.environment === 'sandbox' ? 'Sandbox' : 'Live'}`
            : 'WiPay not configured'}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Total Transactions', value: transactions.length,                                              color:'var(--primary)' },
          { label:'Total Revenue',      value: `$${totalRevenue.toFixed(2)}`,                                    color:'var(--success)' },
          { label:'Pending',            value: transactions.filter(t=>t.status==='pending').length,              color:'var(--warning)' },
          { label:'Currency',           value: config.currency,                                                   color:'var(--purple)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:'18px 20px', borderTop:`3px solid ${s.color}` }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:26, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-3)', marginTop:4, textTransform:'uppercase', letterSpacing:'.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--surface-2)', padding:4, borderRadius:'var(--radius)', width:'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'7px 20px', borderRadius:'var(--radius-sm)', fontSize:13, fontWeight:600,
            border:'none', cursor:'pointer', transition:'all var(--transition)',
            background: tab===t.id ? 'var(--surface)' : 'transparent',
            color: tab===t.id ? 'var(--text-1)' : 'var(--text-3)',
            boxShadow: tab===t.id ? 'var(--shadow-sm)' : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── New Charge tab ──────────────────────────────────────────────────── */}
      {tab === 'pos' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:20 }}>

          {/* Left — form */}
          <div>
            {!isConfigured && (
              <div style={{ padding:'14px 18px', background:'var(--warning-soft)', borderRadius:'var(--radius)', border:'1px solid #fcd34d', marginBottom:20, fontSize:13, color:'#92400e', display:'flex', alignItems:'center', gap:10 }}>
                <span>⚠</span>
                <span>WiPay credentials not set. <button onClick={()=>setTab('settings')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--primary)', fontWeight:700, fontSize:13, padding:0, textDecoration:'underline' }}>Configure now →</button></span>
              </div>
            )}

            {/* Customer */}
            <div className="card" style={{ padding:24, marginBottom:16 }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, marginBottom:16 }}>Customer Details</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <FormField label="Full Name *"     value={customer.name}  onChange={v=>setCustomer(p=>({...p,name:v}))}  placeholder="Marcus Brown" />
                <FormField label="Email *"         value={customer.email} onChange={v=>setCustomer(p=>({...p,email:v}))} placeholder="marcus@email.com" type="email" />
              </div>
              <FormField label="Phone" value={customer.phone} onChange={v=>setCustomer(p=>({...p,phone:v}))} placeholder="+1 876 000 0000" type="tel" />
            </div>

            {/* Items */}
            <div className="card" style={{ padding:24, marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, margin:0 }}>Items / Services</h3>
                <button onClick={addItem} style={{ background:'var(--primary-soft)', color:'var(--primary)', border:'none', padding:'6px 14px', borderRadius:'var(--radius-sm)', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Add Item</button>
              </div>

              {/* Column headers */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 80px 110px 32px', gap:8, marginBottom:8 }}>
                {['Description','Qty','Price ('+config.currency+')',''].map(h => (
                  <div key={h} style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em' }}>{h}</div>
                ))}
              </div>

              {items.map((item, i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 80px 110px 32px', gap:8, marginBottom:8 }}>
                  <input
                    value={item.desc} onChange={e=>updateItem(i,'desc',e.target.value)}
                    placeholder="e.g. Sea freight — 10 lbs"
                    style={{ padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)', outline:'none' }}
                    onFocus={e=>e.target.style.borderColor='var(--primary)'}
                    onBlur={e=>e.target.style.borderColor='var(--border)'}
                  />
                  <input
                    type="number" min="1" value={item.qty} onChange={e=>updateItem(i,'qty',e.target.value)}
                    style={{ padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)', outline:'none', textAlign:'center' }}
                    onFocus={e=>e.target.style.borderColor='var(--primary)'}
                    onBlur={e=>e.target.style.borderColor='var(--border)'}
                  />
                  <input
                    type="number" min="0" step="0.01" value={item.price} onChange={e=>updateItem(i,'price',e.target.value)}
                    placeholder="0.00"
                    style={{ padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)', outline:'none', textAlign:'right' }}
                    onFocus={e=>e.target.style.borderColor='var(--primary)'}
                    onBlur={e=>e.target.style.borderColor='var(--border)'}
                  />
                  <button onClick={()=>removeItem(i)} disabled={items.length===1}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'var(--danger)', fontSize:18, opacity:items.length===1?.3:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    ×
                  </button>
                </div>
              ))}

              <div style={{ marginTop:8 }}>
                <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Notes (optional)</label>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
                  placeholder="Order notes, shipment reference, special instructions…"
                  style={{ width:'100%', padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)', outline:'none', resize:'vertical', boxSizing:'border-box' }}
                  onFocus={e=>e.target.style.borderColor='var(--primary)'}
                  onBlur={e=>e.target.style.borderColor='var(--border)'}
                />
              </div>
            </div>
          </div>

          {/* Right — order summary + charge button */}
          <div>
            <div className="card" style={{ padding:24, position:'sticky', top:20 }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, marginBottom:20 }}>Order Summary</h3>

              {items.filter(i=>i.desc||i.price).map((item,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:13 }}>
                  <span style={{ color:'var(--text-2)', flex:1, marginRight:8 }}>{item.desc || 'Item'} × {item.qty}</span>
                  <span style={{ fontWeight:600 }}>{config.currency} {((parseFloat(item.price)||0)*(parseInt(item.qty)||1)).toFixed(2)}</span>
                </div>
              ))}

              <div style={{ borderTop:'2px solid var(--border)', marginTop:16, paddingTop:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:16 }}>Total</span>
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, color:'var(--primary)' }}>
                    {config.currency} {total.toFixed(2)}
                  </span>
                </div>
                {config.fee_structure === 'customer_pay' && total > 0 && (
                  <div style={{ fontSize:11, color:'var(--text-3)', marginTop:6, textAlign:'right' }}>
                    + WiPay fee (paid by customer)
                  </div>
                )}
              </div>

              {/* Payment method icons */}
              <div style={{ margin:'20px 0', padding:'14px', background:'var(--surface-2)', borderRadius:'var(--radius-sm)', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:8, fontWeight:600 }}>ACCEPTED PAYMENT METHODS</div>
                <div style={{ display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap' }}>
                  {['VISA','Mastercard','WiPay Wallet','WiPay Voucher'].map(m => (
                    <span key={m} style={{ fontSize:10, fontWeight:700, padding:'3px 8px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:4, color:'var(--text-2)' }}>{m}</span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCharge}
                disabled={processing || total<=0 || !customer.name || !customer.email}
                style={{
                  width:'100%', padding:'14px', borderRadius:'var(--radius)',
                  background: processing ? 'var(--text-3)' : 'linear-gradient(135deg, #0069b4, #005a9a)',
                  color:'#fff', border:'none', fontSize:15, fontWeight:700,
                  cursor: processing||total<=0||!customer.name||!customer.email ? 'not-allowed' : 'pointer',
                  opacity: total<=0||!customer.name||!customer.email ? .5 : 1,
                  transition:'all .2s',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                }}
              >
                {processing ? (
                  <>
                    <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'arazi-spin .7s linear infinite', display:'inline-block' }}/>
                    Opening WiPay…
                  </>
                ) : (
                  <>💳 Charge {config.currency} {total.toFixed(2)}</>
                )}
              </button>

              <div style={{ marginTop:12, fontSize:11, color:'var(--text-3)', textAlign:'center', lineHeight:1.6 }}>
                Customer will be redirected to WiPay's secure hosted payment page. Payment confirmation is sent automatically.
              </div>

              {config.environment === 'sandbox' && (
                <div style={{ marginTop:10, padding:'10px 12px', background:'#fffbeb', borderRadius:'var(--radius-sm)', border:'1px solid #fcd34d', fontSize:11, color:'#92400e', textAlign:'center' }}>
                  🧪 Sandbox mode — use card 4111 1111 1111 1111, CVV 123, any future expiry
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Transactions tab ──────────────────────────────────────────────────── */}
      {tab === 'transactions' && (
        <div className="card" style={{ overflow:'hidden' }}>
          {transactions.length === 0 ? (
            <div style={{ padding:48, textAlign:'center', color:'var(--text-3)' }}>
              <div style={{ fontSize:36, marginBottom:12 }}>💳</div>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>No transactions yet</div>
              <div style={{ fontSize:13 }}>Charges will appear here after you process them</div>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
                    {['Order ID','Customer','Amount','Currency','Environment','Status','Date'].map(h=>(
                      <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:800, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} style={{ borderBottom:'1px solid var(--border-light)' }}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    >
                      <td style={{ padding:'12px 16px', fontFamily:'monospace', fontSize:12, color:'var(--primary)', fontWeight:700 }}>{tx.id}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ fontWeight:600 }}>{tx.customer}</div>
                        <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{tx.email}</div>
                      </td>
                      <td style={{ padding:'12px 16px', fontWeight:700 }}>{tx.total}</td>
                      <td style={{ padding:'12px 16px', color:'var(--text-2)' }}>{tx.currency}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:700,
                          background: tx.environment==='sandbox' ? 'var(--warning-soft)' : 'var(--success-soft)',
                          color: tx.environment==='sandbox' ? 'var(--warning)' : 'var(--success)',
                        }}>{tx.environment}</span>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700,
                          background: tx.status==='completed' ? 'var(--success-soft)' : tx.status==='failed' ? 'var(--danger-soft)' : 'var(--warning-soft)',
                          color: tx.status==='completed' ? 'var(--success)' : tx.status==='failed' ? 'var(--danger)' : 'var(--warning)',
                        }}>{tx.status}</span>
                      </td>
                      <td style={{ padding:'12px 16px', color:'var(--text-3)', fontSize:12 }}>
                        {new Date(tx.date).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Settings tab ──────────────────────────────────────────────────────── */}
      {tab === 'settings' && (
        <div style={{ maxWidth:600 }}>
          <div className="card" style={{ padding:28, marginBottom:16 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:6 }}>WiPay API Credentials</h3>
            <p style={{ color:'var(--text-3)', fontSize:13, marginBottom:24, lineHeight:1.6 }}>
              Get your Account Number and API Key from your WiPay dashboard → click your profile picture → Developer.
            </p>

            <form onSubmit={handleSaveConfig}>
              <FormField
                label="WiPay Account Number *"
                value={config.account_number}
                onChange={v=>setConfig(p=>({...p,account_number:v}))}
                placeholder="Your WiPay account number"
              />

              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>API Key *</label>
                <div style={{ display:'flex', gap:8 }}>
                  <input
                    type={showKey?'text':'password'}
                    value={config.api_key}
                    onChange={e=>setConfig(p=>({...p,api_key:e.target.value}))}
                    placeholder="Your WiPay API key"
                    style={{ flex:1, padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:14, background:'var(--surface)', color:'var(--text-1)', outline:'none' }}
                    onFocus={e=>e.target.style.borderColor='var(--primary)'}
                    onBlur={e=>e.target.style.borderColor='var(--border)'}
                  />
                  <button type="button" onClick={()=>setShowKey(v=>!v)}
                    style={{ padding:'0 14px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--surface-2)', cursor:'pointer', fontSize:14 }}>
                    {showKey?'🙈':'👁'}
                  </button>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Country Code</label>
                  <select value={config.country_code} onChange={e=>setConfig(p=>({...p,country_code:e.target.value}))}
                    style={{ width:'100%', padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)' }}>
                    <option value="JM">JM — Jamaica</option>
                    <option value="TT">TT — Trinidad & Tobago</option>
                    <option value="BB">BB — Barbados</option>
                    <option value="GY">GY — Guyana</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Currency</label>
                  <select value={config.currency} onChange={e=>setConfig(p=>({...p,currency:e.target.value}))}
                    style={{ width:'100%', padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)' }}>
                    <option value="JMD">JMD — Jamaican Dollar</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="TTD">TTD — TT Dollar</option>
                    <option value="BBD">BBD — Barbadian Dollar</option>
                  </select>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Environment</label>
                  <select value={config.environment} onChange={e=>setConfig(p=>({...p,environment:e.target.value}))}
                    style={{ width:'100%', padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)' }}>
                    <option value="sandbox">🧪 Sandbox (Testing)</option>
                    <option value="production">🟢 Production (Live)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>Fee Structure</label>
                  <select value={config.fee_structure} onChange={e=>setConfig(p=>({...p,fee_structure:e.target.value}))}
                    style={{ width:'100%', padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'var(--surface)', color:'var(--text-1)' }}>
                    <option value="customer_pay">Customer Pays Fee</option>
                    <option value="merchant_absorb">Merchant Absorbs Fee</option>
                    <option value="split">Split Fee</option>
                  </select>
                </div>
              </div>

              <FormField
                label="Return URL (after payment)"
                value={config.return_url}
                onChange={v=>setConfig(p=>({...p,return_url:v}))}
                placeholder="https://yourdomain.com/payment/return"
              />

              <div style={{ padding:'14px 16px', background:'var(--surface-2)', borderRadius:'var(--radius-sm)', fontSize:12, color:'var(--text-2)', marginBottom:20, lineHeight:1.7 }}>
                <strong>Where to find your credentials:</strong><br/>
                1. Log into wipaycaribbean.com<br/>
                2. Click your profile picture → <strong>Developer</strong><br/>
                3. Enter your website URL to generate your API Key<br/>
                4. Your Account Number is shown on the same page
              </div>

              <button type="submit" disabled={saving}
                style={{ padding:'11px 28px', borderRadius:'var(--radius-sm)', background:'var(--primary)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', opacity:saving?.7:1 }}>
                {saving ? 'Saving…' : '💾 Save WiPay Settings'}
              </button>
            </form>
          </div>

          {/* Test card info */}
          {config.environment === 'sandbox' && (
            <div className="card" style={{ padding:20, background:'#fffbeb', borderColor:'#fcd34d' }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>🧪 Sandbox Test Card Details</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:13 }}>
                {[
                  ['Card Number', '4111 1111 1111 1111'],
                  ['CVV', '123'],
                  ['Expiry Month', 'Any (e.g. 01)'],
                  ['Expiry Year', 'Any future year'],
                  ['Developer ID', '1 (auto-set in sandbox)'],
                  ['Result', 'Successful test payment'],
                ].map(([l,v])=>(
                  <React.Fragment key={l}>
                    <div style={{ color:'var(--text-3)', fontWeight:600 }}>{l}</div>
                    <div style={{ fontFamily:'monospace', fontWeight:700 }}>{v}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes arazi-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function FormField({ label, value, onChange, placeholder, type='text' }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', display:'block', marginBottom:6 }}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%', padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:14, background:'var(--surface)', color:'var(--text-1)', outline:'none', boxSizing:'border-box', transition:'border .15s' }}
        onFocus={e=>e.target.style.borderColor='var(--primary)'}
        onBlur={e=>e.target.style.borderColor='var(--border)'}
      />
    </div>
  )
}
