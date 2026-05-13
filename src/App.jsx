import React, { useState, createContext, useContext } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Dashboard from './pages/Dashboard'
import Shipments from './pages/Shipments'
import Quotes from './pages/Quotes'
import Calculator from './pages/Calculator'
import Carriers from './pages/Carriers'
import WebhookLog from './pages/WebhookLog'
import Profile from './pages/Profile'
import PointOfSale from './pages/PointOfSale'
import Customers from './pages/Customers'
import AddShipment from './pages/AddShipment' 
import Login from './pages/Login'
import { getUser, clearAuth } from './services/api'

export const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

const PAGES = {
  dashboard: Dashboard,
  pos:       PointOfSale,
  shipments: Shipments,
  quotes:    Quotes,
  calculator:Calculator,
  carriers:  Carriers,
  webhooks:  WebhookLog,
  profile:   Profile,
  customers: Customers,
 addshipment: AddShipment,
}

export default function App() {
  const [user, setUser]               = useState(getUser())
  const [page, setPage]               = useState('dashboard')
  const [pageParams, setPageParams]   = useState({})
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notification, setNotification] = useState(null)

  const navigate = (p, params = {}) => { setPage(p); setPageParams(params) }
  const logout   = () => { clearAuth(); setUser(null) }
  const notify   = (msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3500)
  }

  if (!user) {
    return (
      <AuthCtx.Provider value={{ user, setUser, notify }}>
        <Login onLogin={setUser} />
      </AuthCtx.Provider>
    )
  }

  const PageComponent = PAGES[page] || Dashboard

  return (
    <AuthCtx.Provider value={{ user, setUser, logout, notify, navigate }}>
      <div style={{ display:'flex', height:'100vh', width:'100vw', overflow:'hidden', background:'var(--bg)' }}>
        <Sidebar activePage={page} onNavigate={navigate} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(v => !v)} />
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0, width:'100%' }}>
          <TopBar page={page} user={user} onLogout={logout} onToggleSidebar={() => setSidebarOpen(v => !v)} onNavigate={navigate} />
          <main style={{ flex:1, overflow:'auto', padding:'24px 28px', width:'100%', boxSizing:'border-box' }}>
            <PageComponent params={pageParams} onNavigate={navigate} />
          </main>
        </div>
      </div>
      {notification && (
        <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, background: notification.type==='error' ? '#e02424' : '#0f172a', color:'#fff', padding:'12px 20px', borderRadius:'var(--radius)', boxShadow:'var(--shadow-lg)', fontSize:'13px', fontWeight:500, animation:'fadeUp .2s ease', display:'flex', alignItems:'center', gap:10, maxWidth:360 }}>
          <span>{notification.type === 'error' ? '✗' : '✓'}</span>
          {notification.msg}
        </div>
      )}
    </AuthCtx.Provider>
  )
}
