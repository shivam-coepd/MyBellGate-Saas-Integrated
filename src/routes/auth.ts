import { Hono } from 'hono'
import { users, superAdmins, societies, sessions, Session } from '../data/store'

const auth = new Hono()

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2)
}

auth.post('/login', async (c) => {
  const body = await c.req.json()
  const { email, password } = body

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400)
  }

  // Check Super Admin first
  const sa = superAdmins.find(s => s.email === email && s.password === password && s.isActive)
  if (sa) {
    const token = generateToken()
    sessions.set(token, { token, userId: sa.id, role: 'superadmin', expiresAt: Date.now() + 24 * 60 * 60 * 1000 })
    return c.json({
      token,
      user: { id: sa.id, name: sa.name, email: sa.email, role: 'superadmin' }
    })
  }

  // Check Society Users
  const user = users.find(u => u.email === email && u.password === password && u.isActive)
  if (!user) {
    return c.json({ error: 'Invalid credentials. Please check your email and password.' }, 401)
  }

  // Check society is active
  const society = societies.find(s => s.id === user.societyId)
  if (!society || society.status !== 'approved') {
    return c.json({ error: 'Your society account is not active. Please contact your administrator.' }, 403)
  }

  const token = generateToken()
  sessions.set(token, {
    token, userId: user.id, role: user.role,
    societyId: user.societyId,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  })

  return c.json({
    token,
    user: {
      id: user.id, name: user.name, email: user.email,
      phone: user.phone, role: user.role,
      flatId: user.flatId, societyId: user.societyId,
      societyName: society.name, societyCode: society.code
    }
  })
})

auth.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (authHeader?.startsWith('Bearer ')) sessions.delete(authHeader.substring(7))
  return c.json({ message: 'Logged out successfully' })
})

auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'No token provided' }, 401)

  const token = authHeader.substring(7)
  const session = sessions.get(token)
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token)
    return c.json({ error: 'Session expired' }, 401)
  }

  // Super admin
  if (session.role === 'superadmin') {
    const { superAdmins: sas } = await import('../data/store')
    const sa = sas.find(s => s.id === session.userId)
    if (!sa) return c.json({ error: 'User not found' }, 404)
    return c.json({ id: sa.id, name: sa.name, email: sa.email, role: 'superadmin' })
  }

  const user = users.find(u => u.id === session.userId)
  if (!user) return c.json({ error: 'User not found' }, 404)
  const society = societies.find(s => s.id === user.societyId)

  return c.json({
    id: user.id, name: user.name, email: user.email,
    phone: user.phone, role: user.role,
    flatId: user.flatId, societyId: user.societyId,
    societyName: society?.name, societyCode: society?.code
  })
})

// Validate society code (for login page hint)
auth.get('/society/:code', (c) => {
  const soc = societies.find(s => s.code === c.req.param('code').toUpperCase() && s.status === 'approved')
  if (!soc) return c.json({ error: 'Society not found or not active' }, 404)
  return c.json({ id: soc.id, name: soc.name, code: soc.code, city: soc.city })
})

export default auth
