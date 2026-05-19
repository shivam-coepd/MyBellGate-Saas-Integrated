import { Hono } from 'hono'
import { users, flats, User, Flat, nextUserId, nextFlatId } from '../data/store'

const residents = new Hono()

// GET all residents
residents.get('/', (c) => {
  const residentUsers = users.filter(u => u.role === 'resident')
  const result = residentUsers.map(u => {
    const flat = flats.find(f => f.id === u.flatId)
    return { ...u, password: undefined, flat }
  })
  return c.json(result)
})

// GET single resident
residents.get('/:id', (c) => {
  const id = c.req.param('id')
  const user = users.find(u => u.id === id)
  if (!user) return c.json({ error: 'Resident not found' }, 404)
  const flat = flats.find(f => f.id === user.flatId)
  return c.json({ ...user, password: undefined, flat })
})

// POST create resident
residents.post('/', async (c) => {
  const body = await c.req.json()
  const { name, email, phone, flatId, type } = body

  if (!name || !email || !phone) {
    return c.json({ error: 'Name, email, and phone are required' }, 400)
  }

  if (users.find(u => u.email === email)) {
    return c.json({ error: 'Email already exists' }, 409)
  }

  const newUser: User = {
    id: nextUserId(),
    name,
    email,
    phone,
    password: 'resident123',
    role: 'resident',
    flatId: flatId || undefined,
    avatar: '',
    createdAt: new Date().toISOString(),
    isActive: true
  }
  users.push(newUser)

  if (flatId) {
    const flat = flats.find(f => f.id === flatId)
    if (flat) {
      if (!flat.residents.includes(newUser.id)) flat.residents.push(newUser.id)
      if (type === 'owner') flat.ownerId = newUser.id
      else flat.tenantId = newUser.id
      if (flat.residents.length > 0) flat.status = 'occupied'
    }
  }

  return c.json({ ...newUser, password: undefined }, 201)
})

// PUT update resident
residents.put('/:id', async (c) => {
  const id = c.req.param('id')
  const idx = users.findIndex(u => u.id === id)
  if (idx === -1) return c.json({ error: 'Resident not found' }, 404)
  const body = await c.req.json()
  const { name, email, phone, isActive } = body
  if (name) users[idx].name = name
  if (email) users[idx].email = email
  if (phone) users[idx].phone = phone
  if (isActive !== undefined) users[idx].isActive = isActive
  return c.json({ ...users[idx], password: undefined })
})

// DELETE resident
residents.delete('/:id', (c) => {
  const id = c.req.param('id')
  const idx = users.findIndex(u => u.id === id)
  if (idx === -1) return c.json({ error: 'Resident not found' }, 404)
  const user = users[idx]
  // Remove from flat
  if (user.flatId) {
    const flat = flats.find(f => f.id === user.flatId)
    if (flat) {
      flat.residents = flat.residents.filter(r => r !== id)
      if (flat.ownerId === id) flat.ownerId = undefined
      if (flat.tenantId === id) flat.tenantId = undefined
      if (flat.residents.length === 0) flat.status = 'vacant'
    }
  }
  users.splice(idx, 1)
  return c.json({ message: 'Resident deleted successfully' })
})

// -------- FLATS --------

residents.get('/flats/all', (c) => {
  const result = flats.map(f => {
    const owner = f.ownerId ? users.find(u => u.id === f.ownerId) : null
    const tenant = f.tenantId ? users.find(u => u.id === f.tenantId) : null
    const residentList = f.residents.map(rid => users.find(u => u.id === rid)).filter(Boolean)
    return { ...f, owner: owner ? { ...owner, password: undefined } : null, tenant: tenant ? { ...tenant, password: undefined } : null, residentList }
  })
  return c.json(result)
})

  residents.post('/flats', async (c) => {
    const body = await c.req.json()
    const { flatNo, floor, block, area, type } = body
    if (!flatNo || !block) return c.json({ error: 'Flat number and block are required' }, 400)
    if (flats.find(f => f.flatNo === flatNo)) return c.json({ error: 'Flat number already exists' }, 409)

    const newFlat: Flat = {
      id: nextFlatId(),
      flatNo,
      floor: floor || 1,
      block,
      area: area || 0,
      type: type || '2BHK',
      status: 'vacant',
      ownerId: undefined,
      tenantId: undefined,
      residents: [],
      vehicles: [],
      createdAt: new Date().toISOString()
    }
    flats.push(newFlat)
    return c.json(newFlat, 201)
  })

  residents.put('/flats/:id', async (c) => {
    const id = c.req.param('id')
    const idx = flats.findIndex(f => f.id === id)
    if (idx === -1) return c.json({ error: 'Flat not found' }, 404)
    const body = await c.req.json()
    const { flatNo, floor, block, area, type, status, ownerId, tenantId, residents } = body
    if (flatNo) flats[idx].flatNo = flatNo
    if (floor !== undefined) flats[idx].floor = floor
    if (block) flats[idx].block = block
    if (area !== undefined) flats[idx].area = area
    if (type) flats[idx].type = type
    if (status) flats[idx].status = status
    if (ownerId !== undefined) flats[idx].ownerId = ownerId
    if (tenantId !== undefined) flats[idx].tenantId = tenantId
    if (residents) flats[idx].residents = residents
    return c.json(flats[idx])
  })

residents.delete('/flats/:id', (c) => {
  const id = c.req.param('id')
  const idx = flats.findIndex(f => f.id === id)
  if (idx === -1) return c.json({ error: 'Flat not found' }, 404)
  flats.splice(idx, 1)
  return c.json({ message: 'Flat deleted successfully' })
})

export default residents
