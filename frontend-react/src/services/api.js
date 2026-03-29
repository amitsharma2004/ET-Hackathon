/**
 * RevenueGuard AI — API Service
 * All calls go to /api (proxied to FastAPI backend by Vite in dev, or directly in prod)
 */
import axios from 'axios'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'https://4shh3k1g.run.complete.dev'

const client = axios.create({ baseURL: BACKEND, timeout: 30000 })

/** Fetch properties, optionally filtered by zone */
export const getProperties = (zone = 'All Zones') =>
  client.get('/properties', { params: zone !== 'All Zones' ? { zone } : {} })
    .then(r => r.data)

/** Dashboard KPI stats */
export const getDashboardStats = (zone = 'All Zones') =>
  client.get('/dashboard-stats', { params: zone !== 'All Zones' ? { zone } : {} })
    .then(r => r.data)

/** Run multi-agent analysis on a property */
export const analyzeProperty = (propertyId) =>
  client.post(`/analyze/${propertyId}`).then(r => r.data)

/** Get satellite image URLs */
export const getSatelliteInfo = (propertyId) =>
  client.get(`/satellite/${propertyId}`).then(r => r.data)

/** Top fraud summary */
export const getFraudSummary = () =>
  client.get('/fraud-summary').then(r => r.data)

/** Satellite image URL builder */
export const satelliteImageUrl = (propertyId, year) =>
  `${BACKEND}/satellite-image/${propertyId}/${year}`
