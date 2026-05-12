import React, { useState, useEffect } from 'react'
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { MOCK_STATS, MOCK_CHART, MOCK_SHIPMENTS, fetchDashboard } from '../services/api'
import { useAuth } from '../App'

const STATUS_COLOR = {
  pending:'#c27803', in_transit:'#1a56db', customs:'#7e3af2',
  out_for_delivery:'#E85D04', delivered:'#0e9f6e', exception:'#e02424',
}
const STATUS_LABEL = {
  pending:'Pending', in_transit:'In Transit', customs:'Customs',
  out_for_delivery:'Out for Delivery', delivered:'Delivered', exception:'Exception',
}

// Stat card matching the Wanhub design
function StatCard({ icon, label, value, sub, delta, color, delay = 0 }) {
  return (
    <div className="card" style={{
      padding: '20px 22px',
      animation: `fadeUp .4s ease both`,
      animationDelay: `${delay}ms`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position:'absolute', top:0, right:0,
        width:80, height:80, borderRadius:'0 0 0 80px',
        background: color + '0f',
      }}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div style={{
          width:36, height:36, borderRadius:10,
          background: color + '18',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:18,
        }}>{icon}</div>
        {delta != null && (
          <span style={{
            fontSize:11, fontWeight:700,
            color: delta >= 0 ? 'var(--success)' : 'var(--danger)',
            background: delta >= 0 ? 'var(--success-soft)' : 'var(--danger-soft)',
            padding:'3px 8px', borderRadius:99,
          }}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:800, color:'var(--text-1)', lineHeight:1 }}>
        {value}
      </div>
      <div style={{ color:'var(--text-2)', fontSize:13, marginTop:6, fontWeight:500 }}>{label}</div>
      {sub && <div style={{ color:'var(--text-3)', fontSize:11, marginTop:3 }}>{sub}</div>}
    </div>
  )
}

// Chart range buttons
function RangeBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:'5px 12px', borderRadius:6, fontSize:12, fontWeight:500,
      border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
      background: active ? 'var(--primary-soft)' : 'transparent',
      color: active ? 'var(--primary)' : 'var(--text-2)',
      cursor:'pointer', transition:'all var(--transition)',
    }}>{label}</button>
  )
}

// Custom tooltip
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background:'var(--sidebar-bg)', border:'none', borderRadius:'var(--radius)',
      padding:'10px 14px', boxShadow:'var(--shadow-lg)',
    }}>
      <div style={{ color:'rgba(255,255,255,.5)', fontSize:11, marginBottom:6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color:'#fff', fontSize:12, fontWeight:600, display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:p.color, display:'inline-block' }}/>
          {p.name}: {p.name === 'revenue' ? '$' + p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  )
}

