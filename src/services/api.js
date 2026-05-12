// ── API Configuration ─────────────────────────────────────────────────────────
// Change WP_BASE to your WordPress site URL
const WP_BASE = import.meta.env.VITE_WP_URL || 'https://your-arazi-site.com'
const API_BASE = `${WP_BASE}/wp-json/arazi/v1`

// ── Auth helpers ──────────────────────────────────────────────────────────────
export const getAuth = () => ({
  username:    localStorage.getItem('arazi_username') || '',
  appPassword: localStorage.getItem('arazi_app_password') || '',
})

export const saveAuth = (username, appPassword, userData) => {
  localStorage.setItem('arazi_username', username)
  localStorage.setItem('arazi_app_password', appPassword)
  localStorage.setItem('arazi_user', JSON.stringify(userData))
}

export const clearAuth = () => {
  localStorage.removeItem('arazi_username')
  localStorage.removeItem('arazi_app_password')
  localStorage.removeItem('arazi_user')
}

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('arazi_user') || 'null') }
  catch { return null }
}

// ── Fetch wrapper ─────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const { username, appPassword } = getAuth()
  const headers = {
    'Content-Type': 'application/json',
    ...(username && appPassword
      ? { Authorization: `Basic ${btoa(`${username}:${appPassword}`)}` }
      : {}),
    ...options.headers,
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = (username, password) =>
  apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })

// ── Dashboard stats ───────────────────────────────────────────────────────────
export const fetchDashboard = async () => {
  const [allShips, transit, outDel, customs, exception, quotesNew] = await Promise.all([
    apiFetch('/admin/shipments?per_page=1'),
    apiFetch('/admin/shipments?per_page=1&status=in_transit'),
    apiFetch('/admin/shipments?per_page=1&status=out_for_delivery'),
    apiFetch('/admin/shipments?per_page=1&status=customs'),
    apiFetch('/admin/shipments?per_page=1&status=exception'),
    apiFetch('/admin/quotes?per_page=50&status=new'),
  ])
  return {
    total:           allShips.total || 0,
    in_transit:      transit.total || 0,
    out_for_delivery:outDel.total || 0,
    customs:         customs.total || 0,
    exception:       exception.total || 0,
    new_quotes:      quotesNew.quotes?.length || 0,
  }
}

// ── Shipments ─────────────────────────────────────────────────────────────────
export const fetchShipments = (page = 1, status = '', search = '') =>
  apiFetch(`/admin/shipments?page=${page}&per_page=20${status ? `&status=${status}` : ''}`)

export const fetchShipment = (id) =>
  apiFetch(`/shipments/${id}`)

export const createShipment = (data) =>
  apiFetch('/admin/shipments', { method: 'POST', body: JSON.stringify(data) })

export const updateShipment = (id, data) =>
  apiFetch(`/admin/shipments/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const addTrackingEvent = (id, data) =>
  apiFetch(`/admin/shipments/${id}/events`, { method: 'POST', body: JSON.stringify(data) })

export const syncShipment = (id) =>
  apiFetch(`/admin/shipments/${id}/sync`, { method: 'POST' })

export const assignCarrier = (id, slot, carrierTn) =>
  apiFetch(`/admin/shipments/${id}/carrier`, {
    method: 'PUT',
    body: JSON.stringify({ carrier_slot: slot, carrier_tracking_number: carrierTn })
  })

// ── Quotes ────────────────────────────────────────────────────────────────────
export const fetchQuotes = (page = 1, status = '') =>
  apiFetch(`/admin/quotes?page=${page}&per_page=20${status ? `&status=${status}` : ''}`)

export const respondQuote = (id, data) =>
  apiFetch(`/admin/quotes/${id}`, { method: 'PUT', body: JSON.stringify(data) })

// ── Shipping rates ────────────────────────────────────────────────────────────
export const calculateRate = (data) =>
  apiFetch('/calculate-rate', { method: 'POST', body: JSON.stringify(data) })

// ── Shippers ──────────────────────────────────────────────────────────────────
export const fetchShippers = () => apiFetch('/admin/shippers')
export const saveShipper = (slot, data) =>
  apiFetch(`/admin/shippers/${slot}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteShipper = (slot) =>
  apiFetch(`/admin/shippers/${slot}`, { method: 'DELETE' })
export const testShipper = (slot, tn) =>
  apiFetch(`/admin/shippers/${slot}/test`, { method: 'POST', body: JSON.stringify({ test_tracking_number: tn }) })

// ── Webhook log ───────────────────────────────────────────────────────────────
export const fetchWebhookLog = () => apiFetch('/admin/webhook-log')

// ── Profile ───────────────────────────────────────────────────────────────────
export const fetchProfile = () => apiFetch('/profile')

// ── Mock data for demo (when not connected to WP) ─────────────────────────────
export const MOCK_STATS = {
  total: 23, in_transit: 8, out_for_delivery: 3, customs: 2, exception: 1, new_quotes: 5,
}

export const MOCK_CHART = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  packages: Math.floor(Math.random() * 40 + 10),
  revenue:  Math.floor(Math.random() * 60000 + 80000),
  customers: Math.floor(Math.random() * 8 + 2),
}))

export const MOCK_SHIPMENTS = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  tracking_number: `AZ-${String.fromCharCode(65+i%26)}${String.fromCharCode(75+i%10)}-${100000+i}`,
  customer_name: ['Marcus Brown','Kezia Williams','Devon Campbell','Asha Reid','Omar Francis'][i % 5],
  customer_email: `customer${i+1}@example.com`,
  origin: ['Miami, FL','New York, NY','Toronto, CA','London, UK','Kingston, JM'][i % 5],
  destination: ['Kingston, JM','Portmore, JM','Spanish Town, JM','Montego Bay, JM','Mandeville, JM'][i % 5],
  service_type: ['sea','air','express','last-mile'][i % 4],
  status: ['pending','in_transit','customs','out_for_delivery','delivered','exception'][i % 6],
  status_label: ['Pending','In Transit','Customs','Out for Delivery','Delivered','Exception'][i % 6],
  weight_kg: (Math.random() * 20 + 0.5).toFixed(1),
  estimated_delivery: new Date(Date.now() + (i+1) * 86400000 * 2).toISOString().split('T')[0],
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
  updated_at: new Date(Date.now() - i * 3600000).toISOString(),
}))

export const MOCK_QUOTES = Array.from({ length: 8 }, (_, i) => ({
  id: i+1, reference: `QT-${String.fromCharCode(65+i)}XM${i+1}29`,
  customer_name: ['Sasha King','Tony Brown','Nadia Lee','Carlos Vega'][i%4],
  customer_email: `quote${i+1}@example.com`,
  origin: ['Miami, FL','New York'][i%2],
  destination: 'Kingston, JM',
  service_type: ['sea','air','express'][i%3],
  weight_kg: (Math.random()*15+1).toFixed(1),
  status: ['new','quoted','accepted'][i%3],
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
  quoted_price: i > 0 ? (Math.random()*500+50).toFixed(2) : null,
}))
