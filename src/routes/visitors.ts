import { Hono } from 'hono'
import { visitors, flats, users, Visitor, nextVisitorId } from '../data/store'

const visitorsRoute = new Hono()

visitorsRoute.get('/', (c) => {
  const { status, flatId, date } = c.req.query()
  let result = [...visitors]
  if (status) result = result.filter(v => v.status === status)
  if (flatId) result = result.filter(v => v.flatId === flatId)
  if (date) {
    const d = new Date(date).toDateString()
    result = result.filter(v => new Date(v.createdAt).toDateString() === d)
  }
  return c.json(result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
})

visitorsRoute.get('/today', (c) => {
  const today = new Date().toDateString()
  const result = visitors.filter(v => new Date(v.createdAt).toDateString() === today)
  return c.json(result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
})

visitorsRoute.get('/pending', (c) => {
  const result = visitors.filter(v => v.status === 'pending')
  return c.json(result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
})

visitorsRoute.get('/:id', (c) => {
  const id = c.req.param('id')
  const visitor = visitors.find(v => v.id === id)
  if (!visitor) return c.json({ error: 'Visitor not found' }, 404)
  return c.json(visitor)
})

visitorsRoute.post('/', async (c) => {
  const body = await c.req.json()
  const { name, phone, purpose, flatId, isPreApproved, vehicleNo, guardId } = body

  if (!name || !phone || !purpose || !flatId) {
    return c.json({ error: 'Name, phone, purpose, and flat are required' }, 400)
  }

  const flat = flats.find(f => f.id === flatId)
  if (!flat) return c.json({ error: 'Flat not found' }, 404)

  const resident = flat.ownerId ? users.find(u => u.id === flat.ownerId) : null

  const newVisitor: Visitor = {
    id: nextVisitorId(),
    name,
    phone,
    purpose,
    flatId,
    flatNo: flat.flatNo,
    residentName: resident?.name || 'Resident',
    status: isPreApproved ? 'approved' : 'pending',
    entryTime: isPreApproved ? new Date().toISOString() : undefined,
    guardId: guardId || 'u2',
    isPreApproved: isPreApproved || false,
    vehicleNo,
    createdAt: new Date().toISOString()
  }
  visitors.push(newVisitor)
  return c.json(newVisitor, 201)
})

visitorsRoute.put('/:id/approve', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const idx = visitors.findIndex(v => v.id === id)
  if (idx === -1) return c.json({ error: 'Visitor not found' }, 404)
  visitors[idx].status = 'approved'
  visitors[idx].entryTime = new Date().toISOString()
  visitors[idx].approvedBy = body.approvedBy || 'u3'
  return c.json(visitors[idx])
})

visitorsRoute.put('/:id/reject', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const idx = visitors.findIndex(v => v.id === id)
  if (idx === -1) return c.json({ error: 'Visitor not found' }, 404)
  visitors[idx].status = 'rejected'
  return c.json(visitors[idx])
})

visitorsRoute.put('/:id/exit', (c) => {
  const id = c.req.param('id')
  const idx = visitors.findIndex(v => v.id === id)
  if (idx === -1) return c.json({ error: 'Visitor not found' }, 404)
  visitors[idx].status = 'exited'
  visitors[idx].exitTime = new Date().toISOString()
  return c.json(visitors[idx])
})

visitorsRoute.put('/:id', async (c) => {
  const id = c.req.param('id')
  const idx = visitors.findIndex(v => v.id === id)
  if (idx === -1) return c.json({ error: 'Visitor not found' }, 404)
  const body = await c.req.json()
  Object.assign(visitors[idx], body)
  return c.json(visitors[idx])
})

visitorsRoute.delete('/:id', (c) => {
  const id = c.req.param('id')
  const idx = visitors.findIndex(v => v.id === id)
  if (idx === -1) return c.json({ error: 'Visitor not found' }, 404)
  visitors.splice(idx, 1)
  return c.json({ message: 'Visitor record deleted' })
})

export default visitorsRoute
