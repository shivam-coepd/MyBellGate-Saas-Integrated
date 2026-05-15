import { Hono } from 'hono'
import {
  societies, Society, societyRegistrations, SocietyRegistration,
  users, User, sessions, Session,
  nextSocietyId, nextRegId, nextUserId, generateSocietyCode
} from '../data/store'

const superAdminRoute = new Hono()

// ─── DASHBOARD STATS ───────────────────────────────────────────────
superAdminRoute.get('/stats', (c) => {
  const total       = societies.length
  const approved    = societies.filter(s => s.status === 'approved').length
  const pending     = societies.filter(s => s.status === 'pending').length
  const verified    = societies.filter(s => s.status === 'verified').length
  const newLeads    = societyRegistrations.filter(r => r.status === 'new').length
  const underReview = societyRegistrations.filter(r => r.status === 'under_review').length
  const totalAdmins = users.filter(u => u.role === 'admin').length
  const totalResidents = users.filter(u => u.role === 'resident').length

  // monthly signup trend (last 6 months)
  const trend: { month: string; count: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d   = new Date(); d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    trend.push({
      month: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      count: societies.filter(s => s.createdAt.startsWith(key)).length
    })
  }

  const planDist = ['starter', 'professional', 'enterprise'].map(p => ({
    plan: p, count: societies.filter(s => s.plan === p).length
  }))

  return c.json({
    totalSocieties: total, approved, pending, verified,
    newLeads, underReview,
    totalAdmins, totalResidents,
    trend, planDist
  })
})