export default function Dashboard({ onNavigate }) {
  const { notify } = useAuth()
  const [stats, setStats] = useState(MOCK_STATS)
  const [chartRange, setChartRange] = useState('3months')
  const [loading, setLoading] = useState(false)
  const [recentShipments] = useState(MOCK_SHIPMENTS.slice(0, 6))

  // Generate chart data based on range
  const chartData = (() => {
    if (chartRange === '7days') {
      return Array.from({length:7}, (_,i) => {
        const d = new Date(); d.setDate(d.getDate() - (6-i))
        return {
          month: d.toLocaleDateString('en',{weekday:'short'}),
          packages: Math.floor(Math.random()*8+1),
          customers: Math.floor(Math.random()*3),
          revenue: Math.floor(Math.random()*15000+5000),
        }
      })
    }
    if (chartRange === '30days') {
      return Array.from({length:10}, (_,i) => ({
        month: `${i*3+1}-${i*3+3}`,
        packages: Math.floor(Math.random()*15+3),
        customers: Math.floor(Math.random()*5+1),
        revenue: Math.floor(Math.random()*30000+10000),
      }))
    }
    return MOCK_CHART
  })()

  const locationData = [
    { name:'Kingston',    value:8, color:'#1a56db' },
    { name:'Portmore',    value:5, color:'#0e9f6e' },
    { name:'Spanish Town',value:3, color:'#E85D04' },
    { name:'Montego Bay', value:2, color:'#7e3af2' },
  ]

  const revenueData = MOCK_CHART.map(d => ({ ...d, revenue: Math.floor(d.revenue * 1.4) }))

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>

      {/* Stat cards — 5 across like Wanhub */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:16, marginBottom:24 }}>
        <StatCard icon="👥" label="Total Customers" value={stats.total} sub="LAST 90 DAYS"   delta={12.5} color="#1a56db" delay={0} />
        <StatCard icon="👤" label="Registered Users" value={18}         sub="ALL TIME"       delta={8.2}  color="#7e3af2" delay={60} />
        <StatCard icon="📦" label="Pkgs Processed"  value={stats.total} sub="LAST 90 DAYS"   delta={3.1}  color="#0e9f6e" delay={120} />
        <StatCard icon="📊" label="Customers / Day" value={(stats.total/90).toFixed(1)} sub="DAILY AVG" delta={null} color="#c27803" delay={180} />
        <StatCard icon="📈" label="Packages / Day"  value={(stats.total/90*1.3).toFixed(1)} sub="DAILY AVG" delta={5.7} color="#E85D04" delay={240} />
      </div>

      {/* Package & Customer Growth chart */}
      <div className="card" style={{ padding:24, marginBottom:20, animation:'fadeUp .4s ease .1s both' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, color:'var(--text-1)' }}>
              Package &amp; Customer Growth
            </div>
            <div style={{ color:'var(--text-3)', fontSize:12, marginTop:3 }}>
              Total for the last {chartRange === '7days' ? '7 days' : chartRange === '30days' ? '30 days' : '3 months'}
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <RangeBtn label="Last 3 months" active={chartRange==='3months'} onClick={()=>setChartRange('3months')} />
            <RangeBtn label="Last 30 days"  active={chartRange==='30days'}  onClick={()=>setChartRange('30days')} />
            <RangeBtn label="Last 7 days"   active={chartRange==='7days'}   onClick={()=>setChartRange('7days')} />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{top:5,right:10,bottom:0,left:-10}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{fontSize:12,paddingTop:12}} />
            <Line type="monotone" dataKey="packages"  stroke="#0e9f6e" strokeWidth={2} dot={false} activeDot={{r:4}} />
            <Line type="monotone" dataKey="customers" stroke="#1a56db" strokeWidth={2} dot={false} activeDot={{r:4}} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom two charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>

        {/* Customers by Location */}
        <div className="card" style={{ padding:24, animation:'fadeUp .4s ease .2s both' }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, marginBottom:4 }}>
            Customers by Location
          </div>
          <div style={{ color:'var(--text-3)', fontSize:12, marginBottom:20 }}>Distribution across major cities</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:32 }}>
            <PieChart width={180} height={180}>
              <Pie data={locationData} cx={85} cy={85} innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                {locationData.map((d,i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <text x={90} y={80} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:22,fill:'var(--text-1)'}}>
                {locationData.reduce((a,b)=>a+b.value,0)}
              </text>
              <text x={90} y={100} textAnchor="middle" dominantBaseline="middle" style={{fontSize:11,fill:'var(--text-3)'}}>
                Customers
              </text>
            </PieChart>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {locationData.map(d => (
                <div key={d.name} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
                  <span style={{ width:10, height:10, borderRadius:3, background:d.color, flexShrink:0 }}/>
                  <span style={{ color:'var(--text-2)', flex:1 }}>{d.name}</span>
                  <span style={{ fontWeight:700, color:'var(--text-1)' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)', textAlign:'center' }}>
            <div style={{ fontSize:12, color:'var(--success)', fontWeight:600 }}>Growing customer base across regions ↗</div>
            <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>Showing customer distribution by location</div>
          </div>
        </div>

        {/* Revenue Trends */}
        <div className="card" style={{ padding:24, animation:'fadeUp .4s ease .25s both' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
            <span style={{ color:'var(--text-3)' }}>$</span>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15 }}>Revenue Trends</span>
          </div>
          <div style={{ color:'var(--text-3)', fontSize:12, marginBottom:16 }}>Monthly revenue performance</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData} margin={{top:5,right:0,bottom:0,left:-20}}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1a56db" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#1a56db" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{fontSize:10,fill:'var(--text-3)'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize:10,fill:'var(--text-3)'}} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#1a56db" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{r:4}} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)', textAlign:'center' }}>
            <div style={{ fontSize:12, color:'var(--success)', fontWeight:600 }}>Revenue growth of 128.0% this year ↗</div>
            <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>
              Average monthly revenue: ${(revenueData.reduce((a,b)=>a+b.revenue,0)/revenueData.length).toLocaleString(undefined,{maximumFractionDigits:0})}
            </div>
          </div>
        </div>
      </div>

      {/* Recent shipments mini table */}
      <div className="card" style={{ padding:24, animation:'fadeUp .4s ease .3s both' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15 }}>Recent Shipments</div>
          <button
            onClick={() => onNavigate('shipments')}
            style={{
              fontSize:12, fontWeight:600, color:'var(--primary)',
              background:'var(--primary-soft)', border:'none',
              padding:'5px 14px', borderRadius:99, cursor:'pointer',
            }}
          >View all →</button>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid var(--border)' }}>
              {['Tracking #','Customer','Route','Service','Status','Updated'].map(h => (
                <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentShipments.map(s => (
              <tr key={s.id} style={{ borderBottom:'1px solid var(--border-light)' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              >
                <td style={{ padding:'10px 12px' }}>
                  <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:700, color:'var(--primary)' }}>{s.tracking_number}</span>
                </td>
                <td style={{ padding:'10px 12px', color:'var(--text-2)' }}>{s.customer_name}</td>
                <td style={{ padding:'10px 12px', fontSize:12 }}>
                  <span style={{ color:'var(--text-2)' }}>{s.origin.split(',')[0]}</span>
                  <span style={{ color:'var(--accent)', margin:'0 6px' }}>→</span>
                  <span style={{ color:'var(--text-2)' }}>{s.destination.split(',')[0]}</span>
                </td>
                <td style={{ padding:'10px 12px' }}>
                  <span className={`badge badge-${s.service_type==='air'?'purple':s.service_type==='express'?'orange':s.service_type==='last-mile'?'green':'blue'}`}>
                    {s.service_type}
                  </span>
                </td>
                <td style={{ padding:'10px 12px' }}>
                  <span style={{
                    padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700,
                    background: STATUS_COLOR[s.status] + '18',
                    color: STATUS_COLOR[s.status],
                  }}>{STATUS_LABEL[s.status]}</span>
                </td>
                <td style={{ padding:'10px 12px', color:'var(--text-3)', fontSize:12 }}>
                  {new Date(s.updated_at).toLocaleDateString('en',{month:'short',day:'numeric'})}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
