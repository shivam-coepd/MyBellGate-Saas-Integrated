import { Hono } from 'hono'
import { users, flats, visitors, complaints, notices, bills } from '../data/store'

const dashboardRoute = new Hono()

dashboardRoute.get('/stats', (c) => {
  const today = new Date().toDateString()
  const visitorsToday = visitors.filter(v => new Date(v.createdAt).toDateString() === today)
  const pendingApprovals = visitors.filter(v => v.status === 'pending')
  const openComplaints = complaints.filter(c => c.status === 'open' || c.status === 'in_progress')
  const totalResidents = users.filter(u => u.role === 'resident' && u.isActive)
  const occupiedFlats = flats.filter(f => f.status === 'occupied')
  const paidBills = bills.filter(b => b.status === 'paid')
  const unpaidBills = bills.filter(b => b.status === 'unpaid' || b.status === 'overdue')
  const totalRevenue = paidBills.reduce((s, b) => s + b.totalAmount, 0)
  const pendingRevenue = unpaidBills.reduce((s, b) => s + b.totalAmount, 0)

  // Weekly visitor data
  const weeklyVisitors = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = d.toDateString()
    const count = visitors.filter(v => new Date(v.createdAt).toDateString() === ds).length
    weeklyVisitors.push({ day: d.toLocaleDateString('en-IN', { weekday: 'short' }), count })
  }

  // Complaint category breakdown
  const complaintsByCategory = ['plumbing','electrical','security','cleaning','parking','lift','other'].map(cat => ({
    category: cat,
    count: complaints.filter(c => c.category === cat).length
  }))

  // Bill status
  const billStats = {
    paid: paidBills.length,
    unpaid: bills.filter(b => b.status === 'unpaid').length,
    overdue: bills.filter(b => b.status === 'overdue').length
  }

  return c.json({
    totalResidents: totalResidents.length,
    totalFlats: flats.length,
    occupiedFlats: occupiedFlats.length,
    vacantFlats: flats.length - occupiedFlats.length,
    visitorsToday: visitorsToday.length,
    pendingApprovals: pendingApprovals.length,
    openComplaints: openComplaints.length,
    totalRevenue,
    pendingRevenue,
    activeNotices: notices.filter(n => n.isActive).length,
    weeklyVisitors,
    complaintsByCategory,
    billStats
  })
})

dashboardRoute.get('/recent-activity', (c) => {
  const recentVisitors = visitors
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const recentComplaints = complaints
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const recentNotices = notices
    .filter(n => n.isActive)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  return c.json({ recentVisitors, recentComplaints, recentNotices })
})

export default dashboardRoute
