import { Hono } from 'hono'
import { notices, Notice, nextNoticeId } from '../data/store'

const noticesRoute = new Hono()

noticesRoute.get('/', (c) => {
  const { category, priority } = c.req.query()
  let result = [...notices].filter(n => n.isActive)
  if (category) result = result.filter(n => n.category === category)
  if (priority) result = result.filter(n => n.priority === priority)
  return c.json(result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
})

noticesRoute.get('/:id', (c) => {
  const id = c.req.param('id')
  const notice = notices.find(n => n.id === id)
  if (!notice) return c.json({ error: 'Notice not found' }, 404)
  return c.json(notice)
})

noticesRoute.post('/', async (c) => {
  const body = await c.req.json()
  const { title, content, category, priority, authorId, authorName, expiresAt } = body
  if (!title || !content) return c.json({ error: 'Title and content are required' }, 400)
  const newNotice: Notice = {
    id: nextNoticeId(),
    title, content,
    category: category || 'general',
    priority: priority || 'normal',
    authorId: authorId || 'u1',
    authorName: authorName || 'Admin',
    attachments: [],
    acknowledgedBy: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    expiresAt
  }
  notices.push(newNotice)
  return c.json(newNotice, 201)
})

noticesRoute.put('/:id', async (c) => {
  const id = c.req.param('id')
  const idx = notices.findIndex(n => n.id === id)
  if (idx === -1) return c.json({ error: 'Notice not found' }, 404)
  const body = await c.req.json()
  const { title, content, category, priority, isActive } = body
  if (title) notices[idx].title = title
  if (content) notices[idx].content = content
  if (category) notices[idx].category = category
  if (priority) notices[idx].priority = priority
  if (isActive !== undefined) notices[idx].isActive = isActive
  return c.json(notices[idx])
})

noticesRoute.post('/:id/acknowledge', async (c) => {
  const id = c.req.param('id')
  const idx = notices.findIndex(n => n.id === id)
  if (idx === -1) return c.json({ error: 'Notice not found' }, 404)
  const body = await c.req.json()
  const { userId } = body
  if (!notices[idx].acknowledgedBy.includes(userId)) {
    notices[idx].acknowledgedBy.push(userId)
  }
  return c.json(notices[idx])
})

noticesRoute.delete('/:id', (c) => {
  const id = c.req.param('id')
  const idx = notices.findIndex(n => n.id === id)
  if (idx === -1) return c.json({ error: 'Notice not found' }, 404)
  notices[idx].isActive = false
  return c.json({ message: 'Notice removed' })
})

export default noticesRoute
