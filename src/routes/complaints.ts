import { Hono } from 'hono'
import { complaints, Complaint, ComplaintComment, nextComplaintId } from '../data/store'

const complaintsRoute = new Hono()

complaintsRoute.get('/', (c) => {
  const { status, category, residentId } = c.req.query()
  let result = [...complaints]
  if (status) result = result.filter(c => c.status === status)
  if (category) result = result.filter(c => c.category === category)
  if (residentId) result = result.filter(c => c.residentId === residentId)
  return c.json(result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
})

complaintsRoute.get('/:id', (c) => {
  const id = c.req.param('id')
  const complaint = complaints.find(c => c.id === id)
  if (!complaint) return c.json({ error: 'Complaint not found' }, 404)
  return c.json(complaint)
})

complaintsRoute.post('/', async (c) => {
  const body = await c.req.json()
  const { title, description, category, priority, flatId, flatNo, residentId, residentName } = body
  if (!title || !description || !category || !residentId) {
    return c.json({ error: 'Title, description, category and resident are required' }, 400)
  }
  const newComplaint: Complaint = {
    id: nextComplaintId(),
    title, description,
    category: category || 'other',
    status: 'open',
    priority: priority || 'medium',
    flatId: flatId || '',
    flatNo: flatNo || '',
    residentId,
    residentName: residentName || 'Resident',
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  complaints.push(newComplaint)
  return c.json(newComplaint, 201)
})

complaintsRoute.put('/:id', async (c) => {
  const id = c.req.param('id')
  const idx = complaints.findIndex(c => c.id === id)
  if (idx === -1) return c.json({ error: 'Complaint not found' }, 404)
  const body = await c.req.json()
  const { status, assignedTo, priority } = body
  if (status) {
    complaints[idx].status = status
    if (status === 'resolved') complaints[idx].resolvedAt = new Date().toISOString()
  }
  if (assignedTo !== undefined) complaints[idx].assignedTo = assignedTo
  if (priority) complaints[idx].priority = priority
  complaints[idx].updatedAt = new Date().toISOString()
  return c.json(complaints[idx])
})

complaintsRoute.post('/:id/comments', async (c) => {
  const id = c.req.param('id')
  const idx = complaints.findIndex(c => c.id === id)
  if (idx === -1) return c.json({ error: 'Complaint not found' }, 404)
  const body = await c.req.json()
  const { text, authorId, authorName, role } = body
  if (!text) return c.json({ error: 'Comment text is required' }, 400)
  const comment: ComplaintComment = {
    id: `cc${Date.now()}`,
    text, authorId, authorName, role,
    createdAt: new Date().toISOString()
  }
  complaints[idx].comments.push(comment)
  complaints[idx].updatedAt = new Date().toISOString()
  return c.json(complaints[idx])
})

complaintsRoute.delete('/:id', (c) => {
  const id = c.req.param('id')
  const idx = complaints.findIndex(c => c.id === id)
  if (idx === -1) return c.json({ error: 'Complaint not found' }, 404)
  complaints.splice(idx, 1)
  return c.json({ message: 'Complaint deleted' })
})

export default complaintsRoute