// ─── SOCIETY REGISTRATIONS (LEADS) ─────────────────────────────────
superAdminRoute.get('/registrations', (c) => {
  const { status } = c.req.query()
  let list = [...societyRegistrations]
  if (status) list = list.filter(r => r.status === status)
  return c.json(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
})

superAdminRoute.get('/registrations/:id', (c) => {
  const reg = societyRegistrations.find(r => r.id === c.req.param('id'))
  if (!reg) return c.json({ error: 'Registration not found' }, 404)
  return c.json(reg)
})

// Public endpoint – used by the landing page registration form
superAdminRoute.post('/registrations', async (c) => {
  const body = await c.req.json()
  const { societyName, address, city, state, pincode, towers, totalFlats,
          contactName, contactEmail, contactPhone, gst, pan, message } = body

  if (!societyName || !city || !contactName || !contactEmail || !contactPhone)
    return c.json({ error: 'Society name, city, contact name, email and phone are required' }, 400)

  // duplicate check
  if (societyRegistrations.find(r => r.contactEmail === contactEmail))
    return c.json({ error: 'A registration with this email already exists' }, 409)

  const newReg: SocietyRegistration = {
    id: nextRegId(), societyName,
    address: address || '', city, state: state || '', pincode: pincode || '',
    towers: Number(towers) || 1, totalFlats: Number(totalFlats) || 10,
    contactName, contactEmail, contactPhone,
    gst, pan, message,
    status: 'new',
    createdAt: new Date().toISOString()
  }
  societyRegistrations.push(newReg)
  return c.json({ message: 'Registration submitted successfully', id: newReg.id }, 201)
})

// Approve registration lead → creates society + deletes registration
superAdminRoute.post('/registrations/:id/approve', async (c) => {
  const regIdx = societyRegistrations.findIndex(r => r.id === c.req.param('id'))
  if (regIdx === -1) return c.json({ error: 'Registration not found' }, 404)

  const reg = societyRegistrations[regIdx]
  if (reg.status === 'approved') return c.json({ error: 'Already approved' }, 400)

  const code = generateSocietyCode(reg.societyName)
  const id   = nextSocietyId()

  const newSoc: Society = {
    id, code,
    name: reg.societyName,
    address: reg.address || '', city: reg.city, state: reg.state || '', pincode: reg.pincode || '',
    towers: reg.towers || 1, totalFlats: reg.totalFlats || 0,
    contactName: reg.contactName, contactEmail: reg.contactEmail, contactPhone: reg.contactPhone,
    gst: reg.gst, pan: reg.pan,
    registrationId: reg.id,
    documents: [],
    status: 'approved',
    inviteLink: `https://mygatebell.com/join/${code}`,
    createdAt: new Date().toISOString(),
    plan: 'starter',
    stats: { residents: 0, visitors: 0, complaints: 0 }
  }
  societies.push(newSoc)

  // Create admin user
  const password = 'Admin@' + Math.floor(1000 + Math.random() * 9000)
  const adminId  = nextUserId()
  const newAdmin: User = {
    id: adminId, name: reg.contactName, email: reg.contactEmail, phone: reg.contactPhone,
    password, role: 'admin', societyId: id,
    createdAt: new Date().toISOString(), isActive: true
  }
  users.push(newAdmin)
  newSoc.adminId = adminId

  // Delete the registration — it now lives in societies table
  societyRegistrations.splice(regIdx, 1)

  return c.json({
    society_id: id, society_name: reg.societyName, code,
    admin_email: reg.contactEmail, admin_phone: reg.contactPhone, password
  }, 201)
})

// Update registration status
superAdminRoute.put('/registrations/:id', async (c) => {
  const idx = societyRegistrations.findIndex(r => r.id === c.req.param('id'))
  if (idx === -1) return c.json({ error: 'Registration not found' }, 404)
  const body = await c.req.json()
  const { status, reviewedBy, rejectionReason } = body
  if (status) societyRegistrations[idx].status = status
  if (reviewedBy) societyRegistrations[idx].reviewedBy = reviewedBy
  if (rejectionReason) societyRegistrations[idx].rejectionReason = rejectionReason
  societyRegistrations[idx].reviewedAt = new Date().toISOString()
  return c.json(societyRegistrations[idx])
})

// ─── SOCIETIES ──────────────────────────────────────────────────────
superAdminRoute.get('/societies', (c) => {
  const { status } = c.req.query()
  let list = [...societies]
  if (status) list = list.filter(s => s.status === status)
  return c.json(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
})

superAdminRoute.get('/societies/:id', (c) => {
  const soc = societies.find(s => s.id === c.req.param('id'))
  if (!soc) return c.json({ error: 'Society not found' }, 404)
  const admin = soc.adminId ? users.find(u => u.id === soc.adminId) : null
  const societyUsers = users.filter(u => u.societyId === soc.id)
  return c.json({ ...soc, admin: admin ? { ...admin, password: undefined } : null, userCount: societyUsers.length })
})

// Create society (by super admin)
superAdminRoute.post('/societies', async (c) => {
  const body = await c.req.json()
  const { name, address, city, state, pincode, towers, totalFlats,
          contactName, contactEmail, contactPhone, gst, pan, plan } = body

  if (!name || !city || !contactEmail)
    return c.json({ error: 'Society name, city and contact email are required' }, 400)

  const id   = nextSocietyId()
  const code = generateSocietyCode(name)

  const newSoc: Society = {
    id, code, name,
    address: address || '', city, state: state || '', pincode: pincode || '',
    towers: Number(towers) || 1, totalFlats: Number(totalFlats) || 10,
    contactName: contactName || '', contactEmail, contactPhone: contactPhone || '',
    gst, pan, documents: [],
    status: 'verified',
    inviteLink: `https://mygatebell.com/join/${code}`,
    createdAt: new Date().toISOString(),
    plan: plan || 'starter',
    stats: { residents: 0, visitors: 0, complaints: 0 }
  }
  societies.push(newSoc)
  return c.json(newSoc, 201)
})

// Update society
superAdminRoute.put('/societies/:id', async (c) => {
  const idx = societies.findIndex(s => s.id === c.req.param('id'))
  if (idx === -1) return c.json({ error: 'Society not found' }, 404)
  const body = await c.req.json()
  const allowed = ['name','address','city','state','pincode','towers','totalFlats',
                   'contactName','contactEmail','contactPhone','gst','pan','plan','status']
  for (const key of allowed) {
    if (body[key] !== undefined) (societies[idx] as any)[key] = body[key]
  }
  return c.json(societies[idx])
})

// Approve society
superAdminRoute.post('/societies/:id/approve', async (c) => {
  const idx = societies.findIndex(s => s.id === c.req.param('id'))
  if (idx === -1) return c.json({ error: 'Society not found' }, 404)
  const body = await c.req.json()
  societies[idx].status    = 'approved'
  societies[idx].approvedAt = new Date().toISOString()
  societies[idx].approvedBy = body.approvedBy || 'sa1'
  return c.json(societies[idx])
})

// Suspend / Reject society
superAdminRoute.post('/societies/:id/suspend', async (c) => {
  const idx = societies.findIndex(s => s.id === c.req.param('id'))
  if (idx === -1) return c.json({ error: 'Society not found' }, 404)
  societies[idx].status = 'suspended'
  return c.json(societies[idx])
})

// Delete society
superAdminRoute.delete('/societies/:id', (c) => {
  const idx = societies.findIndex(s => s.id === c.req.param('id'))
  if (idx === -1) return c.json({ error: 'Society not found' }, 404)
  societies.splice(idx, 1)
  return c.json({ message: 'Society deleted' })
})

// ─── SOCIETY ADMINS ─────────────────────────────────────────────────
superAdminRoute.get('/societies/:id/admin', (c) => {
  const soc = societies.find(s => s.id === c.req.param('id'))
  if (!soc) return c.json({ error: 'Society not found' }, 404)
  if (!soc.adminId) return c.json(null)
  const admin = users.find(u => u.id === soc.adminId)
  return c.json(admin ? { ...admin, password: undefined } : null)
})

// Create society admin login
superAdminRoute.post('/societies/:id/create-admin', async (c) => {
  const socId = c.req.param('id')
  const socIdx = societies.findIndex(s => s.id === socId)
  if (socIdx === -1) return c.json({ error: 'Society not found' }, 404)

  const body = await c.req.json()
  const { name, email, phone, password } = body
  if (!name || !email || !phone)
    return c.json({ error: 'Name, email and phone are required' }, 400)

  if (users.find(u => u.email === email))
    return c.json({ error: 'Email already in use' }, 409)

  const newAdmin: User = {
    id: nextUserId(), name, email, phone,
    password: password || 'admin@123',
    role: 'admin', societyId: socId,
    createdAt: new Date().toISOString(),
    isActive: true
  }
  users.push(newAdmin)

  societies[socIdx].adminId = newAdmin.id
  if (societies[socIdx].status === 'verified') {
    societies[socIdx].status    = 'approved'
    societies[socIdx].approvedAt = new Date().toISOString()
    societies[socIdx].approvedBy = 'sa1'
  }

  return c.json({
    admin: { ...newAdmin, password: undefined },
    society: societies[socIdx],
    loginCredentials: { email, password: password || 'admin@123' }
  }, 201)
})

// List all society admins
superAdminRoute.get('/admins', (c) => {
  const admins = users.filter(u => u.role === 'admin').map(u => {
    const soc = societies.find(s => s.id === u.societyId)
    return { ...u, password: undefined, society: soc ? { id: soc.id, name: soc.name, code: soc.code, status: soc.status } : null }
  })
  return c.json(admins)
})

// Toggle admin active state
superAdminRoute.put('/admins/:id/toggle', (c) => {
  const idx = users.findIndex(u => u.id === c.req.param('id') && u.role === 'admin')
  if (idx === -1) return c.json({ error: 'Admin not found' }, 404)
  users[idx].isActive = !users[idx].isActive
  return c.json({ ...users[idx], password: undefined })
})

export default superAdminRoute
